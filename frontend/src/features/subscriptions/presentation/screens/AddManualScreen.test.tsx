import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { ApiError } from "../../../../lib/api/client";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { SubscriptionsGateway } from "../../application/ports";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };

function renderAdd(createManual: SubscriptionsGateway["createManual"]) {
  const subscriptions = { ...gatewaysWith({}).subscriptions, createManual };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp("/subs/agregar", { auth, subscriptions });
}

async function fillForm(values: { name: string; amount: string; billingDay: string }) {
  await userEvent.type(await screen.findByLabelText("Nombre"), values.name);
  await userEvent.type(screen.getByLabelText("Monto mensual"), values.amount);
  await userEvent.type(screen.getByLabelText("Día de cobro"), values.billingDay);
}

describe("Add manual screen", () => {
  it("adds a manual in cents and goes back to Subs", async () => {
    const createManual = vi.fn(async () => "m1");
    const { router } = renderAdd(createManual);

    await fillForm({ name: "Gimnasio", amount: "25.000", billingDay: "5" });
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/subs"));
    expect(createManual).toHaveBeenCalledWith({
      name: "Gimnasio",
      amount: 2_500_000,
      currency: "CLP",
      billingDay: 5,
    });
  });

  it("sends dollars when USD is chosen", async () => {
    const createManual = vi.fn(async () => "m1");
    renderAdd(createManual);

    await fillForm({ name: "ChatGPT", amount: "20", billingDay: "9" });
    await userEvent.click(screen.getByRole("radio", { name: "USD" }));
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() =>
      expect(createManual).toHaveBeenCalledWith({
        name: "ChatGPT",
        amount: 2_000,
        currency: "USD",
        billingDay: 9,
      }),
    );
  });

  it("shows each error on its field without sending", async () => {
    const createManual = vi.fn(async () => "m1");
    renderAdd(createManual);

    await fillForm({ name: " ", amount: "0", billingDay: "40" });
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(await screen.findByText("Escribe un nombre.")).toBeInTheDocument();
    expect(screen.getByText("El monto debe ser mayor que cero.")).toBeInTheDocument();
    expect(screen.getByText("El día de cobro va del 1 al 31.")).toBeInTheDocument();
    expect(createManual).not.toHaveBeenCalled();
  });

  it("puts the fields of a 400 on their fields", async () => {
    const rejected = new ApiError({
      status: 400,
      key: "common.invalid_request",
      fields: { name: "subscriptions.manual_name_too_long" },
    });
    renderAdd(() => Promise.reject(rejected));

    await fillForm({ name: "Gimnasio", amount: "25.000", billingDay: "5" });
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(
      await screen.findByText("El nombre de la suscripción puede tener hasta 40 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
  });
});
