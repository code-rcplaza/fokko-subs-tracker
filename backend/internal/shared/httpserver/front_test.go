package httpserver

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

const builtIndex = `<!doctype html><title>Fokko</title>`

func builtFront() fstest.MapFS {
	return fstest.MapFS{
		"index.html":            {Data: []byte(builtIndex)},
		"assets/app-abc123.js":  {Data: []byte("console.log(1)")},
		"assets/app-abc123.css": {Data: []byte("body{}")},
		"favicon.svg":           {Data: []byte("<svg/>")},
	}
}

func serveFront(t *testing.T, method, target string) *httptest.ResponseRecorder {
	t.Helper()
	responder := Responder{Logger: discardLogger()}
	router := NewRouter(responder.Logger, AlwaysHealthy)
	responder.MountFront(router, builtFront())
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(method, target, nil))
	return recorder
}

func TestFront_ServesFiles(t *testing.T) {
	cases := []struct {
		name             string
		target           string
		wantType         string
		wantBody         string
		wantCacheControl string
	}{
		{"the index at /", "/", "text/html", builtIndex, "no-cache"},
		{"a hashed script, cached for good", "/assets/app-abc123.js", "javascript", "console.log(1)", "public, max-age=31536000, immutable"},
		{"a hashed style", "/assets/app-abc123.css", "text/css", "body{}", "public, max-age=31536000, immutable"},
		{"a file of the root, not hashed", "/favicon.svg", "image/svg+xml", "<svg/>", "no-cache"},
		{"a route of the front gets the index", "/subs", "text/html", builtIndex, "no-cache"},
		{"a deep route of the front with its key", "/subs/service%3ANetflix%7C%7Cd18/editar", "text/html", builtIndex, "no-cache"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			res := serveFront(t, http.MethodGet, tc.target)

			if res.Code != http.StatusOK || res.Body.String() != tc.wantBody {
				t.Fatalf("GET %s = %d %q, want 200 %q", tc.target, res.Code, res.Body.String(), tc.wantBody)
			}
			if got := res.Header().Get("Content-Type"); !strings.Contains(got, tc.wantType) {
				t.Errorf("Content-Type = %q, want %s", got, tc.wantType)
			}
			if got := res.Header().Get("Cache-Control"); got != tc.wantCacheControl {
				t.Errorf("Cache-Control = %q, want %q", got, tc.wantCacheControl)
			}
		})
	}
}

func TestFront_DoesNotAnswerForTheAPIOrMissingFiles(t *testing.T) {
	cases := []struct {
		name   string
		method string
		target string
	}{
		{"an API route that does not exist", http.MethodGet, "/api/inexistente"},
		{"the API root", http.MethodGet, "/api"},
		{"a missing asset", http.MethodGet, "/assets/falta.js"},
		{"a missing file with an extension", http.MethodGet, "/robots.txt"},
		{"a write to a front route", http.MethodPost, "/subs"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			res := serveFront(t, tc.method, tc.target)

			if res.Code != http.StatusNotFound || !strings.Contains(res.Body.String(), "common.route_not_found") {
				t.Errorf("%s %s = %d %q, want the JSON 404", tc.method, tc.target, res.Code, res.Body.String())
			}
		})
	}
}

func TestFront_APIKeepsItsRoutes(t *testing.T) {
	res := serveFront(t, http.MethodGet, "/api/health")

	if res.Code != http.StatusOK || !strings.Contains(res.Body.String(), `"ok"`) {
		t.Errorf("GET /api/health = %d %q, want the API's answer", res.Code, res.Body.String())
	}
}

func TestAPI_ResponsesAreNotCached(t *testing.T) {
	for _, target := range []string{"/api/health", "/api/inexistente"} {
		res := serveFront(t, http.MethodGet, target)

		if got := res.Header().Get("Cache-Control"); got != "no-store" {
			t.Errorf("GET %s Cache-Control = %q, want no-store", target, got)
		}
	}
}
