package httpserver

import (
	"bytes"
	"io/fs"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

const (
	apiPrefix   = "/api"
	indexFile   = "index.html"
	assetsDir   = "assets/"
	hashedCache = "public, max-age=31536000, immutable"
	// The index and the root files keep their names between builds: always ask again.
	revalidate = "no-cache"
)

// MountFront serves the built front for everything the API does not answer:
// a file that exists, else index.html for a route of the front (the router
// lives in the browser). The API keeps its JSON 404, and so does a missing
// file, so a broken asset never comes back as HTML.
func (responder Responder) MountFront(router chi.Router, site fs.FS) {
	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		name, isFront := frontFileOf(r)
		if !isFront {
			responder.routeNotFoundHandler()(w, r)
			return
		}
		if isFile(site, name) {
			serveSiteFile(w, r, site, name)
			return
		}
		if path.Ext(name) != "" || strings.HasPrefix(name, assetsDir) {
			responder.routeNotFoundHandler()(w, r)
			return
		}
		serveSiteFile(w, r, site, indexFile)
	})
}

// frontFileOf is the file a request asks for, and whether the front may answer it at all.
func frontFileOf(r *http.Request) (string, bool) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		return "", false
	}
	clean := path.Clean("/" + r.URL.Path)
	if clean == apiPrefix || strings.HasPrefix(clean, apiPrefix+"/") {
		return "", false
	}
	name := strings.TrimPrefix(clean, "/")
	if name == "" {
		return indexFile, true
	}
	return name, true
}

func isFile(site fs.FS, name string) bool {
	info, err := fs.Stat(site, name)
	return err == nil && !info.IsDir()
}

func serveSiteFile(w http.ResponseWriter, r *http.Request, site fs.FS, name string) {
	data, err := fs.ReadFile(site, name)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Cache-Control", cacheControlOf(name))
	// The name gives the content type; no modification time, so no conditional requests.
	http.ServeContent(w, r, name, time.Time{}, bytes.NewReader(data))
}

// cacheControlOf: Vite names what is under assets/ by its content, so it never changes.
func cacheControlOf(name string) string {
	if strings.HasPrefix(name, assetsDir) {
		return hashedCache
	}
	return revalidate
}

// noStoreForAPI keeps every API answer, errors included, out of any cache.
func noStoreForAPI(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == apiPrefix || strings.HasPrefix(r.URL.Path, apiPrefix+"/") {
			w.Header().Set("Cache-Control", "no-store")
		}
		next.ServeHTTP(w, r)
	})
}
