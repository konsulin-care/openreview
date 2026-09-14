// Package app manages application lifecycle and engine state.
package app

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
	State State
}

// NewApp creates a new App in StateNew.
func NewApp() *App {
	return &App{State: StateNew}
}
