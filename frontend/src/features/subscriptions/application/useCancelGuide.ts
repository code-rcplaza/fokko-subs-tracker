import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import { subscriptionsQueryKey } from "./useReview";

/** Cómo cancelar: the service's link, and the "por cancelar" mark. */
export function useCancelGuide(lineKey: string) {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const guide = useQuery({
    queryKey: [...subscriptionsQueryKey, "cancel-guide", lineKey],
    queryFn: () => subscriptions.readCancelGuide(lineKey),
  });
  const marking = useMutation({
    mutationFn: () => subscriptions.markForCancellation(lineKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey }),
  });

  return {
    url: guide.data,
    mark: () => {
      if (!marking.isPending) {
        marking.mutate();
      }
    },
    isMarking: marking.isPending,
    markError: marking.isError ? serverMessageOf(marking.error) : undefined,
  };
}
