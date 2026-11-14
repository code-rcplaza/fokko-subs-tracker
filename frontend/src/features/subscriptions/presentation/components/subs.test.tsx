import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SubscriptionLine } from "../../domain/summary";
import { SubscriptionList, SubsZone } from "./SubscriptionList";

/** Noon in Santiago of a day of November 2026. */
function onDay(day: number): number {
  return Date.UTC(2026, 10, day, 15) / 1000;
}

function lineOf(name: string, day: number): SubscriptionLine {
  return {
    lineKey: `k-${name}`,
    name,
    alias: "",
    cadence: "monthly",
    amount: { amount: 999_000, currency: "CLP" },
    inPesos: { amount: 999_000, isApproximate: false },
    nextCharge: onDay(day),
    bank: "bci",
    card: "credito",
    hasRise: false,
    markedForCancellationAt: null,
  };
}

function renderList(lines: readonly SubscriptionLine[]) {
  return render(<SubscriptionList lines={lines} onNavigate={vi.fn()} />);
}

describe("SubscriptionList", () => {
  it("has a row per line, soonest charge first, each one leading to its Detalle", () => {
    renderList([
      lineOf("Spotify", 20),
      lineOf("Netflix", 18),
      lineOf("iCloud", 2),
      lineOf("Adobe", 24),
      lineOf("Google One", 5),
    ]);

    const links = within(screen.getByRole("list", { name: "Tus suscripciones" })).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/subs/k-iCloud",
      "/subs/k-Google%20One",
      "/subs/k-Netflix",
      "/subs/k-Spotify",
      "/subs/k-Adobe",
    ]);
  });

  it("shows name (or alias), amount, next charge, bank and card", () => {
    renderList([{ ...lineOf("NETFLIX.COM", 18), alias: "Netflix" }]);

    const row = within(screen.getByRole("link"));
    expect(row.getByText("Netflix")).toBeInTheDocument();
    expect(row.getByText("$9.990")).toBeInTheDocument();
    expect(row.getByText("mié 18 nov · BCI · crédito")).toBeInTheDocument();
  });

  it.each([
    {
      name: "with its pesos",
      inPesos: { amount: 1_900_000, isApproximate: true },
      text: "USD 20 · ≈ $19.000",
    },
    { name: "without an exchange rate", inPesos: null, text: "USD 20" },
  ])("shows a dollar line $name", ({ inPesos, text }) => {
    renderList([{ ...lineOf("ChatGPT", 9), amount: { amount: 2_000, currency: "USD" }, inPesos }]);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("marks a line to cancel and one with a rise, in words", () => {
    renderList([
      { ...lineOf("Disney+", 15), hasRise: true },
      { ...lineOf("Spotify", 20), markedForCancellationAt: onDay(1) },
    ]);

    expect(within(screen.getByRole("link", { name: /Disney\+/ })).getByText("Alza")).toBeInTheDocument();
    expect(
      within(screen.getByRole("link", { name: /Spotify/ })).getByText("Por cancelar"),
    ).toBeInTheDocument();
  });

  it("leaves out bank and card of a manual line", () => {
    renderList([{ ...lineOf("Gimnasio", 15), bank: "", card: "" }]);

    expect(screen.getByText("dom 15 nov")).toBeInTheDocument();
  });

  it("shows the empty state with Subir cartola and Agregar", () => {
    renderList([]);

    expect(screen.getByRole("heading", { name: "Aún no tienes suscripciones" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subir cartola" })).toHaveAttribute("href", "/fuente");
    expect(screen.getByRole("link", { name: "Agregar" })).toHaveAttribute("href", "/subs/agregar");
  });
});

describe("SubsZone", () => {
  it("counts the lines with the monthly total and leads to Agregar", () => {
    const total = { amount: 8_406_000, currency: "CLP", isApproximate: false, isIncomplete: false };
    render(<SubsZone count={8} total={total} onNavigate={vi.fn()} />);

    expect(screen.getByText("8 activas · $84.060 al mes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agregar" })).toHaveAttribute("href", "/subs/agregar");
  });
});
