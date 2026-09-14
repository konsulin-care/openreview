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

func TestPreflightHandler(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/preflight", nil)
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode body: %v", err)
	}

	// git field must be string or null
	gitVal := body["git"]
	if gitVal != nil {
		if _, ok := gitVal.(string); !ok {
			t.Errorf("body.git type = %T, want string or null", gitVal)
		}
	}

	// mise field must be string or null
	miseVal := body["mise"]
	if miseVal != nil {
		if _, ok := miseVal.(string); !ok {
			t.Errorf("body.mise type = %T, want string or null", miseVal)
		}
	}
}

func TestPreflightHandlerContentType(t *testing.T) {
	a := app.NewApp()
	cfg := &config.Config{Port: 1234, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/preflight", nil)
	w := httptest.NewRecorder()
	srv.Handler().ServeHTTP(w, req)

	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", ct)
	}
}
