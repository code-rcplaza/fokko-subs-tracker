import { useState } from "react";
import { AppShell } from "../../../../components/layout/AppShell";
import { BottomNav } from "../../../../components/layout/BottomNav";
import { BrandHeader } from "../../../../components/layout/BrandHeader";
import { sectionPaths } from "../../../../components/layout/navigation";
import { SideNav } from "../../../../components/layout/SideNav";
import type { Navigate } from "../../../../components/ui/atoms/AppLink";
import { Skeleton } from "../../../../components/ui/atoms/Skeleton";
import { ConfirmDialog } from "../../../../components/ui/molecules/ConfirmDialog";
import { t } from "../../../../lib/i18n/translate";
import { useNavigateTo } from "../../../../lib/router/useNavigateTo";
import { type EditSource, useEditableLine } from "../../application/useEditableLine";
import { useEditLine } from "../../application/useEditLine";
import { useEditManual } from "../../application/useManualForm";
import { useRemoveManual } from "../../application/useRemoveManual";
import type { LineDetail } from "../../domain/detail";
import { centsToText, type EditableLine, manualIdOf } from "../../domain/edit";
import type { ManualCurrency } from "../../domain/manual";
import { displayNameOf } from "../../domain/review";
import { EditLineForm } from "../components/EditLineForm";
import { FormZone, ManualSubscriptionForm } from "../components/ManualSubscriptionForm";
import { detailPathOf, reviewPath } from "../components/paths";

export interface EditScreenProps {
  readonly lineKey: string;
  readonly source: EditSource;
  readonly account: { readonly name: string; readonly email: string };
}

/** Where Editar goes back to: Revisión when it came from there, else the line's Detalle. */
function backOf(props: { readonly lineKey: string; readonly source: EditSource }) {
  return props.source === "review"
    ? { to: reviewPath, label: t("ui.review.step") }
    : { to: detailPathOf(props.lineKey), label: t("ui.nav.subs") };
}

function currencyOf(detail: LineDetail): ManualCurrency {
  return detail.amount.currency === "USD" ? "USD" : "CLP";
}

interface EditorProps {
  readonly line: EditableLine;
  readonly backTo: string;
  readonly onNavigate: Navigate;
}

function DetectedLineEditor({ line, backTo, onNavigate }: EditorProps) {
  const edit = useEditLine({ line, onSaved: () => onNavigate(backTo) });
  return (
    <EditLineForm
      name={line.name}
      currency={line.amount.currency}
      fields={edit.fields}
      errors={edit.errors}
      formError={edit.formError}
      isSubmitting={edit.isSubmitting}
      onSubmit={edit.submit}
      cancelTo={backTo}
      onNavigate={onNavigate}
    />
  );
}

function ManualLineEditor({
  detail,
  publicId,
  backTo,
  onNavigate,
}: Omit<EditorProps, "line"> & { readonly detail: LineDetail; readonly publicId: string }) {
  const initial = {
    name: displayNameOf(detail),
    amount: centsToText(detail.amount.amount),
    currency: currencyOf(detail),
    billingDay: String(detail.cycle.day),
  };
  const edit = useEditManual({ publicId, initial, onSaved: () => onNavigate(backTo) });
  const [isConfirmingRemove, setConfirmingRemove] = useState(false);
  const removal = useRemoveManual({ publicId, onRemoved: () => onNavigate(sectionPaths.subs) });
  const keepIt = () => {
    removal.resetError();
    setConfirmingRemove(false);
  };
  return (
    <>
      <ManualSubscriptionForm
        fields={edit.fields}
        currency={edit.currency}
        errors={edit.errors}
        formError={edit.formError}
        isSubmitting={edit.isSubmitting}
        onSubmit={edit.submit}
        onNavigate={onNavigate}
        submitLabel={t("ui.edit.save")}
        cancelTo={backTo}
        onRemove={() => setConfirmingRemove(true)}
      />
      <ConfirmDialog
        isOpen={isConfirmingRemove}
        title={t("ui.edit.remove_title", { name: displayNameOf(detail) })}
        text={t("ui.edit.remove_text")}
        confirmLabel={t("ui.edit.remove_confirm")}
        onConfirm={removal.remove}
        onCancel={keepIt}
        isConfirming={removal.isRemoving}
        error={removal.error}
      />
    </>
  );
}

/** Editar: a detected line gets an alias and its real amount and day; a manual one, its whole form. */
export function EditScreen({ lineKey, source, account }: EditScreenProps) {
  const navigateTo = useNavigateTo();
  const editable = useEditableLine({ lineKey, source });
  const back = backOf({ lineKey, source });
  const publicId = manualIdOf(lineKey);
  const notFound = editable.isMissing ? t("subscriptions.line_not_found") : undefined;
  const error = editable.error ?? notFound;

  return (
    <AppShell
      header={<BrandHeader session={{ name: account.name, onNavigate: navigateTo }} />}
      zone={
        <FormZone
          title={t("ui.edit.title")}
          subtitle={t("ui.edit.subtitle")}
          back={back}
          onNavigate={navigateTo}
        />
      }
      nav={<BottomNav current="subs" onNavigate={navigateTo} />}
      sideNav={<SideNav current="subs" account={account} onNavigate={navigateTo} />}
    >
      {error !== undefined && (
        <p role="alert" className="mx-6 mt-8 rounded-md bg-error-surface p-4 text-sm text-danger-ink md:mx-0">
          {error}
        </p>
      )}
      {editable.isLoading && <Skeleton className="mx-6 mt-8 h-40 md:mx-0" />}
      {editable.line !== undefined && publicId === undefined && (
        <DetectedLineEditor line={editable.line} backTo={back.to} onNavigate={navigateTo} />
      )}
      {editable.detail !== undefined && publicId !== undefined && (
        <ManualLineEditor
          detail={editable.detail}
          publicId={publicId}
          backTo={back.to}
          onNavigate={navigateTo}
        />
      )}
    </AppShell>
  );
}
