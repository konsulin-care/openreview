// Package database manages SQLite connections for the master DB and project cache.
package database

import (
	"database/sql"
	_ "embed"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaSQL string

// MasterDB manages the machine-local registry (actors, projects, settings).
type MasterDB struct {
	db *sql.DB
}

// Actor represents a user identity in the system.
type Actor struct {
	ID        string
	Name      string
	Email     string
	CreatedAt string
}

// Project represents a registered review project.
type Project struct {
	ID        string
	Path      string
	Name      string
	CreatedAt string
}

// Open opens or creates a SQLite database at path and initializes the schema.
func Open(path string) (*MasterDB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	if _, err := db.Exec(schemaSQL); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("execute schema: %w", err)
	}

	return &MasterDB{db: db}, nil
}

// Close releases the database resources.
func (m *MasterDB) Close() error {
	return m.db.Close()
}

// CreateActor inserts a new actor identity.
func (m *MasterDB) CreateActor(id, name, email string) error {
	_, err := m.db.Exec(
		"INSERT INTO actor (id, name, email, created_at) VALUES (?, ?, ?, ?)",
		id, name, email, time.Now().UTC().Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("create actor: %w", err)
	}
	return nil
}

// GetActor retrieves an actor by ID. Returns nil nil if not found.
func (m *MasterDB) GetActor(id string) (*Actor, error) {
	var a Actor
	err := m.db.QueryRow(
		"SELECT id, name, email, created_at FROM actor WHERE id = ?", id,
	).Scan(&a.ID, &a.Name, &a.Email, &a.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get actor: %w", err)
	}
	return &a, nil
}

// ListActors returns all registered actors.
func (m *MasterDB) ListActors() ([]Actor, error) {
	rows, err := m.db.Query("SELECT id, name, email, created_at FROM actor")
	if err != nil {
		return nil, fmt.Errorf("list actors: %w", err)
	}
	defer func() { _ = rows.Close() }()

	var actors []Actor
	for rows.Next() {
		var a Actor
		if err := rows.Scan(&a.ID, &a.Name, &a.Email, &a.CreatedAt); err != nil {
			return nil, fmt.Errorf("list actors scan: %w", err)
		}
		actors = append(actors, a)
	}
	return actors, rows.Err()
}

// RegisterProject adds a new project to the registry.
func (m *MasterDB) RegisterProject(id, path, name string) error {
	_, err := m.db.Exec(
		"INSERT INTO project (id, path, name, created_at) VALUES (?, ?, ?, ?)",
		id, path, name, time.Now().UTC().Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("register project: %w", err)
	}
	return nil
}

// GetProject retrieves a project by ID. Returns nil nil if not found.
func (m *MasterDB) GetProject(id string) (*Project, error) {
	var p Project
	err := m.db.QueryRow(
		"SELECT id, path, name, created_at FROM project WHERE id = ?", id,
	).Scan(&p.ID, &p.Path, &p.Name, &p.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	return &p, nil
}

// ListProjects returns all registered projects.
func (m *MasterDB) ListProjects() ([]Project, error) {
	rows, err := m.db.Query("SELECT id, path, name, created_at FROM project")
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	defer func() { _ = rows.Close() }()

	var projects []Project
	for rows.Next() {
		var p Project
		if err := rows.Scan(&p.ID, &p.Path, &p.Name, &p.CreatedAt); err != nil {
			return nil, fmt.Errorf("list projects scan: %w", err)
		}
		projects = append(projects, p)
	}
	return projects, rows.Err()
}

// UpdateProject updates the path and name of an existing project.
func (m *MasterDB) UpdateProject(id, path, name string) error {
	_, err := m.db.Exec(
		"UPDATE project SET path = ?, name = ? WHERE id = ?",
		path, name, id,
	)
	if err != nil {
		return fmt.Errorf("update project: %w", err)
	}
	return nil
}

// GetSetting retrieves a setting value by key. Returns empty string if not found.
func (m *MasterDB) GetSetting(key string) (string, error) {
	var value string
	err := m.db.QueryRow("SELECT value FROM setting WHERE key = ?", key).Scan(&value)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("get setting: %w", err)
	}
	return value, nil
}

// SetSetting inserts or updates a setting value.
func (m *MasterDB) SetSetting(key, value string) error {
	_, err := m.db.Exec(
		"INSERT INTO setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
		key, value,
	)
	if err != nil {
		return fmt.Errorf("set setting: %w", err)
	}
	return nil
}
