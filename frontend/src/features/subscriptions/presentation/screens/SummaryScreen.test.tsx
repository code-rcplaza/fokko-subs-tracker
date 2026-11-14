import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { ApiError } from "../../../../lib/api/client";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { SubscriptionsGateway } from "../../application/ports";
import type { Summary } from "../../domain/summary";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };
const pesos = (amount: number) => ({ amount, currency: "CLP" });

const summary: Summary = {
  subscriptions: [
    {
      lineKey: "k-netflix",
      name: "Netflix",
      alias: "",
      cadence: "monthly",
      amount: pesos(999_000),
      inPesos: { amount: 999_000, isApproximate: false },
      nextCharge: 1_795_000_000,
      bank: "bci",
      card: "credito",
      hasRise: false,
      markedForCancellationAt: null,
    },
  ],
  possible: [{ lineKey: "k-prime", name: "AMZN PRIME", alias: "", amount: pesos(579_000), charges: [] }],
  total: { amount: 999_000, currency: "CLP", isApproximate: false, isIncomplete: false },
  charged: 3,
  remaining: 5,
  rises: [],
  pendingActions: [{ kind: "possible", lineKey: "k-prime" }],
  upcoming: [
    { lineKey: "k-netflix", name: "Netflix", alias: "", amount: pesos(999_000), date: 1_795_000_000 },
  ],
  spend: [{ name: "Netflix", amount: 999_000, percent: 100, isOthers: false }],
};

function renderSummary(readSummary: SubscriptionsGateway["readSummary"]) {
  const subscriptions = { ...gatewaysWith({}).subscriptions, readSummary };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp("/resumen", { auth, subscriptions });
}

describe("Summary screen", () => {
  it("greets by first name and shows the month, the pending ones and what is coming", async () => {
    renderSummary(async () => summary);

    expect(await screen.findByRole("heading", { level: 1, name: "Hola, Ana" })).toBeInTheDocument();
    expect(screen.getByText("Llevas 3 cobros este mes y te quedan 5.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Próximo cobro" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Próximos cobros/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Resumen" })[0]).toHaveAttribute("aria-current", "page");
  });

  it("passes the coming charges to the cycle tip", async () => {
    const onThe20th = (position: number) => ({
      lineKey: `k${position}`,
      name: `S${position}`,
      alias: "",
      amount: pesos(100),
      date: Date.UTC(2026, 10, 20, 15) / 1000,
    });
    renderSummary(async () => ({ ...summary, upcoming: [0, 1, 2].map(onThe20th) }));

    expect(
      await screen.findByRole("heading", { name: "Optimización de ciclo sugerida" }),
    ).toBeInTheDocument();
  });

  it("goes to Revisión from a pending possible one", async () => {
    const { router } = renderSummary(async () => summary);

    await userEvent.click(await screen.findByRole("link", { name: /¿AMZN PRIME es una suscripción\?/ }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/revision"));
  });

  it("shows the error when the summary cannot be read", async () => {
    renderSummary(() => Promise.reject(new ApiError({ status: 500, key: "common.internal" })));

    expect(await screen.findByRole("alert")).toHaveTextContent("Algo salió mal");
  });

  it("keeps the components free of application and infrastructure", () => {
    const folder = join(__dirname, "../components");
    const sources = readdirSync(folder)
      .filter((file) => /\.tsx?$/.test(file) && !file.includes(".test."))
      .map((file) => readFileSync(join(folder, file), "utf8"));

    expect(sources.length).toBeGreaterThan(4);
    for (const source of sources) {
      expect(source).not.toMatch(/from "\.\.\/\.\.\/(application|infrastructure)\//);
    }
  });
});
