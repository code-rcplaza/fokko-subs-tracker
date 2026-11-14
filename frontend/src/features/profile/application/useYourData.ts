import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { serverMessageOf } from "../../../lib/api/serverErrors";
import { saveFile } from "../../../lib/files/saveFile";
import { useGateways } from "../../../lib/gateways/GatewaysProvider";
import type { CopyFormat } from "../domain/copy";

/** "Descargar copia primero": the browser saves it; a failure warns and blocks nothing. */
export function useExportCopy() {
  const { profile } = useGateways();
  const [format, setFormat] = useState<CopyFormat>("csv");
  const exporting = useMutation({
    mutationFn: (chosen: CopyFormat) => profile.exportCopy(chosen),
    onSuccess: saveFile,
  });

  return {
    format,
    chooseFormat: setFormat,
    download: () => {
      if (!exporting.isPending) {
        exporting.mutate(format);
      }
    },
    isDownloading: exporting.isPending,
    error: exporting.isError ? serverMessageOf(exporting.error) : undefined,
  };
}

export interface UseDeleteAllOptions {
  readonly onDeleted: () => void;
}

/** "Eliminar todo": `DELETE /api/me`; once gone, nothing of the account stays in the cache. */
export function useDeleteAll({ onDeleted }: UseDeleteAllOptions) {
  const { profile } = useGateways();
  const queryClient = useQueryClient();
  const deleting = useMutation({
    mutationFn: () => profile.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      onDeleted();
    },
  });

  return {
    deleteAll: () => {
      if (!deleting.isPending) {
        deleting.mutate();
      }
    },
    isDeleting: deleting.isPending,
    error: deleting.isError ? serverMessageOf(deleting.error) : undefined,
    resetError: deleting.reset,
  };
}
