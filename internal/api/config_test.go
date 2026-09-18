package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/konsulin-care/openreview/internal/database"
)

func TestConfigHandler_Success(t *testing.T) {
	handler := ConfigHandler()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/config", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var resp map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}

	expectedDir, err := database.ProjectDir()
	if err != nil {
		t.Fatalf("ProjectDir() error: %v", err)
	}

	if resp["project_dir"] != expectedDir {
		t.Errorf("project_dir = %q, want %q", resp["project_dir"], expectedDir)
	}
}

func TestConfigHandler_NoInitializationRequired(t *testing.T) {
	handler := ConfigHandler()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/config", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}
}
