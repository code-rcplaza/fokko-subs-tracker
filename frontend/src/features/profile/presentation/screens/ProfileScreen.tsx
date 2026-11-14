import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { SideNav } from "../../../../components/layout/SideNav";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { useThemePreference } from "../../../../lib/theme/useThemePreference";
import { useLogout } from "../../application/useLogout";
import { type ProfileAccount, ProfileHeader, ProfileRows } from "../components/Profile";
import { loginPath } from "../components/paths";

export interface ProfileScreenProps {
  readonly account: ProfileAccount;
}

/** Perfil: the account, Tus datos, Apariencia and Cerrar sesión. */
export function ProfileScreen({ account }: ProfileScreenProps) {
  const navigateTo = useNavigateTo();
  const theme = useThemePreference();
  const leaving = useLogout({ onLoggedOut: () => navigateTo(loginPath) });

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={<ProfileHeader account={account} onNavigate={navigateTo} />}
      nav={<BottomNav onNavigate={navigateTo} />}
      sideNav={<SideNav account={account} onNavigate={navigateTo} />}
    >
      <ProfileRows
        appearance={{ preference: theme.preference, onChoose: theme.choose }}
        onLogout={leaving.logout}
        isLeaving={leaving.isLeaving}
        onNavigate={navigateTo}
      />
    </AppShell>
  );
}
