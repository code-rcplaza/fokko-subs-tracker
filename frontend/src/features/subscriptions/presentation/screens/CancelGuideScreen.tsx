import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { t } from "../../../../lib/i18n/translate";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useCancelGuide } from "../../application/useCancelGuide";
import { useLineDetail } from "../../application/useLineDetail";
import { displayNameOf } from "../../domain/review";
import { CancelLink, CancellationStatus, CancelSteps, CancelZone } from "../components/CancelGuide";
import { detailPathOf } from "../components/paths";

export interface CancelGuideScreenProps {
  readonly lineKey: string;
  readonly account: { readonly name: string; readonly email: string };
}

/** Cómo cancelar: Fokko cancels nothing; it shows how and keeps the "por cancelar" mark. */
export function CancelGuideScreen({ lineKey, account }: CancelGuideScreenProps) {
  const navigateTo = useNavigateTo();
  const { detail, error } = useLineDetail(lineKey);
  const guide = useCancelGuide(lineKey);
  const name = detail === undefined ? "" : displayNameOf(detail);

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        detail === undefined ? (
          <SegmentedRing variant="loading" size={104} />
        ) : (
          <CancelZone
            name={name}
            back={{ to: detailPathOf(lineKey), label: t("ui.nav.subs") }}
            onNavigate={navigateTo}
          />
        )
      }
      nav={<BottomNav current="summary" onNavigate={navigateTo} />}
      sideNav={<SideNav current="summary" account={account} onNavigate={navigateTo} />}
    >
      {error !== undefined && (
        <p role="alert" className="mx-6 mt-8 rounded-md bg-error-surface p-4 text-sm text-danger-ink md:mx-0">
          {error}
        </p>
      )}
      {detail !== undefined && (
        <div className="flex flex-col gap-8 px-6 pt-8 md:px-0 md:pt-0">
          <CancelSteps name={name} />
          {guide.url !== undefined && <CancelLink name={name} url={guide.url} />}
          <CancellationStatus
            markedAt={detail.markedForCancellationAt}
            onMark={guide.mark}
            isMarking={guide.isMarking}
            error={guide.markError}
          />
        </div>
      )}
    </AppShell>
  );
}
