import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LineDetail } from "../../domain/detail";
import { ChargeHistory, CycleRows, DetailContent, DetailZone, PriceChangeBlock } from "./LineDetailView";

const pesos = (amount: number) => ({ amount, currency: "CLP" });
/** Noon in Santiago of a day of 2026. */
const on = (month: number, day: number) => Date.UTC(2026, month - 1, day, 15) / 1000;

const disney: LineDetail = {
  lineKey: "k-disney",
  name: "Disney+",
  alias: "",
  cadence: "monthly",
  amount: pesos(890_000),
  inPesos: { amount: 890_000, isApproximate: false },
  nextCharge: on(12, 15),
  bank: "bci",
  card: "credito",
  markedForCancellationAt: null,
  cycle: { day: 15, month: null },
  charges: [],
  rise: null,
};

describe("DetailZone and CycleRows", () => {
  it("shows a monthly line with its amount, Mensual and the day", () => {
    render(
      <>
        <DetailZone detail={disney} onNavigate={vi.fn()} />
        <CycleRows detail={disney} />
      </>,
    );

    expect(screen.getByText("$8.900")).toBeInTheDocument();
    expect(screen.getByText("al mes")).toBeInTheDocument();
    expect(screen.getByText("Mensual, cada 15 del mes")).toBeInTheDocument();
    expect(screen.getByText("mar 15 dic")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subs" })).toHaveAttribute("href", "/subs");
  });

  it("shows a yearly line with its amount, Anual and the date", () => {
    const yearly = { ...disney, cadence: "yearly", cycle: { day: 15, month: 3 } } as const;
    render(
      <>
        <DetailZone detail={yearly} onNavigate={vi.fn()} />
        <CycleRows detail={yearly} />
      </>,
    );

    expect(screen.getByText("al año")).toBeInTheDocument();
    expect(screen.getByText("Anual, cada 15 de marzo")).toBeInTheDocument();
  });

  it("shows the alias and the service it is of", () => {
    render(<DetailZone detail={{ ...disney, alias: "Disney de los niños" }} onNavigate={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Disney de los niños" })).toBeInTheDocument();
    expect(screen.getByText("Servicio: Disney+")).toBeInTheDocument();
  });
});

describe("PriceChangeBlock", () => {
  const rise = {
    before: pesos(890_000),
    after: pesos(1_050_000),
    since: Date.UTC(2025, 11, 15, 15) / 1000,
    monthlyImpact: pesos(160_000),
    yearlyImpact: pesos(1_920_000),
    isPlanChange: false,
  };

  it("shows before, after, since when and the monthly and yearly impact", () => {
    render(<PriceChangeBlock detail={{ ...disney, rise }} />);

    const block = within(screen.getByRole("region", { name: "Alza detectada" }));
    expect(block.getByText("$8.900 al mes")).toBeInTheDocument();
    expect(block.getByText("Desde el 15 dic")).toBeInTheDocument();
    expect(block.getByText("$10.500 al mes")).toBeInTheDocument();
    expect(block.getByText("Son $1.600 más al mes y $19.200 más al año.")).toBeInTheDocument();
    expect(block.queryByText(/cambio de plan/)).not.toBeInTheDocument();
  });

  it("says so when it looks like a change of plan", () => {
    render(<PriceChangeBlock detail={{ ...disney, rise: { ...rise, isPlanChange: true } }} />);

    expect(screen.getByText("Parece un cambio de plan, no solo de precio.")).toBeInTheDocument();
  });

  it("is not there without a rise", () => {
    const { container } = render(<PriceChangeBlock detail={disney} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("ChargeHistory", () => {
  it("keeps the order of the back, newest first, with date and amount", () => {
    const charges = [6, 5, 4, 3, 2, 1].map((month) => ({
      date: on(month + 4, 15),
      amount: pesos(890_000),
      inPesos: { amount: 890_000, isApproximate: false },
    }));
    render(<ChargeHistory detail={{ ...disney, charges }} />);

    const rows = within(screen.getByRole("list", { name: "Últimos cobros" })).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "15 oct$8.900",
      "15 sept$8.900",
      "15 ago$8.900",
      "15 jul$8.900",
      "15 jun$8.900",
      "15 may$8.900",
    ]);
  });

  it("shows a dollar charge with its equivalent", () => {
    const charge = {
      date: on(10, 9),
      amount: { amount: 2_000, currency: "USD" },
      inPesos: { amount: 1_900_000, isApproximate: true },
    };
    render(<ChargeHistory detail={{ ...disney, charges: [charge] }} />);

    expect(screen.getByText("USD 20 · ≈ $19.000")).toBeInTheDocument();
  });
});

describe("DetailContent", () => {
  it("leads to Editar and to Cómo cancelar of the line", () => {
    render(<DetailContent detail={disney} onNavigate={vi.fn()} onStopFollowing={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Editar" })).toHaveAttribute("href", "/subs/k-disney/editar");
    expect(screen.getByRole("link", { name: "Ver cómo cancelar" })).toHaveAttribute(
      "href",
      "/subs/k-disney/cancelar",
    );
  });

  it("asks to stop following the line", () => {
    const onStopFollowing = vi.fn();
    render(<DetailContent detail={disney} onNavigate={vi.fn()} onStopFollowing={onStopFollowing} />);

    fireEvent.click(screen.getByRole("button", { name: "Dejar de seguir esta suscripción" }));

    expect(onStopFollowing).toHaveBeenCalledTimes(1);
  });
});
