import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../lib/api/client";
import { gatewaysWith, renderWithGateways } from "../../../lib/gateways/renderWithGateways";
import type { Possible } from "../domain/review";
import type { SubscriptionsGateway } from "./ports";
import { useReview } from "./useReview";

const icloud: Possible = {
  lineKey: "k-icloud",
  name: "iCloud 2TB",
  alias: "",
  amount: { amount: 990_000, currency: "CLP" },
  charges: [],
};

function subscriptionsWith(overrides: Partial<SubscriptionsGateway>): SubscriptionsGateway {
  return {
    ...gatewaysWith({}).subscriptions,
    readPossible: async () => [icloud],
    decide: vi.fn(async () => {}),
    undoDecision: vi.fn(async () => {}),
    ...overrides,
  };
}

/** Shows what the hook exposes and gives a button per action. */
function ReviewProbe() {
  const review = useReview();
  if (review.isLoading) {
    return <p>loading</p>;
  }
  if (review.error !== undefined) {
    return <p role="alert">{review.error}</p>;
  }
  const card = review.cards[0];
  const lineKey = card?.possible.lineKey ?? "";
  return (
    <div>
      <p>{`${card?.possible.name} · ${card?.state.kind} · ${review.progress.resolved}/${review.progress.total}`}</p>
      {card?.error !== undefined && <p role="alert">{card.error}</p>}
      <button type="button" onClick={() => review.answerYes(lineKey)}>
        yes
      </button>
      <button type="button" onClick={() => review.chooseCadence({ lineKey, cadence: "yearly" })}>
        yearly
      </button>
      <button type="button" onClick={() => review.confirm(lineKey)}>
        confirm
      </button>
      <button type="button" onClick={() => review.dismiss(lineKey)}>
        dismiss
      </button>
      <button
        type="button"
        onClick={() => {
          review.undo(lineKey);
          review.undo(lineKey);
        }}
      >
        undo twice
      </button>
    </div>
  );
}

function renderProbe(subscriptions: SubscriptionsGateway) {
  return renderWithGateways(<ReviewProbe />, { subscriptions });
}

describe("useReview", () => {
  it("brings the possible ones, all pending", async () => {
    renderProbe(subscriptionsWith({}));

    expect(await screen.findByText("iCloud 2TB · pending · 0/1")).toBeInTheDocument();
  });

  it("exposes the error when they cannot be read", async () => {
    renderProbe(
      subscriptionsWith({
        readPossible: () => Promise.reject(new ApiError({ status: 500, key: "common.internal" })),
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Algo salió mal");
  });

  it("is loading until the summary answers", () => {
    renderProbe(subscriptionsWith({ readPossible: () => new Promise(() => {}) }));

    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("does not send a Sí until a cadence is chosen", async () => {
    const subscriptions = subscriptionsWith({});
    renderProbe(subscriptions);

    await userEvent.click(await screen.findByRole("button", { name: "yes" }));
    await userEvent.click(screen.getByRole("button", { name: "confirm" }));

    expect(screen.getByText("iCloud 2TB · choosing · 0/1")).toBeInTheDocument();
    expect(subscriptions.decide).not.toHaveBeenCalled();
  });

  it("confirms with the chosen cadence and the card is added", async () => {
    const subscriptions = subscriptionsWith({});
    renderProbe(subscriptions);

    await userEvent.click(await screen.findByRole("button", { name: "yes" }));
    await userEvent.click(screen.getByRole("button", { name: "yearly" }));
    await userEvent.click(screen.getByRole("button", { name: "confirm" }));

    expect(await screen.findByText("iCloud 2TB · added · 1/1")).toBeInTheDocument();
    expect(subscriptions.decide).toHaveBeenCalledWith({
      lineKey: "k-icloud",
      decision: "confirm",
      cadence: "yearly",
    });
  });

  it("goes back to pending with the message when the API fails", async () => {
    const subscriptions = subscriptionsWith({
      decide: () => Promise.reject(new ApiError({ status: 404, key: "subscriptions.possible_not_found" })),
    });
    renderProbe(subscriptions);

    await userEvent.click(await screen.findByRole("button", { name: "yes" }));
    await userEvent.click(screen.getByRole("button", { name: "yearly" }));
    await userEvent.click(screen.getByRole("button", { name: "confirm" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esa posible suscripción ya no está pendiente.",
    );
    expect(screen.getByText("iCloud 2TB · pending · 0/1")).toBeInTheDocument();
  });

  it("dismisses and the card is dismissed", async () => {
    const subscriptions = subscriptionsWith({});
    renderProbe(subscriptions);

    await userEvent.click(await screen.findByRole("button", { name: "dismiss" }));

    expect(await screen.findByText("iCloud 2TB · dismissed · 1/1")).toBeInTheDocument();
    expect(subscriptions.decide).toHaveBeenCalledWith({ lineKey: "k-icloud", decision: "dismiss" });
  });

  it("undoes once, even when tapped twice, and the card is pending again", async () => {
    const subscriptions = subscriptionsWith({});
    renderProbe(subscriptions);
    await userEvent.click(await screen.findByRole("button", { name: "dismiss" }));
    await screen.findByText("iCloud 2TB · dismissed · 1/1");

    await userEvent.click(screen.getByRole("button", { name: "undo twice" }));

    expect(await screen.findByText("iCloud 2TB · pending · 0/1")).toBeInTheDocument();
    expect(subscriptions.undoDecision).toHaveBeenCalledTimes(1);
    expect(subscriptions.undoDecision).toHaveBeenCalledWith("k-icloud");
  });

  it("keeps the decided card instead of refetching the list", async () => {
    const readPossible = vi.fn(async () => [icloud]);
    renderProbe(subscriptionsWith({ readPossible }));

    await userEvent.click(await screen.findByRole("button", { name: "dismiss" }));
    await screen.findByText("iCloud 2TB · dismissed · 1/1");

    await waitFor(() => expect(readPossible).toHaveBeenCalledTimes(1));
  });
});
