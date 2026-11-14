// Command api is the composition root: it only builds the context from OS
// signals and delegates to run, where all testable logic lives.
package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	_ "time/tzdata" // America/Santiago loads even where the system has no zone files
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	err := runCommand(ctx, os.Args[1:])
	stop()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

// runCommand serves the app, or with `health` checks the one already running.
func runCommand(ctx context.Context, args []string) error {
	if len(args) > 0 && args[0] == healthCommand {
		return checkHealth(ctx, os.Getenv)
	}
	return run(ctx, os.Getenv, os.Stdout)
}
