import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { ForwardIcon } from "../../../../components/ui/atoms/icons";
import { t } from "../../../../lib/i18n/translate";
import { isEmptySummary, pendingRowsOf, type Summary, upcomingByDate } from "../../domain/summary";
import { CycleTip } from "./CycleTip";
import { sourcePath } from "./paths";
import { MonthCounts, ServiceLegend, SpendHero } from "./SpendHero";
import { NextChargeRow, PendingActionsList, UpcomingChargesList } from "./SummaryLists";

export interface SummaryZoneProps {
  readonly summary: Summary;
  readonly firstName: string;
}

/** Resumen, top: the greeting, the month's charges, the ring and its legend. */
export function SummaryZone({ summary, firstName }: SummaryZoneProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-1">
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
          {t("ui.greeting", { name: firstName })}
        </h1>
        <MonthCounts charged={summary.charged} remaining={summary.remaining} />
      </div>
      <SpendHero total={summary.total} count={summary.subscriptions.length} spend={summary.spend} />
      <ServiceLegend spend={summary.spend} />
    </div>
  );
}

export interface SummaryContentProps {
  readonly summary: Summary;
  readonly onNavigate: Navigate;
}

/** Nothing loaded yet: the way to the first statement. */
function SummaryEmpty({ onNavigate }: { readonly onNavigate: Navigate }) {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-ink">{t("ui.summary.empty_title")}</h2>
      <p className="text-ink-secondary">{t("ui.summary.empty_text")}</p>
      <AppLink
        to={sourcePath}
        onNavigate={onNavigate}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-on-primary"
      >
        {t("ui.upload_statement")}
        <ForwardIcon />
      </AppLink>
    </section>
  );
}

/** Resumen, sheet: next charge, what is pending and the charges to come. */
export function SummaryContent({ summary, onNavigate }: SummaryContentProps) {
  if (isEmptySummary(summary)) {
    return (
      <div className="px-6 pt-8 md:px-0 md:pt-0">
        <SummaryEmpty onNavigate={onNavigate} />
      </div>
    );
  }
  const upcoming = upcomingByDate(summary.upcoming);
  return (
    <div className="flex flex-col gap-8 px-6 pt-8 md:px-0 md:pt-0">
      <NextChargeRow next={upcoming[0]} />
      <PendingActionsList rows={pendingRowsOf(summary)} onNavigate={onNavigate} />
      <UpcomingChargesList upcoming={upcoming} onNavigate={onNavigate} />
      <CycleTip upcoming={upcoming} />
    </div>
  );
}
