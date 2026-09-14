package api

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"strings"
)

// PreflightResponse is the response shape for the preflight endpoint.
type PreflightResponse struct {
	Git  *string `json:"git"`
	Mise *string `json:"mise"`
}

// PreflightHandler checks whether required tools are installed.
func PreflightHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp := PreflightResponse{
			Git:  toolVersion("git", "--version"),
			Mise: toolVersion("mise", "--version"),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(resp)
	}
}

// toolVersion runs a command and returns the first line of output, or nil on failure.
func toolVersion(name string, args ...string) *string {
	out, err := exec.Command(name, args...).Output()
	if err != nil {
		return nil
	}
	line := strings.TrimSpace(string(out))
	if line == "" {
		return nil
	}
	return &line
}
