/** Amounts travel in cents (like `Money` in the back) with their currency. */
export interface MoneyAmount {
  readonly amount: number;
  readonly currency: string;
}

/** "$84.060" for pesos, "US$19,99" for dollars: the way people in Chile read them. */
export function formatMoney({ amount, currency }: MoneyAmount): string {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency }).format(amount / 100);
}

const monthPattern = /^(\d{4})-(\d{2})$/;
const monthFormat = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" });

/** "2026-09" → "septiembre de 2026"; anything else stays as it came. */
export function formatMonth(month: string): string {
  const [, year, number] = monthPattern.exec(month) ?? [];
  if (year === undefined || number === undefined) {
    return month;
  }
  return monthFormat.format(new Date(Date.UTC(Number(year), Number(number) - 1, 1)));
}

const listFormat = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

export function formatMonths(months: readonly string[]): string {
  return listFormat.format(months.map(formatMonth));
}

const santiago = "America/Santiago";
const chargeDateFormat = new Intl.DateTimeFormat("es-CL", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: santiago,
});
const dayMonthFormat = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  timeZone: santiago,
});

/** Unix seconds as "mié 18 nov", in Santiago: Intl puts a comma the handoff does not have. */
export function formatChargeDate(unix: number): string {
  return chargeDateFormat
    .formatToParts(new Date(unix * 1000))
    .filter((part) => part.type !== "literal")
    .map((part) => part.value)
    .join(" ");
}

/** Unix seconds as "15 dic", in Santiago. */
export function formatDayMonth(unix: number): string {
  return dayMonthFormat.format(new Date(unix * 1000));
}
