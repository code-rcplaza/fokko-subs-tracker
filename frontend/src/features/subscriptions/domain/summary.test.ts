import { describe, expect, it } from "vitest";
import {
  isEmptySummary,
  pendingRowsOf,
  risePercentOf,
  type Summary,
  segmentsOf,
  summarySchema,
  upcomingByDate,
} from "./summary";

const pesos = (amount: number) => ({ amount, currency: "CLP" });
const fifteenthOfDecember = Date.UTC(2025, 11, 15, 15) / 1000;

const disney = {
  lineKey: "k-disney",
  name: "Disney+",
  alias: "",
  cadence: "monthly",
  amount: pesos(1_050_000),
  inPesos: { amount: 1_050_000, isApproximate: false },
  nextCharge: null,
  bank: "bci",
  card: "credito",
  hasRise: true,
  markedForCancellationAt: null,
} as const;

const prime = {
  lineKey: "k-prime",
  name: "AMZN PRIME",
  alias: "Amazon Prime",
  amount: pesos(579_000),
  charges: [],
};

const summary: Summary = {
  subscriptions: [disney],
  possible: [prime],
  total: { amount: 1_050_000, currency: "CLP", isApproximate: false, isIncomplete: false },
  charged: 3,
  remaining: 5,
  rises: [
    {
      lineKey: "k-disney",
      before: pesos(890_000),
      after: pesos(1_050_000),
      since: fifteenthOfDecember,
      isPlanChange: false,
    },
  ],
  pendingActions: [
    { kind: "rise", lineKey: "k-disney" },
    { kind: "possible", lineKey: "k-prime" },
    { kind: "possible", lineKey: "k-gone" },
  ],
  upcoming: [],
  spend: [{ name: "Disney+", amount: 1_050_000, percent: 100, isOthers: false }],
};

describe("summarySchema", () => {
  // Subs (FOKKO-0105-SUBS) also reads bank, card, pesos and marks; only cardLast4 is still dropped.
  it("reads the summary the back sends and drops what no screen uses", () => {
    const sent = { ...summary, subscriptions: [{ ...disney, cardLast4: "1234" }] };

    expect(summarySchema.parse(sent)).toEqual(summary);
  });

  it("rejects an unknown pending action", () => {
    expect(() =>
      summarySchema.parse({ ...summary, pendingActions: [{ kind: "other", lineKey: "k" }] }),
    ).toThrow();
  });
});

describe("isEmptySummary", () => {
  it.each([
    { name: "with subscriptions", change: {}, expected: false },
    { name: "with only possible ones", change: { subscriptions: [] }, expected: false },
    { name: "with nothing", change: { subscriptions: [], possible: [] }, expected: true },
  ])("is $expected $name", ({ change, expected }) => {
    expect(isEmptySummary({ ...summary, ...change })).toBe(expected);
  });
});

describe("risePercentOf", () => {
  it.each([
    { before: 890_000, after: 1_050_000, expected: 18 },
    { before: 1_000, after: 1_005, expected: 1 },
    { before: 0, after: 1_000, expected: 0 },
  ])("$before → $after is +$expected %", ({ before, after, expected }) => {
    expect(risePercentOf({ before: pesos(before), after: pesos(after) })).toBe(expected);
  });
});

describe("pendingRowsOf", () => {
  it("names each pending action and leaves out a line that is not there", () => {
    expect(pendingRowsOf(summary)).toEqual([
      {
        kind: "rise",
        lineKey: "k-disney",
        name: "Disney+",
        after: pesos(1_050_000),
        percent: 18,
        since: fifteenthOfDecember,
      },
      { kind: "possible", lineKey: "k-prime", name: "Amazon Prime" },
    ]);
  });
});

describe("upcomingByDate", () => {
  it("sorts by date without touching the list it got", () => {
    const later = { lineKey: "b", name: "B", alias: "", amount: pesos(1), date: 200 };
    const sooner = { lineKey: "a", name: "A", alias: "", amount: pesos(1), date: 100 };
    const upcoming = [later, sooner];

    expect(upcomingByDate(upcoming)).toEqual([sooner, later]);
    expect(upcoming).toEqual([later, sooner]);
  });
});

describe("segmentsOf", () => {
  it("gives each service its series in order and Otros the last one", () => {
    const spend = [
      { name: "A", amount: 5, percent: 50, isOthers: false },
      { name: "B", amount: 3, percent: 30, isOthers: false },
      { name: "", amount: 2, percent: 20, isOthers: true },
    ];

    expect(segmentsOf(spend)).toEqual([
      { value: 5, series: 1 },
      { value: 3, series: 2 },
      { value: 2, series: 6 },
    ]);
  });
});
