import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { SubscriptionsGateway } from "../../application/ports";
import type { Possible } from "../../domain/review";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };

function possibleNamed(name: string): Possible {
  const amount = { amount: 579_000, currency: "CLP" };
  return { lineKey: `k-${name}`, name, alias: "", amount, charges: [{ date: 1_788_000_000, amount }] };
}

function renderReview(possible: readonly Possible[]) {
  const subscriptions: SubscriptionsGateway = {
    ...gatewaysWith({}).subscriptions,
    readPossible: async () => possible,
    decide: vi.fn(async () => {}),
    undoDecision: vi.fn(async () => {}),
  };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return { ...renderApp("/revision", { auth, subscriptions }), subscriptions };
}

describe("Review screen", () => {
  it("confirms a possible one as yearly and lets it be undone", async () => {
    const { subscriptions } = renderReview([possibleNamed("AMZN PRIME"), possibleNamed("GOOGLE *STORAGE")]);
    const prime = within(await screen.findByRole("article", { name: "AMZN PRIME" }));

    await userEvent.click(prime.getByRole("button", { name: "Sí, es una suscripción" }));
    await userEvent.click(prime.getByRole("radio", { name: "Cada año" }));
    await userEvent.click(prime.getByRole("button", { name: "Agregar" }));

    expect(await prime.findByText("Agregada: se cobra cada año.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "1 de 2 revisadas" })).toBeInTheDocument();
    expect(subscriptions.decide).toHaveBeenCalledWith({
      lineKey: "k-AMZN PRIME",
      decision: "confirm",
      cadence: "yearly",
    });

    await userEvent.click(prime.getByRole("button", { name: "Deshacer" }));

    expect(await prime.findByRole("button", { name: "Sí, es una suscripción" })).toBeInTheDocument();
    expect(subscriptions.undoDecision).toHaveBeenCalledWith("k-AMZN PRIME");
  });

  it("goes to the summary once all are resolved", async () => {
    const { router } = renderReview([possibleNamed("AMZN PRIME")]);

    await userEvent.click(await screen.findByRole("button", { name: "No lo es" }));
    await userEvent.click(await screen.findByRole("link", { name: "Ir a mi resumen" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/resumen"));
  });

  it("shows Revisión vacía and leads to the summary when nothing is pending", async () => {
    renderReview([]);

    expect(await screen.findByRole("heading", { level: 1, name: "Nada por revisar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a mi resumen" })).toHaveAttribute("href", "/resumen");
  });

  it("keeps the components free of application and infrastructure", () => {
    const folder = join(__dirname, "../components");
    const sources = readdirSync(folder)
      .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
      .map((file) => readFileSync(join(folder, file), "utf8"));

    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(source).not.toMatch(/from "\.\.\/\.\.\/(application|infrastructure)\//);
    }
  });
});
