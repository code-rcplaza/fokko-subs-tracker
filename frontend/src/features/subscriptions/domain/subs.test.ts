import { describe, expect, it } from "vitest";
import { isMarkedForCancellation, linesByNextCharge } from "./subs";
import type { SubscriptionLine } from "./summary";

function lineOf(name: string, nextCharge: number | null): SubscriptionLine {
  return {
    lineKey: `k-${name}`,
    name,
    alias: "",
    cadence: "monthly",
    amount: { amount: 100, currency: "CLP" },
    inPesos: { amount: 100, isApproximate: false },
    nextCharge,
    bank: "bci",
    card: "credito",
    hasRise: false,
    markedForCancellationAt: null,
  };
}

describe("linesByNextCharge", () => {
  it("puts the soonest first and the ones without a date last, by name", () => {
    const lines = [lineOf("Zeta", null), lineOf("B", 300), lineOf("Alfa", null), lineOf("A", 100)];

    expect(linesByNextCharge(lines).map((line) => line.name)).toEqual(["A", "B", "Alfa", "Zeta"]);
    expect(lines.map((line) => line.name)).toEqual(["Zeta", "B", "Alfa", "A"]);
  });
});

describe("isMarkedForCancellation", () => {
  it.each([
    { markedForCancellationAt: null, expected: false },
    { markedForCancellationAt: 1_790_000_000, expected: true },
  ])("is $expected when marked at $markedForCancellationAt", ({ markedForCancellationAt, expected }) => {
    expect(isMarkedForCancellation({ ...lineOf("A", 1), markedForCancellationAt })).toBe(expected);
  });
});
