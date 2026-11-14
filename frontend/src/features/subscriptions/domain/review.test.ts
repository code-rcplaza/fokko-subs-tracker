import { describe, expect, it } from "vitest";
import {
  billingDayOf,
  cardStateOf,
  decisionOf,
  displayNameOf,
  type Possible,
  possibleListSchema,
  progressOf,
  resolvedStateOf,
} from "./review";

/** 2 Oct 2026 02:00 UTC: still the 1st in Santiago (UTC-3 in October), where the UI reads dates. */
const firstOfOctoberInSantiago = Date.UTC(2026, 9, 2, 2) / 1000;
const secondOfSeptember = Date.UTC(2026, 8, 2, 15) / 1000;

const icloud: Possible = {
  lineKey: "k-icloud",
  name: "APPLE.COM/BILL",
  alias: "",
  amount: { amount: 990_000, currency: "CLP" },
  charges: [{ date: secondOfSeptember, amount: { amount: 990_000, currency: "CLP" } }],
};

describe("possibleListSchema", () => {
  it("reads only the possible ones of the summary", () => {
    const summary = { subscriptions: [{ lineKey: "a" }], possible: [icloud], total: {} };

    expect(possibleListSchema.parse(summary)).toEqual([icloud]);
  });

  it("rejects a possible without its line key", () => {
    const { lineKey: _, ...withoutKey } = icloud;

    expect(() => possibleListSchema.parse({ possible: [withoutKey] })).toThrow();
  });
});

describe("displayNameOf", () => {
  it.each([
    { alias: "", expected: "APPLE.COM/BILL" },
    { alias: "  ", expected: "APPLE.COM/BILL" },
    { alias: "iCloud 2TB", expected: "iCloud 2TB" },
  ])("names '$alias' as '$expected'", ({ alias, expected }) => {
    expect(displayNameOf({ ...icloud, alias })).toBe(expected);
  });
});

describe("billingDayOf", () => {
  it.each([
    { name: "no charges", dates: [], expected: undefined },
    { name: "the last charge", dates: [secondOfSeptember], expected: 2 },
    { name: "the day in Santiago", dates: [secondOfSeptember, firstOfOctoberInSantiago], expected: 1 },
  ])("takes $name", ({ dates, expected }) => {
    const charges = dates.map((date) => ({ date, amount: icloud.amount }));

    expect(billingDayOf(charges)).toBe(expected);
  });
});

describe("decisionOf", () => {
  it.each([
    { name: "pending", state: { kind: "pending" }, expected: undefined },
    {
      name: "choosing without cadence",
      state: { kind: "choosing", cadence: undefined },
      expected: undefined,
    },
    {
      name: "choosing yearly",
      state: { kind: "choosing", cadence: "yearly" },
      expected: { lineKey: "k", decision: "confirm", cadence: "yearly" },
    },
  ] as const)("is $name → $expected", ({ state, expected }) => {
    expect(decisionOf("k", state)).toEqual(expected);
  });
});

describe("resolvedStateOf", () => {
  it.each([
    {
      decision: { lineKey: "k", decision: "confirm", cadence: "monthly" },
      expected: { kind: "added", cadence: "monthly" },
    },
    { decision: { lineKey: "k", decision: "dismiss" }, expected: { kind: "dismissed" } },
  ] as const)("turns $decision.decision into $expected.kind", ({ decision, expected }) => {
    expect(resolvedStateOf(decision)).toEqual(expected);
  });
});

describe("progressOf", () => {
  it("counts the resolved ones out of all", () => {
    const states = {
      a: { kind: "added", cadence: "monthly" },
      b: { kind: "dismissed" },
      c: { kind: "choosing", cadence: "yearly" },
    } as const;

    expect(progressOf(["a", "b", "c", "d", "e"], states)).toEqual({ resolved: 2, total: 5 });
  });

  it("is pending when nothing was decided", () => {
    expect(cardStateOf({}, "a")).toEqual({ kind: "pending" });
  });
});
