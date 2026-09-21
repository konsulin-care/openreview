package database

import (
	"path/filepath"
	"testing"
	"time"
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

	err := db.RegisterProject("proj-1", "/tmp/my-review", "My Review", "active", "")
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
	if p.Status != "active" {
		t.Errorf("GetProject().Status = %q, want %q", p.Status, "active")
	}
}

func TestRegisterProject_DraftStatus(t *testing.T) {
	db := openTestDB(t)

	err := db.RegisterProject("draft-1", "/tmp/draft", "", "draft", "")
	if err != nil {
		t.Fatalf("RegisterProject() error = %v", err)
	}

	p, err := db.GetProject("draft-1")
	if err != nil {
		t.Fatalf("GetProject() error = %v", err)
	}
	if p == nil {
		t.Fatal("GetProject() returned nil")
	}
	if p.Status != "draft" {
		t.Errorf("GetProject().Status = %q, want %q", p.Status, "draft")
	}
	if p.Name != "" {
		t.Errorf("GetProject().Name = %q, want empty", p.Name)
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

	_ = db.RegisterProject("p1", "/path/1", "Review 1", "active", "")
	_ = db.RegisterProject("p2", "/path/2", "Review 2", "active", "")

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

	_ = db.RegisterProject("p1", "/old/path", "Old Name", "active", "")
	err := db.UpdateProject("p1", "/new/path", "New Name")
	if err != nil {
		t.Fatalf("UpdateProject() error = %v", err)
	}

	p, _ := db.GetProject("p1")
	if p.Path != "/new/path" || p.Name != "New Name" {
		t.Errorf("after UpdateProject(), got %+v", p)
	}
}

// --- Project Status ---

func TestUpdateProjectStatus(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/path/1", "Review", "draft", "")
	err := db.UpdateProjectStatus("p1", "active")
	if err != nil {
		t.Fatalf("UpdateProjectStatus() error = %v", err)
	}

	p, _ := db.GetProject("p1")
	if p.Status != "active" {
		t.Errorf("after UpdateProjectStatus(), Status = %q, want %q", p.Status, "active")
	}
}

func TestCleanupExpiredDrafts(t *testing.T) {
	db := openTestDB(t)

	// Create drafts with different ages
	_ = db.RegisterProject("draft-old", "/tmp/old", "Old", "draft", "")
	_ = db.RegisterProject("draft-new", "/tmp/new", "New", "draft", "")
	_ = db.RegisterProject("active-1", "/tmp/active", "Active", "active", "")

	// Make draft-old appear old by updating created_at
	_, _ = db.db.Exec("UPDATE project SET created_at = datetime('now', '-1 hour') WHERE id = 'draft-old'")

	paths, err := db.CleanupExpiredDrafts(10 * time.Minute)
	if err != nil {
		t.Fatalf("CleanupExpiredDrafts() error = %v", err)
	}

	// Should only return the old draft path
	if len(paths) != 1 || paths[0] != "/tmp/old" {
		t.Errorf("CleanupExpiredDrafts() = %v, want [/tmp/old]", paths)
	}

	// Old draft should be deleted
	p, _ := db.GetProject("draft-old")
	if p != nil {
		t.Error("old draft should be deleted")
	}

	// New draft should remain
	p, _ = db.GetProject("draft-new")
	if p == nil {
		t.Error("new draft should remain")
	}

	// Active project should remain
	p, _ = db.GetProject("active-1")
	if p == nil {
		t.Error("active project should remain")
	}
}

func TestPathExists(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/path/to/project", "Review", "active", "")

	exists, err := db.PathExists("/path/to/project")
	if err != nil {
		t.Fatalf("PathExists() error = %v", err)
	}
	if !exists {
		t.Error("PathExists() = false, want true")
	}

	exists, err = db.PathExists("/other/path")
	if err != nil {
		t.Fatalf("PathExists() error = %v", err)
	}
	if exists {
		t.Error("PathExists() = true, want false")
	}
}

func TestPathExists_ExcludesProject(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/path/to/project", "Review", "active", "")

	// Same path but different project ID should return false
	exists, err := db.PathExists("/path/to/project")
	if err != nil {
		t.Fatalf("PathExists() error = %v", err)
	}
	if !exists {
		t.Error("PathExists() = false, want true")
	}
}

// --- Batch Delete ---

func TestDeleteProjects_Success(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/path/1", "Review 1", "active", "")
	_ = db.RegisterProject("p2", "/path/2", "Review 2", "active", "")
	_ = db.RegisterProject("p3", "/path/3", "Review 3", "active", "")

	err := db.DeleteProjects([]string{"p1", "p2"})
	if err != nil {
		t.Fatalf("DeleteProjects() error = %v", err)
	}

	// p1 and p2 should be deleted
	p, _ := db.GetProject("p1")
	if p != nil {
		t.Error("p1 should be deleted")
	}
	p, _ = db.GetProject("p2")
	if p != nil {
		t.Error("p2 should be deleted")
	}

	// p3 should remain
	p, _ = db.GetProject("p3")
	if p == nil {
		t.Error("p3 should remain")
	}
}

func TestDeleteProjects_PartialNotFound(t *testing.T) {
	db := openTestDB(t)

	_ = db.RegisterProject("p1", "/path/1", "Review 1", "active", "")

	err := db.DeleteProjects([]string{"p1", "nonexistent"})
	if err != nil {
		t.Fatalf("DeleteProjects() error = %v", err)
	}

	// p1 should be deleted despite nonexistent being in the list
	p, _ := db.GetProject("p1")
	if p != nil {
		t.Error("p1 should be deleted")
	}
}

func TestDeleteProjects_EmptyList(t *testing.T) {
	db := openTestDB(t)

	err := db.DeleteProjects([]string{})
	if err != nil {
		t.Fatalf("DeleteProjects() error = %v", err)
	}
}

func TestDeleteProjects_NilList(t *testing.T) {
	db := openTestDB(t)

	err := db.DeleteProjects(nil)
	if err != nil {
		t.Fatalf("DeleteProjects() error = %v", err)
	}
}

// --- Description field ---

func TestRegisterProject_WithDescription(t *testing.T) {
	db := openTestDB(t)

	err := db.RegisterProject("proj-desc", "/tmp/desc-review", "Desc Review", "active", "")
	if err != nil {
		t.Fatalf("RegisterProject() error = %v", err)
	}

	p, err := db.GetProject("proj-desc")
	if err != nil {
		t.Fatalf("GetProject() error = %v", err)
	}
	if p == nil {
		t.Fatal("GetProject() returned nil")
	}
	if p.Description != "" {
		t.Errorf("Description = %q, want empty string", p.Description)
	}
}

func TestRegisterProject_WithDescriptionValue(t *testing.T) {
	db := openTestDB(t)

	err := db.RegisterProject("proj-desc2", "/tmp/desc-review2", "Desc Review 2", "active", "A comprehensive review of XYZ")
	if err != nil {
		t.Fatalf("RegisterProject() error = %v", err)
	}

	p, err := db.GetProject("proj-desc2")
	if err != nil {
		t.Fatalf("GetProject() error = %v", err)
	}
	if p == nil {
		t.Fatal("GetProject() returned nil")
	}
	if p.Description != "A comprehensive review of XYZ" {
		t.Errorf("Description = %q, want %q", p.Description, "A comprehensive review of XYZ")
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

// --- Actor Update ---

func TestUpdateActor_Success(t *testing.T) {
	db := openTestDB(t)

	_ = db.CreateActor("actor-1", "Alice", "alice@example.com")
	err := db.UpdateActor("actor-1", "Alice Updated", "alice.new@example.com")
	if err != nil {
		t.Fatalf("UpdateActor() error = %v", err)
	}

	a, _ := db.GetActor("actor-1")
	if a.Name != "Alice Updated" || a.Email != "alice.new@example.com" {
		t.Errorf("after UpdateActor(), got %+v", a)
	}
}

func TestUpdateActor_NotFound(t *testing.T) {
	db := openTestDB(t)

	err := db.UpdateActor("nonexistent", "Name", "email@example.com")
	if err == nil {
		t.Error("UpdateActor() should return error for nonexistent actor")
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
