import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";

export interface UseLogoutOptions {
  readonly onLoggedOut: () => void;
}

/**
 * "Cerrar sesión" from Perfil: whatever the server says, nothing of the
 * account stays in the cache. A copy of auth's: features do not import each other.
 */
export function useLogout({ onLoggedOut }: UseLogoutOptions) {
  const { profile } = useGateways();
  const queryClient = useQueryClient();
  const leaving = useMutation({
    mutationFn: () => profile.logout(),
    onSettled: () => {
      queryClient.removeQueries();
      onLoggedOut();
    },
  });

  return {
    logout: () => {
      if (!leaving.isPending) {
        leaving.mutate();
      }
    },
    isLeaving: leaving.isPending,
  };
}
