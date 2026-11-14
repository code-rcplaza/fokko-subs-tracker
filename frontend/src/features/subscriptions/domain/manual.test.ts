import { describe, expect, it } from "vitest";
import { amountToCents, type emptyManualForm, manualFormSchema, manualInputOf } from "./manual";

function errorsOf(change: Partial<typeof emptyManualForm>) {
  const valid = { name: "Gimnasio", amount: "25.000", currency: "CLP", billingDay: "5" } as const;
  const result = manualFormSchema.safeParse({ ...valid, ...change });
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

describe("manualFormSchema", () => {
  it.each([
    {
      name: "an empty name",
      change: { name: "  " },
      field: "name",
      key: "subscriptions.manual_name_missing",
    },
    {
      name: "a long name",
      change: { name: "x".repeat(41) },
      field: "name",
      key: "subscriptions.manual_name_too_long",
    },
    {
      name: "a zero amount",
      change: { amount: "0" },
      field: "amount",
      key: "subscriptions.manual_amount_not_positive",
    },
    {
      name: "a negative amount",
      change: { amount: "-5" },
      field: "amount",
      key: "subscriptions.manual_amount_not_positive",
    },
    {
      name: "a word as amount",
      change: { amount: "mucho" },
      field: "amount",
      key: "subscriptions.manual_amount_not_positive",
    },
    {
      name: "day 0",
      change: { billingDay: "0" },
      field: "billingDay",
      key: "subscriptions.manual_day_out_of_range",
    },
    {
      name: "day 32",
      change: { billingDay: "32" },
      field: "billingDay",
      key: "subscriptions.manual_day_out_of_range",
    },
    {
      name: "no day",
      change: { billingDay: "" },
      field: "billingDay",
      key: "subscriptions.manual_day_out_of_range",
    },
  ])("rejects $name on its field", ({ change, field, key }) => {
    expect(errorsOf(change)).toEqual({ [field]: key });
  });

  it("accepts a valid form", () => {
    expect(errorsOf({})).toEqual({});
  });
});

describe("amountToCents", () => {
  it.each([
    { text: "9990", cents: 999_000 },
    { text: "9.990", cents: 999_000 },
    { text: "1.250.000", cents: 125_000_000 },
    { text: "19,99", cents: 1_999 },
    { text: " 20 ", cents: 2_000 },
    { text: "9.99", cents: undefined },
    { text: "1,234,5", cents: undefined },
    { text: "", cents: undefined },
  ])("reads '$text' as $cents", ({ text, cents }) => {
    expect(amountToCents(text)).toBe(cents);
  });
});

describe("manualInputOf", () => {
  it("sends cents and a whole day, with the name trimmed", () => {
    const form = { name: " Gimnasio ", amount: "25.000", currency: "CLP", billingDay: "05" } as const;

    expect(manualInputOf(form)).toEqual({
      name: "Gimnasio",
      amount: 2_500_000,
      currency: "CLP",
      billingDay: 5,
    });
  });
});
