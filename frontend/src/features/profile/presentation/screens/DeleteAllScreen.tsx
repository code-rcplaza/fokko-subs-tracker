import { useState } from "react";
import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { ConfirmDialog } from "../../../../components/ui/molecules/ConfirmDialog";
import { t } from "../../../../lib/i18n/translate";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useDeleteAll, useExportCopy } from "../../application/useYourData";
import { DeleteAllContent, DeleteAllZone } from "../components/DeleteAll";
import { registerPath } from "../components/paths";

export interface DeleteAllScreenProps {
  readonly account: { readonly name: string; readonly email: string };
}

/** Eliminar todo: a copy first if wanted, then the account and its data go away. */
export function DeleteAllScreen({ account }: DeleteAllScreenProps) {
  const navigateTo = useNavigateTo();
  const copy = useExportCopy();
  const deletion = useDeleteAll({ onDeleted: () => navigateTo(registerPath) });
  const [isConfirming, setConfirming] = useState(false);
  const keepEverything = () => {
    deletion.resetError();
    setConfirming(false);
  };

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={<DeleteAllZone onNavigate={navigateTo} />}
      nav={<BottomNav onNavigate={navigateTo} />}
      sideNav={<SideNav account={account} onNavigate={navigateTo} />}
    >
      <DeleteAllContent
        copy={{
          format: copy.format,
          onChooseFormat: copy.chooseFormat,
          onDownload: copy.download,
          isDownloading: copy.isDownloading,
          hasFailed: copy.error !== undefined,
        }}
        onDelete={() => setConfirming(true)}
        onNavigate={navigateTo}
      />
      <ConfirmDialog
        isOpen={isConfirming}
        title={t("ui.delete_all.confirm_title")}
        text={t("ui.delete_all.confirm_text")}
        confirmLabel={t("ui.delete_all.confirm")}
        onConfirm={deletion.deleteAll}
        onCancel={keepEverything}
        isConfirming={deletion.isDeleting}
        error={deletion.error}
      />
    </AppShell>
  );
}
