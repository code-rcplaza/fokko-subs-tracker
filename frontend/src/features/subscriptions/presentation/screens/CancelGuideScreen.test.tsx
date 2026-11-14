import { screen } from "@testing-library/react";
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
  rise: null,
};

function renderGuide(overrides: Partial<SubscriptionsGateway>) {
  const subscriptions: SubscriptionsGateway = {
    ...gatewaysWith({}).subscriptions,
    readLineDetail: async () => disney,
    readCancelGuide: async () => "https://www.disneyplus.com/account",
    ...overrides,
  };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp("/subs/k-disney/cancelar", { auth, subscriptions });
}

describe("Cancel guide screen", () => {
  it("gives the steps and the link of the service", async () => {
    renderGuide({});

    expect(await screen.findByRole("link", { name: "Ir a Disney+" })).toHaveAttribute(
      "href",
      "https://www.disneyplus.com/account",
    );
  });

  it("marks the line and shows the mark once the summary is read again", async () => {
    const markedAt = Date.UTC(2026, 10, 12, 15) / 1000;
    const readLineDetail = vi
      .fn()
      .mockResolvedValueOnce(disney)
      .mockResolvedValue({ ...disney, markedForCancellationAt: markedAt });
    const markForCancellation = vi.fn(async () => {});
    renderGuide({ readLineDetail, markForCancellation });

    await userEvent.click(await screen.findByRole("button", { name: "La voy a cancelar" }));

    expect(await screen.findByText("Marcada por cancelar el 12 nov.")).toBeInTheDocument();
    expect(markForCancellation).toHaveBeenCalledWith("k-disney");
    expect(screen.getByRole("button", { name: "La voy a cancelar" })).toBeDisabled();
  });

  it("keeps the state and shows the message when marking fails", async () => {
    renderGuide({
      markForCancellation: () => Promise.reject(new ApiError({ status: 500, key: "common.internal" })),
    });

    await userEvent.click(await screen.findByRole("button", { name: "La voy a cancelar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Algo salió mal");
    expect(screen.queryByText(/Marcada por cancelar/)).not.toBeInTheDocument();
  });
});
