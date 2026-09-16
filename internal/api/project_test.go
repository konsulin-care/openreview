package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/konsulin-care/openreview/internal/app"
)

func TestProjectHandler_POST_Success(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"name":"My Review"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if resp["project_id"] == "" {
		t.Error("project_id should not be empty")
	}
	if len(resp["project_id"]) != 26 {
		t.Errorf("project_id length = %d, want 26", len(resp["project_id"]))
	}
	if resp["name"] != "My Review" {
		t.Errorf("name = %q, want %q", resp["name"], "My Review")
	}
	if resp["path"] == "" {
		t.Error("path should not be empty")
	}
	if resp["created_at"] == "" {
		t.Error("created_at should not be empty")
	}

	// Verify project directory was created
	projectPath := resp["path"]
	for _, dir := range []string{"events", "papers", "exports"} {
		if _, err := os.Stat(filepath.Join(projectPath, dir)); os.IsNotExist(err) {
			t.Errorf("directory %s not created", filepath.Join(projectPath, dir))
		}
	}

	// Verify manifest file exists
	manifestPath := filepath.Join(projectPath, "openreview.yml")
	if _, err := os.Stat(manifestPath); os.IsNotExist(err) {
		t.Errorf("manifest file not created at %s", manifestPath)
	}
}

func TestProjectHandler_POST_NotInitialized(t *testing.T) {
	a := app.NewApp()

	handler := ProjectHandler(a)
	body := `{"name":"My Review"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("status = %d, want %d", w.Code, http.StatusServiceUnavailable)
	}
}

func TestProjectHandler_POST_MissingName(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"name":""}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestProjectHandler_POST_MissingBody(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}

func TestProjectHandler_GET_Success(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project first
	initHandler := InitializeHandler(a)
	initBody := `{"name":"Alice","email":"alice@example.com"}`
	initReq := httptest.NewRequest(http.MethodPost, "/api/v1/initialize", bytes.NewBufferString(initBody))
	initReq.Header.Set("Content-Type", "application/json")
	initW := httptest.NewRecorder()
	initHandler.ServeHTTP(initW, initReq)

	// Now create a project via the handler
	createHandler := ProjectHandler(a)
	createBody := `{"name":"My Project"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	createHandler.ServeHTTP(createW, createReq)

	if createW.Code != http.StatusOK {
		t.Fatalf("create project failed: status %d", createW.Code)
	}

	// Now GET projects
	handler := ProjectHandler(a)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp []map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if len(resp) == 0 {
		t.Error("should have at least one project")
	}
}

func TestProjectHandler_GET_NotInitialized(t *testing.T) {
	a := app.NewApp()

	handler := ProjectHandler(a)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("status = %d, want %d", w.Code, http.StatusServiceUnavailable)
	}
}
