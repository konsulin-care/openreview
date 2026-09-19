package database

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestDataDir_ReturnsNonEmpty(t *testing.T) {
	dir, err := DataDir()
	if err != nil {
		t.Fatalf("DataDir() error = %v", err)
	}
	if dir == "" {
		t.Error("DataDir() returned empty string")
	}
}

func TestDataDir_ContainsOpenreview(t *testing.T) {
	dir, err := DataDir()
	if err != nil {
		t.Fatalf("DataDir() error = %v", err)
	}
	if !strings.Contains(dir, "openreview") {
		t.Errorf("DataDir() = %q, should contain 'openreview'", dir)
	}
}

func TestDataDir_CreatesDirectory(t *testing.T) {
	// Use a temp home to avoid touching real directories
	t.Setenv("HOME", t.TempDir())
	// Also handle XDG_DATA_HOME for Linux
	if runtime.GOOS == "linux" {
		t.Setenv("XDG_DATA_HOME", filepath.Join(t.TempDir(), ".local", "share"))
	}

	dir, err := DataDir()
	if err != nil {
		t.Fatalf("DataDir() error = %v", err)
	}

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		t.Errorf("DataDir() did not create directory: %s", dir)
	}
}

func TestMasterDBPath_EndsWithFilename(t *testing.T) {
	path, err := MasterDBPath()
	if err != nil {
		t.Fatalf("MasterDBPath() error = %v", err)
	}
	if !strings.HasSuffix(path, "openreview.sqlite") {
		t.Errorf("MasterDBPath() = %q, should end with 'openreview.sqlite'", path)
	}
}

func TestMasterDBPath_ParentIsDataDir(t *testing.T) {
	dataDir, _ := DataDir()
	dbPath, _ := MasterDBPath()

	parent := filepath.Dir(dbPath)
	if parent != dataDir {
		t.Errorf("MasterDBPath() parent = %q, DataDir() = %q", parent, dataDir)
	}
}

func TestProjectDir_ReturnsNonEmpty(t *testing.T) {
	dir, err := ProjectDir()
	if err != nil {
		t.Fatalf("ProjectDir() error = %v", err)
	}
	if dir == "" {
		t.Error("ProjectDir() returned empty string")
	}
}

func TestProjectDir_ContainsProjects(t *testing.T) {
	dir, err := ProjectDir()
	if err != nil {
		t.Fatalf("ProjectDir() error = %v", err)
	}
	if !strings.Contains(dir, "projects") {
		t.Errorf("ProjectDir() = %q, should contain 'projects'", dir)
	}
}

func TestProjectDir_CreatesDirectory(t *testing.T) {
	// Use a temp home to avoid touching real directories
	t.Setenv("HOME", t.TempDir())
	if runtime.GOOS == "linux" {
		t.Setenv("XDG_DATA_HOME", filepath.Join(t.TempDir(), ".local", "share"))
	}

	dir, err := ProjectDir()
	if err != nil {
		t.Fatalf("ProjectDir() error = %v", err)
	}

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		t.Errorf("ProjectDir() did not create directory: %s", dir)
	}
}

func TestProjectPath_CorrectStructure(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	if runtime.GOOS == "linux" {
		t.Setenv("XDG_DATA_HOME", filepath.Join(t.TempDir(), ".local", "share"))
	}

	path, err := ProjectPath("01ABCDEF0123456789ABCDEFG")
	if err != nil {
		t.Fatalf("ProjectPath() error = %v", err)
	}

	if !strings.HasSuffix(path, "01ABCDEF0123456789ABCDEFG") {
		t.Errorf("ProjectPath() = %q, should end with project ID", path)
	}

	projectDir, _ := ProjectDir()
	expected := filepath.Join(projectDir, "01ABCDEF0123456789ABCDEFG")
	if path != expected {
		t.Errorf("ProjectPath() = %q, want %q", path, expected)
	}
}
