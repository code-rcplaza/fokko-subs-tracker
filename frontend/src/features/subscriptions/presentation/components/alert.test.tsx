import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LineDetail, LineRise } from "../../domain/detail";
import { AlertDecisionActions, AlertZone, PriceAlertCard } from "./PriceAlert";

const pesos = (amount: number) => ({ amount, currency: "CLP" });
const rise: LineRise = {
  before: pesos(890_000),
  after: pesos(1_050_000),
  since: Date.UTC(2025, 11, 15, 15) / 1000,
  monthlyImpact: pesos(160_000),
  yearlyImpact: pesos(1_920_000),
  isPlanChange: false,
};

const disney: LineDetail = {
  lineKey: "k-disney",
  name: "Disney+",
  alias: "",
  cadence: "monthly",
  amount: pesos(1_050_000),
  inPesos: { amount: 1_050_000, isApproximate: false },
  nextCharge: null,
  bank: "bci",
  card: "credito",
  markedForCancellationAt: null,
  cycle: { day: 15, month: null },
  charges: [],
  rise,
};

describe("PriceAlertCard", () => {
  it("shows the service, before, after, since when and the impact", () => {
    render(<PriceAlertCard detail={disney} rise={rise} />);

    const card = within(screen.getByRole("region", { name: "Alza detectada" }));
    expect(card.getByRole("heading", { name: "Disney+ sube a $10.500" })).toBeInTheDocument();
    expect(card.getByText("$8.900")).toBeInTheDocument();
    expect(card.getByText("Desde el 15 dic")).toBeInTheDocument();
    expect(card.getByText("+$1.600 al mes · +$19.200 al año")).toBeInTheDocument();
    expect(card.queryByText(/cambio de plan/)).not.toBeInTheDocument();
  });

  it("says when it looks like a change of plan", () => {
    render(<PriceAlertCard detail={disney} rise={{ ...rise, isPlanChange: true }} />);

    expect(screen.getByText("Parece un cambio de plan, no solo de precio.")).toBeInTheDocument();
  });

  it("shows dollars with their approximate pesos at the line's rate", () => {
    const usd = (amount: number) => ({ amount, currency: "USD" });
    const dollarRise = {
      ...rise,
      before: usd(1_800),
      after: usd(2_000),
      monthlyImpact: usd(200),
      yearlyImpact: usd(2_400),
    };
    const chatgpt = {
      ...disney,
      amount: usd(2_000),
      inPesos: { amount: 1_900_000, isApproximate: true },
      rise: dollarRise,
    };
    render(<PriceAlertCard detail={chatgpt} rise={dollarRise} />);

    expect(screen.getByText("US$20,00 ≈ $19.000")).toBeInTheDocument();
    expect(screen.getByText("US$18,00 ≈ $17.100")).toBeInTheDocument();
  });
});

describe("AlertZone", () => {
  it("shows the rise as a percent", () => {
    render(<AlertZone rise={rise} onNavigate={vi.fn()} />);

    expect(screen.getByText("+18%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resumen" })).toHaveAttribute("href", "/resumen");
  });
});

describe("AlertDecisionActions", () => {
  it("offers to keep it or to see how to cancel, and no later", () => {
    render(
      <AlertDecisionActions
        detail={disney}
        onKeep={vi.fn()}
        isKeeping={false}
        error={undefined}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Mantener Disney+" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver cómo cancelar" })).toHaveAttribute(
      "href",
      "/subs/k-disney/cancelar",
    );
    expect(screen.queryByText(/más tarde|después/i)).not.toBeInTheDocument();
  });
});
