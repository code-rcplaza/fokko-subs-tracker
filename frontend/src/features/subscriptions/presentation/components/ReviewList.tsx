import { sectionPaths } from "../../../../components/layout/navigation";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { ForwardIcon } from "../../../../components/ui/atoms/icons";
import { t } from "../../../../lib/i18n/translate";
import type { ReviewCardView, ReviewProgress } from "../../domain/review";
import { ReviewCard, type ReviewCardActions } from "./ReviewCard";
import { isReviewDone } from "./ReviewProgress";

export interface ReviewListProps {
  readonly cards: readonly ReviewCardView[];
  readonly progress: ReviewProgress;
  readonly actions: ReviewCardActions;
  readonly onNavigate: Navigate;
}

function SummaryLink({ onNavigate }: { readonly onNavigate: Navigate }) {
  return (
    <AppLink
      to={sectionPaths.summary}
      onNavigate={onNavigate}
      className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-on-primary"
    >
      {t("ui.review.to_summary")}
      <ForwardIcon />
    </AppLink>
  );
}

/** Undecided ones wait in the summary, so leaving halfway loses nothing. */
function LaterLink({ onNavigate }: { readonly onNavigate: Navigate }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <AppLink
        to={sectionPaths.summary}
        onNavigate={onNavigate}
        className="inline-flex min-h-11 items-center text-[15px] font-semibold text-primary"
      >
        {t("ui.review.later")}
      </AppLink>
      <p className="text-xs text-ink-muted">{t("ui.review.later_text")}</p>
    </div>
  );
}

/** Revisión, sheet: a card per possible one and the way out to the summary. */
export function ReviewList({ cards, progress, actions, onNavigate }: ReviewListProps) {
  const isDone = isReviewDone(progress);
  return (
    <div className="flex flex-col gap-8 px-6 pt-4 md:px-0 md:pt-0">
      {cards.length > 0 && (
        <section aria-label={t("ui.review.list")} className="flex flex-col">
          {cards.map((card) => (
            <ReviewCard key={card.possible.lineKey} card={card} actions={actions} onNavigate={onNavigate} />
          ))}
        </section>
      )}
      {isDone ? <SummaryLink onNavigate={onNavigate} /> : <LaterLink onNavigate={onNavigate} />}
    </div>
  );
}
