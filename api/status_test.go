package api_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/openreview/openreview/api"
	"github.com/openreview/openreview/app"
	"github.com/openreview/openreview/config"
)

func TestStatusHandler(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	tests := []struct {
		name       string
		method     string
		path       string
		wantStatus int
		wantState  string
	}{
		{
			name:       "GET /api/v1/status returns NEW state",
			method:     http.MethodGet,
			path:       "/api/v1/status",
			wantStatus: http.StatusOK,
			wantState:  "NEW",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, nil)
			w := httptest.NewRecorder()
			srv.Handler().ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("status = %d, want %d", w.Code, tt.wantStatus)
			}

			var body map[string]string
			if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
				t.Fatalf("decode body: %v", err)
			}
			if body["state"] != tt.wantState {
				t.Errorf("body.state = %q, want %q", body["state"], tt.wantState)
			}
			if body["version"] == "" {
				t.Error("body.version is empty, want non-empty")
			}
		})
	}
}

func TestStatusHandlerContentType(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/status", nil)
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", ct)
	}
}
