import { BackLink } from "../../../../components/layout/BackLink";
import { sectionPaths } from "../../../../components/layout/navigation";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Badge } from "../../../../components/ui/atoms/Badge";
import { Button } from "../../../../components/ui/atoms/Button";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { formatDayMonth, formatMoney } from "../../../../lib/format";
import { t } from "../../../../lib/i18n/translate";
import { approxPesosOf, type LineDetail, type LineRise } from "../../domain/detail";
import type { Money } from "../../domain/money";
import { displayNameOf } from "../../domain/review";
import { risePercentOf } from "../../domain/summary";
import { cancelGuidePathOf } from "./paths";

/** "$10.500", and for dollars also "≈ $9.975" at the line's rate. */
function amountWithPesos(money: Money, detail: LineDetail): string {
  const pesos = approxPesosOf(money, detail);
  const amount = formatMoney(money);
  return pesos === undefined ? amount : `${amount} ${t("ui.approximate", { amount: formatMoney(pesos) })}`;
}

export interface AlertZoneProps {
  readonly rise: LineRise;
  readonly onNavigate: Navigate;
}

/** Alerta, top: back to Resumen and how much it went up. */
export function AlertZone({ rise, onNavigate }: AlertZoneProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <BackLink to={sectionPaths.summary} label={t("ui.nav.summary")} onNavigate={onNavigate} />
      <div className="flex justify-center">
        <SegmentedRing
          variant="normal"
          segments={[{ value: 1, series: 4 }]}
          label={t("ui.alert.ring")}
          size={144}
        >
          <span className="text-2xl font-semibold text-zone-ink">{`+${risePercentOf(rise)}%`}</span>
          <span className="text-xs text-hero-ink-secondary">{t("ui.detail.per_month")}</span>
        </SegmentedRing>
      </div>
    </div>
  );
}

/** What went up: the service, before and after, since when and what it costs. */
export function PriceAlertCard({ detail, rise }: { readonly detail: LineDetail; readonly rise: LineRise }) {
  const name = displayNameOf(detail);
  return (
    <section
      aria-label={t("ui.detail.rise_title")}
      className="flex flex-col gap-4 rounded-lg border border-alert-border bg-alert p-4 text-alert-ink"
    >
      <Badge kind="rise" />
      <h1 className="text-[22px] leading-tight font-semibold">
        {t("ui.rise_title", { name, amount: formatMoney(rise.after) })}
      </h1>
      <dl className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <dt className="text-sm text-alert-ink-secondary">{t("ui.detail.before")}</dt>
          <dd className="font-semibold">{amountWithPesos(rise.before, detail)}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-sm text-alert-ink-secondary">
            {t("ui.detail.since", { date: formatDayMonth(rise.since) })}
          </dt>
          <dd className="font-semibold">{amountWithPesos(rise.after, detail)}</dd>
        </div>
      </dl>
      <p className="text-sm font-semibold">
        {t("ui.alert.impact", {
          monthly: formatMoney(rise.monthlyImpact),
          yearly: formatMoney(rise.yearlyImpact),
        })}
      </p>
      {rise.isPlanChange && <p className="text-sm">{t("ui.detail.plan_change")}</p>}
    </section>
  );
}

export interface AlertDecisionActionsProps {
  readonly detail: LineDetail;
  readonly onKeep: () => void;
  readonly isKeeping: boolean;
  readonly error: string | undefined;
  readonly onNavigate: Navigate;
}

/** Keep it or go cancel it; the MVP has no "later". */
export function AlertDecisionActions({
  detail,
  onKeep,
  isKeeping,
  error,
  onNavigate,
}: AlertDecisionActionsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-semibold text-ink">{t("ui.alert.question")}</h2>
      {error !== undefined && (
        <p role="alert" className="rounded-md bg-error-surface p-4 text-sm text-danger-ink">
          {error}
        </p>
      )}
      <Button onClick={onKeep} loading={isKeeping}>
        {t("ui.alert.keep", { name: displayNameOf(detail) })}
      </Button>
      <div className="flex flex-col gap-1">
        <AppLink
          to={cancelGuidePathOf(detail.lineKey)}
          onNavigate={onNavigate}
          className="flex min-h-[52px] items-center justify-center rounded-lg border-[1.5px] border-outline px-6 text-[15px] font-semibold text-outline-ink"
        >
          {t("ui.detail.cancel_guide")}
        </AppLink>
        <p className="text-center text-xs text-ink-muted">{t("ui.alert.cancel_note")}</p>
      </div>
    </section>
  );
}
