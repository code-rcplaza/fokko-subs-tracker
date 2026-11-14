package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/code-rcplaza/mail-checker/backend/internal/statements/adapters/extract/pdftest"
)

// privateMark is in lines that are not charges: it must end up nowhere.
const privateMark = "ZQX"

// privateStatement is the September statement with an unreadable purchase
// that carries the mark; the holder's name is already in it.
func privateStatement(t *testing.T) []byte {
	t.Helper()
	text := string(statementText(t, "statement_september.txt"))
	unreadable := "26/08/26 0000 00000099 COMERCIO " + privateMark + "\t$12,99O\t$12.990\t01/01\t$12.990"
	marked := strings.Replace(text, "1.TOTAL OPERACIONES\t(B)\t$-150.000\n", "1.TOTAL OPERACIONES\t(B)\t$-150.000\n"+unreadable+"\n", 1)
	if marked == text {
		t.Fatalf("the fixture changed: the unreadable line found no place")
	}
	return pdftest.FromText(marked)
}

// everyStoredValue is every value of every table of the app's database, as text.
func everyStoredValue(t *testing.T, db *sql.DB) string {
	t.Helper()
	tables, err := db.Query(`SELECT name FROM sqlite_master WHERE type = 'table'`)
	if err != nil {
		t.Fatalf("list tables: %v", err)
	}
	var names []string
	for tables.Next() {
		var name string
		if err := tables.Scan(&name); err != nil {
			t.Fatalf("scan table name: %v", err)
		}
		names = append(names, name)
	}
	tables.Close()
	var stored strings.Builder
	for _, name := range names {
		stored.WriteString(valuesOfTable(t, db, name))
	}
	return stored.String()
}

func valuesOfTable(t *testing.T, db *sql.DB, table string) string {
	t.Helper()
	rows, err := db.Query(fmt.Sprintf(`SELECT * FROM %q`, table))
	if err != nil {
		t.Fatalf("read %s: %v", table, err)
	}
	defer rows.Close()
	columns, err := rows.Columns()
	if err != nil {
		t.Fatalf("columns of %s: %v", table, err)
	}
	var values strings.Builder
	for rows.Next() {
		cells := make([]sql.RawBytes, len(columns))
		pointers := make([]any, len(cells))
		for i := range cells {
			pointers[i] = &cells[i]
		}
		if err := rows.Scan(pointers...); err != nil {
			t.Fatalf("scan %s: %v", table, err)
		}
		for _, cell := range cells {
			values.Write(cell)
			values.WriteString("\n")
		}
	}
	return values.String()
}

func columnsOf(t *testing.T, db *sql.DB, table string) []string {
	t.Helper()
	rows, err := db.Query(fmt.Sprintf(`SELECT * FROM %q LIMIT 0`, table))
	if err != nil {
		t.Fatalf("read %s: %v", table, err)
	}
	defer rows.Close()
	columns, err := rows.Columns()
	if err != nil {
		t.Fatalf("columns of %s: %v", table, err)
	}
	return columns
}

// logLines are the app's structured log lines; the console mailer's code line is not a log.
func logLines(out string) string {
	var logs strings.Builder
	for _, line := range strings.Split(out, "\n") {
		if strings.HasPrefix(line, "time=") {
			logs.WriteString(line + "\n")
		}
	}
	return logs.String()
}

func TestPrivacy_StatementTextIsNotKept(t *testing.T) {
	app := startSmokeApp(t)
	ana := app.signUp(t, "Ana Prueba", "ana@example.com")

	reply := ana.expect(t, ana.upload(t, "cartola.pdf", privateStatement(t)), http.StatusCreated)

	if !strings.Contains(reply.body, `"badLines":1`) {
		t.Fatalf("upload = %s, want the marked line as the one bad line", reply.body)
	}
	db := app.openDB(t)
	defer db.Close()
	stored := everyStoredValue(t, db)
	if !strings.Contains(stored, ana.email) {
		t.Fatalf("the scan does not see what is stored (the user's email): it would prove nothing")
	}
	for _, private := range []string{privateMark, "APELLIDO PRUEBA", "LAS CONDES", "MONTO CANCELADO", "COBRO ADM"} {
		if strings.Contains(stored, private) {
			t.Errorf("the database keeps %q from the statement text", private)
		}
	}
	// A stored charge is descriptor, amount, date, card and its last 4 digits, plus ids and links.
	wantColumns := "id user_id bank source external_id statement_id occurred_at amount currency merchant card card_last4"
	if got := strings.Join(columnsOf(t, db, "charges"), " "); got != wantColumns {
		t.Errorf("charges columns = %s, want %s", got, wantColumns)
	}
	var badLines string
	if err := db.QueryRow(`SELECT bad_lines FROM statements`).Scan(&badLines); err != nil {
		t.Fatalf("read bad lines: %v", err)
	}
	if strings.Trim(badLines, "[]0123456789, ") != "" {
		t.Errorf("bad_lines = %q, want only line numbers", badLines)
	}
}

func TestPrivacy_LogsKeepNoData(t *testing.T) {
	app := startSmokeApp(t)
	ana := app.signUp(t, "Ana Prueba", "ana@example.com")
	code := app.lastCode(t, ana.email)
	ana.expect(t, ana.upload(t, "cartola-privada.pdf", privateStatement(t)), http.StatusCreated)
	ana.expect(t, ana.upload(t, "cartola-privada.pdf", privateStatement(t)), http.StatusConflict)
	ana.upload(t, "no-es-pdf.pdf", []byte("hola"))

	logs := logLines(app.out.String())

	if !strings.Contains(logs, "/api/statements") {
		t.Fatalf("the uploads were not logged, so the check would prove nothing:\n%s", logs)
	}
	for _, private := range []string{ana.email, code, "cartola-privada", "no-es-pdf", "NETFLIX", "MICROSOFT", "12.990", "1299000", privateMark} {
		if strings.Contains(logs, private) {
			t.Errorf("the log has %q:\n%s", private, logs)
		}
	}
}
