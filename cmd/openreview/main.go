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
)

func main() {
	cfg := config.ParseFlags()
	a := app.NewApp()
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
	os.Exit(0)
}
