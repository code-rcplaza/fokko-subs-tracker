package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"testing"

	"github.com/code-rcplaza/mail-checker/backend/internal/statements/adapters/extract/pdftest"
)

// statementPDF is an anonymized BCI statement of the parser's fixtures, made
// into a PDF here: the repo never holds a real one.
func statementPDF(t *testing.T, name string) []byte {
	t.Helper()
	return pdftest.FromText(string(statementText(t, name)))
}

func statementText(t *testing.T, name string) []byte {
	t.Helper()
	text, err := os.ReadFile("../../internal/statements/adapters/bci/testdata/" + name)
	if err != nil {
		t.Fatalf("read fixture %s: %v", name, err)
	}
	return text
}

// upload sends the file as the front does: multipart with only `file`.
func (u smokeUser) upload(t *testing.T, filename string, data []byte) smokeReply {
	t.Helper()
	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	part, err := form.CreateFormFile("file", filename)
	if err != nil {
		t.Fatalf("form file: %v", err)
	}
	if _, err := part.Write(data); err != nil {
		t.Fatalf("write file: %v", err)
	}
	if err := form.Close(); err != nil {
		t.Fatalf("close form: %v", err)
	}
	request, err := http.NewRequest(http.MethodPost, u.app.base+"/api/statements", &body)
	if err != nil {
		t.Fatalf("request: %v", err)
	}
	request.Header.Set("Content-Type", form.FormDataContentType())
	res, err := u.client.Do(request)
	if err != nil {
		t.Fatalf("POST /api/statements: %v", err)
	}
	defer res.Body.Close()
	read, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("read upload: %v", err)
	}
	return smokeReply{status: res.StatusCode, body: string(read)}
}

// statementSummary is what these tests read of GET /api/summary.
type statementSummary struct {
	Subscriptions []smokeLine `json:"subscriptions"`
	Possible      []smokeLine `json:"possible"`
	Total         struct {
		Amount   int64  `json:"amount"`
		Currency string `json:"currency"`
	} `json:"total"`
}

type smokeLine struct {
	LineKey string `json:"lineKey"`
	Name    string `json:"name"`
	Cadence string `json:"cadence"`
	Amount  struct {
		Amount int64 `json:"amount"`
	} `json:"amount"`
}

func (u smokeUser) fullSummary(t *testing.T) statementSummary {
	t.Helper()
	reply := u.expect(t, u.do(t, http.MethodGet, "/api/summary", ""), http.StatusOK)
	var summary statementSummary
	if err := json.Unmarshal([]byte(reply.body), &summary); err != nil {
		t.Fatalf("decode summary: %v", err)
	}
	return summary
}

func lineNamed(lines []smokeLine, name string) (smokeLine, bool) {
	for _, line := range lines {
		if line.Name == name {
			return line, true
		}
	}
	return smokeLine{}, false
}

// uploadStatements signs Ana up and uploads both anonymized statements.
func uploadStatements(t *testing.T) smokeUser {
	t.Helper()
	app := startSmokeApp(t)
	ana := app.signUp(t, "Ana Prueba", "ana@example.com")
	for _, name := range []string{"statement_september.txt", "statement_october.txt"} {
		ana.expect(t, ana.upload(t, name+".pdf", statementPDF(t, name)), http.StatusCreated)
	}
	return ana
}

func TestSmoke_StatementUpload(t *testing.T) {
	app := startSmokeApp(t)
	ana := app.signUp(t, "Ana Prueba", "ana@example.com")
	october := statementPDF(t, "statement_october.txt")

	first := ana.expect(t, ana.upload(t, "cartola-octubre.pdf", october), http.StatusCreated)
	var uploaded struct {
		Months   []string `json:"months"`
		Charges  int      `json:"charges"`
		BadLines int      `json:"badLines"`
	}
	if err := json.Unmarshal([]byte(first.body), &uploaded); err != nil {
		t.Fatalf("decode upload: %v", err)
	}
	if len(uploaded.Months) != 2 || uploaded.Months[1] != "2026-10" || uploaded.Charges == 0 || uploaded.BadLines != 0 {
		t.Errorf("upload = %+v, want September and October read with no bad lines", uploaded)
	}

	again := ana.expect(t, ana.upload(t, "cartola-octubre.pdf", october), http.StatusConflict)
	if !strings.Contains(again.body, "statements.already_imported") {
		t.Errorf("second upload = %s, want statements.already_imported", again.body)
	}
}

func TestSmoke_StatementToSummary(t *testing.T) {
	ana := uploadStatements(t)

	summary := ana.fullSummary(t)

	microsoft, isSure := lineNamed(summary.Subscriptions, "Microsoft")
	if !isSure || microsoft.Cadence != "monthly" || microsoft.Amount.Amount != 539900 {
		t.Errorf("subscriptions = %+v, want Microsoft monthly at $5.399", summary.Subscriptions)
	}
	for _, name := range []string{"Spotify", "HostGator"} {
		if _, isPossible := lineNamed(summary.Possible, name); !isPossible {
			t.Errorf("possible = %+v, want %s to confirm", summary.Possible, name)
		}
	}
	if summary.Total.Currency != "CLP" || summary.Total.Amount < microsoft.Amount.Amount {
		t.Errorf("total = %+v, want pesos counting Microsoft", summary.Total)
	}
}

func TestSmoke_DecisionShowsInTheSummary(t *testing.T) {
	ana := uploadStatements(t)
	spotify, _ := lineNamed(ana.fullSummary(t).Possible, "Spotify")

	ana.expect(t, ana.do(t, http.MethodPost, "/api/subscriptions/decisions",
		fmt.Sprintf(`{"groupKey":%q,"decision":"confirm","cadence":"yearly"}`, spotify.LineKey)), http.StatusNoContent)

	summary := ana.fullSummary(t)
	confirmed, isSure := lineNamed(summary.Subscriptions, "Spotify")
	if !isSure || confirmed.Cadence != "yearly" {
		t.Errorf("subscriptions = %+v, want Spotify confirmed as yearly", summary.Subscriptions)
	}
	if _, isStillPossible := lineNamed(summary.Possible, "Spotify"); isStillPossible {
		t.Errorf("possible still has Spotify after confirming it")
	}
}
