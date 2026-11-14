import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { ApiError } from "../../../../lib/api/client";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { SubscriptionsGateway } from "../../application/ports";
import type { LineDetail } from "../../domain/detail";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };
const pesos = (amount: number) => ({ amount, currency: "CLP" });

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
  rise: {
    before: pesos(890_000),
    after: pesos(1_050_000),
    since: Date.UTC(2025, 11, 15, 15) / 1000,
    monthlyImpact: pesos(160_000),
    yearlyImpact: pesos(1_920_000),
    isPlanChange: false,
  },
};

function renderAlert(overrides: Partial<SubscriptionsGateway>) {
  const subscriptions = {
    ...gatewaysWith({}).subscriptions,
    readLineDetail: async () => disney,
    ...overrides,
  };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp("/alerta/k-disney", { auth, subscriptions });
}

describe("Alert screen", () => {
  it("keeps the subscription and goes back to Resumen", async () => {
    const keepRise = vi.fn(async () => {});
    const { router } = renderAlert({ keepRise });

    await userEvent.click(await screen.findByRole("button", { name: "Mantener Disney+" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/resumen"));
    expect(keepRise).toHaveBeenCalledWith("k-disney");
  });

  it("stays with the message when keeping fails", async () => {
    const { router } = renderAlert({
      keepRise: () => Promise.reject(new ApiError({ status: 404, key: "subscriptions.rise_not_found" })),
    });

    await userEvent.click(await screen.findByRole("button", { name: "Mantener Disney+" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Esa suscripción no tiene un alza pendiente.");
    expect(router.state.location.pathname).toBe("/alerta/k-disney");
  });

  it("goes to Cómo cancelar of that line", async () => {
    const { router } = renderAlert({});

    await userEvent.click(await screen.findByRole("link", { name: "Ver cómo cancelar" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/subs/k-disney/cancelar"));
  });

  it("says so when the line has no rise", async () => {
    renderAlert({ readLineDetail: async () => ({ ...disney, rise: null }) });

    expect(await screen.findByRole("alert")).toHaveTextContent("Esa suscripción no tiene un alza pendiente.");
  });
});
