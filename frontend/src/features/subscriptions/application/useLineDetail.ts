import { useQuery } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";

/** Under `["subscriptions"]`, so a change to the line marks it stale. */
export function lineDetailQueryKey(lineKey: string) {
  return ["subscriptions", "line", lineKey] as const;
}

/** Detalle: one subscription with its cycle, last charges and rise. */
export function useLineDetail(lineKey: string) {
  const { subscriptions } = useGateways();
  const detail = useQuery({
    queryKey: lineDetailQueryKey(lineKey),
    queryFn: () => subscriptions.readLineDetail(lineKey),
  });

  return {
    detail: detail.data,
    isLoading: detail.isPending,
    error: detail.isError ? serverMessageOf(detail.error) : undefined,
  };
}
