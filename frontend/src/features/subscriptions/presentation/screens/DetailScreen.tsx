import { useState } from "react";
import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { sectionPaths } from "../../../../components/layout/navigation";
import { SideNav } from "../../../../components/layout/SideNav";
import { ConfirmDialog } from "../../../../components/ui/molecules/ConfirmDialog";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { t } from "../../../../lib/i18n/translate";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useLineDetail } from "../../application/useLineDetail";
import { useStopFollowing } from "../../application/useStopFollowing";
import { displayNameOf } from "../../domain/review";
import { DetailContent, DetailZone } from "../components/LineDetailView";

export interface DetailScreenProps {
  readonly lineKey: string;
  readonly account: { readonly name: string; readonly email: string };
}

/** Detalle: one subscription, its cycle, its last charges and its rise. */
export function DetailScreen({ lineKey, account }: DetailScreenProps) {
  const navigateTo = useNavigateTo();
  const { detail, error } = useLineDetail(lineKey);
  const [isConfirmingStop, setConfirmingStop] = useState(false);
  const stop = useStopFollowing({ lineKey, onStopped: () => navigateTo(sectionPaths.subs) });
  const askToStop = () => setConfirmingStop(true);
  const keepFollowing = () => {
    stop.resetError();
    setConfirmingStop(false);
  };

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        detail === undefined ? (
          <SegmentedRing variant="loading" size={176} />
        ) : (
          <DetailZone detail={detail} onNavigate={navigateTo} />
        )
      }
      nav={<BottomNav current="subs" onNavigate={navigateTo} />}
      sideNav={<SideNav current="subs" account={account} onNavigate={navigateTo} />}
    >
      {error !== undefined && (
        <p role="alert" className="mx-6 mt-8 rounded-md bg-error-surface p-4 text-sm text-danger-ink md:mx-0">
          {error}
        </p>
      )}
      {detail !== undefined && (
        <>
          <DetailContent detail={detail} onNavigate={navigateTo} onStopFollowing={askToStop} />
          <ConfirmDialog
            isOpen={isConfirmingStop}
            title={t("ui.detail.stop_title", { name: displayNameOf(detail) })}
            text={t("ui.detail.stop_text")}
            confirmLabel={t("ui.detail.stop_confirm")}
            onConfirm={stop.stopFollowing}
            onCancel={keepFollowing}
            isConfirming={stop.isStopping}
            error={stop.error}
          />
        </>
      )}
    </AppShell>
  );
}
