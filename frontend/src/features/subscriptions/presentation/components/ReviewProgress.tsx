import { StepIndicator } from "../../../../components/layout/StepIndicator";
import { CheckIcon } from "../../../../components/ui/atoms/icons";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { t } from "../../../../lib/i18n/translate";
import type { ReviewProgress } from "../../domain/review";

const reviewStep = { step: 3, total: 3 } as const;

/** Nothing pending: there is nothing to review or all was decided. */
export function isReviewDone(progress: ReviewProgress): boolean {
  return progress.resolved === progress.total;
}

function RingCenter({ progress }: { readonly progress: ReviewProgress }) {
  if (isReviewDone(progress)) {
    return (
      <span className="text-zone-ink">
        <CheckIcon size={24} />
      </span>
    );
  }
  return (
    <>
      <span className="text-2xl leading-none font-semibold text-zone-ink">
        {progress.total - progress.resolved}
      </span>
      <span className="text-xs text-hero-ink-secondary">{t("ui.review.left")}</span>
    </>
  );
}

/** Revisión, top: step 3 of 3, the ring with the resolved ones and the question. */
export function ReviewZone({ progress }: { readonly progress: ReviewProgress }) {
  const isEmpty = progress.total === 0;
  const label = t("ui.review.ring", { resolved: progress.resolved, total: progress.total });
  const segments = [
    { value: progress.resolved, series: 1 },
    { value: progress.total - progress.resolved, series: 4 },
  ] as const;
  return (
    <div className="flex w-full flex-col gap-6">
      <StepIndicator step={reviewStep.step} total={reviewStep.total} name={t("ui.review.step")} />
      <div className="flex items-center gap-4">
        {isEmpty ? (
          <SegmentedRing variant="empty" label={label} size={104}>
            <RingCenter progress={progress} />
          </SegmentedRing>
        ) : (
          <SegmentedRing variant="normal" segments={segments} label={label} size={104}>
            <RingCenter progress={progress} />
          </SegmentedRing>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
            {t(isEmpty ? "ui.review.empty_title" : "ui.review.title")}
          </h1>
          <p className="text-sm text-hero-ink-secondary">
            {t(isEmpty ? "ui.review.empty_text" : "ui.review.text")}
          </p>
        </div>
      </div>
    </div>
  );
}
