import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { Skeleton } from "../../../../components/ui/atoms/Skeleton";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useSubscriptions } from "../../application/useSubscriptions";
import { SubscriptionList, SubsZone } from "../components/SubscriptionList";

export interface SubsScreenProps {
  readonly account: { readonly name: string; readonly email: string };
}

/** Subs: every subscription the user has, with its next charge and marks. */
export function SubsScreen({ account }: SubsScreenProps) {
  const navigateTo = useNavigateTo();
  const { subs, error } = useSubscriptions();

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        subs === undefined ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <SubsZone count={subs.lines.length} total={subs.total} onNavigate={navigateTo} />
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
      {subs !== undefined && <SubscriptionList lines={subs.lines} onNavigate={navigateTo} />}
    </AppShell>
  );
}
