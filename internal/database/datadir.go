package database

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

const appName = "openreview"

// DataDir returns the OS-specific application data directory.
// Linux: ~/.local/share/openreview
// macOS: ~/Library/Application Support/openreview
// Windows: %LOCALAPPDATA%\openreview
// Creates the directory if it doesn't exist.
func DataDir() (string, error) {
	var base string

	switch runtime.GOOS {
	case "linux":
		xdg := os.Getenv("XDG_DATA_HOME")
		if xdg == "" {
			home, err := os.UserHomeDir()
			if err != nil {
				return "", fmt.Errorf("home directory: %w", err)
			}
			xdg = filepath.Join(home, ".local", "share")
		}
		base = xdg

	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("home directory: %w", err)
		}
		base = filepath.Join(home, "Library", "Application Support")

	case "windows":
		local := os.Getenv("LOCALAPPDATA")
		if local == "" {
			return "", fmt.Errorf("LOCALAPPDATA not set")
		}
		base = local

	default:
		return "", fmt.Errorf("unsupported OS: %s", runtime.GOOS)
	}

	dir := filepath.Join(base, appName)
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return "", fmt.Errorf("create data directory: %w", err)
	}

	return dir, nil
}

// MasterDBPath returns the path to the master SQLite database file.
func MasterDBPath() (string, error) {
	dir, err := DataDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, appName+".sqlite"), nil
}

// ProjectDir returns the directory for storing project data.
// Structure: <DataDir>/projects/
// Creates the directory if it doesn't exist.
func ProjectDir() (string, error) {
	dir, err := DataDir()
	if err != nil {
		return "", err
	}
	projectsDir := filepath.Join(dir, "projects")
	if err := os.MkdirAll(projectsDir, 0o700); err != nil {
		return "", fmt.Errorf("create projects directory: %w", err)
	}
	return projectsDir, nil
}

// ProjectPath returns the full path for a project directory.
// Structure: <ProjectDir>/<projectID>/
func ProjectPath(projectID string) (string, error) {
	dir, err := ProjectDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, projectID), nil
}
