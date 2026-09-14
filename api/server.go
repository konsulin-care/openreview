// Package api provides HTTP handlers and routing for the OpenReview engine.
package api

import (
	"fmt"
	"net/http"

	"github.com/openreview/openreview/app"
	"github.com/openreview/openreview/config"
)

// Server wraps the HTTP server with OpenReview-specific routing.
type Server struct {
	httpServer *http.Server
}

// NewServer creates a Server with routes registered on the given app and config.
func NewServer(a *app.App, cfg *config.Config) *Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/health", HealthHandler())
	mux.HandleFunc("/api/v1/status", StatusHandler(a))
	mux.HandleFunc("/api/v1/initialize", InitializeHandler(a))

	addr := fmt.Sprintf("%s:%d", cfg.BindAddr, cfg.Port)
	return &Server{
		httpServer: &http.Server{
			Addr:    addr,
			Handler: mux,
		},
	}
}

// ListenAndServe starts the HTTP server.
func (s *Server) ListenAndServe() error {
	return s.httpServer.ListenAndServe()
}

// Addr returns the server's listening address.
func (s *Server) Addr() string {
	return s.httpServer.Addr
}

// Handler exposes the underlying http.Handler for testing.
func (s *Server) Handler() http.Handler {
	return s.httpServer.Handler
}
