// Package main is the entry point for the openreview CLI.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/openreview/openreview/api"
	"github.com/openreview/openreview/app"
	"github.com/openreview/openreview/config"
	"github.com/openreview/openreview/internal/database"
)

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
