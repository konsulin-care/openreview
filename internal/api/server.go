// Package api provides HTTP handlers and routing for the OpenReview engine.
package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/config"
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
	mux.HandleFunc("/api/v1/preflight", PreflightHandler())
	mux.HandleFunc("/api/v1/initialize", InitializeHandler(a))
	mux.HandleFunc("/api/v1/actor", ActorHandler(a))
	mux.HandleFunc("/api/v1/config", ConfigHandler())
	mux.HandleFunc("/api/v1/project", ProjectHandler(a))
	mux.HandleFunc("/api/v1/project/", handleGetProjectById(a))

	handler := corsMiddleware(cfg.CorsOrigins, mux)

	addr := fmt.Sprintf("%s:%d", cfg.BindAddr, cfg.Port)
	return &Server{
		httpServer: &http.Server{
			Addr:    addr,
			Handler: handler,
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

// Shutdown gracefully stops the HTTP server.
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

// requireReady returns 503 if the app state is not READY.
func requireReady(a *app.App, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if a.State != app.StateReady {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "not initialized"})
			return
		}
		next(w, r)
	}
}

// corsMiddleware adds CORS headers to responses.
// When origins is empty, all origins are allowed.
// When origins is a comma-separated list, only listed origins are allowed.
func corsMiddleware(origins string, next http.Handler) http.Handler {
	allowed := strings.Split(origins, ",")
	allowAll := origins == ""

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Determine if origin is allowed
		var allowedOrigin string
		if allowAll && origin != "" {
			allowedOrigin = "*"
		} else if !allowAll && origin != "" {
			for _, o := range allowed {
				if strings.TrimSpace(o) == origin {
					allowedOrigin = origin
					break
				}
			}
		}

		// Handle preflight
		if r.Method == http.MethodOptions {
			if allowedOrigin != "" {
				w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
				w.Header().Set("Access-Control-Max-Age", "86400")
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Set CORS headers for actual requests
		if allowedOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}

		next.ServeHTTP(w, r)
	})
}
