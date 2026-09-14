// Package config handles configuration loading, defaults, and CLI flags.
package config

import (
	"flag"
	"os"
)

// Config holds application configuration.
type Config struct {
	Port        int
	BindAddr    string
	CorsOrigins string
}

// ParseFlags reads CLI flags and returns a Config with defaults.
// Defaults: port 1234, bind 127.0.0.1.
// CorsOrigins is read from OPENREVIEW_CORS_ORIGINS env var.
func ParseFlags() *Config {
	return ParseFlagsWithArgs(os.Args[1:])
}

// ParseFlagsWithArgs parses the given args and returns a Config.
// This is useful for testing.
func ParseFlagsWithArgs(args []string) *Config {
	cfg := &Config{}
	fs := flag.NewFlagSet("openreview", flag.ContinueOnError)
	fs.IntVar(&cfg.Port, "port", 1234, "HTTP server port")
	fs.StringVar(&cfg.BindAddr, "bind", "127.0.0.1", "HTTP server bind address")
	_ = fs.Parse(args)
	cfg.CorsOrigins = os.Getenv("OPENREVIEW_CORS_ORIGINS")
	return cfg
}
