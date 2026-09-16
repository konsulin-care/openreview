// Package manifest handles the openreview.yml project manifest schema,
// parsing, validation, and writing.
package manifest

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

const schemaVersion = "1.0.0"

// Manifest represents the openreview.yml project manifest.
type Manifest struct {
	SchemaVersion string `yaml:"schema_version"`
	ProjectID     string `yaml:"project_id"`
	Name          string `yaml:"name"`
	CreatedAt     string `yaml:"created_at"`
}

// New creates a new Manifest with the given project ID and name.
// Sets schema_version to "1.0.0" and created_at to the current UTC time.
func New(projectID, name string) *Manifest {
	return &Manifest{
		SchemaVersion: schemaVersion,
		ProjectID:     projectID,
		Name:          name,
		CreatedAt:     time.Now().UTC().Format(time.RFC3339),
	}
}

// Parse reads and unmarshals a YAML manifest from the given byte slice.
func Parse(data []byte) (*Manifest, error) {
	var m Manifest
	if err := yaml.Unmarshal(data, &m); err != nil {
		return nil, err
	}
	return &m, nil
}

// Validate checks that the manifest conforms to the expected schema.
// Returns an error if schema_version is not "1.0.0" or project_id is not a valid 26-char ULID.
func (m *Manifest) Validate() error {
	if m.SchemaVersion != schemaVersion {
		return ErrInvalidSchemaVersion
	}
	if len(m.ProjectID) != 26 {
		return ErrInvalidProjectID
	}
	return nil
}

// Write marshals the manifest to YAML and writes it to the given path.
func (m *Manifest) Write(path string) error {
	data, err := yaml.Marshal(m)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

// ErrInvalidSchemaVersion is returned when schema_version is not "1.0.0".
var ErrInvalidSchemaVersion = fmt.Errorf("invalid schema version: expected %q", schemaVersion)

// ErrInvalidProjectID is returned when project_id is not a valid 26-character ULID.
var ErrInvalidProjectID = fmt.Errorf("invalid project ID: must be a 26-character ULID")
