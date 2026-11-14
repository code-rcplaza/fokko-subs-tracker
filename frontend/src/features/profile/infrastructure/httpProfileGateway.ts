import type { ApiClient } from "../../../lib/api/client";
import type { ProfileGateway } from "../application/ports";

export function createHttpProfileGateway(api: ApiClient): ProfileGateway {
  return {
    logout: async () => {
      await api.send({ method: "POST", path: "/api/auth/logout" });
    },
    exportCopy: (format) => api.getFile(`/api/export?${new URLSearchParams({ format })}`),
    deleteAccount: async () => {
      await api.send({ method: "DELETE", path: "/api/me" });
    },
  };
}
