import { z } from "zod";
import { type Money, moneySchema } from "./money";
import { cadences, displayNameOf, possibleSchema } from "./review";

/** A line of Resumen and Subs. `inPesos` is null for dollars without an exchange rate. */
const subscriptionSchema = z.object({
  lineKey: z.string(),
  name: z.string(),
  alias: z.string(),
  cadence: z.enum(cadences),
  amount: moneySchema,
  inPesos: z.object({ amount: z.number(), isApproximate: z.boolean() }).nullable(),
  nextCharge: z.number().nullable(),
  bank: z.string(),
  card: z.string(),
  hasRise: z.boolean(),
  markedForCancellationAt: z.number().nullable(),
});

const riseSchema = z.object({
  lineKey: z.string(),
  before: moneySchema,
  after: moneySchema,
  since: z.number(),
  isPlanChange: z.boolean(),
});

const upcomingSchema = z.object({
  lineKey: z.string(),
  name: z.string(),
  alias: z.string(),
  amount: moneySchema,
  date: z.number(),
});

/** A segment of the ring: monthly in pesos; "Otros" comes without a name. */
const spendSchema = z.object({
  name: z.string(),
  amount: z.number(),
  percent: z.number(),
  isOthers: z.boolean(),
});

/** `GET /api/summary`. */
export const summarySchema = z.object({
  subscriptions: z.array(subscriptionSchema),
  possible: z.array(possibleSchema),
  total: z.object({
    amount: z.number(),
    currency: z.string(),
    isApproximate: z.boolean(),
    isIncomplete: z.boolean(),
  }),
  charged: z.number(),
  remaining: z.number(),
  rises: z.array(riseSchema),
  pendingActions: z.array(z.object({ kind: z.enum(["rise", "possible"]), lineKey: z.string() })),
  upcoming: z.array(upcomingSchema),
  spend: z.array(spendSchema),
});

export type Summary = Readonly<z.infer<typeof summarySchema>>;
export type Upcoming = Summary["upcoming"][number];
export type SubscriptionLine = Summary["subscriptions"][number];
export type SpendShare = Summary["spend"][number];
export type SummaryTotal = Summary["total"];

/** A row of "Acciones pendientes": a rise leads to Alerta, a possible one to Revisión. */
export type PendingRow =
  | {
      readonly kind: "rise";
      readonly lineKey: string;
      readonly name: string;
      readonly after: Money;
      readonly percent: number;
      readonly since: number;
    }
  | { readonly kind: "possible"; readonly lineKey: string; readonly name: string };

/** The ring's series: one per service in order; "Otros" always takes the last. */
export type SpendSeries = 1 | 2 | 3 | 4 | 5 | 6;

export interface SpendSegment {
  readonly value: number;
  readonly series: SpendSeries;
}

const serviceSeries: readonly SpendSeries[] = [1, 2, 3, 4, 5];
const othersSeries: SpendSeries = 6;

/** Nothing loaded yet: no subscription and nothing to review. */
export function isEmptySummary(summary: Summary): boolean {
  return summary.subscriptions.length === 0 && summary.possible.length === 0;
}

/** Whole percent of the rise; a price that was 0 has none to tell. */
export function risePercentOf(rise: { readonly before: Money; readonly after: Money }): number {
  if (rise.before.amount === 0) {
    return 0;
  }
  return Math.round(((rise.after.amount - rise.before.amount) * 100) / rise.before.amount);
}

function riseRowOf(summary: Summary, lineKey: string): PendingRow | undefined {
  const rise = summary.rises.find((candidate) => candidate.lineKey === lineKey);
  const line = summary.subscriptions.find((candidate) => candidate.lineKey === lineKey);
  if (rise === undefined || line === undefined) {
    return undefined;
  }
  const percent = risePercentOf(rise);
  return { kind: "rise", lineKey, name: displayNameOf(line), after: rise.after, percent, since: rise.since };
}

function possibleRowOf(summary: Summary, lineKey: string): PendingRow | undefined {
  const line = summary.possible.find((candidate) => candidate.lineKey === lineKey);
  return line === undefined ? undefined : { kind: "possible", lineKey, name: displayNameOf(line) };
}

/** In the order the back gave (rises by impact first); a line it does not list is left out. */
export function pendingRowsOf(summary: Summary): readonly PendingRow[] {
  return summary.pendingActions
    .map((action) =>
      action.kind === "rise" ? riseRowOf(summary, action.lineKey) : possibleRowOf(summary, action.lineKey),
    )
    .filter((row) => row !== undefined);
}

export function upcomingByDate(upcoming: readonly Upcoming[]): readonly Upcoming[] {
  return [...upcoming].sort((first, second) => first.date - second.date);
}

export function segmentsOf(spend: readonly SpendShare[]): readonly SpendSegment[] {
  return spend.map((share, position) => ({
    value: share.amount,
    series: share.isOthers ? othersSeries : (serviceSeries[position] ?? othersSeries),
  }));
}

/** The greeting uses only the first word (duplicated from auth: features do not import each other). */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
