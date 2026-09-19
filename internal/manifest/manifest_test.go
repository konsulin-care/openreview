package manifest

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestNew_CreatesCorrectFields(t *testing.T) {
	m := New("01KABCDEFGHIJKLMNOPQRSTUVW", "Test Project")

	if m.SchemaVersion != "1.0.0" {
		t.Errorf("SchemaVersion = %q, want %q", m.SchemaVersion, "1.0.0")
	}
	if m.ProjectID != "01KABCDEFGHIJKLMNOPQRSTUVW" {
		t.Errorf("ProjectID = %q, want %q", m.ProjectID, "01KABCDEFGHIJKLMNOPQRSTUVW")
	}
	if m.Name != "Test Project" {
		t.Errorf("Name = %q, want %q", m.Name, "Test Project")
	}
	if m.CreatedAt == "" {
		t.Error("CreatedAt should not be empty")
	}
}

func TestParse_ValidYAML(t *testing.T) {
	data := []byte(`
schema_version: "1.0.0"
project_id: "01KABCDEFGHIJKLMNOPQRSTUVW"
name: "My Review"
created_at: "2026-09-16T12:00:00Z"
`)

	m, err := Parse(data)
	if err != nil {
		t.Fatalf("Parse() error = %v", err)
	}
	if m.SchemaVersion != "1.0.0" {
		t.Errorf("SchemaVersion = %q, want %q", m.SchemaVersion, "1.0.0")
	}
	if m.ProjectID != "01KABCDEFGHIJKLMNOPQRSTUVW" {
		t.Errorf("ProjectID = %q, want %q", m.ProjectID, "01KABCDEFGHIJKLMNOPQRSTUVW")
	}
	if m.Name != "My Review" {
		t.Errorf("Name = %q, want %q", m.Name, "My Review")
	}
}

func TestParse_InvalidYAML(t *testing.T) {
	_, err := Parse([]byte("not: valid: yaml: :::"))
	if err == nil {
		t.Error("Parse() should return error for invalid YAML")
	}
}

func TestValidate_ValidManifest(t *testing.T) {
	m := New("01KABCDEFGHIJKLMNOPQRSTUVW", "Test")
	if err := m.Validate(); err != nil {
		t.Errorf("Validate() error = %v", err)
	}
}

func TestValidate_WrongSchemaVersion(t *testing.T) {
	m := New("01KABCDEFGHIJKLMNOPQRSTUVW", "Test")
	m.SchemaVersion = "2.0.0"
	err := m.Validate()
	if err == nil {
		t.Error("Validate() should return error for wrong schema version")
	}
	if err != ErrInvalidSchemaVersion {
		t.Errorf("error = %v, want %v", err, ErrInvalidSchemaVersion)
	}
}

func TestValidate_InvalidProjectID(t *testing.T) {
	m := New("short", "Test")
	err := m.Validate()
	if err == nil {
		t.Error("Validate() should return error for invalid project ID")
	}
	if err != ErrInvalidProjectID {
		t.Errorf("error = %v, want %v", err, ErrInvalidProjectID)
	}
}

func TestWrite_CreatesFile(t *testing.T) {
	m := New("01KABCDEFGHIJKLMNOPQRSTUVW", "Test Project")

	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "openreview.yml")

	if err := m.Write(path); err != nil {
		t.Fatalf("Write() error = %v", err)
	}

	// Verify file exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Errorf("Write() did not create file at %s", path)
	}

	// Verify content can be parsed
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("ReadFile() error = %v", err)
	}
	parsed, err := Parse(data)
	if err != nil {
		t.Fatalf("Parse() error = %v", err)
	}
	if parsed.Name != "Test Project" {
		t.Errorf("parsed.Name = %q, want %q", parsed.Name, "Test Project")
	}
}

func TestWrite_YAMLContainsFields(t *testing.T) {
	m := New("01KABCDEFGHIJKLMNOPQRSTUVW", "Test Project")

	tmpDir := t.TempDir()
	path := filepath.Join(tmpDir, "openreview.yml")

	if err := m.Write(path); err != nil {
		t.Fatalf("Write() error = %v", err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("ReadFile() error = %v", err)
	}

	content := string(data)
	if !strings.Contains(content, "schema_version") {
		t.Error("YAML should contain schema_version")
	}
	if !strings.Contains(content, "project_id") {
		t.Error("YAML should contain project_id")
	}
	if !strings.Contains(content, "name") {
		t.Error("YAML should contain name")
	}
	if !strings.Contains(content, "created_at") {
		t.Error("YAML should contain created_at")
	}
}
