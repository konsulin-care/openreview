package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/konsulin-care/openreview/internal/app"
)

func TestDraftExpiry_CleanupExpiredDrafts(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a draft project
	handler := ProjectHandler(a)
	createBody := `{"status":"draft"}`
	createReq := createRequest(t, "POST", "/api/v1/project", createBody)
	createW := executeRequest(t, handler, createReq)

	var createResp map[string]string
	_ = parseResponse(t, createW, &createResp)
	projectID := createResp["project_id"]
	projectPath := createResp["path"]

	// Verify draft exists
	p, err := a.DB.GetProject(projectID)
	if err != nil {
		t.Fatalf("GetProject() error: %v", err)
	}
	if p == nil {
		t.Fatal("draft should exist")
	}
	if p.Status != "draft" {
		t.Errorf("status = %q, want %q", p.Status, "draft")
	}

	// Verify directory exists
	if _, err := os.Stat(projectPath); os.IsNotExist(err) {
		t.Errorf("draft directory should exist: %s", projectPath)
	}

	// Make the draft appear old by updating created_at
	_ = a.DB.Exec(
		"UPDATE project SET created_at = datetime('now', '-1 hour') WHERE id = ?",
		projectID,
	)

	// Run cleanup
	paths, err := a.DB.CleanupExpiredDrafts(10 * time.Minute)
	if err != nil {
		t.Fatalf("CleanupExpiredDrafts() error: %v", err)
	}

	// Should return the expired draft path
	if len(paths) != 1 || paths[0] != projectPath {
		t.Errorf("CleanupExpiredDrafts() = %v, want [%s]", paths, projectPath)
	}

	// Remove the directory
	for _, path := range paths {
		if err := os.RemoveAll(path); err != nil {
			t.Errorf("RemoveAll(%s) error: %v", path, err)
		}
	}

	// Verify draft is deleted from DB
	p, _ = a.DB.GetProject(projectID)
	if p != nil {
		t.Error("expired draft should be deleted from DB")
	}

	// Verify directory is removed
	if _, err := os.Stat(projectPath); !os.IsNotExist(err) {
		t.Errorf("draft directory should be removed: %s", projectPath)
	}
}

func TestDraftExpiry_KeepsRecentDrafts(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a draft project
	handler := ProjectHandler(a)
	createBody := `{"status":"draft"}`
	createReq := createRequest(t, "POST", "/api/v1/project", createBody)
	createW := executeRequest(t, handler, createReq)

	var createResp map[string]string
	_ = parseResponse(t, createW, &createResp)
	projectID := createResp["project_id"]

	// Verify draft exists
	p, err := a.DB.GetProject(projectID)
	if err != nil {
		t.Fatalf("GetProject() error: %v", err)
	}
	if p == nil {
		t.Fatal("draft should exist")
	}

	// Run cleanup (draft is recent, should not be cleaned up)
	paths, err := a.DB.CleanupExpiredDrafts(10 * time.Minute)
	if err != nil {
		t.Fatalf("CleanupExpiredDrafts() error: %v", err)
	}

	// Should not return any paths
	if len(paths) != 0 {
		t.Errorf("CleanupExpiredDrafts() = %v, want []", paths)
	}

	// Verify draft still exists
	p, _ = a.DB.GetProject(projectID)
	if p == nil {
		t.Error("recent draft should still exist")
	}
}

func TestDraftExpiry_KeepsActiveProjects(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create an active project
	handler := ProjectHandler(a)
	createBody := `{"name":"Active Project"}`
	createReq := createRequest(t, "POST", "/api/v1/project", createBody)
	createW := executeRequest(t, handler, createReq)

	var createResp map[string]string
	_ = parseResponse(t, createW, &createResp)
	projectID := createResp["project_id"]

	// Make the project appear old
	_ = a.DB.Exec(
		"UPDATE project SET created_at = datetime('now', '-1 hour') WHERE id = ?",
		projectID,
	)

	// Run cleanup
	paths, err := a.DB.CleanupExpiredDrafts(10 * time.Minute)
	if err != nil {
		t.Fatalf("CleanupExpiredDrafts() error: %v", err)
	}

	// Should not return any paths (active projects are not cleaned up)
	if len(paths) != 0 {
		t.Errorf("CleanupExpiredDrafts() = %v, want []", paths)
	}

	// Verify active project still exists
	p, _ := a.DB.GetProject(projectID)
	if p == nil {
		t.Error("active project should still exist")
	}
	if p.Status != "active" {
		t.Errorf("status = %q, want %q", p.Status, "active")
	}
}

// Helper functions for tests

func createRequest(t *testing.T, method, path, body string) *http.Request {
	t.Helper()
	req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	return req
}

func executeRequest(t *testing.T, handler http.HandlerFunc, req *http.Request) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	return w
}

func parseResponse(t *testing.T, w *httptest.ResponseRecorder, v interface{}) error {
	t.Helper()
	return json.Unmarshal(w.Body.Bytes(), v)
}
