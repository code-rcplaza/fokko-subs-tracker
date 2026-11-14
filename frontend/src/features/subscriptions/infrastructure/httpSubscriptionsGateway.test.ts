import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "../../../lib/api/client";
import type { SubscriptionsGateway } from "../application/ports";
import { createHttpSubscriptionsGateway } from "./httpSubscriptionsGateway";

function fetchAnswering(status: number, body?: unknown) {
  return vi.fn(
    async (_input: string, _init: RequestInit) =>
      new Response(body === undefined ? null : JSON.stringify(body), { status }),
  );
}

const icloud = {
  lineKey: "k-icloud",
  name: "APPLE.COM/BILL",
  alias: "",
  amount: { amount: 990_000, currency: "CLP" },
  charges: [{ date: 1_788_000_000, amount: { amount: 990_000, currency: "CLP" } }],
};

function sentRequest(fetchFunction: ReturnType<typeof fetchAnswering>) {
  const [path, init] = fetchFunction.mock.calls[0] ?? [];
  return {
    path,
    method: init?.method,
    body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
  };
}

describe("http subscriptions gateway", () => {
  it("reads the possible ones of /api/summary", async () => {
    const fetchFunction = fetchAnswering(200, { subscriptions: [], possible: [icloud] });

    await expect(
      createHttpSubscriptionsGateway(createApiClient(fetchFunction)).readPossible(),
    ).resolves.toEqual([icloud]);
    expect(sentRequest(fetchFunction).path).toBe("/api/summary");
  });

  it("reads the whole summary with its amounts in cents", async () => {
    const pesos = (amount: number) => ({ amount, currency: "CLP" });
    const summary = {
      subscriptions: [],
      possible: [icloud],
      total: { amount: 8_406_000, currency: "CLP", isApproximate: false, isIncomplete: false },
      charged: 3,
      remaining: 5,
      rises: [],
      pendingActions: [{ kind: "possible", lineKey: "k-icloud" }],
      upcoming: [
        { lineKey: "k-netflix", name: "Netflix", alias: "", amount: pesos(999_000), date: 1_795_000_000 },
      ],
      spend: [{ name: "Netflix", amount: 999_000, percent: 100, isOthers: false }],
    };
    const fetchFunction = fetchAnswering(200, summary);

    await expect(
      createHttpSubscriptionsGateway(createApiClient(fetchFunction)).readSummary(),
    ).resolves.toEqual(summary);
    expect(sentRequest(fetchFunction).path).toBe("/api/summary");
  });

  it.each([
    {
      name: "a confirmation with its cadence",
      decision: { lineKey: "k-icloud", decision: "confirm", cadence: "yearly" },
      body: { groupKey: "k-icloud", decision: "confirm", cadence: "yearly" },
    },
    {
      name: "a dismissal without cadence",
      decision: { lineKey: "k-icloud", decision: "dismiss" },
      body: { groupKey: "k-icloud", decision: "dismiss" },
    },
  ] as const)("posts $name to /api/subscriptions/decisions", async ({ decision, body }) => {
    const fetchFunction = fetchAnswering(204);

    await createHttpSubscriptionsGateway(createApiClient(fetchFunction)).decide(decision);

    expect(sentRequest(fetchFunction)).toEqual({
      path: "/api/subscriptions/decisions",
      method: "POST",
      body,
    });
  });

  it("reads the detail of a line with the key in the query, escaped", async () => {
    const pesos = (amount: number) => ({ amount, currency: "CLP" });
    const detail = {
      lineKey: "service:Disney+||d15",
      name: "Disney+",
      alias: "",
      cadence: "monthly",
      amount: pesos(1_050_000),
      inPesos: { amount: 1_050_000, isApproximate: false },
      nextCharge: 1_797_000_000,
      bank: "bci",
      card: "credito",
      markedForCancellationAt: null,
      cycle: { day: 15, month: null },
      charges: [
        {
          date: 1_790_000_000,
          amount: pesos(1_050_000),
          inPesos: { amount: 1_050_000, isApproximate: false },
        },
      ],
      rise: null,
    };
    const fetchFunction = fetchAnswering(200, { ...detail, cardLast4: "1234" });

    await expect(
      createHttpSubscriptionsGateway(createApiClient(fetchFunction)).readLineDetail("service:Disney+||d15"),
    ).resolves.toEqual(detail);
    expect(sentRequest(fetchFunction).path).toBe(
      "/api/subscriptions/line?lineKey=service%3ADisney%2B%7C%7Cd15",
    );
  });

  it("undoes with DELETE and the key in the query, escaped", async () => {
    const fetchFunction = fetchAnswering(204);

    await createHttpSubscriptionsGateway(createApiClient(fetchFunction)).undoDecision("a b&c");

    expect(sentRequest(fetchFunction)).toEqual({
      path: "/api/subscriptions/decisions?groupKey=a+b%26c",
      method: "DELETE",
      body: undefined,
    });
  });

  it("stops following with DELETE /api/subscriptions/line and resolves empty", async () => {
    const fetchFunction = fetchAnswering(204);

    await expect(
      createHttpSubscriptionsGateway(createApiClient(fetchFunction)).stopFollowing("service:Netflix||d18"),
    ).resolves.toBeUndefined();
    expect(sentRequest(fetchFunction)).toEqual({
      path: "/api/subscriptions/line?lineKey=service%3ANetflix%7C%7Cd18",
      method: "DELETE",
      body: undefined,
    });
  });

  it("creates a manual with POST /api/subscriptions/manual and answers its id", async () => {
    const fetchFunction = fetchAnswering(201, { id: "0190a000-0000-7000-8000-000000000001" });
    const input = { name: "Gimnasio", amount: 2_500_000, currency: "CLP", billingDay: 5 } as const;

    await expect(
      createHttpSubscriptionsGateway(createApiClient(fetchFunction)).createManual(input),
    ).resolves.toBe("0190a000-0000-7000-8000-000000000001");
    expect(sentRequest(fetchFunction)).toEqual({
      path: "/api/subscriptions/manual",
      method: "POST",
      body: input,
    });
  });

  it("throws ApiError with the fields of a 400", async () => {
    const fields = { name: "subscriptions.manual_name_missing" };
    const fetchFunction = fetchAnswering(400, { error: { key: "common.invalid_request", fields } });
    const input = { name: "", amount: 1, currency: "CLP", billingDay: 5 } as const;

    const error = await createHttpSubscriptionsGateway(createApiClient(fetchFunction))
      .createManual(input)
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, fields });
  });

  it.each([
    {
      name: "an alias",
      call: (gateway: SubscriptionsGateway) => gateway.nameLine({ lineKey: "k", alias: "Familia" }),
      request: {
        path: "/api/subscriptions/aliases",
        method: "PUT",
        body: { lineKey: "k", alias: "Familia" },
      },
    },
    {
      name: "an override",
      call: (gateway: SubscriptionsGateway) =>
        gateway.saveOverride({ lineKey: "k", amount: 1_099_000, billingDay: 20 }),
      request: {
        path: "/api/subscriptions/overrides",
        method: "PUT",
        body: { lineKey: "k", amount: 1_099_000, billingDay: 20 },
      },
    },
    {
      name: "a manual edit",
      call: (gateway: SubscriptionsGateway) =>
        gateway.editManual({
          publicId: "m1",
          input: { name: "Gym", amount: 100, currency: "CLP", billingDay: 5 },
        }),
      request: {
        path: "/api/subscriptions/manual/m1",
        method: "PUT",
        body: { name: "Gym", amount: 100, currency: "CLP", billingDay: 5 },
      },
    },
    {
      name: "a kept rise",
      call: (gateway: SubscriptionsGateway) => gateway.keepRise("k"),
      request: { path: "/api/subscriptions/price-alerts/decision", method: "POST", body: { lineKey: "k" } },
    },
    {
      name: "a mark for cancellation",
      call: (gateway: SubscriptionsGateway) => gateway.markForCancellation("k"),
      request: { path: "/api/subscriptions/cancellations", method: "POST", body: { lineKey: "k" } },
    },
    {
      name: "a manual removal",
      call: (gateway: SubscriptionsGateway) => gateway.removeManual("m1"),
      request: { path: "/api/subscriptions/manual/m1", method: "DELETE", body: undefined },
    },
  ])("sends $name", async ({ call, request }) => {
    const fetchFunction = fetchAnswering(204);

    await call(createHttpSubscriptionsGateway(createApiClient(fetchFunction)));

    expect(sentRequest(fetchFunction)).toEqual(request);
  });

  it("throws ApiError with the fields of a 400 on an override", async () => {
    const fields = { amount: "subscriptions.override_amount_not_positive" };
    const fetchFunction = fetchAnswering(400, { error: { key: "common.invalid_request", fields } });

    const error = await createHttpSubscriptionsGateway(createApiClient(fetchFunction))
      .saveOverride({ lineKey: "k", amount: 0, billingDay: 5 })
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({ status: 400, fields });
  });

  it("reads the cancel link of a line", async () => {
    const fetchFunction = fetchAnswering(200, { url: "https://streaming.example/cancelar" });

    await expect(
      createHttpSubscriptionsGateway(createApiClient(fetchFunction)).readCancelGuide("k|1"),
    ).resolves.toBe("https://streaming.example/cancelar");
    expect(sentRequest(fetchFunction).path).toBe("/api/subscriptions/cancel-guide?lineKey=k%7C1");
  });
});
