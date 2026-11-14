import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import { subscriptionsQueryKey } from "./useReview";

export interface UseKeepRiseOptions {
  readonly lineKey: string;
  readonly onKept: () => void;
}

/** "Mantener": the new price is accepted and the summary is read again without the alert. */
export function useKeepRise({ lineKey, onKept }: UseKeepRiseOptions) {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const keeping = useMutation({
    mutationFn: () => subscriptions.keepRise(lineKey),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
      onKept();
    },
  });

  return {
    keep: () => {
      if (!keeping.isPending) {
        keeping.mutate();
      }
    },
    isKeeping: keeping.isPending,
    error: keeping.isError ? serverMessageOf(keeping.error) : undefined,
  };
}
