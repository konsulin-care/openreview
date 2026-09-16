package integration

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/konsulin-care/openreview/internal/api"
	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/config"
)

func TestInitializationFlow(t *testing.T) {
	// Create a temp directory for the test database
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test.sqlite")

	a := app.NewApp()
	a.SetDBPath(dbPath)

	cfg := &config.Config{Port: 0, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	ts := httptest.NewServer(srv.Handler())
	defer ts.Close()

	client := ts.Client()

	// Step 1: GET /status should return NEW
	resp, err := client.Get(ts.URL + "/api/v1/status")
	if err != nil {
		t.Fatalf("GET /status error: %v", err)
	}
	status := decodeStatus(t, resp)

	if status["state"] != "NEW" {
		t.Errorf("GET /status: state = %q, want %q", status["state"], "NEW")
	}

	// Step 2: POST /initialize with valid input
	initBody := `{"name":"Test User","email":"test@example.com"}`
	resp, err = client.Post(ts.URL+"/api/v1/initialize", "application/json", bytes.NewBufferString(initBody))
	if err != nil {
		t.Fatalf("POST /initialize error: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("POST /initialize: status = %d, want %d", resp.StatusCode, http.StatusOK)
	}

	var initResp map[string]string
	decodeJSON(t, resp, &initResp)
	if initResp["actor_id"] == "" {
		t.Error("POST /initialize: actor_id should not be empty")
	}
	if initResp["state"] != "READY" {
		t.Errorf("POST /initialize: state = %q, want %q", initResp["state"], "READY")
	}

	// Step 3: GET /status should now return READY
	resp, err = client.Get(ts.URL + "/api/v1/status")
	if err != nil {
		t.Fatalf("GET /status error: %v", err)
	}
	status = decodeStatus(t, resp)

	if status["state"] != "READY" {
		t.Errorf("GET /status: state = %q, want %q", status["state"], "READY")
	}

	// Step 4: POST /initialize again should return 409
	resp, err = client.Post(ts.URL+"/api/v1/initialize", "application/json", bytes.NewBufferString(initBody))
	if err != nil {
		t.Fatalf("POST /initialize (second) error: %v", err)
	}
	_ = resp.Body.Close()

	if resp.StatusCode != http.StatusConflict {
		t.Errorf("POST /initialize (second): status = %d, want %d", resp.StatusCode, http.StatusConflict)
	}
}

func TestPreInitGuard(t *testing.T) {
	// Create a temp directory for the test database
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "test.sqlite")

	a := app.NewApp()
	a.SetDBPath(dbPath)

	cfg := &config.Config{Port: 0, BindAddr: "127.0.0.1"}
	srv := api.NewServer(a, cfg)

	ts := httptest.NewServer(srv.Handler())
	defer ts.Close()

	client := ts.Client()

	resp, err := client.Get(ts.URL + "/api/v1/health")
	if err != nil {
		t.Fatalf("GET /health error: %v", err)
	}
	_ = resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("GET /health: status = %d, want %d", resp.StatusCode, http.StatusOK)
	}
}

func decodeStatus(t *testing.T, resp *http.Response) map[string]string {
	t.Helper()
	defer func() { _ = resp.Body.Close() }()
	var status map[string]string
	decodeJSON(t, resp, &status)
	return status
}

func decodeJSON(t *testing.T, resp *http.Response, v any) {
	t.Helper()
	defer func() { _ = resp.Body.Close() }()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	if err := json.Unmarshal(body, v); err != nil {
		t.Fatalf("unmarshal: %v (body: %s)", err, body)
	}
}
