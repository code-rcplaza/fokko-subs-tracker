package http

import (
	"net/http"

	shared "github.com/code-rcplaza/mail-checker/backend/internal/shared/domain"
	"github.com/code-rcplaza/mail-checker/backend/internal/shared/httpserver"
	"github.com/code-rcplaza/mail-checker/backend/internal/subscriptions/domain"
	"github.com/code-rcplaza/mail-checker/backend/internal/subscriptions/usecases"
)

// lineDetailResponse is one subscription as Detalle shows it: the line as in
// the summary, its cycle, its last charges (newest first) and its rise.
type lineDetailResponse struct {
	LineKey                 domain.GroupKey        `json:"lineKey"`
	Name                    string                 `json:"name"`
	Alias                   string                 `json:"alias"`
	Cadence                 domain.Cadence         `json:"cadence"`
	Amount                  moneyResponse          `json:"amount"`
	InPesos                 *pesosResponse         `json:"inPesos"`
	NextCharge              *int64                 `json:"nextCharge"`
	Bank                    shared.Bank            `json:"bank"`
	Card                    shared.Card            `json:"card"`
	CardLast4               string                 `json:"cardLast4"`
	MarkedForCancellationAt *int64                 `json:"markedForCancellationAt"`
	Cycle                   cycleResponse          `json:"cycle"`
	Charges                 []detailChargeResponse `json:"charges"`
	Rise                    *riseResponse          `json:"rise"` // null without a rise
}

// cycleResponse has the month (1 to 12) only for a yearly line.
type cycleResponse struct {
	Day   int  `json:"day"`
	Month *int `json:"month"`
}

type detailChargeResponse struct {
	Date    int64          `json:"date"`
	Amount  moneyResponse  `json:"amount"`
	InPesos *pesosResponse `json:"inPesos"` // null: dollars without an exchange rate
}

func (h Handlers) lineDetail(u userRequest) (httpserver.Reply, error) {
	key, err := queryKey(u, lineKeyField)
	if err != nil {
		return httpserver.Reply{}, err
	}
	view, err := h.LineDetail.Execute(u.request().Context(), u.userID, key)
	if err != nil {
		return httpserver.Reply{}, err
	}
	return httpserver.Reply{Status: http.StatusOK, Body: lineDetailResponseOf(view)}, nil
}

func lineDetailResponseOf(view usecases.LineDetailView) lineDetailResponse {
	line := view.Line
	last := lastCharge(line)
	return lineDetailResponse{
		LineKey:                 line.Key,
		Name:                    domain.ParentName(line.Parent),
		Alias:                   line.Alias,
		Cadence:                 line.Cadence,
		Amount:                  moneyOf(line.Amount, line.Currency),
		InPesos:                 pesosOf(line.InPesos),
		NextCharge:              unixOrNull(line.NextCharge),
		Bank:                    last.Bank,
		Card:                    last.Card,
		CardLast4:               last.CardLast4,
		MarkedForCancellationAt: unixOrNull(line.MarkedForCancellationAt),
		Cycle:                   cycleOf(view.Detail.Cycle),
		Charges:                 detailChargesOf(view),
		Rise:                    riseOrNull(view.Detail.Rise),
	}
}

func cycleOf(cycle domain.LineCycle) cycleResponse {
	if cycle.Month == 0 {
		return cycleResponse{Day: cycle.Day}
	}
	month := int(cycle.Month)
	return cycleResponse{Day: cycle.Day, Month: &month}
}

func detailChargesOf(view usecases.LineDetailView) []detailChargeResponse {
	charges := make([]detailChargeResponse, 0, len(view.Detail.LastCharges))
	for _, charge := range view.Detail.LastCharges {
		charges = append(charges, detailChargeResponse{
			Date:    charge.OccurredAt.Unix(),
			Amount:  moneyOf(charge.Amount, charge.Currency),
			InPesos: pesosOf(domain.ChargeInPesos(charge, view.Rate)),
		})
	}
	return charges
}

func riseOrNull(rise *domain.RiseWithImpact) *riseResponse {
	if rise == nil {
		return nil
	}
	response := riseOf(*rise)
	return &response
}
