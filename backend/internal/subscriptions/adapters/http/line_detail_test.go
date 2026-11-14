package http

import (
	"encoding/json"
	"net/http"
	"net/url"
	"testing"
)

func TestGetLineDetail_Status(t *testing.T) {
	cases := []struct {
		name       string
		query      func(seededKeys) string
		wantStatus int
		wantBody   string
	}{
		{"a subscription", func(k seededKeys) string { return "?lineKey=" + url.QueryEscape(k.active) }, http.StatusOK, `"cycle":{"day":`},
		{"a possible one is not a subscription yet", func(k seededKeys) string { return "?lineKey=" + url.QueryEscape(k.possible) }, http.StatusNotFound, "subscriptions.line_not_found"},
		{"a line that does not exist", func(seededKeys) string { return "?lineKey=" + url.QueryEscape(unknownLine) }, http.StatusNotFound, "subscriptions.line_not_found"},
		{"no line key", func(seededKeys) string { return "" }, http.StatusBadRequest, lineKeyRequired},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			server := newTestServer(t)
			server.seedLines(t)
			keys := server.seededKeys(t)

			got := server.send(t, http.MethodGet, "/api/subscriptions/line"+tc.query(keys), "")

			assertResponse(t, got, tc.wantStatus, tc.wantBody)
		})
	}
}

// lineDetailView is what the front reads of GET /api/subscriptions/line.
type lineDetailView struct {
	LineKey string `json:"lineKey"`
	Name    string `json:"name"`
	Cadence string `json:"cadence"`
	Bank    string `json:"bank"`
	Cycle   struct {
		Day   int  `json:"day"`
		Month *int `json:"month"`
	} `json:"cycle"`
	Charges []struct {
		Date    int64                   `json:"date"`
		Amount  struct{ Amount int64 }  `json:"amount"`
		InPesos *struct{ Amount int64 } `json:"inPesos"`
	} `json:"charges"`
	Rise *struct {
		Before       struct{ Amount int64 } `json:"before"`
		After        struct{ Amount int64 } `json:"after"`
		YearlyImpact struct{ Amount int64 } `json:"yearlyImpact"`
		IsPlanChange bool                   `json:"isPlanChange"`
	} `json:"rise"`
}

func TestGetLineDetail_Body(t *testing.T) {
	server := newTestServer(t)
	server.seedLines(t)
	keys := server.seededKeys(t)

	got := server.send(t, http.MethodGet, "/api/subscriptions/line?lineKey="+url.QueryEscape(keys.active), "")

	var detail lineDetailView
	if err := json.Unmarshal(got.Body.Bytes(), &detail); err != nil {
		t.Fatalf("decode detail: %v (%s)", err, got.Body.String())
	}
	if detail.LineKey != keys.active || detail.Name != "Streaming Co" || detail.Cadence != "monthly" || detail.Bank != "bci" {
		t.Errorf("line = %+v, want the Streaming Co monthly line of BCI", detail)
	}
	if detail.Cycle.Month != nil || detail.Cycle.Day == 0 {
		t.Errorf("cycle = %+v, want a day and no month for a monthly line", detail.Cycle)
	}
	if len(detail.Charges) != 3 || detail.Charges[0].Amount.Amount != 1050000 || detail.Charges[0].Date < detail.Charges[2].Date {
		t.Errorf("charges = %+v, want the three charges newest first", detail.Charges)
	}
	if detail.Charges[0].InPesos == nil || detail.Charges[0].InPesos.Amount != 1050000 {
		t.Errorf("charge in pesos = %+v, want the same amount for a charge in pesos", detail.Charges[0].InPesos)
	}
	if detail.Rise == nil || detail.Rise.Before.Amount != 1000000 || detail.Rise.After.Amount != 1050000 || detail.Rise.YearlyImpact.Amount != 600000 {
		t.Errorf("rise = %+v, want 10.000 → 10.500 with its yearly impact", detail.Rise)
	}
}
