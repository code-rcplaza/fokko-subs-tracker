import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiError } from "../../../lib/api/client";
import { gatewaysWith, renderWithGateways } from "../../../lib/gateways/renderWithGateways";
import type { Summary } from "../domain/summary";
import type { SubscriptionsGateway } from "./ports";
import { useSubscriptions } from "./useSubscriptions";

const summary: Summary = {
  subscriptions: [
    {
      lineKey: "k-netflix",
      name: "Netflix",
      alias: "",
      cadence: "monthly",
      amount: { amount: 999_000, currency: "CLP" },
      inPesos: { amount: 999_000, isApproximate: false },
      nextCharge: 1_795_000_000,
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

function SubsProbe() {
  const { subs, isLoading, error } = useSubscriptions();
  if (isLoading) {
    return <p>loading</p>;
  }
  if (error !== undefined) {
    return <p role="alert">{error}</p>;
  }
  return <p>{`${subs?.lines.map((line) => line.name).join()} · ${subs?.total.amount}`}</p>;
}

function renderProbe(readSummary: SubscriptionsGateway["readSummary"]) {
  return renderWithGateways(<SubsProbe />, {
    subscriptions: { ...gatewaysWith({}).subscriptions, readSummary },
  });
}

describe("useSubscriptions", () => {
  it("brings the lines and the monthly total", async () => {
    renderProbe(async () => summary);

    expect(await screen.findByText("Netflix · 999000")).toBeInTheDocument();
  });

  it("exposes the error", async () => {
    renderProbe(() => Promise.reject(new ApiError({ status: 500, key: "common.internal" })));

    expect(await screen.findByRole("alert")).toHaveTextContent("Algo salió mal");
  });
});
