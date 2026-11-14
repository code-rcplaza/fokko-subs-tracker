package web

import (
	"io/fs"
	"strings"
	"testing"
	"testing/fstest"
)

func TestSite_ServesTheBuildWhenThereIsOne(t *testing.T) {
	cases := []struct {
		name  string
		files fstest.MapFS
		want  string
	}{
		{
			"with the front built",
			fstest.MapFS{"dist/index.html": {Data: []byte("built")}, "fallback/index.html": {Data: []byte("fallback")}},
			"built",
		},
		{
			"without a build",
			fstest.MapFS{"fallback/index.html": {Data: []byte("fallback")}},
			"fallback",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			site, err := siteOf(tc.files)
			if err != nil {
				t.Fatalf("siteOf error = %v", err)
			}
			index, err := fs.ReadFile(site, "index.html")

			if err != nil || string(index) != tc.want {
				t.Errorf("index = %q (%v), want %q", index, err, tc.want)
			}
		})
	}
}

func TestSite_EmbedsAnIndex(t *testing.T) {
	site, err := Site()
	if err != nil {
		t.Fatalf("Site error = %v", err)
	}
	index, err := fs.ReadFile(site, "index.html")

	if err != nil || !strings.Contains(string(index), "<html") {
		t.Errorf("embedded index = %q (%v), want an HTML page", index, err)
	}
}
