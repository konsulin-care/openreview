package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/database"
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
	// Verify path is under the OS data dir, not CWD
	dataDir, err := database.DataDir()
	if err != nil {
		t.Fatalf("DataDir() error: %v", err)
	}
	if !strings.HasPrefix(resp["path"], dataDir) {
		t.Errorf("path = %q, should be under data dir %q", resp["path"], dataDir)
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

func TestProjectHandler_POST_WithCustomPath(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a temp directory for the custom path
	tmpDir := t.TempDir()
	customPath := filepath.Join(tmpDir, "my-custom-project")

	handler := ProjectHandler(a)
	body := fmt.Sprintf(`{"name":"Custom Path Project","path":"%s"}`, customPath)
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

	if resp["path"] != customPath {
		t.Errorf("path = %q, want %q", resp["path"], customPath)
	}

	// Verify directory was created at custom path
	for _, dir := range []string{"events", "papers", "exports"} {
		if _, err := os.Stat(filepath.Join(customPath, dir)); os.IsNotExist(err) {
			t.Errorf("directory %s not created", filepath.Join(customPath, dir))
		}
	}

	// Verify manifest file exists
	manifestPath := filepath.Join(customPath, "openreview.yml")
	if _, err := os.Stat(manifestPath); os.IsNotExist(err) {
		t.Errorf("manifest file not created at %s", manifestPath)
	}
}

func TestProjectHandler_POST_WithDescription(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"name":"Described Project","description":"A project with description"}`
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

	// Verify manifest contains description
	manifestPath := filepath.Join(resp["path"], "openreview.yml")
	data, err := os.ReadFile(manifestPath)
	if err != nil {
		t.Fatalf("read manifest: %v", err)
	}
	if !strings.Contains(string(data), "A project with description") {
		t.Error("manifest should contain description")
	}
}

func TestProjectHandler_POST_RelativePathRejected(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"name":"Relative Path","path":"relative/path"}`
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

func TestProjectHandler_GET_Empty(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	// Body must be a valid JSON array, not null
	body := w.Body.Bytes()
	if len(body) == 0 {
		t.Fatal("body is empty")
	}
	if string(body) == "null" {
		t.Error("body is null, want a JSON array")
	}
	if body[0] != '[' {
		t.Errorf("body starts with %c, want [", body[0])
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

func TestProjectHandler_DELETE_Success(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project first
	handler := ProjectHandler(a)
	createBody := `{"name":"To Delete"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	handler.ServeHTTP(createW, createReq)

	if createW.Code != http.StatusOK {
		t.Fatalf("create project failed: status %d", createW.Code)
	}

	var createResp map[string]string
	_ = json.Unmarshal(createW.Body.Bytes(), &createResp)
	projectID := createResp["project_id"]
	projectPath := createResp["path"]

	// Verify directory exists before delete
	if _, err := os.Stat(projectPath); os.IsNotExist(err) {
		t.Fatalf("project directory should exist before delete: %s", projectPath)
	}

	// DELETE the project
	deleteHandler := handleGetProjectById(a)
	deleteReq := httptest.NewRequest(http.MethodDelete, "/api/v1/project/"+projectID, nil)
	deleteW := httptest.NewRecorder()
	deleteHandler.ServeHTTP(deleteW, deleteReq)

	if deleteW.Code != http.StatusOK {
		t.Errorf("delete status = %d, want %d", deleteW.Code, http.StatusOK)
	}

	var deleteResp map[string]string
	if err := json.Unmarshal(deleteW.Body.Bytes(), &deleteResp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if deleteResp["project_id"] != projectID {
		t.Errorf("project_id = %q, want %q", deleteResp["project_id"], projectID)
	}
	if deleteResp["name"] != "To Delete" {
		t.Errorf("name = %q, want %q", deleteResp["name"], "To Delete")
	}

	// Verify directory was removed from disk
	if _, err := os.Stat(projectPath); !os.IsNotExist(err) {
		t.Errorf("project directory should be removed after delete: %s", projectPath)
	}

	// Verify project is gone from list
	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
	listW := httptest.NewRecorder()
	handler.ServeHTTP(listW, listReq)

	var projects []map[string]string
	_ = json.Unmarshal(listW.Body.Bytes(), &projects)
	for _, p := range projects {
		if p["id"] == projectID {
			t.Error("deleted project should not appear in list")
		}
	}
}

func TestProjectHandler_DELETE_NotFound(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := handleGetProjectById(a)
	req := httptest.NewRequest(http.MethodDelete, "/api/v1/project/01ABC000000000000000000", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", w.Code, http.StatusNotFound)
	}
}

func TestProjectHandler_DELETE_NotInitialized(t *testing.T) {
	a := app.NewApp()

	handler := handleGetProjectById(a)
	req := httptest.NewRequest(http.MethodDelete, "/api/v1/project/01ABC000000000000000000", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("status = %d, want %d", w.Code, http.StatusServiceUnavailable)
	}
}
