import { describe, expect, it } from "vitest";
import {
  centsToText,
  type EditableLine,
  editLineFormOf,
  editLineFormSchema,
  lineChangesOf,
  manualIdOf,
} from "./edit";

const netflix: EditableLine = {
  lineKey: "service:Netflix||d18",
  name: "Netflix",
  alias: "",
  amount: { amount: 999_000, currency: "CLP" },
  billingDay: 18,
};

describe("manualIdOf", () => {
  it.each([
    { lineKey: "manual:0190a000-0000-7000-8000-000000000001", id: "0190a000-0000-7000-8000-000000000001" },
    { lineKey: "service:Netflix||d18", id: undefined },
  ])("reads $id from $lineKey", ({ lineKey, id }) => {
    expect(manualIdOf(lineKey)).toBe(id);
  });
});

describe("centsToText", () => {
  it.each([
    { cents: 999_000, text: "9.990" },
    { cents: 1_999, text: "19,99" },
    { cents: 2_000, text: "20" },
  ])("writes $cents as '$text'", ({ cents, text }) => {
    expect(centsToText(cents)).toBe(text);
  });
});

describe("editLineFormSchema", () => {
  it.each([
    { change: { alias: "x".repeat(41) }, field: "alias", key: "subscriptions.alias_too_long" },
    { change: { amount: "0" }, field: "amount", key: "subscriptions.override_amount_not_positive" },
    { change: { billingDay: "32" }, field: "billingDay", key: "subscriptions.override_day_out_of_range" },
  ])("rejects $field", ({ change, field, key }) => {
    const result = editLineFormSchema.safeParse({ ...editLineFormOf(netflix), ...change });

    expect(result.success ? [] : result.error.issues.map((issue) => [issue.path[0], issue.message])).toEqual([
      [field, key],
    ]);
  });
});

describe("lineChangesOf", () => {
  it.each([
    { name: "nothing changed", change: {}, alias: undefined, override: undefined },
    {
      name: "only the alias",
      change: { alias: " Netflix familia " },
      alias: { lineKey: netflix.lineKey, alias: "Netflix familia" },
      override: undefined,
    },
    {
      name: "only the amount, sent with the day",
      change: { amount: "10.990" },
      alias: undefined,
      override: { lineKey: netflix.lineKey, amount: 1_099_000, billingDay: 18 },
    },
    {
      name: "only the day, sent with the amount",
      change: { billingDay: "20" },
      alias: undefined,
      override: { lineKey: netflix.lineKey, amount: 999_000, billingDay: 20 },
    },
  ])("sends $name", ({ change, alias, override }) => {
    expect(lineChangesOf(netflix, { ...editLineFormOf(netflix), ...change })).toEqual({ alias, override });
  });

  it("clears an alias with an empty one", () => {
    const named = { ...netflix, alias: "Familia" };

    expect(lineChangesOf(named, { ...editLineFormOf(named), alias: "" }).alias).toEqual({
      lineKey: netflix.lineKey,
      alias: "",
    });
  });
});
