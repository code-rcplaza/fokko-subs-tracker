import { useQuery } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import type { Summary } from "../domain/summary";
import { summaryQueryKey } from "./useSummary";

function subsOf(summary: Summary) {
  return { lines: summary.subscriptions, total: summary.total, hasPossible: summary.possible.length > 0 };
}

/** Subs: the lines of the same summary Resumen reads, so both share one request and one cache. */
export function useSubscriptions() {
  const { subscriptions } = useGateways();
  const subs = useQuery({
    queryKey: summaryQueryKey,
    queryFn: () => subscriptions.readSummary(),
    select: subsOf,
  });

  return {
    subs: subs.data,
    isLoading: subs.isPending,
    error: subs.isError ? serverMessageOf(subs.error) : undefined,
  };
}
