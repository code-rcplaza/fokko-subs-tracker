import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useSummary } from "../../application/useSummary";
import { firstNameOf } from "../../domain/summary";
import { SummaryContent, SummaryZone } from "../components/SummaryView";

export interface SummaryScreenProps {
  readonly account: { readonly name: string; readonly email: string };
}

/** Resumen: the main screen, what the month costs and what is left to do. */
export function SummaryScreen({ account }: SummaryScreenProps) {
  const navigateTo = useNavigateTo();
  const { summary, error } = useSummary();

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        summary === undefined ? (
          <SegmentedRing variant="loading" size={224} />
        ) : (
          <SummaryZone summary={summary} firstName={firstNameOf(account.name)} />
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
      {summary !== undefined && <SummaryContent summary={summary} onNavigate={navigateTo} />}
    </AppShell>
  );
}
