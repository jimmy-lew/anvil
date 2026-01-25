package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/jimmy-lew/anvil/packages/cli/pkg/app"
)

func main() {
	a := app.NewApp()

	// Handle cleanup on interrupt
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		a.Stop()
		os.Exit(0)
	}()

	if err := a.Run(); err != nil {
		a.Stop()
		panic(err)
	}
}
