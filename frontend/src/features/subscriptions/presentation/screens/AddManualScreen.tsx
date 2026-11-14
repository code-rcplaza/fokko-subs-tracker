import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { sectionPaths } from "../../../../components/layout/navigation";
import { SideNav } from "../../../../components/layout/SideNav";
import { t } from "../../../../lib/i18n/translate";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useAddManual } from "../../application/useManualForm";
import { FormZone, ManualSubscriptionForm } from "../components/ManualSubscriptionForm";

export interface AddManualScreenProps {
  readonly account: { readonly name: string; readonly email: string };
}

/** Agregar: a subscription the statement does not show; back to Subs once added. */
export function AddManualScreen({ account }: AddManualScreenProps) {
  const navigateTo = useNavigateTo();
  const manual = useAddManual({ onAdded: () => navigateTo(sectionPaths.subs) });

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        <FormZone
          title={t("ui.manual.title")}
          subtitle={t("ui.manual.subtitle")}
          back={{ to: sectionPaths.subs, label: t("ui.nav.subs") }}
          onNavigate={navigateTo}
        />
      }
      nav={<BottomNav current="subs" onNavigate={navigateTo} />}
      sideNav={<SideNav current="subs" account={account} onNavigate={navigateTo} />}
    >
      <ManualSubscriptionForm
        fields={manual.fields}
        currency={manual.currency}
        errors={manual.errors}
        formError={manual.formError}
        isSubmitting={manual.isSubmitting}
        onSubmit={manual.submit}
        onNavigate={navigateTo}
        submitLabel={t("ui.add")}
        cancelTo={sectionPaths.subs}
      />
    </AppShell>
  );
}
