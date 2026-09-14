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

func TestHealthHandler(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	tests := []struct {
		name       string
		method     string
		path       string
		wantStatus int
		wantBody   map[string]string
	}{
		{
			name:       "GET /api/v1/health returns ok",
			method:     http.MethodGet,
			path:       "/api/v1/health",
			wantStatus: http.StatusOK,
			wantBody:   map[string]string{"status": "ok"},
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
			if body["status"] != tt.wantBody["status"] {
				t.Errorf("body.status = %q, want %q", body["status"], tt.wantBody["status"])
			}
		})
	}
}

func TestHealthHandlerContentType(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", ct)
	}
}
