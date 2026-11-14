import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { Summary } from "../../domain/summary";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };

const summary: Summary = {
  subscriptions: [
    {
      lineKey: "k-netflix",
      name: "Netflix",
      alias: "",
      cadence: "monthly",
      amount: { amount: 999_000, currency: "CLP" },
      inPesos: { amount: 999_000, isApproximate: false },
      nextCharge: Date.UTC(2026, 10, 18, 15) / 1000,
      bank: "bci",
      card: "credito",
      hasRise: false,
      markedForCancellationAt: null,
    },
  ],
  possible: [],
  total: { amount: 999_000, currency: "CLP", isApproximate: false, isIncomplete: false },
  charged: 0,
  remaining: 1,
  rises: [],
  pendingActions: [],
  upcoming: [],
  spend: [],
};

function renderSubs() {
  const subscriptions = { ...gatewaysWith({}).subscriptions, readSummary: async () => summary };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp("/subs", { auth, subscriptions });
}

describe("Subs screen", () => {
  it("lists the lines with the count and marks Subs as the current section", async () => {
    renderSubs();

    expect(await screen.findByText("1 activa · $9.990 al mes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Netflix/ })).toHaveAttribute("href", "/subs/k-netflix");
    expect(screen.getAllByRole("link", { name: "Subs" })[0]).toHaveAttribute("aria-current", "page");
  });

  it("goes to Agregar", async () => {
    const { router } = renderSubs();

    await userEvent.click(await screen.findByRole("link", { name: "Agregar" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/subs/agregar"));
  });
});
