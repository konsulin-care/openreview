// Package app manages application lifecycle and engine state.
package app

import (
	"log"

	"github.com/konsulin-care/openreview/internal/database"
)

// State represents the engine's lifecycle state.
type State string

const (
	// StateNew indicates the engine has not been initialized.
	StateNew State = "NEW"
	// StateReady indicates the engine is initialized and serving requests.
	StateReady State = "READY"
)

// App holds the application state.
type App struct {
	State  State
	DB     *database.MasterDB
	DBPath string // configurable database path (for testing)
}

// NewApp creates a new App in StateNew.
func NewApp() *App {
	return &App{State: StateNew}
}

// Init attempts to open an existing master database and checks for an actor.
// If the database file exists and contains an actor, state transitions to READY.
// If the file doesn't exist or has no actor, state stays NEW.
func (a *App) Init(dbPath string) error {
	path := dbPath
	if path == "" {
		path = a.DBPath
	}
	if path == "" {
		var err error
		path, err = database.MasterDBPath()
		if err != nil {
			return err
		}
	}

	db, err := database.Open(path)
	if err != nil {
		// Database file doesn't exist or can't be opened — stay in NEW
		log.Printf("master DB not available, staying in NEW state: %v", err)
		return nil
	}

	actors, err := db.ListActors()
	if err != nil {
		_ = db.Close()
		return err
	}

	if len(actors) > 0 {
		a.DB = db
		a.State = StateReady
		return nil
	}

	// DB exists but no actor — stay in NEW, but keep DB open for later initialization
	a.DB = db
	return nil
}

// SetDBPath sets a custom database path (primarily for testing).
func (a *App) SetDBPath(path string) {
	a.DBPath = path
}
