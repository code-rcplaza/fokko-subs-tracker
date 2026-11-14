import { render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { PendingRow, Summary, Upcoming } from "../../domain/summary";
import { MonthCounts, ServiceLegend, SpendHero } from "./SpendHero";
import { NextChargeRow, PendingActionsList, UpcomingChargesList } from "./SummaryLists";
import { SummaryContent } from "./SummaryView";

const pesos = (amount: number) => ({ amount, currency: "CLP" });
const total = { amount: 8_406_000, currency: "CLP", isApproximate: false, isIncomplete: false };
/** Wednesday 18 Nov 2026, noon in Santiago. */
const eighteenthOfNovember = Date.UTC(2026, 10, 18, 15) / 1000;
const fifthOfNovember = Date.UTC(2026, 10, 5, 15) / 1000;

function upcomingOf(name: string, date: number): Upcoming {
  return { lineKey: `k-${name}`, name, alias: "", amount: pesos(999_000), date };
}

const emptySummary: Summary = {
  subscriptions: [],
  possible: [],
  total: { ...total, amount: 0 },
  charged: 0,
  remaining: 0,
  rises: [],
  pendingActions: [],
  upcoming: [],
  spend: [],
};

describe("SpendHero", () => {
  // Reduced motion: the number shows its value at once, without counting.
  beforeAll(() => vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") })));
  afterAll(() => vi.unstubAllGlobals());

  it("shows the total formatted in es-CL inside the ring", () => {
    render(<SpendHero total={total} count={8} spend={[]} />);

    const ring = screen.getByRole("img", { name: "Gasto del mes por servicio" }).parentElement;
    expect(ring).toHaveTextContent("$84.060");
    expect(ring).toHaveTextContent("8 cobros");
  });

  it("marks an approximate total with ≈", () => {
    render(<SpendHero total={{ ...total, isApproximate: true }} count={8} spend={[]} />);

    expect(screen.getByText("≈ $84.060")).toBeInTheDocument();
  });

  it("warns that an incomplete total leaves the dollars out", () => {
    render(<SpendHero total={{ ...total, isIncomplete: true }} count={8} spend={[]} />);

    expect(
      screen.getByText("No incluye los cobros en dólares: falta el tipo de cambio."),
    ).toBeInTheDocument();
  });
});

describe("ServiceLegend", () => {
  it("lists each service with its percent and the color of its arc", () => {
    const names = ["Adobe", "ChatGPT", "Netflix", "iCloud", "Disney+"];
    const spend = [
      ...names.map((name, position) => ({ name, amount: 100 - position, percent: 17, isOthers: false })),
      { name: "", amount: 15, percent: 15, isOthers: true },
    ];
    render(<ServiceLegend spend={spend} />);

    const rows = within(screen.getByRole("list", { name: "Reparto por servicio" })).getAllByRole("listitem");
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveTextContent("Adobe17%");
    expect(rows[5]).toHaveTextContent("Otros15%");
    expect(rows[5]?.querySelector("[data-series]")).toHaveAttribute("data-series", "6");
  });

  it("has one row for one service", () => {
    render(<ServiceLegend spend={[{ name: "Netflix", amount: 1, percent: 100, isOthers: false }]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("MonthCounts", () => {
  it.each([
    { charged: 3, remaining: 5, text: "Llevas 3 cobros este mes y te quedan 5." },
    { charged: 1, remaining: 5, text: "Llevas 1 cobro este mes y te quedan 5." },
  ])("says '$text'", ({ charged, remaining, text }) => {
    render(<MonthCounts charged={charged} remaining={remaining} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("shows nothing with no charges at all", () => {
    const { container } = render(<MonthCounts charged={0} remaining={0} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("NextChargeRow", () => {
  it("shows name, amount and date in Santiago", () => {
    render(<NextChargeRow next={upcomingOf("Netflix", eighteenthOfNovember)} />);

    const row = within(screen.getByRole("region", { name: "Próximo cobro" }));
    expect(row.getByText("Netflix · mié 18 nov")).toBeInTheDocument();
    expect(row.getByText("$9.990")).toBeInTheDocument();
  });

  it("is not there without charges to come", () => {
    const { container } = render(<NextChargeRow next={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("PendingActionsList", () => {
  const rows: readonly PendingRow[] = [
    {
      kind: "rise",
      lineKey: "k-disney",
      name: "Disney+",
      after: pesos(1_050_000),
      percent: 18,
      since: Date.UTC(2025, 11, 15, 15) / 1000,
    },
    { kind: "possible", lineKey: "k-prime", name: "Amazon Prime" },
  ];

  it("leads a rise to Alerta and a possible one to Revisión", () => {
    render(<PendingActionsList rows={rows} onNavigate={vi.fn()} />);

    expect(screen.getByRole("link", { name: /Disney\+ sube a \$10\.500/ })).toHaveAttribute(
      "href",
      "/alerta/k-disney",
    );
    expect(screen.getByText("+18% desde el 15 dic.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /¿Amazon Prime es una suscripción\?/ })).toHaveAttribute(
      "href",
      "/revision",
    );
  });

  it("is not there with nothing pending", () => {
    const { container } = render(<PendingActionsList rows={[]} onNavigate={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("UpcomingChargesList", () => {
  it("sorts by date and each row opens the Detalle of its line", () => {
    const upcoming = [upcomingOf("Netflix", eighteenthOfNovember), upcomingOf("Google One", fifthOfNovember)];
    render(<UpcomingChargesList upcoming={upcoming} onNavigate={vi.fn()} />);

    const links = within(screen.getByRole("list")).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/subs/k-Google%20One",
      "/subs/k-Netflix",
    ]);
  });
});

describe("SummaryContent", () => {
  it("shows the empty state that leads to Elegir fuente", () => {
    render(<SummaryContent summary={emptySummary} onNavigate={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Tu mes está en blanco" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subir cartola" })).toHaveAttribute("href", "/fuente");
  });
});
