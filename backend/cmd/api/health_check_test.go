package main

import (
	"context"
	"strconv"
	"testing"
)

func TestCheckHealth(t *testing.T) {
	t.Run("a running app is healthy", func(t *testing.T) {
		app := startSmokeApp(t)
		port := app.base[len("http://127.0.0.1:"):]

		if err := checkHealth(context.Background(), fakeEnv(map[string]string{envPort: port})); err != nil {
			t.Errorf("checkHealth error = %v, want nil", err)
		}
	})
	t.Run("nothing listening is unhealthy", func(t *testing.T) {
		port := strconv.Itoa(freePort(t))

		if err := checkHealth(context.Background(), fakeEnv(map[string]string{envPort: port})); err == nil {
			t.Errorf("checkHealth error = nil, want an error")
		}
	})
	t.Run("a broken port is an error", func(t *testing.T) {
		if err := checkHealth(context.Background(), fakeEnv(map[string]string{envPort: "nope"})); err == nil {
			t.Errorf("checkHealth error = nil, want an error")
		}
	})
}
