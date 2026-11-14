import { Card } from "../../../../components/ui/molecules/Card";
import { t } from "../../../../lib/i18n/translate";
import { concentratedDaysOf } from "../../domain/cycleTip";
import type { Upcoming } from "../../domain/summary";

const dayList = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

function daysText(days: readonly number[]): string {
  const listed = dayList.format(days.map(String));
  return t(days.length === 1 ? "ui.cycle_tip.on_day" : "ui.cycle_tip.on_days", { days: listed });
}

/** A tip on the charge dates only; it never speaks of the bank, which the app does not see. */
export function CycleTip({ upcoming }: { readonly upcoming: readonly Upcoming[] }) {
  const days = concentratedDaysOf(upcoming);
  if (days.length === 0) {
    return null;
  }
  return (
    <Card variant="tip">
      <h2 className="text-sm font-semibold text-ink">{t("ui.cycle_tip.title")}</h2>
      <p className="mt-1 text-sm">{t("ui.cycle_tip.text", { days: daysText(days) })}</p>
    </Card>
  );
}
