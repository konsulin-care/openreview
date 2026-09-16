package api

import (
	"encoding/json"
	"net/http"

	"github.com/openreview/openreview/app"
	"github.com/openreview/openreview/internal/database"
	"github.com/openreview/openreview/internal/ulid"
)

type initializeRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type initializeResponse struct {
	ActorID string `json:"actor_id"`
	State   string `json:"state"`
}

// InitializeHandler handles POST /api/v1/initialize.
func InitializeHandler(a *app.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
			return
		}

		var req initializeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}

		if req.Name == "" || req.Email == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name and email are required"})
			return
		}

		// Check if already initialized
		if a.State == app.StateReady {
			writeJSON(w, http.StatusConflict, map[string]string{"error": "already initialized"})
			return
		}

		// Use custom DB path if set (for testing), otherwise use default
		dbPath := a.DBPath
		if dbPath == "" {
			var err error
			dbPath, err = database.MasterDBPath()
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to resolve data directory"})
				return
			}
		}

		// Open or create the database
		db, err := database.Open(dbPath)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to open database"})
			return
		}

		actorID, err := ulid.Make()
		if err != nil {
			_ = db.Close()
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate actor ID"})
			return
		}

		if err := db.CreateActor(actorID, req.Name, req.Email); err != nil {
			_ = db.Close()
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create actor"})
			return
		}

		a.DB = db
		a.State = app.StateReady

		writeJSON(w, http.StatusOK, initializeResponse{
			ActorID: actorID,
			State:   string(a.State),
		})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
