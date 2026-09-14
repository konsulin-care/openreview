package database

import (
	"path/filepath"
	"testing"
)

func TestOpen_CreatesDatabaseWithTables(t *testing.T) {
	path := filepath.Join(t.TempDir(), "test.sqlite")

	db, err := Open(path)
	if err != nil {
		t.Fatalf("Open() error = %v", err)
	}
	defer func() { _ = db.Close() }()

	// Verify all three tables exist
	tables := []string{"actor", "project", "setting"}
	for _, table := range tables {
		var name string
		err := db.db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name=?", table).Scan(&name)
		if err != nil {
			t.Errorf("table %q not found: %v", table, err)
		}
	}
}

func TestOpen_Idempotent(t *testing.T) {
	path := filepath.Join(t.TempDir(), "test.sqlite")

	db1, err := Open(path)
	if err != nil {
		t.Fatalf("first Open() error = %v", err)
	}
	_ = db1.Close()

	db2, err := Open(path)
	if err != nil {
		t.Fatalf("second Open() error = %v", err)
	}
	defer func() { _ = db2.Close() }()

	// Tables should still exist
	var count int
	err = db2.db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name IN ('actor','project','setting')").Scan(&count)
	if err != nil {
		t.Fatalf("query error = %v", err)
	}
	if count != 3 {
		t.Errorf("expected 3 tables, got %d", count)
	}
}

// --- Actor CRUD ---

func TestCreateActor_And_Get(t *testing.T) {
	db := openTestDB(t)

	err := db.CreateActor("actor-1", "Alice", "alice@example.com")
	if err != nil {
		t.Fatalf("CreateActor() error = %v", err)
	}

	a, err := db.GetActor("actor-1")
	if err != nil {
		t.Fatalf("GetActor() error = %v", err)
	}
	if a == nil {
		t.Fatal("GetActor() returned nil")
	}
	if a.ID != "actor-1" || a.Name != "Alice" || a.Email != "alice@example.com" {
		t.Errorf("GetActor() = %+v", a)
	}
	if a.CreatedAt == "" {
		t.Error("CreatedAt is empty")
	}
}

func TestGetActor_NotFound(t *testing.T) {
	db := openTestDB(t)

	a, err := db.GetActor("nonexistent")
	if err != nil {
		t.Fatalf("GetActor() error = %v", err)
	}
	if a != nil {
		t.Errorf("GetActor() should return nil, got %+v", a)
	}
}

func TestListActors(t *testing.T) {
	db := openTestDB(t)

	_ = db.CreateActor("a1", "Alice", "a@example.com")
	_ = db.CreateActor("a2", "Bob", "b@example.com")

	actors, err := db.ListActors()
	if err != nil {
		t.Fatalf("ListActors() error = %v", err)
	}
	if len(actors) != 2 {
		t.Errorf("ListActors() returned %d actors, want 2", len(actors))
	}
}

// --- Project CRUD ---

func TestRegisterProject_And_Get(t *testing.T) {
	db := openTestDB(t)

	err := db.RegisterProject("proj-1", "/tmp/my-review", "My Review")
	if err != nil {
		t.Fatalf("RegisterProject() error = %v", err)
	}

	p, err := db.GetProject("proj-1")
	if err != nil {
		t.Fatalf("GetProject() error = %v", err)
	}
	if p == nil {
		t.Fatal("GetProject() returned nil")
	}
	if p.ID != "proj-1" || p.Path != "/tmp/my-review" || p.Name != "My Review" {
		t.Errorf("GetProject() = %+v", p)
	}
}

func TestGetProject_NotFound(t *testing.T) {
	db := openTestDB(t)

	p, err := db.GetProject("nonexistent")
	if err != nil {
		t.Fatalf("GetProject() error = %v", err)
	}
	if p != nil {
		t.Errorf("GetProject() should return nil, got %+v", p)
	}
}

func TestListProjects(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/path/1", "Review 1")
	_ = db.RegisterProject("p2", "/path/2", "Review 2")

	projects, err := db.ListProjects()
	if err != nil {
		t.Fatalf("ListProjects() error = %v", err)
	}
	if len(projects) != 2 {
		t.Errorf("ListProjects() returned %d, want 2", len(projects))
	}
}

func TestUpdateProject(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/old/path", "Old Name")
	err := db.UpdateProject("p1", "/new/path", "New Name")
	if err != nil {
		t.Fatalf("UpdateProject() error = %v", err)
	}

	p, _ := db.GetProject("p1")
	if p.Path != "/new/path" || p.Name != "New Name" {
		t.Errorf("after UpdateProject(), got %+v", p)
	}
}

// --- Setting CRUD ---

func TestGetSetting_NotFound(t *testing.T) {
	db := openTestDB(t)

	val, err := db.GetSetting("missing")
	if err != nil {
		t.Fatalf("GetSetting() error = %v", err)
	}
	if val != "" {
		t.Errorf("GetSetting() = %q, want empty string", val)
	}
}

func TestSetSetting_And_Get(t *testing.T) {
	db := openTestDB(t)

	err := db.SetSetting("theme", "dark")
	if err != nil {
		t.Fatalf("SetSetting() error = %v", err)
	}

	val, err := db.GetSetting("theme")
	if err != nil {
		t.Fatalf("GetSetting() error = %v", err)
	}
	if val != "dark" {
		t.Errorf("GetSetting() = %q, want %q", val, "dark")
	}
}

func TestSetSetting_Upsert(t *testing.T) {
	db := openTestDB(t)

	_ = db.SetSetting("key", "value1")
	_ = db.SetSetting("key", "value2")

	val, _ := db.GetSetting("key")
	if val != "value2" {
		t.Errorf("upsert failed: got %q, want %q", val, "value2")
	}
}

// openTestDB is a helper that opens an in-memory database for testing.
func openTestDB(t *testing.T) *MasterDB {
	t.Helper()
	db, err := Open(":memory:")
	if err != nil {
		t.Fatalf("Open(:memory:) error = %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}
