// Package pdftest builds statement PDFs from anonymized text, for tests
// outside the extractor (the smoke tests of cmd/api). The repo is public: a
// real statement must never be in it, so the PDF is made here. Like the bank
// PDFs, every glyph is its own text operation, placed with the extractor's
// own widths so the text reads back exactly.
package pdftest

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/ledongthuc/pdf"

	"github.com/code-rcplaza/mail-checker/backend/internal/statements/adapters/extract"
)

const (
	font         = "Helvetica"
	fontSize     = 9
	lineStep     = 12
	topY         = 760
	leftX        = 40
	linesPerPage = 55
	// columnGap is well over the extractor's tab threshold (one font size).
	columnGap = 3 * fontSize
)

// FromText makes a PDF whose text is the given one: lines in order, a tab
// between columns, split into pages.
func FromText(text string) []byte {
	lines := strings.Split(strings.TrimRight(text, "\n"), "\n")
	streams := make([]string, 0, len(lines)/linesPerPage+1)
	for start := 0; start < len(lines); start += linesPerPage {
		streams = append(streams, pageStream(lines[start:min(start+linesPerPage, len(lines))]))
	}
	return writeDocument(streams)
}

func pageStream(lines []string) string {
	var stream strings.Builder
	for row, line := range lines {
		y := float64(topY - row*lineStep)
		x := float64(leftX)
		for _, column := range strings.Split(line, "\t") {
			x = writeGlyphs(&stream, glyphRow{text: column, x: x, y: y}) + columnGap
		}
	}
	return stream.String()
}

type glyphRow struct {
	text string
	x, y float64
}

// writeGlyphs emits one operation per glyph and answers where the pen ended;
// a space only moves the pen.
func writeGlyphs(stream *strings.Builder, row glyphRow) float64 {
	x := row.x
	for _, glyph := range row.text {
		if glyph != ' ' {
			fmt.Fprintf(stream, "BT /F1 %d Tf 1 0 0 1 %.2f %.2f Tm (%s) Tj ET\n", fontSize, x, row.y, encodeGlyph(glyph))
		}
		x += extract.GlyphAdvance(pdf.Text{S: string(glyph), Font: font, FontSize: fontSize})
	}
	return x
}

// latinEnd is past the last Latin-1 glyph; in that range WinAnsi has the same
// codes (accents, Ñ, º), which is all a statement needs.
const latinEnd = 0x100

// encodeGlyph writes the glyph in WinAnsi, as the font declares, escaping PDF delimiters.
func encodeGlyph(glyph rune) string {
	if glyph >= latinEnd {
		glyph = '?'
	}
	if glyph == '(' || glyph == ')' || glyph == '\\' {
		return `\` + string(glyph)
	}
	return string([]byte{byte(glyph)})
}

func writeDocument(streams []string) []byte {
	objects := []string{
		"<< /Type /Catalog /Pages 2 0 R >>",
		pagesObject(len(streams)),
		"<< /Type /Font /Subtype /Type1 /BaseFont /" + font + " /Encoding /WinAnsiEncoding >>",
	}
	for i, content := range streams {
		objects = append(objects,
			fmt.Sprintf("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1200 792] /Resources << /Font << /F1 3 0 R >> >> /Contents %d 0 R >>", 5+2*i),
			fmt.Sprintf("<< /Length %d >>\nstream\n%s\nendstream", len(content), content),
		)
	}
	return writeObjects(objects)
}

func pagesObject(pageCount int) string {
	kids := make([]string, 0, pageCount)
	for i := range pageCount {
		kids = append(kids, fmt.Sprintf("%d 0 R", 4+2*i))
	}
	return fmt.Sprintf("<< /Type /Pages /Kids [%s] /Count %d >>", strings.Join(kids, " "), pageCount)
}

func writeObjects(objects []string) []byte {
	var out bytes.Buffer
	out.WriteString("%PDF-1.4\n")
	offsets := make([]int, 0, len(objects))
	for i, object := range objects {
		offsets = append(offsets, out.Len())
		fmt.Fprintf(&out, "%d 0 obj\n%s\nendobj\n", i+1, object)
	}
	xrefAt := out.Len()
	fmt.Fprintf(&out, "xref\n0 %d\n0000000000 65535 f \n", len(objects)+1)
	for _, offset := range offsets {
		fmt.Fprintf(&out, "%010d 00000 n \n", offset)
	}
	fmt.Fprintf(&out, "trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n", len(objects)+1, xrefAt)
	return out.Bytes()
}
