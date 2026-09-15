package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/openreview/openreview/app"
)

func TestActorHandler_GET_Success(t *testing.T) {
	a := app.NewApp()

	// Initialize via the handler so the actor is created with a real DB
	initHandler := InitializeHandler(a)
	initBody := `{"name":"TestUser","email":"test@example.com"}`
	initReq := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(initBody))
	initReq.Header.Set("Content-Type", "application/json")
	initW := httptest.NewRecorder()
	initHandler.ServeHTTP(initW, initReq)

	if initW.Code != http.StatusOK {
		t.Fatalf("initialize failed: status %d", initW.Code)
	}

	var initResp map[string]string
	_ = json.Unmarshal(initW.Body.Bytes(), &initResp)
	actorID := initResp["actor_id"]

	// GET the actor
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
	if resp["id"] != actorID {
		t.Errorf("id = %q, want %q", resp["id"], actorID)
	}
	if resp["name"] != "TestUser" {
		t.Errorf("name = %q, want %q", resp["name"], "TestUser")
	}
	if resp["email"] != "test@example.com" {
		t.Errorf("email = %q, want %q", resp["email"], "test@example.com")
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

func TestActorHandler_PUT_Success(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ActorHandler(a)
	body := `{"name":"Bob","email":"bob@example.com"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/actor", bytes.NewBufferString(body))
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
	if resp["name"] != "Bob" {
		t.Errorf("name = %q, want %q", resp["name"], "Bob")
	}
	if resp["email"] != "bob@example.com" {
		t.Errorf("email = %q, want %q", resp["email"], "bob@example.com")
	}
}

func TestActorHandler_PUT_NotInitialized(t *testing.T) {
	a := app.NewApp()

	handler := ActorHandler(a)
	body := `{"name":"Bob","email":"bob@example.com"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/actor", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("status = %d, want %d", w.Code, http.StatusServiceUnavailable)
	}
}

func TestActorHandler_PUT_EmptyName(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ActorHandler(a)
	body := `{"name":"","email":"bob@example.com"}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/actor", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestActorHandler_PUT_EmptyEmail(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ActorHandler(a)
	body := `{"name":"Bob","email":""}`
	req := httptest.NewRequest(http.MethodPut, "/api/v1/actor", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestActorHandler_PUT_Persists(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ActorHandler(a)

	// PUT new values
	putBody := `{"name":"Bob","email":"bob@example.com"}`
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/actor", bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusOK {
		t.Fatalf("PUT status = %d, want %d", putW.Code, http.StatusOK)
	}

	// GET the actor — must reflect the updated values, not the initial ones
	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/actor", nil)
	getW := httptest.NewRecorder()
	handler.ServeHTTP(getW, getReq)

	if getW.Code != http.StatusOK {
		t.Fatalf("GET status = %d, want %d", getW.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.Unmarshal(getW.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if resp["name"] != "Bob" {
		t.Errorf("name = %q, want %q", resp["name"], "Bob")
	}
	if resp["email"] != "bob@example.com" {
		t.Errorf("email = %q, want %q", resp["email"], "bob@example.com")
	}
}
