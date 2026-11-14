import { BackLink } from "../../../../components/layout/BackLink";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Button } from "../../../../components/ui/atoms/Button";
import { CheckIcon } from "../../../../components/ui/atoms/icons";
import { SegmentedControl } from "../../../../components/ui/molecules/SegmentedControl";
import { type MessageKey, t } from "../../../../lib/i18n/translate";
import { type CopyFormat, copyFormats } from "../../domain/copy";
import { profilePath } from "./paths";

const deletedItems: readonly MessageKey[] = [
  "ui.delete_all.what_account",
  "ui.delete_all.what_subscriptions",
  "ui.delete_all.what_statements",
];
const formatOptions = copyFormats.map((format) => ({
  value: format,
  label: format.toLocaleUpperCase("es-CL"),
}));

function isCopyFormat(value: string): value is CopyFormat {
  return copyFormats.some((format) => format === value);
}

/** Eliminar todo, top: back to Perfil and what this is. */
export function DeleteAllZone({ onNavigate }: { readonly onNavigate: Navigate }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <BackLink to={profilePath} label={t("ui.nav.profile")} onNavigate={onNavigate} />
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
          {t("ui.delete_all.title")}
        </h1>
        <p className="text-sm text-hero-ink-secondary">{t("ui.delete_all.text")}</p>
      </div>
    </div>
  );
}

export interface CopyDownloadProps {
  readonly format: CopyFormat;
  readonly onChooseFormat: (format: CopyFormat) => void;
  readonly onDownload: () => void;
  readonly isDownloading: boolean;
  readonly hasFailed: boolean;
}

/** CSV by default, JSON as the other; a failure only warns. */
export function CopyDownload({
  format,
  onChooseFormat,
  onDownload,
  isDownloading,
  hasFailed,
}: CopyDownloadProps) {
  const choose = (value: string) => {
    if (isCopyFormat(value)) {
      onChooseFormat(value);
    }
  };
  return (
    <section className="flex flex-col gap-4">
      <SegmentedControl
        label={t("ui.delete_all.format")}
        options={formatOptions}
        value={format}
        onChange={choose}
      />
      <Button variant="secondary" onClick={onDownload} loading={isDownloading}>
        {t("ui.delete_all.download")}
      </Button>
      {hasFailed && (
        <p role="alert" className="rounded-md bg-error-surface p-4 text-sm text-danger-ink">
          {t("ui.delete_all.download_failed")}
        </p>
      )}
    </section>
  );
}

export interface DeleteAllContentProps {
  readonly copy: CopyDownloadProps;
  readonly onDelete: () => void;
  readonly onNavigate: Navigate;
}

/** What goes away, the copy first, and the button that asks to confirm. */
export function DeleteAllContent({ copy, onDelete, onNavigate }: DeleteAllContentProps) {
  return (
    <div className="flex flex-col gap-8 px-6 pt-8 md:px-0 md:pt-0">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-ink">{t("ui.delete_all.what")}</h2>
        <ul aria-label={t("ui.delete_all.what")} className="flex flex-col gap-2">
          {deletedItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
              <span className="flex flex-none text-danger-ink">
                <CheckIcon size={16} />
              </span>
              {t(item)}
            </li>
          ))}
        </ul>
      </section>
      <CopyDownload {...copy} />
      <div className="flex flex-col gap-2">
        <Button variant="danger" onClick={onDelete}>
          {t("ui.delete_all.delete")}
        </Button>
        <AppLink
          to={profilePath}
          onNavigate={onNavigate}
          className="flex min-h-[52px] items-center justify-center text-[15px] font-semibold text-primary"
        >
          {t("ui.cancel")}
        </AppLink>
      </div>
    </div>
  );
}
