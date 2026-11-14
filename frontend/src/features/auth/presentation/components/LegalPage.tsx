import { BackLink } from "../../../../components/layout/BackLink";
import type { Navigate } from "../../../../components/ui/atoms/AppLink";
import { t } from "../../../../lib/i18n/translate";
import { loginPath } from "./RegisterForm";

export type LegalDocument = "terms" | "privacy";

const titles = { terms: "ui.legal.terms_title", privacy: "ui.legal.privacy_title" } as const;

export interface LegalPageProps {
  readonly document: LegalDocument;
  readonly onNavigate: Navigate;
}

/** Términos or Privacidad; the approved texts are on their way, so it says so (FOKKO-0113A-SUBS). */
export function LegalPage({ document, onNavigate }: LegalPageProps) {
  return (
    <div className="flex flex-col gap-6 px-6 pt-8 md:px-0 md:pt-0">
      <BackLink to={loginPath} label={t("ui.legal.back")} onNavigate={onNavigate} />
      <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em] text-ink">
        {t(titles[document])}
      </h1>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-ink">{t("ui.legal.soon")}</h2>
        <p className="text-ink-secondary">{t("ui.legal.soon_text")}</p>
      </section>
    </div>
  );
}
