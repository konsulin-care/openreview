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
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if req.Name == "" {
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
	if err := a.DB.RegisterProject(projectID, projectPath, req.Name); err != nil {
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
		ID        string `json:"id"`
		Path      string `json:"path"`
		Name      string `json:"name"`
		CreatedAt string `json:"created_at"`
	}

	resp := make([]projectResponse, 0)
	for _, p := range projects {
		resp = append(resp, projectResponse{
			ID:        p.ID,
			Path:      p.Path,
			Name:      p.Name,
			CreatedAt: p.CreatedAt,
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
		ID        string `json:"id"`
		Path      string `json:"path"`
		Name      string `json:"name"`
		CreatedAt string `json:"created_at"`
	}

	resp := projectResponse{
		ID:        p.ID,
		Path:      p.Path,
		Name:      p.Name,
		CreatedAt: p.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
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
