import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { ApiError } from "../../../../lib/api/client";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { SubscriptionsGateway } from "../../application/ports";
import type { LineDetail } from "../../domain/detail";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };
const lineKey = "service:Disney+||d15";

const detail: LineDetail = {
  lineKey,
  name: "Disney+",
  alias: "",
  cadence: "monthly",
  amount: { amount: 890_000, currency: "CLP" },
  inPesos: { amount: 890_000, isApproximate: false },
  nextCharge: null,
  bank: "bci",
  card: "credito",
  markedForCancellationAt: null,
  cycle: { day: 15, month: null },
  charges: [],
  rise: null,
};

function renderDetail(
  readLineDetail: SubscriptionsGateway["readLineDetail"],
  stopFollowing: SubscriptionsGateway["stopFollowing"] = vi.fn(async () => {}),
) {
  const subscriptions = { ...gatewaysWith({}).subscriptions, readLineDetail, stopFollowing };
  const auth = { ...gatewaysWith({}).auth, getMe: async () => ana };
  return renderApp(`/subs/${encodeURIComponent(lineKey)}`, { auth, subscriptions });
}

describe("Detail screen", () => {
  it("reads the line of the URL, decoded, and marks Subs as current", async () => {
    const readLineDetail = vi.fn(async () => detail);
    renderDetail(readLineDetail);

    expect(await screen.findByRole("heading", { level: 1, name: "Disney+" })).toBeInTheDocument();
    expect(readLineDetail).toHaveBeenCalledWith(lineKey);
    expect(
      screen
        .getAllByRole("link", { name: "Subs" })
        .some((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });

  it("shows the message when the line is not there", async () => {
    renderDetail(() => Promise.reject(new ApiError({ status: 404, key: "subscriptions.line_not_found" })));

    expect(await screen.findByRole("alert")).toHaveTextContent("No encontramos esa suscripción.");
  });

  it("stops following after confirming and goes back to Subs", async () => {
    const stopFollowing = vi.fn(async () => {});
    const { router } = renderDetail(async () => detail, stopFollowing);

    await userEvent.click(await screen.findByRole("button", { name: "Dejar de seguir esta suscripción" }));
    const dialog = screen.getByRole("dialog", { name: "¿Dejar de seguir Disney+?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Dejar de seguir" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/subs"));
    expect(stopFollowing).toHaveBeenCalledWith(lineKey);
  });

  it("stays on Detalle with the message when stopping fails", async () => {
    const stopFollowing = () => Promise.reject(new ApiError({ status: 500, key: "common.internal" }));
    const { router } = renderDetail(async () => detail, stopFollowing);

    await userEvent.click(await screen.findByRole("button", { name: "Dejar de seguir esta suscripción" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Dejar de seguir" }),
    );

    expect(await within(screen.getByRole("dialog")).findByRole("alert")).toHaveTextContent("Algo salió mal");
    expect(router.state.location.pathname).not.toBe("/subs");
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
  });
});
