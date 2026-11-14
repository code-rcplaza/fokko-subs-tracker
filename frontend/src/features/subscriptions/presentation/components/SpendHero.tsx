import { AnimatedNumber } from "../../../../components/ui/atoms/AnimatedNumber";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { formatMoney } from "../../../../lib/format";
import { t } from "../../../../lib/i18n/translate";
import { type SpendSeries, type SpendShare, type SummaryTotal, segmentsOf } from "../../domain/summary";

const dotBySeries: Readonly<Record<SpendSeries, string>> = {
  1: "bg-series-1",
  2: "bg-series-2",
  3: "bg-series-3",
  4: "bg-series-4",
  5: "bg-series-5",
  6: "bg-series-6",
};

/** "1 cobro", "8 cobros". */
export function chargesText(count: number): string {
  return t(count === 1 ? "ui.summary.charges_one" : "ui.summary.charges_other", { count });
}

/** With dollars converted the total is not exact, so it says so with "≈". */
function totalText(total: SummaryTotal, shown: number): string {
  const amount = formatMoney({ amount: shown, currency: total.currency });
  return total.isApproximate ? t("ui.approximate", { amount }) : amount;
}

export interface SpendHeroProps {
  readonly total: SummaryTotal;
  readonly count: number;
  readonly spend: readonly SpendShare[];
}

/** The month's spend: the ring split by service and the total counting up in its center. */
export function SpendHero({ total, count, spend }: SpendHeroProps) {
  const label = t("ui.summary.ring");
  const center = (
    <>
      <span className="text-xs text-hero-ink-secondary">{t("ui.summary.this_month")}</span>
      <span className="text-[34px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
        <AnimatedNumber value={total.amount} format={(shown) => totalText(total, shown)} />
      </span>
      {count > 0 && <span className="text-xs text-hero-ink-secondary">{chargesText(count)}</span>}
    </>
  );
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {spend.length === 0 ? (
        <SegmentedRing variant="empty" label={label} size={224}>
          {center}
        </SegmentedRing>
      ) : (
        <SegmentedRing variant="normal" segments={segmentsOf(spend)} label={label} size={224}>
          {center}
        </SegmentedRing>
      )}
      {total.isIncomplete && (
        <p className="max-w-xs text-center text-xs text-hero-ink-secondary">{t("ui.summary.incomplete")}</p>
      )}
    </div>
  );
}

/** Each service with its share and the color of its arc. */
export function ServiceLegend({ spend }: { readonly spend: readonly SpendShare[] }) {
  if (spend.length === 0) {
    return null;
  }
  const segments = segmentsOf(spend);
  return (
    <ul aria-label={t("ui.summary.legend")} className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {spend.map((share, position) => (
        <li
          key={share.isOthers ? "others" : share.name}
          className="flex items-center gap-2 text-sm text-zone-ink"
        >
          <span
            aria-hidden="true"
            data-series={segments[position]?.series}
            className={`size-2 rounded-full ${dotBySeries[segments[position]?.series ?? 6]}`}
          />
          <span>{share.isOthers ? t("ui.summary.others") : share.name}</span>
          <span className="text-hero-ink-secondary">
            {t("ui.summary.percent", { percent: share.percent })}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** How many charges went this month and how many are left; nothing when there are none. */
export function MonthCounts({
  charged,
  remaining,
}: {
  readonly charged: number;
  readonly remaining: number;
}) {
  if (charged === 0 && remaining === 0) {
    return null;
  }
  return (
    <p className="text-sm text-hero-ink-secondary">
      {t("ui.summary.month_counts", { charges: chargesText(charged), remaining })}
    </p>
  );
}
