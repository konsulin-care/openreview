package api_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/openreview/openreview/api"
	"github.com/openreview/openreview/app"
	"github.com/openreview/openreview/config"
)

func TestCORS_AllowAllOrigins(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1", CorsOrigins: ""}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://example.com")
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want *", w.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORS_AllowSpecificOrigin(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1", CorsOrigins: "http://localhost:4321,https://example.com"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://localhost:4321")
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "http://localhost:4321" {
		t.Errorf("Access-Control-Allow-Origin = %q, want http://localhost:4321", w.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORS_BlockUnlistedOrigin(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1", CorsOrigins: "http://localhost:4321"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://evil.com")
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Errorf("Access-Control-Allow-Origin = %q, want empty", w.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORS_Preflight(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1", CorsOrigins: ""}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://example.com")
	req.Header.Set("Access-Control-Request-Method", "GET")
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNoContent)
	}
	if w.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want *", w.Header().Get("Access-Control-Allow-Origin"))
	}
	if w.Header().Get("Access-Control-Allow-Methods") == "" {
		t.Error("Access-Control-Allow-Methods should be set")
	}
	if w.Header().Get("Access-Control-Allow-Headers") == "" {
		t.Error("Access-Control-Allow-Headers should be set")
	}
	if w.Header().Get("Access-Control-Max-Age") == "" {
		t.Error("Access-Control-Max-Age should be set")
	}
}

func TestCORS_PreflightSpecificOrigin(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1", CorsOrigins: "http://localhost:4321"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://localhost:4321")
	req.Header.Set("Access-Control-Request-Method", "GET")
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNoContent)
	}
	if w.Header().Get("Access-Control-Allow-Origin") != "http://localhost:4321" {
		t.Errorf("Access-Control-Allow-Origin = %q, want http://localhost:4321", w.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORS_PreflightBlockedOrigin(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1", CorsOrigins: "http://localhost:4321"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/health", nil)
	req.Header.Set("Origin", "http://evil.com")
	req.Header.Set("Access-Control-Request-Method", "GET")
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Errorf("Access-Control-Allow-Origin = %q, want empty", w.Header().Get("Access-Control-Allow-Origin"))
	}
}
