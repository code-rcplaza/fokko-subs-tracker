import type { Upcoming } from "./summary";

/** From how many charges on one day of the month the tip speaks up. */
export const minChargesOnOneDay = 3;

const dayFormat = new Intl.DateTimeFormat("es-CL", { day: "numeric", timeZone: "America/Santiago" });

function dayOfMonthOf(unix: number): number {
  return Number(dayFormat.format(new Date(unix * 1000)));
}

/**
 * The days of the month where the coming charges pile up, in order. Only
 * charge dates: the app knows nothing of the user's bank balance.
 */
export function concentratedDaysOf(upcoming: readonly Upcoming[]): readonly number[] {
  const days = upcoming.map((charge) => dayOfMonthOf(charge.date));
  return [...new Set(days)]
    .filter((day) => days.filter((other) => other === day).length >= minChargesOnOneDay)
    .sort((first, second) => first - second);
}
