package api

import (
	"testing"

	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/database"
)

func TestDebug_CheckMovedProject(t *testing.T) {
	a := app.NewApp()
	initializeAndClose(t, a)

	// Check if there's a project with path ending in "moved-project"
	projects, err := a.DB.ListProjects()
	if err != nil {
		t.Fatalf("ListProjects() error: %v", err)
	}

	for _, p := range projects {
		t.Logf("Project: id=%s path=%s name=%s status=%s", p.ID, p.Path, p.Name, p.Status)
	}

	// Check PathExists
	exists, err := a.DB.PathExists("/home/lam/data/lamuri/openreview/projects/moved-project")
	if err != nil {
		t.Fatalf("PathExists() error: %v", err)
	}
	t.Logf("PathExists('/home/lam/data/lamuri/openreview/projects/moved-project'): %v", exists)

	// Check DataDir
	dataDir, _ := database.DataDir()
	t.Logf("DataDir: %s", dataDir)
}
