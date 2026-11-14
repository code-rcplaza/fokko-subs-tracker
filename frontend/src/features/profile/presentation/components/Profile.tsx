import { BackLink } from "../../../../components/layout/BackLink";
import { sectionPaths } from "../../../../components/layout/navigation";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Button } from "../../../../components/ui/atoms/Button";
import { ForwardIcon } from "../../../../components/ui/atoms/icons";
import { Skeleton } from "../../../../components/ui/atoms/Skeleton";
import { SegmentedControl } from "../../../../components/ui/molecules/SegmentedControl";
import { t } from "../../../../lib/i18n/translate";
import { type ThemePreference, themePreferences } from "../../../../lib/theme/theme";
import { deleteAllPath } from "./paths";

export interface ProfileAccount {
  readonly name: string;
  readonly email: string;
  readonly initials: string;
}

export interface ProfileHeaderProps {
  /** Undefined while `GET /api/me` answers. */
  readonly account: ProfileAccount | undefined;
  readonly onNavigate: Navigate;
}

/** Perfil, top: back to Resumen, and who is signed in. */
export function ProfileHeader({ account, onNavigate }: ProfileHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <BackLink to={sectionPaths.summary} label={t("ui.nav.summary")} onNavigate={onNavigate} />
      {account === undefined ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <section aria-label={t("ui.profile.account")} className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-16 flex-none items-center justify-center rounded-full bg-hero-line text-xl font-semibold text-zone-ink"
          >
            {account.initials}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[22px] font-semibold text-zone-ink">{account.name}</span>
            <span className="truncate text-sm text-hero-ink-secondary">{account.email}</span>
          </span>
        </section>
      )}
    </div>
  );
}

const preferenceLabels = {
  light: "ui.profile.light",
  dark: "ui.profile.dark",
  system: "ui.profile.system",
} as const;
const preferenceOptions = themePreferences.map((preference) => ({
  value: preference,
  label: t(preferenceLabels[preference]),
}));

function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.some((preference) => preference === value);
}

export interface AppearanceSelectorProps {
  readonly preference: ThemePreference;
  readonly onChoose: (preference: ThemePreference) => void;
}

/** Claro, Oscuro or Sistema; it lives in the browser, no endpoint. */
export function AppearanceSelector({ preference, onChoose }: AppearanceSelectorProps) {
  const choose = (value: string) => {
    if (isThemePreference(value)) {
      onChoose(value);
    }
  };
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-ink">{t("ui.profile.appearance")}</h2>
      <SegmentedControl
        label={t("ui.profile.appearance")}
        options={preferenceOptions}
        value={preference}
        onChange={choose}
      />
    </section>
  );
}

export interface ProfileRowsProps {
  readonly appearance: AppearanceSelectorProps;
  readonly onLogout: () => void;
  readonly isLeaving: boolean;
  readonly onNavigate: Navigate;
}

/** Tus datos, Apariencia and Cerrar sesión; the post-MVP rows are not offered. */
export function ProfileRows({ appearance, onLogout, isLeaving, onNavigate }: ProfileRowsProps) {
  return (
    <div className="flex flex-col gap-8 px-6 pt-8 md:px-0 md:pt-0">
      <AppLink
        to={deleteAllPath}
        onNavigate={onNavigate}
        className="flex min-h-11 items-center gap-4 border-b border-border py-3"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium text-ink">{t("ui.profile.your_data")}</span>
          <span className="text-sm text-ink-muted">{t("ui.profile.your_data_text")}</span>
        </span>
        <span className="flex-none text-ink-muted">
          <ForwardIcon />
        </span>
      </AppLink>
      <AppearanceSelector preference={appearance.preference} onChoose={appearance.onChoose} />
      <Button variant="secondary" onClick={onLogout} loading={isLeaving}>
        {t("ui.profile.logout")}
      </Button>
    </div>
  );
}
