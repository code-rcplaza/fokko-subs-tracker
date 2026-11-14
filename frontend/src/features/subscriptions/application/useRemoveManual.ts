import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import { subscriptionsQueryKey } from "./useReview";

export interface UseRemoveManualOptions {
  readonly publicId: string;
  readonly onRemoved: () => void;
}

/** Quitar a manual line; the summary is read again without it. */
export function useRemoveManual({ publicId, onRemoved }: UseRemoveManualOptions) {
  const { subscriptions } = useGateways();
  const queryClient = useQueryClient();
  const removing = useMutation({
    mutationFn: () => subscriptions.removeManual(publicId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: [...subscriptionsQueryKey, "line"] });
      await queryClient.invalidateQueries({ queryKey: subscriptionsQueryKey });
      onRemoved();
    },
  });

  return {
    remove: () => {
      if (!removing.isPending) {
        removing.mutate();
      }
    },
    isRemoving: removing.isPending,
    error: removing.isError ? serverMessageOf(removing.error) : undefined,
    resetError: removing.reset,
  };
}
