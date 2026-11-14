package usecases

import (
	"context"
	"fmt"

	shared "github.com/code-rcplaza/mail-checker/backend/internal/shared/domain"
	"github.com/code-rcplaza/mail-checker/backend/internal/subscriptions/domain"
)

// GetLineDetail is one subscription of the summary with its cycle, its last
// charges and its rise. It reads the summary, so the line looks the same as in
// Resumen and Subs: alias, overrides, kept rises and exchange rate included.
type GetLineDetail struct {
	summary GetSummary
}

func NewGetLineDetail(summary GetSummary) GetLineDetail {
	return GetLineDetail{summary: summary}
}

// LineDetailView is the line, its detail and the rate to show its dollars in pesos.
type LineDetailView struct {
	Line   domain.Subscription
	Detail domain.LineDetail
	Rate   *shared.ExchangeRate // nil when there is no exchange rate
}

func (u GetLineDetail) Execute(ctx context.Context, userID int64, key domain.GroupKey) (LineDetailView, error) {
	summary, err := u.summary.Execute(ctx, userID, domain.DefaultPeriodMonths)
	if err != nil {
		return LineDetailView{}, fmt.Errorf("read summary for line detail: %w", err)
	}
	line, isFound := findSubscription(summary.Subscriptions, key)
	if !isFound {
		return LineDetailView{}, shared.NotFound(domain.KeyLineNotFound)
	}
	detail := domain.BuildLineDetail(line)
	detail.Rise = riseOfLine(summary, key)
	return LineDetailView{Line: line, Detail: detail, Rate: summary.ExchangeRate}, nil
}

// findSubscription looks only among subscriptions: a possible one has no detail until it is decided.
func findSubscription(lines []domain.Subscription, key domain.GroupKey) (domain.Subscription, bool) {
	for _, line := range lines {
		if line.Key == key {
			return line, true
		}
	}
	return domain.Subscription{}, false
}

// riseOfLine takes the rise from the summary, where a kept rise is already gone.
func riseOfLine(summary domain.Summary, key domain.GroupKey) *domain.RiseWithImpact {
	for _, rise := range domain.RisesWithImpact(summary) {
		if rise.Rise.Key == key {
			return &rise
		}
	}
	return nil
}
