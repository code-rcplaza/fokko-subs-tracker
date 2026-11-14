package main

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

func get(t *testing.T, url string) (*http.Response, string) {
	t.Helper()
	res, err := http.Get(url)
	if err != nil {
		t.Fatalf("GET %s: %v", url, err)
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("read %s: %v", url, err)
	}
	return res, string(body)
}

// The binary serves the embedded front (the build, or the fallback page) next to the API.
func TestSmoke_ServesTheFront(t *testing.T) {
	app := startSmokeApp(t)

	for _, path := range []string{"/", "/subs", "/resumen"} {
		res, body := get(t, app.base+path)
		if res.StatusCode != http.StatusOK || !strings.Contains(res.Header.Get("Content-Type"), "text/html") || !strings.Contains(body, "<html") {
			t.Errorf("GET %s = %d %s, want the front's index", path, res.StatusCode, res.Header.Get("Content-Type"))
		}
	}
	res, body := get(t, app.base+"/api/nope")
	if res.StatusCode != http.StatusNotFound || !strings.Contains(body, "common.route_not_found") {
		t.Errorf("GET /api/nope = %d %s, want the API's JSON 404", res.StatusCode, body)
	}
}
