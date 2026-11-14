package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// healthCommand is `mail-checker health`: the container's health check. The
// final image has no shell nor curl, so the binary asks itself.
const (
	healthCommand = "health"
	healthTimeout = 3 * time.Second
)

// checkHealth asks the running app on its own port for /api/health; any
// answer other than 200 is unhealthy.
func checkHealth(ctx context.Context, getenv func(string) string) error {
	port, err := readPort(getenv)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(ctx, healthTimeout)
	defer cancel()
	url := fmt.Sprintf("http://127.0.0.1:%d/api/health", port)
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("health request: %w", err)
	}
	res, err := http.DefaultClient.Do(request)
	if err != nil {
		return fmt.Errorf("health check: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("health check: status %d", res.StatusCode)
	}
	return nil
}
