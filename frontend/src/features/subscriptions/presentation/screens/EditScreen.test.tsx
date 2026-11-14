import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { SubscriptionsGateway } from "../../application/ports";
import type { LineDetail } from "../../domain/detail";
import type { Possible } from "../../domain/review";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };
const pesos = (amount: number) => ({ amount, currency: "CLP" });

const netflix: LineDetail = {
  lineKey: "k-netflix",
  name: "Netflix",
  alias: "",
  cadence: "monthly",
  amount: pesos(999_000),
  inPesos: { amount: 999_000, isApproximate: false },
  nextCharge: null,
  bank: "bci",
  card: "credito",
  markedForCancellationAt: null,
  cycle: { day: 18, month: null },
  charges: [],
  rise: null,
};

const gym: LineDetail = {
  ...netflix,
  lineKey: "manual:m1",
  name: "",
  alias: "Gimnasio",
  cycle: { day: 5, month: null },
};

const prime: Possible = {
  lineKey: "k-prime",
  name: "AMZN PRIME",
  alias: "",
  amount: pesos(579_000),
  charges: [{ date: Date.UTC(2026, 9, 26, 15) / 1000, amount: pesos(579_000) }],
};

function gatewayWith(overrides: Partial<SubscriptionsGateway>): SubscriptionsGateway {
  return {
    ...gatewaysWith({}).subscriptions,
    nameLine: vi.fn(async () => {}),
    saveOverride: vi.fn(async () => {}),
    editManual: vi.fn(async () => {}),
    removeManual: vi.fn(async () => {}),
    ...overrides,
  };
}

function renderEdit(path: string, subscriptions: SubscriptionsGateway) {
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp(path, { auth, subscriptions });
}

async function replace(label: string, text: string) {
  const field = await screen.findByLabelText(label);
  await userEvent.clear(field);
  if (text !== "") {
    await userEvent.type(field, text);
  }
}

describe("Edit screen", () => {
  it("names a detected line and goes back to its Detalle", async () => {
    const subscriptions = gatewayWith({ readLineDetail: async () => netflix });
    const { router } = renderEdit("/subs/k-netflix/editar", subscriptions);

    await replace("Nombre", "Netflix familia");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/subs/k-netflix"));
    expect(subscriptions.nameLine).toHaveBeenCalledWith({ lineKey: "k-netflix", alias: "Netflix familia" });
    expect(subscriptions.saveOverride).not.toHaveBeenCalled();
  });

  it("overrides the amount with the day it has", async () => {
    const subscriptions = gatewayWith({ readLineDetail: async () => netflix });
    renderEdit("/subs/k-netflix/editar", subscriptions);

    expect(await screen.findByLabelText("Monto (CLP)")).toHaveValue("9.990");
    await replace("Monto (CLP)", "10.990");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(subscriptions.saveOverride).toHaveBeenCalledWith({
        lineKey: "k-netflix",
        amount: 1_099_000,
        billingDay: 18,
      }),
    );
    expect(subscriptions.nameLine).not.toHaveBeenCalled();
  });

  it("edits a possible one from Revisión and goes back there", async () => {
    const subscriptions = gatewayWith({ readPossible: async () => [prime] });
    const { router } = renderEdit("/subs/k-prime/editar?desde=revision", subscriptions);

    await replace("Nombre", "Amazon Prime");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/revision"));
    expect(subscriptions.nameLine).toHaveBeenCalledWith({ lineKey: "k-prime", alias: "Amazon Prime" });
  });

  it("edits a manual line with PUT", async () => {
    const subscriptions = gatewayWith({ readLineDetail: async () => gym });
    renderEdit("/subs/manual%3Am1/editar", subscriptions);

    await replace("Monto mensual", "30.000");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(subscriptions.editManual).toHaveBeenCalledWith({
        publicId: "m1",
        input: { name: "Gimnasio", amount: 3_000_000, currency: "CLP", billingDay: 5 },
      }),
    );
  });

  it("removes a manual line after confirming and goes to Subs", async () => {
    const subscriptions = gatewayWith({ readLineDetail: async () => gym });
    const { router } = renderEdit("/subs/manual%3Am1/editar", subscriptions);

    await userEvent.click(await screen.findByRole("button", { name: "Quitar esta suscripción" }));
    const dialog = screen.getByRole("dialog", { name: "¿Quitar Gimnasio?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Quitar" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/subs"));
    expect(subscriptions.removeManual).toHaveBeenCalledWith("m1");
  });
});
