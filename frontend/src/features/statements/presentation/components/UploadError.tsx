import { StepIndicator } from "../../../../components/layout/StepIndicator";
import { Button } from "../../../../components/ui/atoms/Button";
import { SegmentedRing } from "../../../../components/ui/organisms/SegmentedRing";
import { type MessageKey, t } from "../../../../lib/i18n/translate";
import type { FailureKind } from "../../domain/uploadFailure";

const titleByKind: Readonly<Record<FailureKind, MessageKey>> = {
  unreadable: "ui.upload_error.title_unreadable",
  bank: "ui.upload_error.title_bank",
  imported: "ui.upload_error.title_imported",
  file: "ui.upload_error.title_unreadable",
};

export interface UploadErrorProps {
  readonly kind: FailureKind;
  /** Translated from the key; it never quotes the user's file. */
  readonly message: string;
}

/** Error, top: still step 2 of 3, an empty ring, why it failed. */
export function UploadErrorZone({ kind, message }: UploadErrorProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <StepIndicator step={2} total={3} name={t("ui.analysis.step")} />
      <div className="flex items-center gap-4">
        <SegmentedRing variant="empty" label={t("ui.access_ring")} size={104} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
            {t(titleByKind[kind])}
          </h1>
          <p className="text-sm text-hero-ink-secondary">{message}</p>
        </div>
      </div>
    </div>
  );
}

/** Error, sheet: the one way out and the reassurance that nothing was kept. */
export function UploadErrorActions({
  kind,
  onTryAgain,
}: {
  readonly kind: FailureKind;
  readonly onTryAgain: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-6 pt-8 md:px-0 md:pt-0">
      <Button onClick={onTryAgain}>
        {kind === "bank" ? t("ui.upload_error.choose_bank") : t("ui.upload_error.choose_file")}
      </Button>
      <p className="text-center text-[13px] text-ink-muted">{t("ui.upload_error.not_kept")}</p>
    </div>
  );
}
