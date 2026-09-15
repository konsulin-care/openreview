package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/openreview/openreview/app"
)

func TestActorHandler_GET_Success(t *testing.T) {
	a := app.NewApp()
	// Initialize the app with an actor
	initializeAndClose(t, a)

	handler := ActorHandler(a)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/actor", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if resp["id"] == "" {
		t.Error("id should not be empty")
	}
	if resp["name"] != "Alice" {
		t.Errorf("name = %q, want %q", resp["name"], "Alice")
	}
	if resp["email"] != "alice@example.com" {
		t.Errorf("email = %q, want %q", resp["email"], "alice@example.com")
	}
}

func TestActorHandler_GET_NoActor(t *testing.T) {
	a := app.NewApp()

	handler := ActorHandler(a)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/actor", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}
