package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/konsulin-care/openreview/internal/app"
)

func TestInitializeHandler_Success(t *testing.T) {
	a := app.NewApp()
	handler := InitializeHandler(a)

	body := `{"name":"Alice","email":"alice@example.com"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if resp["actor_id"] == "" {
		t.Error("actor_id should not be empty")
	}
	if resp["state"] != "READY" {
		t.Errorf("state = %q, want %q", resp["state"], "READY")
	}
	if a.State != app.StateReady {
		t.Errorf("app.State = %v, want %v", a.State, app.StateReady)
	}
}

func TestInitializeHandler_MissingName(t *testing.T) {
	a := app.NewApp()
	handler := InitializeHandler(a)

	body := `{"email":"alice@example.com"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestInitializeHandler_MissingEmail(t *testing.T) {
	a := app.NewApp()
	handler := InitializeHandler(a)

	body := `{"name":"Alice"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestInitializeHandler_AlreadyInitialized(t *testing.T) {
	a := app.NewApp()
	// Pre-populate with an actor
	initializeAndClose(t, a)

	handler := InitializeHandler(a)

	body := `{"name":"Bob","email":"bob@example.com"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Errorf("status = %d, want %d", w.Code, http.StatusConflict)
	}
}

func initializeAndClose(t *testing.T, a *app.App) {
	t.Helper()
	body := `{"name":"Alice","email":"alice@example.com"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	InitializeHandler(a).ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("setup initialize failed: status %d", w.Code)
	}
}
