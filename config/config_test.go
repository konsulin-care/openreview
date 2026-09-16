package config_test

import (
	"testing"

	"github.com/openreview/openreview/config"
)

func TestParseFlagsDefaultCorsOrigins(t *testing.T) {
	cfg := config.ParseFlagsWithArgs(nil)

	if cfg.CorsOrigins != "" {
		t.Errorf("CorsOrigins = %q, want empty string", cfg.CorsOrigins)
	}
}

func TestParseFlagsCorsOriginsFromEnv(t *testing.T) {
	origins := "http://localhost:4321,https://example.com"
	t.Setenv("OPENREVIEW_CORS_ORIGINS", origins)

	cfg := config.ParseFlagsWithArgs(nil)

	if cfg.CorsOrigins != origins {
		t.Errorf("CorsOrigins = %q, want %q", cfg.CorsOrigins, origins)
	}
}

func TestParseFlagsCorsOriginsEmptyEnv(t *testing.T) {
	t.Setenv("OPENREVIEW_CORS_ORIGINS", "")

	cfg := config.ParseFlagsWithArgs(nil)

	if cfg.CorsOrigins != "" {
		t.Errorf("CorsOrigins = %q, want empty string", cfg.CorsOrigins)
	}
}
