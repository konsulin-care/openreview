package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/konsulin-care/openreview/internal/app"
)

func TestDebug_PUT_PathChange(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Create a project
	createHandler := ProjectHandler(a)
	createBody := `{"name":"Move Me"}`
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	createHandler.ServeHTTP(createW, createReq)

	t.Logf("Create status: %d", createW.Code)
	t.Logf("Create body: %s", createW.Body.String())

	var createResp map[string]string
	_ = json.Unmarshal(createW.Body.Bytes(), &createResp)
	projectID := createResp["project_id"]
	oldPath := createResp["path"]

	t.Logf("Project ID: %s", projectID)
	t.Logf("Old path: %s", oldPath)

	// Check if old path exists
	if _, err := os.Stat(oldPath); os.IsNotExist(err) {
		t.Logf("Old path does NOT exist: %s", oldPath)
	} else {
		t.Logf("Old path exists: %s", oldPath)
		// List contents
		entries, _ := os.ReadDir(oldPath)
		for _, e := range entries {
			t.Logf("  - %s (dir=%v)", e.Name(), e.IsDir())
		}
	}

	// New path
	tmpDir := t.TempDir()
	newPath := filepath.Join(tmpDir, "moved-project")
	t.Logf("New path: %s", newPath)

	// PUT to change path
	handler := handleGetProjectById(a)
	putBody := fmt.Sprintf(`{"path":"%s"}`, newPath)
	putReq := httptest.NewRequest(http.MethodPut, "/api/v1/project/"+projectID, bytes.NewBufferString(putBody))
	putReq.Header.Set("Content-Type", "application/json")
	putW := httptest.NewRecorder()
	handler.ServeHTTP(putW, putReq)

	t.Logf("PUT status: %d", putW.Code)
	t.Logf("PUT body: %s", putW.Body.String())

	if putW.Code != http.StatusOK {
		var resp map[string]string
		_ = json.Unmarshal(putW.Body.Bytes(), &resp)
		t.Logf("Error: %s", resp["error"])
	}
}
