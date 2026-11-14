import { sectionPaths } from "../../../../components/layout/navigation";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { ForwardIcon } from "../../../../components/ui/atoms/icons";
import { ServiceAvatar } from "../../../../components/ui/atoms/ServiceAvatar";
import { formatChargeDate, formatDayMonth, formatMoney } from "../../../../lib/format";
import { t } from "../../../../lib/i18n/translate";
import { displayNameOf } from "../../domain/review";
import { type PendingRow, type Upcoming, upcomingByDate } from "../../domain/summary";
import { alertPathOf, detailPathOf, reviewPath } from "./paths";

const rowClasses = "flex min-h-11 w-full items-center gap-4 rounded-md py-2 text-left";

function SectionTitle({ title, count }: { readonly title: string; readonly count?: number }) {
  return (
    <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
      {title}
      {count !== undefined && (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-attention-solid px-2 text-xs text-on-attention-solid">
          {count}
        </span>
      )}
    </h2>
  );
}

/** The first charge to come; nothing when none is coming. */
export function NextChargeRow({ next }: { readonly next: Upcoming | undefined }) {
  if (next === undefined) {
    return null;
  }
  const name = displayNameOf(next);
  return (
    <section aria-label={t("ui.next_charge")} className="flex items-center gap-4">
      <ServiceAvatar name={name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm text-ink-muted">{t("ui.next_charge")}</span>
        <span className="truncate font-semibold text-ink">
          {t("ui.summary.next_charge_line", { name, date: formatChargeDate(next.date) })}
        </span>
      </div>
      <span className="flex-none font-semibold text-ink">{formatMoney(next.amount)}</span>
    </section>
  );
}

function pendingPathOf(row: PendingRow): string {
  return row.kind === "rise" ? alertPathOf(row.lineKey) : reviewPath;
}

function pendingTexts(row: PendingRow): { readonly title: string; readonly text: string } {
  if (row.kind === "possible") {
    return { title: t("ui.summary.possible_title", { name: row.name }), text: t("ui.summary.possible_text") };
  }
  return {
    title: t("ui.rise_title", { name: row.name, amount: formatMoney(row.after) }),
    text: t("ui.summary.rise_text", { percent: row.percent, date: formatDayMonth(row.since) }),
  };
}

export interface PendingActionsListProps {
  readonly rows: readonly PendingRow[];
  readonly onNavigate: Navigate;
}

/** What is left to resolve: a rise leads to Alerta, a possible one to Revisión. */
export function PendingActionsList({ rows, onNavigate }: PendingActionsListProps) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle title={t("ui.summary.pending_title")} count={rows.length} />
      <ul className="flex flex-col">
        {rows.map((row) => {
          const texts = pendingTexts(row);
          return (
            <li key={`${row.kind}:${row.lineKey}`} className="border-b border-border last:border-b-0">
              <AppLink to={pendingPathOf(row)} onNavigate={onNavigate} className={rowClasses}>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium text-ink">{texts.title}</span>
                  <span className="text-sm text-ink-muted">{texts.text}</span>
                </span>
                <span className="flex-none text-ink-muted">
                  <ForwardIcon />
                </span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export interface UpcomingChargesListProps {
  readonly upcoming: readonly Upcoming[];
  readonly onNavigate: Navigate;
}

/** The charges to come, by date; each one opens the Detalle of its line. */
export function UpcomingChargesList({ upcoming, onNavigate }: UpcomingChargesListProps) {
  if (upcoming.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle title={t("ui.summary.upcoming_title")} />
        <AppLink
          to={sectionPaths.subs}
          onNavigate={onNavigate}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary"
        >
          {t("ui.summary.see_all")}
        </AppLink>
      </div>
      <ul className="flex flex-col">
        {upcomingByDate(upcoming).map((charge) => {
          const name = displayNameOf(charge);
          return (
            <li key={`${charge.lineKey}:${charge.date}`}>
              <AppLink to={detailPathOf(charge.lineKey)} onNavigate={onNavigate} className={rowClasses}>
                <ServiceAvatar name={name} size={32} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-ink">{name}</span>
                  <span className="text-sm text-ink-muted">{formatChargeDate(charge.date)}</span>
                </span>
                <span className="flex-none font-semibold text-ink">{formatMoney(charge.amount)}</span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
