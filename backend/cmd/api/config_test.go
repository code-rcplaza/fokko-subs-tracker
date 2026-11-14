package main

import (
	"strings"
	"testing"
)

func fakeEnv(values map[string]string) func(string) string {
	return func(name string) string { return values[name] }
}

func TestLoadConfig_UsesDefaultsWhenUnset(t *testing.T) {
	got, err := LoadConfig(fakeEnv(nil))
	if err != nil {
		t.Fatalf("LoadConfig() error = %v, want nil", err)
	}
	want := Config{Host: "127.0.0.1", Port: 8080, DBPath: "data/mail-checker.db"}
	if got != want {
		t.Errorf("LoadConfig() = %+v, want %+v", got, want)
	}
}

func TestLoadConfig_ReadsValuesFromEnv(t *testing.T) {
	got, err := LoadConfig(fakeEnv(map[string]string{
		"MAILCHECKER_HOST":    "0.0.0.0",
		"MAILCHECKER_PORT":    "9090",
		"MAILCHECKER_DB_PATH": "/tmp/x.db",
	}))
	if err != nil {
		t.Fatalf("LoadConfig() error = %v, want nil", err)
	}
	want := Config{Host: "0.0.0.0", Port: 9090, DBPath: "/tmp/x.db"}
	if got != want {
		t.Errorf("LoadConfig() = %+v, want %+v", got, want)
	}
}

func TestLoadConfig_RejectsInvalidPort(t *testing.T) {
	for _, port := range []string{"abc", "0", "70000"} {
		t.Run(port, func(t *testing.T) {
			_, err := LoadConfig(fakeEnv(map[string]string{"MAILCHECKER_PORT": port}))
			if err == nil {
				t.Fatalf("LoadConfig() error = nil, want error for port %q", port)
			}
			if !strings.Contains(err.Error(), "MAILCHECKER_PORT") {
				t.Errorf("error %q does not name MAILCHECKER_PORT", err)
			}
		})
	}
}

func TestLoadConfig_RejectsBlankDBPath(t *testing.T) {
	_, err := LoadConfig(fakeEnv(map[string]string{"MAILCHECKER_DB_PATH": "   "}))
	if err == nil {
		t.Fatalf("LoadConfig() error = nil, want error for blank DB path")
	}
	if !strings.Contains(err.Error(), "MAILCHECKER_DB_PATH") {
		t.Errorf("error %q does not name MAILCHECKER_DB_PATH", err)
	}
}

func TestLoadConfig_RejectsAHostThatIsNotAnIP(t *testing.T) {
	for _, host := range []string{"localhost", "0.0.0.0:80", "nope"} {
		t.Run(host, func(t *testing.T) {
			_, err := LoadConfig(fakeEnv(map[string]string{"MAILCHECKER_HOST": host}))

			if err == nil || !strings.Contains(err.Error(), "MAILCHECKER_HOST") {
				t.Errorf("LoadConfig() error = %v, want one naming MAILCHECKER_HOST", err)
			}
		})
	}
}
