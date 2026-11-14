// Package web holds the built front inside the binary. `pnpm build` writes it
// to dist/ (not versioned); fallback/ is versioned so `go build` always
// compiles, and serves a page that says the front was not built.
package web

import (
	"embed"
	"fmt"
	"io/fs"
)

// Every file of this folder, dist/ included when it was built.
//
//go:embed *
var files embed.FS

const (
	builtDir    = "dist"
	fallbackDir = "fallback"
	indexFile   = "index.html"
)

// Site is the front to serve: the build when there is one, else the fallback page.
func Site() (fs.FS, error) {
	return siteOf(files)
}

func siteOf(all fs.FS) (fs.FS, error) {
	dir := fallbackDir
	if _, err := fs.Stat(all, builtDir+"/"+indexFile); err == nil {
		dir = builtDir
	}
	site, err := fs.Sub(all, dir)
	if err != nil {
		return nil, fmt.Errorf("front folder %s: %w", dir, err)
	}
	return site, nil
}
