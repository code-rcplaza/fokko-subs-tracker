package pdftest

import (
	"os"
	"strings"
	"testing"

	"github.com/code-rcplaza/mail-checker/backend/internal/statements/adapters/extract"
)

func TestFromText_ReadsBackTheSameText(t *testing.T) {
	for _, name := range []string{"statement_september.txt", "statement_october.txt"} {
		t.Run(name, func(t *testing.T) {
			want, err := os.ReadFile("../../bci/testdata/" + name)
			if err != nil {
				t.Fatalf("read fixture: %v", err)
			}

			got, _, err := extract.PDFExtractor{}.Extract(name, FromText(string(want)))

			if err != nil {
				t.Fatalf("Extract error = %v", err)
			}
			if got != readableLines(string(want)) {
				t.Errorf("text read back =\n%s\nwant\n%s", got, want)
			}
		})
	}
}

// readableLines is the text as the extractor gives it: trimmed lines, none blank.
func readableLines(text string) string {
	kept := make([]string, 0)
	for _, line := range strings.Split(text, "\n") {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
			kept = append(kept, trimmed)
		}
	}
	return strings.Join(kept, "\n")
}
