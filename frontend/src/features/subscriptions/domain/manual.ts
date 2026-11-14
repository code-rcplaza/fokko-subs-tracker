import { z } from "zod";

/** The same limits as the back (`MaxLineAliasRunes`, billing days 1 to 31, CLP or USD). */
export const manualNameMaxLength = 40;
export const firstBillingDay = 1;
export const lastBillingDay = 31;
export const manualCurrencies = ["CLP", "USD"] as const;
export type ManualCurrency = (typeof manualCurrencies)[number];

/** As people in Chile write it: "9.990", "9990" or "19,99". */
const amountPattern = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/;
const dayPattern = /^\d{1,2}$/;

/** The text of an amount in cents; undefined when it is not one. */
export function amountToCents(text: string): number | undefined {
  const typed = text.trim();
  if (!amountPattern.test(typed)) {
    return undefined;
  }
  return Math.round(Number(typed.replaceAll(".", "").replace(",", ".")) * 100);
}

function isPositiveAmount(text: string): boolean {
  return (amountToCents(text) ?? 0) > 0;
}

function isBillingDay(text: string): boolean {
  const day = Number(text.trim());
  return dayPattern.test(text.trim()) && day >= firstBillingDay && day <= lastBillingDay;
}

/** The form of Agregar: fields as typed; messages are the back's keys. */
export const manualFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "subscriptions.manual_name_missing")
    .max(manualNameMaxLength, "subscriptions.manual_name_too_long"),
  amount: z.string().refine(isPositiveAmount, "subscriptions.manual_amount_not_positive"),
  currency: z.enum(manualCurrencies),
  billingDay: z.string().refine(isBillingDay, "subscriptions.manual_day_out_of_range"),
});

export type ManualForm = z.infer<typeof manualFormSchema>;
export type ManualField = keyof ManualForm;
export const manualFields: readonly ManualField[] = ["name", "amount", "currency", "billingDay"];

export const emptyManualForm: ManualForm = { name: "", amount: "", currency: "CLP", billingDay: "" };

/** What `POST /api/subscriptions/manual` takes: cents and a whole day. */
export interface ManualInput {
  readonly name: string;
  readonly amount: number;
  readonly currency: ManualCurrency;
  readonly billingDay: number;
}

/** Only called with a form the schema accepted. */
export function manualInputOf(form: ManualForm): ManualInput {
  return {
    name: form.name.trim(),
    amount: amountToCents(form.amount) ?? 0,
    currency: form.currency,
    billingDay: Number(form.billingDay.trim()),
  };
}
