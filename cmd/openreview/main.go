// Package main is the entry point for the openreview CLI.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/konsulin-care/openreview/internal/api"
	"github.com/konsulin-care/openreview/internal/app"
	"github.com/konsulin-care/openreview/internal/config"
	"github.com/konsulin-care/openreview/internal/database"
)

const draftExpiryInterval = 1 * time.Minute
const draftMaxAge = 10 * time.Minute

func main() {
	cfg := config.ParseFlags()
	a := app.NewApp()

	// Determine database path: use custom path from env (for testing) or default
	var dbPath string
	if customPath := os.Getenv("OPENREVIEW_DB_PATH"); customPath != "" {
		dbPath = customPath
		a.SetDBPath(dbPath)
	} else {
		var err error
		dbPath, err = database.MasterDBPath()
		if err != nil {
			log.Printf("warning: could not resolve data dir: %v", err)
		}
	}

	if dbPath != "" {
		if err := a.Init(dbPath); err != nil {
			log.Printf("warning: could not initialize master DB: %v", err)
		}
	}

	// Start draft expiry goroutine
	go startDraftExpiry(a)

	srv := api.NewServer(a, cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("listening on %s", srv.Addr())
		if err := srv.ListenAndServe(); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down")
	if err := srv.Shutdown(context.Background()); err != nil {
		log.Printf("shutdown error: %v", err)
	}
	os.Exit(0)
}

// startDraftExpiry runs a background goroutine that cleans up expired drafts.
func startDraftExpiry(a *app.App) {
	ticker := time.NewTicker(draftExpiryInterval)
	defer ticker.Stop()

	for range ticker.C {
		if a.DB == nil {
			continue
		}
		paths, err := a.DB.CleanupExpiredDrafts(draftMaxAge)
		if err != nil {
			log.Printf("warning: draft cleanup failed: %v", err)
			continue
		}
		for _, path := range paths {
			if err := os.RemoveAll(path); err != nil {
				log.Printf("warning: failed to remove draft directory %s: %v", path, err)
			}
		}
		if len(paths) > 0 {
			log.Printf("cleaned up %d expired draft(s)", len(paths))
		}
	}
}
