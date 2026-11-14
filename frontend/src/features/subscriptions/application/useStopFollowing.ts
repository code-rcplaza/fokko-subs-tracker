import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import { lineDetailQueryKey } from "./useLineDetail";
import { subscriptionsQueryKey } from "./useReview";

export interface StopFollowingOptions {
  readonly lineKey: string;
  readonly onStopped: () => void;
}

/** "Dejar de seguir": hides the line; the summary is read again without it. */
export function useStopFollowing({ lineKey, onStopped }: StopFollowingOptions) {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const stop = useMutation({
    mutationFn: () => subscriptions.stopFollowing(lineKey),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: lineDetailQueryKey(lineKey) });
      await queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
      onStopped();
    },
  });

  return {
    stopFollowing: () => {
      if (!stop.isPending) {
        stop.mutate();
      }
    },
    isStopping: stop.isPending,
    error: stop.isError ? serverMessageOf(stop.error) : undefined,
    resetError: stop.reset,
  };
}
