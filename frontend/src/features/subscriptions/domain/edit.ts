import { z } from "zod";
import { amountToCents, firstBillingDay, lastBillingDay, manualNameMaxLength } from "./manual";
import type { Money } from "./money";

const manualKeyPrefix = "manual:";
const dayPattern = /^\d{1,2}$/;
const amountText = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2, useGrouping: true });

/** A line as Editar starts from: what it shows now, overrides included. */
export interface EditableLine {
  readonly lineKey: string;
  /** What the statement says; the alias goes on top of it. */
  readonly name: string;
  readonly alias: string;
  readonly amount: Money;
  readonly billingDay: number;
}

/** A manual line's key is `manual:<publicId>`; the back edits it by that id. */
export function manualIdOf(lineKey: string): string | undefined {
  return lineKey.startsWith(manualKeyPrefix) ? lineKey.slice(manualKeyPrefix.length) : undefined;
}

/** Cents as the user would type them: 999000 → "9.990", 1999 → "19,99". */
export function centsToText(cents: number): string {
  return amountText.format(cents / 100);
}

function isBillingDay(text: string): boolean {
  const day = Number(text.trim());
  return dayPattern.test(text.trim()) && day >= firstBillingDay && day <= lastBillingDay;
}

/** Editar of a detected line: an alias (empty clears it) and the amount and day it really has. */
export const editLineFormSchema = z.object({
  alias: z.string().trim().max(manualNameMaxLength, "subscriptions.alias_too_long"),
  amount: z
    .string()
    .refine((text) => (amountToCents(text) ?? 0) > 0, "subscriptions.override_amount_not_positive"),
  billingDay: z.string().refine(isBillingDay, "subscriptions.override_day_out_of_range"),
});

export type EditLineForm = z.infer<typeof editLineFormSchema>;
export type EditLineField = keyof EditLineForm;
export const editLineFields: readonly EditLineField[] = ["alias", "amount", "billingDay"];

export function editLineFormOf(line: EditableLine): EditLineForm {
  return { alias: line.alias, amount: centsToText(line.amount.amount), billingDay: String(line.billingDay) };
}

export interface AliasChange {
  readonly lineKey: string;
  readonly alias: string;
}

/** Amount in the line's currency (cents) and billing day: both, so one does not undo the other. */
export interface OverrideChange {
  readonly lineKey: string;
  readonly amount: number;
  readonly billingDay: number;
}

export interface LineChanges {
  readonly alias: AliasChange | undefined;
  readonly override: OverrideChange | undefined;
}

/** Only what the user changed is sent; a form the schema accepted. */
export function lineChangesOf(line: EditableLine, form: EditLineForm): LineChanges {
  const alias = form.alias.trim();
  const amount = amountToCents(form.amount) ?? line.amount.amount;
  const billingDay = Number(form.billingDay.trim());
  const isOverridden = amount !== line.amount.amount || billingDay !== line.billingDay;
  return {
    alias: alias === line.alias ? undefined : { lineKey: line.lineKey, alias },
    override: isOverridden ? { lineKey: line.lineKey, amount, billingDay } : undefined,
  };
}
