import { BackLink } from "../../../../components/layout/BackLink";
import { sectionPaths } from "../../../../components/layout/navigation";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Button } from "../../../../components/ui/atoms/Button";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { formatChargeDate, formatDayMonth, formatMoney } from "../../../../lib/format";
import { t } from "../../../../lib/i18n/translate";
import type { LineDetail, LineRise } from "../../domain/detail";
import { displayNameOf } from "../../domain/review";
import { amountTextOf } from "./amounts";
import { cancelGuidePathOf, editPathOf } from "./paths";

const dayAndMonth = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", timeZone: "UTC" });
/** Any year: only the day and month of a yearly cycle are shown. */
const anyYear = 2026;

/** "Mensual, cada 15 del mes" or "Anual, cada 15 de marzo". */
export function cycleTextOf(detail: LineDetail): string {
  const { day, month } = detail.cycle;
  if (detail.cadence === "yearly" && month !== null) {
    return t("ui.detail.yearly", { date: dayAndMonth.format(new Date(Date.UTC(anyYear, month - 1, day))) });
  }
  return t("ui.detail.monthly", { day });
}

export interface DetailZoneProps {
  readonly detail: LineDetail;
  readonly onNavigate: Navigate;
}

/** Detalle, top: back to Subs, the amount in its ring and whose line it is. */
export function DetailZone({ detail, onNavigate }: DetailZoneProps) {
  const name = displayNameOf(detail);
  const hasAlias = name !== detail.name;
  return (
    <div className="flex w-full flex-col gap-6">
      <BackLink to={sectionPaths.subs} label={t("ui.nav.subs")} onNavigate={onNavigate} />
      <div className="flex flex-col items-center gap-4 text-center">
        <SegmentedRing
          variant="normal"
          segments={[{ value: 1, series: 1 }]}
          label={t("ui.detail.ring")}
          size={176}
        >
          <span className="text-2xl font-semibold text-zone-ink">{amountTextOf(detail)}</span>
          <span className="text-xs text-hero-ink-secondary">
            {t(detail.cadence === "yearly" ? "ui.detail.per_year" : "ui.detail.per_month")}
          </span>
        </SegmentedRing>
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">{name}</h1>
          {hasAlias && (
            <p className="text-sm text-hero-ink-secondary">{t("ui.detail.service", { name: detail.name })}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function perCadence(rise: LineRise, cadence: LineDetail["cadence"]) {
  const key = cadence === "yearly" ? "ui.detail.amount_per_year" : "ui.detail.amount_per_month";
  return {
    before: t(key, { amount: formatMoney(rise.before) }),
    after: t(key, { amount: formatMoney(rise.after) }),
  };
}

/** How much it went up and what it costs; nothing for a line without a rise. */
export function PriceChangeBlock({ detail }: { readonly detail: LineDetail }) {
  const { rise } = detail;
  if (rise === null) {
    return null;
  }
  const amounts = perCadence(rise, detail.cadence);
  return (
    <section
      aria-label={t("ui.detail.rise_title")}
      className="flex flex-col gap-4 rounded-lg border border-alert-border bg-alert p-4 text-alert-ink"
    >
      <h2 className="font-semibold">{t("ui.detail.rise_title")}</h2>
      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <dt className="text-sm text-alert-ink-secondary">{t("ui.detail.before")}</dt>
          <dd className="font-semibold">{amounts.before}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-sm text-alert-ink-secondary">
            {t("ui.detail.since", { date: formatDayMonth(rise.since) })}
          </dt>
          <dd className="font-semibold">{amounts.after}</dd>
        </div>
      </dl>
      <p className="text-sm">
        {t("ui.detail.impact", {
          monthly: formatMoney(rise.monthlyImpact),
          yearly: formatMoney(rise.yearlyImpact),
        })}
      </p>
      {rise.isPlanChange && <p className="text-sm font-semibold">{t("ui.detail.plan_change")}</p>}
    </section>
  );
}

/** Next charge and cycle, as two plain rows. */
export function CycleRows({ detail }: { readonly detail: LineDetail }) {
  return (
    <dl className="flex flex-col">
      {detail.nextCharge !== null && (
        <div className="flex min-h-11 items-center justify-between gap-4 border-b border-border py-2">
          <dt className="text-ink-muted">{t("ui.next_charge")}</dt>
          <dd className="font-semibold text-ink">{formatChargeDate(detail.nextCharge)}</dd>
        </div>
      )}
      <div className="flex min-h-11 items-center justify-between gap-4 py-2">
        <dt className="text-ink-muted">{t("ui.detail.cycle")}</dt>
        <dd className="text-right font-semibold text-ink">{cycleTextOf(detail)}</dd>
      </div>
    </dl>
  );
}

/** The last charges, newest first, as the back sends them. */
export function ChargeHistory({ detail }: { readonly detail: LineDetail }) {
  if (detail.charges.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[17px] font-semibold text-ink">{t("ui.detail.history")}</h2>
      <ul aria-label={t("ui.detail.history")} className="flex flex-col">
        {detail.charges.map((charge) => (
          <li
            key={charge.date}
            className="flex min-h-11 items-center justify-between gap-4 border-b border-border py-2 last:border-b-0"
          >
            <span className="text-ink-secondary">{formatDayMonth(charge.date)}</span>
            <span className="font-semibold text-ink">{amountTextOf(charge)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const outlineLinkClasses =
  "flex min-h-[52px] items-center justify-center rounded-lg border-[1.5px] border-outline px-6 text-[15px] font-semibold text-outline-ink";

export interface DetailContentProps {
  readonly detail: LineDetail;
  readonly onNavigate: Navigate;
  readonly onStopFollowing: () => void;
}

/** Detalle, sheet: the rise, the cycle, the history and where to go from here. */
export function DetailContent({ detail, onNavigate, onStopFollowing }: DetailContentProps) {
  return (
    <div className="flex flex-col gap-8 px-6 pt-8 md:px-0 md:pt-0">
      <PriceChangeBlock detail={detail} />
      <CycleRows detail={detail} />
      <ChargeHistory detail={detail} />
      <div className="flex flex-col gap-2">
        <AppLink to={editPathOf(detail.lineKey)} onNavigate={onNavigate} className={outlineLinkClasses}>
          {t("ui.detail.edit")}
        </AppLink>
        <AppLink
          to={cancelGuidePathOf(detail.lineKey)}
          onNavigate={onNavigate}
          className={outlineLinkClasses}
        >
          {t("ui.detail.cancel_guide")}
        </AppLink>
        <Button variant="text" onClick={onStopFollowing} className="text-danger-ink">
          {t("ui.detail.stop_following")}
        </Button>
      </div>
    </div>
  );
}
