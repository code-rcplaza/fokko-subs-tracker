import type { ReactNode } from "react";
import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useBanks } from "../../application/useBanks";
import { useUploadStatement } from "../../application/useUploadStatement";
import { SourceZone } from "../components/SourceZone";
import { UploadErrorActions, UploadErrorZone } from "../components/UploadError";
import { UploadForm } from "../components/UploadForm";
import { UploadLoadingContent, UploadLoadingZone } from "../components/UploadLoading";

export interface UploadScreenProps {
  /** The signed-in person, from the route guard. */
  readonly account: { readonly name: string; readonly email: string };
}

type Upload = ReturnType<typeof useUploadStatement>;

interface Stage {
  readonly zone: ReactNode;
  readonly content: ReactNode;
}

/** Elegir fuente has three faces: the form, Cargando while it sends and Error when it failed. */
function stageOf(upload: Upload, form: Stage): Stage {
  if (upload.isUploading) {
    return { zone: <UploadLoadingZone />, content: <UploadLoadingContent /> };
  }
  if (upload.failure !== undefined) {
    return {
      zone: <UploadErrorZone kind={upload.failure.kind} message={upload.failure.message} />,
      content: <UploadErrorActions kind={upload.failure.kind} onTryAgain={upload.tryAgain} />,
    };
  }
  return form;
}

/** Elegir fuente: in the MVP, only uploading a statement. */
export function UploadScreen({ account }: UploadScreenProps) {
  const navigateTo = useNavigateTo();
  const banks = useBanks();
  const upload = useUploadStatement({ onUploaded: (result) => navigateTo(`/analisis/${result.id}`) });
  const stage = stageOf(upload, {
    zone: <SourceZone onNavigate={navigateTo} />,
    content: (
      <UploadForm
        file={upload.file}
        fileError={upload.fileError}
        onPick={upload.pick}
        banks={banks}
        bank={upload.bank}
        onChooseBank={upload.chooseBank}
        needsBillingDate={upload.needsBillingDate}
        billingDate={upload.billingDateText}
        onWriteBillingDate={upload.writeBillingDate}
        error={upload.error}
        canUpload={upload.canUpload}
        isUploading={upload.isUploading}
        onUpload={upload.upload}
      />
    ),
  });

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={stage.zone}
      nav={<BottomNav onNavigate={navigateTo} />}
      sideNav={<SideNav account={account} onNavigate={navigateTo} />}
    >
      {stage.content}
    </AppShell>
  );
}
