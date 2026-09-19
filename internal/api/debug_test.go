package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/konsulin-care/openreview/internal/app"
)

func TestDebug_POST(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	t.Logf("App state: %v", a.State)
	t.Logf("App DB: %v", a.DB)

	handler := ProjectHandler(a)
	body := `{"name":"My Review"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/project", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	t.Logf("Status: %d", w.Code)
	t.Logf("Body: %s", w.Body.String())

	if w.Code != http.StatusOK {
		var resp map[string]string
		_ = json.Unmarshal(w.Body.Bytes(), &resp)
		t.Logf("Error: %s", resp["error"])
	}
}
