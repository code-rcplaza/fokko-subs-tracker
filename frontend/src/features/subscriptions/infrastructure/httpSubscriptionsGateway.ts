import { z } from "zod";
import type { ApiClient } from "../../../lib/api/client";
import type { SubscriptionsGateway } from "../application/ports";
import { lineDetailSchema } from "../domain/detail";
import { type Decision, possibleListSchema } from "../domain/review";
import { summarySchema } from "../domain/summary";

const decisionsPath = "/api/subscriptions/decisions";
const summaryPath = "/api/summary";
const createdSchema = z.object({ id: z.string() });
const cancelGuideSchema = z.object({ url: z.string() });

function manualPathOf(publicId: string): string {
  return `/api/subscriptions/manual/${encodeURIComponent(publicId)}`;
}

/** The back names the line `groupKey` here; dismissing carries no cadence. */
function decisionBodyOf(decision: Decision) {
  if (decision.decision === "dismiss") {
    return { groupKey: decision.lineKey, decision: decision.decision };
  }
  return { groupKey: decision.lineKey, decision: decision.decision, cadence: decision.cadence };
}

export function createHttpSubscriptionsGateway(api: ApiClient): SubscriptionsGateway {
  return {
    readSummary: async () => summarySchema.parse(await api.get(summaryPath)),
    readPossible: async () => possibleListSchema.parse(await api.get(summaryPath)),
    readLineDetail: async (lineKey) => {
      const query = new URLSearchParams({ lineKey });
      return lineDetailSchema.parse(await api.get(`/api/subscriptions/line?${query}`));
    },
    decide: async (decision) => {
      await api.send({ method: "POST", path: decisionsPath, body: decisionBodyOf(decision) });
    },
    undoDecision: async (lineKey) => {
      const query = new URLSearchParams({ groupKey: lineKey });
      await api.send({ method: "DELETE", path: `${decisionsPath}?${query}` });
    },
    createManual: async (input) => {
      const created = await api.send({ method: "POST", path: "/api/subscriptions/manual", body: input });
      return createdSchema.parse(created).id;
    },
    nameLine: async (change) => {
      await api.send({ method: "PUT", path: "/api/subscriptions/aliases", body: change });
    },
    saveOverride: async (change) => {
      await api.send({ method: "PUT", path: "/api/subscriptions/overrides", body: change });
    },
    editManual: async ({ publicId, input }) => {
      await api.send({ method: "PUT", path: manualPathOf(publicId), body: input });
    },
    removeManual: async (publicId) => {
      await api.send({ method: "DELETE", path: manualPathOf(publicId) });
    },
    keepRise: async (lineKey) => {
      await api.send({ method: "POST", path: "/api/subscriptions/price-alerts/decision", body: { lineKey } });
    },
    readCancelGuide: async (lineKey) => {
      const query = new URLSearchParams({ lineKey });
      return cancelGuideSchema.parse(await api.get(`/api/subscriptions/cancel-guide?${query}`)).url;
    },
    markForCancellation: async (lineKey) => {
      await api.send({ method: "POST", path: "/api/subscriptions/cancellations", body: { lineKey } });
    },
    stopFollowing: async (lineKey) => {
      const query = new URLSearchParams({ lineKey });
      await api.send({ method: "DELETE", path: `/api/subscriptions/line?${query}` });
    },
  };
}
