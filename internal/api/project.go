// Package api provides HTTP handlers and routing for the OpenReview engine.
package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/database"
	"github.com/konsulin-care/openreview/internal/manifest"
	"github.com/konsulin-care/openreview/internal/ulid"
)

// ProjectHandler handles GET /api/v1/project and POST /api/v1/project.
func ProjectHandler(a *app.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handleGetProjects(a, w, r)
		case http.MethodPost:
			handleCreateProject(a, w, r)
		default:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusMethodNotAllowed)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
		}
	}
}

// handleCreateProject creates a new project with a ULID, manifest, and directory structure.
func handleCreateProject(a *app.App, w http.ResponseWriter, r *http.Request) {
	// Guard: must be initialized
	if a.State != app.StateReady {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "not initialized"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Path        string `json:"path"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	// Default status to "active" if not provided
	if req.Status == "" {
		req.Status = "active"
	}

	// Validate status value
	if req.Status != "draft" && req.Status != "active" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "status must be 'draft' or 'active'"})
		return
	}

	// Name is required for active projects, optional for drafts
	if req.Status == "active" && req.Name == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "name is required"})
		return
	}

	// Validate custom path if provided
	if req.Path != "" {
		if !filepath.IsAbs(req.Path) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "path must be an absolute path"})
			return
		}
	}

	// Generate ULID for project
	projectID, err := ulid.Make()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate project ID"})
		return
	}

	// Determine project path: use custom path or default
	var projectPath string
	if req.Path != "" {
		projectPath = req.Path
	} else {
		projectDir, err := database.ProjectDir()
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to resolve data directory"})
			return
		}
		projectPath = filepath.Join(projectDir, projectID)
	}
	for _, dir := range []string{"events", "papers", "exports"} {
		if err := os.MkdirAll(filepath.Join(projectPath, dir), 0o755); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create project directory"})
			return
		}
	}

	// Create and write manifest
	m := manifest.New(projectID, req.Name)
	if req.Description != "" {
		m.SetDescription(req.Description)
	}
	if err := m.Validate(); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "manifest validation failed"})
		return
	}
	manifestPath := filepath.Join(projectPath, "openreview.yml")
	if err := m.Write(manifestPath); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to write manifest"})
		return
	}

	// Register in master DB
	if a.DB == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "database not available"})
		return
	}
	if err := a.DB.RegisterProject(projectID, projectPath, req.Name, req.Status, req.Description); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to register project"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"project_id": projectID,
		"name":       req.Name,
		"path":       projectPath,
		"created_at": m.CreatedAt,
	})
}

// handleGetProjects lists all registered projects.
func handleGetProjects(a *app.App, w http.ResponseWriter, r *http.Request) {
	// Guard: must be initialized
	if a.State != app.StateReady {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "not initialized"})
		return
	}

	if a.DB == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "database not available"})
		return
	}

	projects, err := a.DB.ListProjects()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to list projects"})
		return
	}

	// Convert to JSON-serializable format
	type projectResponse struct {
		ID              string `json:"id"`
		Path            string `json:"path"`
		Name            string `json:"name"`
		Description     string `json:"description"`
		CreatedAt       string `json:"created_at"`
		PaperCount      int    `json:"paper_count"`
		AcceptedCount   int    `json:"accepted_count"`
		RejectedCount   int    `json:"rejected_count"`
		NoDecisionCount int    `json:"no_decision_count"`
		ConflictCount   int    `json:"conflict_count"`
		ScreeningStatus string `json:"screening_status"`
	}

	resp := make([]projectResponse, 0)
	for _, p := range projects {
		// Derive screening status from paper counts
		paperCount := 0
		screeningStatus := "not-started"
		// TODO: Query paper counts from paper table when implemented

		resp = append(resp, projectResponse{
			ID:              p.ID,
			Path:            p.Path,
			Name:            p.Name,
			Description:     p.Description,
			CreatedAt:       p.CreatedAt,
			PaperCount:      paperCount,
			AcceptedCount:   0,
			RejectedCount:   0,
			NoDecisionCount: 0,
			ConflictCount:   0,
			ScreeningStatus: screeningStatus,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// handleGetProjectById returns an http.HandlerFunc that retrieves or deletes a single project by ID.
func handleGetProjectById(a *app.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		projectID := strings.TrimPrefix(r.URL.Path, "/api/v1/project/")
		if projectID == "" || projectID == "/" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "project ID is required"})
			return
		}

		// Guard: must be initialized
		if a.State != app.StateReady {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "not initialized"})
			return
		}

		if a.DB == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "database not available"})
			return
		}

		switch r.Method {
		case http.MethodGet:
			handleGetProjectByIdGET(a, w, projectID)
		case http.MethodPut:
			handleUpdateProject(a, w, r, projectID)
		case http.MethodDelete:
			handleDeleteProject(a, w, r, projectID)
		default:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusMethodNotAllowed)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
		}
	}
}

// handleGetProjectByIdGET retrieves a single project by ID.
func handleGetProjectByIdGET(a *app.App, w http.ResponseWriter, projectID string) {
	p, err := a.DB.GetProject(projectID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get project"})
		return
	}

	if p == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "project not found"})
		return
	}

	// Convert to JSON-serializable format
	type projectResponse struct {
		ID          string `json:"id"`
		Path        string `json:"path"`
		Name        string `json:"name"`
		Description string `json:"description"`
		CreatedAt   string `json:"created_at"`
	}

	resp := projectResponse{
		ID:          p.ID,
		Path:        p.Path,
		Name:        p.Name,
		Description: p.Description,
		CreatedAt:   p.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// handleUpdateProject updates an existing project.
func handleUpdateProject(a *app.App, w http.ResponseWriter, r *http.Request, projectID string) {
	// Get existing project
	p, err := a.DB.GetProject(projectID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get project"})
		return
	}

	if p == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "project not found"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Path        string `json:"path"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	// Use existing values if not provided in request
	newName := req.Name
	if newName == "" {
		newName = p.Name
	}
	newPath := req.Path
	if newPath == "" {
		newPath = p.Path
	}
	newStatus := req.Status
	if newStatus == "" {
		newStatus = p.Status
	}
	newDescription := req.Description

	// Validate path if changing
	if newPath != p.Path {
		if !filepath.IsAbs(newPath) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "path must be an absolute path"})
			return
		}

		// Check for collision
		exists, err := a.DB.PathExists(newPath)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check path"})
			return
		}
		if exists {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "path already in use"})
			return
		}

		// Move directory
		if err := os.Rename(p.Path, newPath); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to move project directory"})
			return
		}
	}

	// Update manifest if name or description changed
	if newName != p.Name || newDescription != "" {
		m := manifest.New(projectID, newName)
		if newDescription != "" {
			m.SetDescription(newDescription)
		}
		if err := m.Validate(); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "manifest validation failed"})
			return
		}
		manifestPath := filepath.Join(newPath, "openreview.yml")
		if err := m.Write(manifestPath); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to write manifest"})
			return
		}
	}

	// Update DB
	if err := a.DB.UpdateProject(projectID, newPath, newName); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update project"})
		return
	}
	if newStatus != p.Status {
		if err := a.DB.UpdateProjectStatus(projectID, newStatus); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update project status"})
			return
		}
	}

	// Return updated project
	updated, _ := a.DB.GetProject(projectID)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"project_id": updated.ID,
		"name":       updated.Name,
		"path":       updated.Path,
		"status":     updated.Status,
		"created_at": updated.CreatedAt,
	})
}

// handleDeleteProject removes a project from the registry and deletes its directory from disk.
func handleDeleteProject(a *app.App, w http.ResponseWriter, r *http.Request, projectID string) {
	// Get project to find its path before deletion
	p, err := a.DB.GetProject(projectID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get project"})
		return
	}

	if p == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "project not found"})
		return
	}

	// Remove project directory from disk
	if err := os.RemoveAll(p.Path); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to remove project directory"})
		return
	}

	// Unregister from master DB
	if err := a.DB.DeleteProject(projectID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete project"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"project_id": projectID,
		"name":       p.Name,
	})
}
