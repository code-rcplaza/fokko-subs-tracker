import { AppShell } from "../../../../components/layout/AppShell";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useThemeToggle } from "../../../../lib/theme/useThemeToggle";
import { type LegalDocument, LegalPage } from "../components/LegalPage";

/** The legal pages open without a session, like the access screens. */
export function LegalScreen({ document }: { readonly document: LegalDocument }) {
  const navigateTo = useNavigateTo();
  const theme = useThemeToggle();
  return (
    <AppShell header={<BrandHeader theme={theme} />}>
      <LegalPage document={document} onNavigate={navigateTo} />
    </AppShell>
  );
}
