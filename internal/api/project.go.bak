// Package api provides HTTP handlers and routing for the OpenReview engine.
package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"

	"github.com/konsulin-care/openreview/internal/app"
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
		Name string `json:"name"`
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

	// Generate ULID for project
	projectID, err := ulid.Make()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate project ID"})
		return
	}

	// Create project directory structure
	projectPath := filepath.Join(".", projectID)
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

	var resp []projectResponse
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
