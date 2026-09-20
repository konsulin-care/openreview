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

	var resp []map[string]interface{}
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

// --- Paper count stats ---

func TestProjectHandler_GET_IncludesPaperCounts(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project
	handler := ProjectHandler(a)
	createBody := `{"name":"Paper Count Test"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	handler.ServeHTTP(createW, createReq)

	if createW.Code != http.StatusOK {
		t.Fatalf("create project failed: status %d", createW.Code)
	}

	// GET projects
	req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if len(resp) == 0 {
		t.Fatal("should have at least one project")
	}

	project := resp[0]

	// Verify paper count fields exist
	if _, ok := project["paper_count"]; !ok {
		t.Error("paper_count field missing")
	}
	if _, ok := project["accepted_count"]; !ok {
		t.Error("accepted_count field missing")
	}
	if _, ok := project["rejected_count"]; !ok {
		t.Error("rejected_count field missing")
	}
	if _, ok := project["no_decision_count"]; !ok {
		t.Error("no_decision_count field missing")
	}
	if _, ok := project["conflict_count"]; !ok {
		t.Error("conflict_count field missing")
	}

	// Verify counts are zeros (no papers yet)
	if project["paper_count"] != float64(0) {
		t.Errorf("paper_count = %v, want 0", project["paper_count"])
	}
	if project["accepted_count"] != float64(0) {
		t.Errorf("accepted_count = %v, want 0", project["accepted_count"])
	}
	if project["rejected_count"] != float64(0) {
		t.Errorf("rejected_count = %v, want 0", project["rejected_count"])
	}
	if project["no_decision_count"] != float64(0) {
		t.Errorf("no_decision_count = %v, want 0", project["no_decision_count"])
	}
	if project["conflict_count"] != float64(0) {
		t.Errorf("conflict_count = %v, want 0", project["conflict_count"])
	}
}

// --- Screening status ---

func TestProjectHandler_GET_IncludesScreeningStatus(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project
	handler := ProjectHandler(a)
	createBody := `{"name":"Screening Status Test"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	handler.ServeHTTP(createW, createReq)

	if createW.Code != http.StatusOK {
		t.Fatalf("create project failed: status %d", createW.Code)
	}

	// GET projects
	req := httptest.NewRequest(http.MethodGet, "/api/v1/project", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if len(resp) == 0 {
		t.Fatal("should have at least one project")
	}

	project := resp[0]

	// Verify screening_status field exists
	if _, ok := project["screening_status"]; !ok {
		t.Error("screening_status field missing")
	}

	// With no papers, screening status should be "not-started"
	if project["screening_status"] != "not-started" {
		t.Errorf("screening_status = %v, want not-started", project["screening_status"])
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

// --- Task 4: POST draft support ---

func TestProjectHandler_POST_DraftStatus(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"status":"draft"}`
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
	if resp["name"] != "" {
		t.Errorf("name = %q, want empty", resp["name"])
	}
	if resp["path"] == "" {
		t.Error("path should not be empty")
	}

	// Verify draft status in DB
	p, err := a.DB.GetProject(resp["project_id"])
	if err != nil {
		t.Fatalf("GetProject() error: %v", err)
	}
	if p.Status != "draft" {
		t.Errorf("status = %q, want %q", p.Status, "draft")
	}
}

func TestProjectHandler_POST_DraftWithEmptyName(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"name":"","status":"draft"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d (draft should allow empty name)", w.Code, http.StatusOK)
	}
}

func TestProjectHandler_POST_ActiveRequiresName(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := ProjectHandler(a)
	body := `{"name":"","status":"active"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (active requires name)", w.Code, http.StatusBadRequest)
	}
}

// --- Task 3: PUT handler ---

func TestProjectHandler_PUT_Success(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a draft project
	createHandler := ProjectHandler(a)
	createBody := `{"status":"draft"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	createHandler.ServeHTTP(createW, createReq)

	var createResp map[string]string
	_ = json.Unmarshal(createW.Body.Bytes(), &createResp)
	projectID := createResp["project_id"]

	// PUT to finalize the project
	handler := handleGetProjectById(a)
	putBody := `{"name":"Finalized Project","description":"Updated description","status":"active"}`
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/project/"+projectID, bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusOK {
		t.Fatalf("PUT status = %d, want %d", putW.Code, http.StatusOK)
	}

	var putResp map[string]string
	if err := json.Unmarshal(putW.Body.Bytes(), &putResp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if putResp["name"] != "Finalized Project" {
		t.Errorf("name = %q, want %q", putResp["name"], "Finalized Project")
	}

	// Verify status changed to active
	p, err := a.DB.GetProject(projectID)
	if err != nil {
		t.Fatalf("GetProject() error: %v", err)
	}
	if p.Status != "active" {
		t.Errorf("status = %q, want %q", p.Status, "active")
	}
	if p.Name != "Finalized Project" {
		t.Errorf("name = %q, want %q", p.Name, "Finalized Project")
	}
}

func TestProjectHandler_PUT_PathChange(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project
	createHandler := ProjectHandler(a)
	createBody := `{"name":"Move Me"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	createHandler.ServeHTTP(createW, createReq)

	var createResp map[string]string
	_ = json.Unmarshal(createW.Body.Bytes(), &createResp)
	projectID := createResp["project_id"]
	oldPath := createResp["path"]

	// Verify old path exists
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		t.Fatalf("old path should exist: %s", oldPath)
	}

	// New path (must be on same filesystem as source for os.Rename to work)
	newPath := filepath.Join(filepath.Dir(oldPath), "moved-"+projectID)

	// PUT to change path
	handler := handleGetProjectById(a)
	putBody := fmt.Sprintf(`{"path":"%s"}`, newPath)
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/project/"+projectID, bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusOK {
		t.Fatalf("PUT status = %d, want %d", putW.Code, http.StatusOK)
	}

	// Verify old path is gone
	if _, err := os.Stat(oldPath); !os.IsNotExist(err) {
		t.Errorf("old path should be removed: %s", oldPath)
	}

	// Verify new path exists
	if _, err := os.Stat(newPath); os.IsNotExist(err) {
		t.Errorf("new path should exist: %s", newPath)
	}

	// Verify DB updated
	p, _ := a.DB.GetProject(projectID)
	if p.Path != newPath {
		t.Errorf("path = %q, want %q", p.Path, newPath)
	}
}

func TestProjectHandler_PUT_Collision(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	createHandler := ProjectHandler(a)

	// Create first project
	tmpDir := t.TempDir()
	path1 := filepath.Join(tmpDir, "project-1")
	body1 := fmt.Sprintf(`{"name":"Project 1","path":"%s"}`, path1)
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body1))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	createHandler.ServeHTTP(w1, req1)

	var resp1 map[string]string
	_ = json.Unmarshal(w1.Body.Bytes(), &resp1)

	// Create second project
	path2 := filepath.Join(tmpDir, "project-2")
	body2 := fmt.Sprintf(`{"name":"Project 2","path":"%s"}`, path2)
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body2))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	createHandler.ServeHTTP(w2, req2)

	var resp2 map[string]string
	_ = json.Unmarshal(w2.Body.Bytes(), &resp2)

	// Try to move project 2 to project 1's path (collision)
	handler := handleGetProjectById(a)
	putBody := fmt.Sprintf(`{"path":"%s"}`, path1)
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/project/"+resp2["project_id"], bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusConflict {
		t.Errorf("status = %d, want %d (collision)", putW.Code, http.StatusConflict)
	}
}

func TestProjectHandler_PUT_RelativePathRejected(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project
	createHandler := ProjectHandler(a)
	createBody := `{"name":"Test"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	createHandler.ServeHTTP(createW, createReq)

	var createResp map[string]string
	_ = json.Unmarshal(createW.Body.Bytes(), &createResp)

	// Try to set relative path
	handler := handleGetProjectById(a)
	putBody := `{"path":"relative/path"}`
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/project/"+createResp["project_id"], bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d (relative path rejected)", putW.Code, http.StatusBadRequest)
	}
}

func TestProjectHandler_PUT_NotFound(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	handler := handleGetProjectById(a)
	putBody := `{"name":"Updated"}`
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/project/01ABC000000000000000000", bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", putW.Code, http.StatusNotFound)
	}
}
