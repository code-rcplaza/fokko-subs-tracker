import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiError } from "../../../lib/api/client";
import { gatewaysWith, renderWithGateways } from "../../../lib/gateways/renderWithGateways";
import type { LineDetail } from "../domain/detail";
import type { SubscriptionsGateway } from "./ports";
import { useLineDetail } from "./useLineDetail";

const detail: LineDetail = {
  lineKey: "k-disney",
  name: "Disney+",
  alias: "",
  cadence: "monthly",
  amount: { amount: 1_050_000, currency: "CLP" },
  inPesos: { amount: 1_050_000, isApproximate: false },
  nextCharge: null,
  bank: "bci",
  card: "credito",
  markedForCancellationAt: null,
  cycle: { day: 15, month: null },
  charges: [],
  rise: null,
};

function DetailProbe() {
  const { detail: shown, isLoading, error } = useLineDetail("k-disney");
  if (isLoading) {
    return <p>loading</p>;
  }
  if (error !== undefined) {
    return <p role="alert">{error}</p>;
  }
  return <p>{`${shown?.name} · ${shown?.cycle.day}`}</p>;
}

function renderProbe(readLineDetail: SubscriptionsGateway["readLineDetail"]) {
  return renderWithGateways(<DetailProbe />, {
    subscriptions: { ...gatewaysWith({}).subscriptions, readLineDetail },
  });
}

describe("useLineDetail", () => {
  it("brings the detail of the line it was asked for", async () => {
    renderProbe(async (lineKey) => ({ ...detail, lineKey }));

    expect(await screen.findByText("Disney+ · 15")).toBeInTheDocument();
  });

  it("exposes a 404", async () => {
    renderProbe(() => Promise.reject(new ApiError({ status: 404, key: "subscriptions.line_not_found" })));

    expect(await screen.findByRole("alert")).toHaveTextContent("No encontramos esa suscripción.");
  });
});
