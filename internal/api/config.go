// Package api provides HTTP handlers and routing for the OpenReview engine.
package api

import (
	"encoding/json"
	"net/http"

	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/database"
)

// ConfigHandler handles GET /api/v1/config, returning engine configuration.
func ConfigHandler(a *app.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusMethodNotAllowed)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
			return
		}

		if a.State != app.StateReady {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "not initialized"})
			return
		}

		projectDir, err := database.ProjectDir()
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to resolve project directory"})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{
			"project_dir": projectDir,
		})
	}
}
