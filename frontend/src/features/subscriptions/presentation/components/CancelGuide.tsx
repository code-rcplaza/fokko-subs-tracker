import { BackLink } from "../../../../components/layout/BackLink";
import type { Navigate } from "../../../../components/ui/atoms/AppLink";
import { Badge } from "../../../../components/ui/atoms/Badge";
import { Button } from "../../../../components/ui/atoms/Button";
import { ForwardIcon } from "../../../../components/ui/atoms/icons";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { formatDayMonth } from "../../../../lib/format";
import { type MessageKey, t } from "../../../../lib/i18n/translate";
import { safeCancelUrlOf } from "../../domain/cancelGuide";

const steps: ReadonlyArray<{ readonly title: MessageKey; readonly text: MessageKey }> = [
  { title: "ui.cancel_guide.step_1_title", text: "ui.cancel_guide.step_1_text" },
  { title: "ui.cancel_guide.step_2_title", text: "ui.cancel_guide.step_2_text" },
  { title: "ui.cancel_guide.step_3_title", text: "ui.cancel_guide.step_3_text" },
];

export interface CancelZoneProps {
  readonly name: string;
  readonly back: { readonly to: string; readonly label: string };
  readonly onNavigate: Navigate;
}

/** Cómo cancelar, top: back, the three steps in the ring and whose they are. */
export function CancelZone({ name, back, onNavigate }: CancelZoneProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <BackLink to={back.to} label={back.label} onNavigate={onNavigate} />
      <div className="flex items-center gap-4">
        <SegmentedRing
          variant="normal"
          segments={[{ value: 1, series: 1 }]}
          label={t("ui.cancel_guide.ring")}
          size={104}
        >
          <span className="text-2xl font-semibold text-zone-ink">{steps.length}</span>
          <span className="text-xs text-hero-ink-secondary">{t("ui.cancel_guide.steps")}</span>
        </SegmentedRing>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
            {t("ui.cancel_guide.title", { name })}
          </h1>
          <p className="text-sm text-hero-ink-secondary">{t("ui.cancel_guide.text", { name })}</p>
        </div>
      </div>
    </div>
  );
}

/** The same three steps for every service, in order. */
export function CancelSteps({ name }: { readonly name: string }) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, position) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex size-8 flex-none items-center justify-center rounded-full bg-nav-active text-sm font-semibold text-primary">
            {position + 1}
          </span>
          <span className="flex flex-col">
            <span className="font-semibold text-ink">{t(step.title, { name })}</span>
            <span className="text-sm text-ink-secondary">{t(step.text, { name })}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The service's own site in a new tab, only when it is https; else a generic tip. */
export function CancelLink({ name, url }: { readonly name: string; readonly url: string }) {
  const safeUrl = safeCancelUrlOf(url);
  if (safeUrl === undefined) {
    return (
      <p className="rounded-md bg-field p-4 text-sm text-ink-secondary">
        {t("ui.cancel_guide.no_link", { name })}
      </p>
    );
  }
  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-on-primary"
    >
      {t("ui.cancel_guide.go", { name })}
      <ForwardIcon />
    </a>
  );
}

export interface CancellationStatusProps {
  readonly markedAt: number | null;
  readonly onMark: () => void;
  readonly isMarking: boolean;
  readonly error: string | undefined;
}

/** "La voy a cancelar", or the mark already saved, with the button off. */
export function CancellationStatus({ markedAt, onMark, isMarking, error }: CancellationStatusProps) {
  const isMarked = markedAt !== null;
  return (
    <section className="flex flex-col gap-2">
      {isMarked && (
        <p className="flex items-center gap-2 text-sm text-ink">
          <Badge kind="toCancel" />
          {t("ui.cancel_guide.marked", { date: formatDayMonth(markedAt) })}
        </p>
      )}
      {error !== undefined && (
        <p role="alert" className="rounded-md bg-error-surface p-4 text-sm text-danger-ink">
          {error}
        </p>
      )}
      <Button variant="secondary" onClick={onMark} loading={isMarking} disabled={isMarked}>
        {t("ui.cancel_guide.mark")}
      </Button>
      <p className="text-center text-xs text-ink-muted">{t("ui.cancel_guide.mark_help")}</p>
    </section>
  );
}
