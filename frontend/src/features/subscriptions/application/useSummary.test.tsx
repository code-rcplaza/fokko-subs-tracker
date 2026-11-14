import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiError } from "../../../lib/api/client";
import { gatewaysWith, renderWithGateways } from "../../../lib/gateways/renderWithGateways";
import type { Summary } from "../domain/summary";
import type { SubscriptionsGateway } from "./ports";
import { useSummary } from "./useSummary";

const emptySummary: Summary = {
  subscriptions: [],
  possible: [],
  total: { amount: 8_406_000, currency: "CLP", isApproximate: false, isIncomplete: false },
  charged: 3,
  remaining: 5,
  rises: [],
  pendingActions: [],
  upcoming: [],
  spend: [],
};

function SummaryProbe() {
  const { summary, isLoading, error } = useSummary();
  if (isLoading) {
    return <p>loading</p>;
  }
  if (error !== undefined) {
    return <p role="alert">{error}</p>;
  }
  return <p>{`${summary?.total.amount} · ${summary?.charged}/${summary?.remaining}`}</p>;
}

function renderProbe(readSummary: SubscriptionsGateway["readSummary"]) {
  const subscriptions = { ...gatewaysWith({}).subscriptions, readSummary };
  return renderWithGateways(<SummaryProbe />, { subscriptions });
}

describe("useSummary", () => {
  it("brings the summary", async () => {
    renderProbe(async () => emptySummary);

    expect(await screen.findByText("8406000 · 3/5")).toBeInTheDocument();
  });

  it("exposes the error", async () => {
    renderProbe(() =>
      Promise.reject(new ApiError({ status: 400, key: "subscriptions.months_out_of_range" })),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("El período va de 1 a 24 meses.");
  });

  it("is loading until it answers", () => {
    renderProbe(() => new Promise(() => {}));

    expect(screen.getByText("loading")).toBeInTheDocument();
  });
});
