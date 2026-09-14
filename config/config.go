// Package config handles configuration loading, defaults, and CLI flags.
package config

import "flag"

// Config holds application configuration.
type Config struct {
	Port     int
	BindAddr string
}

// ParseFlags reads CLI flags and returns a Config with defaults.
// Defaults: port 1234, bind 127.0.0.1.
func ParseFlags() *Config {
	cfg := &Config{}
	flag.IntVar(&cfg.Port, "port", 1234, "HTTP server port")
	flag.StringVar(&cfg.BindAddr, "bind", "127.0.0.1", "HTTP server bind address")
	flag.Parse()
	return cfg
}
