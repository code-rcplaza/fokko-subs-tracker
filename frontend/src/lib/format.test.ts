import { describe, expect, it } from "vitest";
import { formatChargeDate, formatDayMonth, formatMoney, formatMonth, formatMonths } from "./format";

describe("formatMoney", () => {
  it.each([
    [8_406_000, "CLP", "$84.060"],
    [599_000, "CLP", "$5.990"],
    [1_999, "USD", "US$19,99"],
  ])("writes %d %s cents as %s", (cents, currency, text) => {
    expect(formatMoney({ amount: cents, currency })).toBe(text);
  });
});

describe("formatMonth", () => {
  it("writes a YYYY-MM month in Spanish", () => {
    expect(formatMonth("2026-09")).toBe("septiembre de 2026");
  });

  it("leaves anything else as it came", () => {
    expect(formatMonth("pronto")).toBe("pronto");
  });
});

describe("formatMonths", () => {
  it.each([
    [["2026-10"], "octubre de 2026"],
    [["2026-09", "2026-10"], "septiembre de 2026 y octubre de 2026"],
    [["2026-08", "2026-09", "2026-10"], "agosto de 2026, septiembre de 2026 y octubre de 2026"],
  ])("joins %j", (months, text) => {
    expect(formatMonths(months)).toBe(text);
  });
});

describe("formatChargeDate", () => {
  it.each([
    { name: "a day in November", unix: Date.UTC(2026, 10, 18, 15) / 1000, text: "mié 18 nov" },
    { name: "the day in Santiago, not in UTC", unix: Date.UTC(2026, 10, 19, 2) / 1000, text: "mié 18 nov" },
  ])("writes $name as '$text'", ({ unix, text }) => {
    expect(formatChargeDate(unix)).toBe(text);
  });
});

describe("formatDayMonth", () => {
  it("writes the day and the short month in Santiago", () => {
    expect(formatDayMonth(Date.UTC(2025, 11, 15, 15) / 1000)).toBe("15 dic");
  });
});
