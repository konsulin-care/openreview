package api

import (
	"encoding/json"
	"net/http"

	"github.com/openreview/openreview/app"
)

const version = "0.1.0"

// StatusHandler returns the engine state and version.
func StatusHandler(a *app.App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]string{"state": string(a.State), "version": version})
	}
}
