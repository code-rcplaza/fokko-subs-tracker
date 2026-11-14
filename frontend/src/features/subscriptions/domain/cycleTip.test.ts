import { describe, expect, it } from "vitest";
import { concentratedDaysOf } from "./cycleTip";

/** Noon in Santiago of a day of November 2026, as the back sends dates. */
function onDay(day: number): number {
  return Date.UTC(2026, 10, day, 15) / 1000;
}

function upcomingOn(days: readonly number[]) {
  return days.map((day, position) => ({
    lineKey: `k${position}`,
    name: `S${position}`,
    alias: "",
    amount: { amount: 100, currency: "CLP" },
    date: onDay(day),
  }));
}

describe("concentratedDaysOf", () => {
  it.each([
    { name: "spread charges", days: [2, 5, 9, 18, 20, 24], expected: [] },
    { name: "two on the same day", days: [20, 20, 5], expected: [] },
    { name: "three on the 20th", days: [20, 20, 20, 5], expected: [20] },
    { name: "two days, in order", days: [20, 5, 20, 5, 5, 20, 9], expected: [5, 20] },
  ])("finds $expected with $name", ({ days, expected }) => {
    expect(concentratedDaysOf(upcomingOn(days))).toEqual(expected);
  });

  it("reads the day in Santiago, not in UTC", () => {
    const lateOnThe19th = Date.UTC(2026, 10, 20, 2) / 1000;
    const upcoming = [
      ...upcomingOn([19, 19]),
      ...upcomingOn([1]).map((charge) => ({ ...charge, date: lateOnThe19th })),
    ];

    expect(concentratedDaysOf(upcoming)).toEqual([19]);
  });
});
