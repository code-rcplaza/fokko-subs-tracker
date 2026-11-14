import { z } from "zod";
import { moneySchema } from "./money";
import { cadences } from "./review";

const pesosSchema = z.object({ amount: z.number(), isApproximate: z.boolean() }).nullable();

/** `GET /api/subscriptions/line`: one subscription with its cycle, last charges and rise. */
export const lineDetailSchema = z.object({
  lineKey: z.string(),
  name: z.string(),
  alias: z.string(),
  cadence: z.enum(cadences),
  amount: moneySchema,
  inPesos: pesosSchema,
  nextCharge: z.number().nullable(),
  bank: z.string(),
  card: z.string(),
  markedForCancellationAt: z.number().nullable(),
  /** `month` (1–12) only for a yearly line. */
  cycle: z.object({ day: z.number(), month: z.number().nullable() }),
  /** Newest first. */
  charges: z.array(z.object({ date: z.number(), amount: moneySchema, inPesos: pesosSchema })),
  rise: z
    .object({
      before: moneySchema,
      after: moneySchema,
      since: z.number(),
      monthlyImpact: moneySchema,
      yearlyImpact: moneySchema,
      isPlanChange: z.boolean(),
    })
    .nullable(),
});

export type LineDetail = Readonly<z.infer<typeof lineDetailSchema>>;
export type DetailCharge = LineDetail["charges"][number];
export type LineRise = NonNullable<LineDetail["rise"]>;

/**
 * A dollar amount of the line in pesos, at the rate its own amount was
 * converted with; undefined for pesos or without a rate.
 */
export function approxPesosOf(
  money: { readonly amount: number; readonly currency: string },
  line: LineDetail,
) {
  if (money.currency === "CLP" || line.inPesos === null || line.amount.amount === 0) {
    return undefined;
  }
  return { amount: Math.round((money.amount * line.inPesos.amount) / line.amount.amount), currency: "CLP" };
}
