import { useQuery } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";

/** Under `["subscriptions"]`, so every decision marks it stale. */
export const summaryQueryKey = ["subscriptions", "summary"] as const;

/** Resumen: the summary of the last 12 months, as the back calculates it. */
export function useSummary() {
  const { subscriptions } = useGateways();
  const summary = useQuery({ queryKey: summaryQueryKey, queryFn: () => subscriptions.readSummary() });

  return {
    summary: summary.data,
    isLoading: summary.isPending,
    error: summary.isError ? serverMessageOf(summary.error) : undefined,
  };
}
