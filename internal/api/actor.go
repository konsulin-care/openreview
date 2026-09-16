// Package api provides HTTP handlers and routing for the OpenReview engine.
package api

import (
	"encoding/json"
	"net/http"

	"github.com/konsulin-care/openreview/internal/app"
)

// ActorHandler handles GET and PUT /api/v1/actor.
func ActorHandler(a *app.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handleGetActor(a, w, r)
		case http.MethodPut:
			handlePutActor(a, w, r)
		default:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusMethodNotAllowed)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "method not allowed"})
		}
	}
}

// handleGetActor returns the current actor.
func handleGetActor(a *app.App, w http.ResponseWriter, r *http.Request) {
	if a.DB == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "no actor"})
		return
	}

	actor, err := a.DB.LatestActor()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get actor"})
		return
	}

	if actor == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "no actor"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"id":    actor.ID,
		"name":  actor.Name,
		"email": actor.Email,
	})
}

// handlePutActor updates the current actor.
func handlePutActor(a *app.App, w http.ResponseWriter, r *http.Request) {
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

	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if req.Name == "" || req.Email == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "name and email are required"})
		return
	}

	// Get current actor — use LatestActor() to match GET's selection logic
	actor, err := a.DB.LatestActor()
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get actor"})
		return
	}
	if actor == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "no actor found"})
		return
	}

	if err := a.DB.UpdateActor(actor.ID, req.Name, req.Email); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update actor"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"id":    actor.ID,
		"name":  req.Name,
		"email": req.Email,
	})
}
