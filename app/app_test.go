package app

import (
	"path/filepath"
	"testing"

	"github.com/openreview/openreview/internal/database"
)

func TestNewApp_StateIsNew(t *testing.T) {
	a := NewApp()
	if a.State != StateNew {
		t.Errorf("NewApp().State = %v, want %v", a.State, StateNew)
	}
	if a.DB != nil {
		t.Error("NewApp().DB should be nil")
	}
}

func TestInit_NoDatabase(t *testing.T) {
	a := NewApp()
	path := filepath.Join(t.TempDir(), "nonexistent.sqlite")

	err := a.Init(path)
	if err != nil {
		t.Fatalf("Init() with no DB file should not error, got: %v", err)
	}
	if a.State != StateNew {
		t.Errorf("State = %v, want %v (no DB means not initialized)", a.State, StateNew)
	}
}

func TestInit_WithActor(t *testing.T) {
	// Create a DB with an actor
	path := filepath.Join(t.TempDir(), "test.sqlite")
	db, err := database.Open(path)
	if err != nil {
		t.Fatalf("database.Open() error = %v", err)
	}
	_ = db.CreateActor("actor-1", "Alice", "alice@example.com")
	_ = db.Close()

	// Init should detect the actor and set READY
	a := NewApp()
	err = a.Init(path)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if a.State != StateReady {
		t.Errorf("State = %v, want %v", a.State, StateReady)
	}
	if a.DB == nil {
		t.Error("DB should be non-nil after Init")
	}
}

func TestInit_EmptyDatabase(t *testing.T) {
	// Create a DB with no actors
	path := filepath.Join(t.TempDir(), "empty.sqlite")
	db, err := database.Open(path)
	if err != nil {
		t.Fatalf("database.Open() error = %v", err)
	}
	_ = db.Close()

	a := NewApp()
	err = a.Init(path)
	if err != nil {
		t.Fatalf("Init() error = %v", err)
	}
	if a.State != StateNew {
		t.Errorf("State = %v, want %v (DB exists but no actor)", a.State, StateNew)
	}
}
