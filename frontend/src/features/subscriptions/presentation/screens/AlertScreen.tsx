import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { sectionPaths } from "../../../../components/layout/navigation";
import { SideNav } from "../../../../components/layout/SideNav";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { t } from "../../../../lib/i18n/translate";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useKeepRise } from "../../application/useKeepRise";
import { useLineDetail } from "../../application/useLineDetail";
import { AlertDecisionActions, AlertZone, PriceAlertCard } from "../components/PriceAlert";

export interface AlertScreenProps {
  readonly lineKey: string;
  readonly account: { readonly name: string; readonly email: string };
}

/** Alerta: a subscription went up; keep it or see how to cancel it. */
export function AlertScreen({ lineKey, account }: AlertScreenProps) {
  const navigateTo = useNavigateTo();
  const { detail, error } = useLineDetail(lineKey);
  const keeping = useKeepRise({ lineKey, onKept: () => navigateTo(sectionPaths.summary) });
  const rise = detail?.rise ?? undefined;
  const noRise = detail !== undefined && rise === undefined ? t("subscriptions.rise_not_found") : undefined;
  const shownError = error ?? noRise;

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        rise === undefined ? (
          <SegmentedRing variant="loading" size={144} />
        ) : (
          <AlertZone rise={rise} onNavigate={navigateTo} />
        )
      }
      nav={<BottomNav current="summary" onNavigate={navigateTo} />}
      sideNav={<SideNav current="summary" account={account} onNavigate={navigateTo} />}
    >
      {shownError !== undefined && (
        <p role="alert" className="mx-6 mt-8 rounded-md bg-error-surface p-4 text-sm text-danger-ink md:mx-0">
          {shownError}
        </p>
      )}
      {detail !== undefined && rise !== undefined && (
        <div className="flex flex-col gap-8 px-6 pt-8 md:px-0 md:pt-0">
          <PriceAlertCard detail={detail} rise={rise} />
          <AlertDecisionActions
            detail={detail}
            onKeep={keeping.keep}
            isKeeping={keeping.isKeeping}
            error={keeping.error}
            onNavigate={navigateTo}
          />
        </div>
      )}
    </AppShell>
  );
}
