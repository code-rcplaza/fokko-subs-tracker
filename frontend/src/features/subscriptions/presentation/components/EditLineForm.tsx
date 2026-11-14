import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Button } from "../../../../components/ui/atoms/Button";
import { Input } from "../../../../components/ui/atoms/Input";
import { FormField } from "../../../../components/ui/molecules/FormField";
import { t } from "../../../../lib/i18n/translate";
import type { EditLineField } from "../../domain/edit";

export interface EditLineFormProps {
  /** What the statement calls it: the name when the alias is empty. */
  readonly name: string;
  readonly currency: string;
  readonly fields: {
    readonly alias: UseFormRegisterReturn;
    readonly amount: UseFormRegisterReturn;
    readonly billingDay: UseFormRegisterReturn;
  };
  readonly errors: Readonly<Partial<Record<EditLineField, string>>>;
  readonly formError: string | undefined;
  readonly isSubmitting: boolean;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly cancelTo: string;
  readonly onNavigate: Navigate;
}

/** Editar of a detected line: its name for the user and the amount and day it really has. */
export function EditLineForm({
  name,
  currency,
  fields,
  errors,
  formError,
  isSubmitting,
  onSubmit,
  cancelTo,
  onNavigate,
}: EditLineFormProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6 px-6 pt-8 md:px-0 md:pt-0">
      <FormField label={t("ui.manual.name")} help={t("ui.edit.alias_help", { name })} error={errors.alias}>
        {(control) => <Input {...control} {...fields.alias} type="text" placeholder={name} />}
      </FormField>
      <FormField
        label={t("ui.edit.amount", { currency })}
        help={t("ui.manual.amount_help")}
        error={errors.amount}
      >
        {(control) => <Input {...control} {...fields.amount} type="text" inputMode="decimal" />}
      </FormField>
      <FormField
        label={t("ui.manual.billing_day")}
        help={t("ui.manual.billing_day_help")}
        error={errors.billingDay}
      >
        {(control) => <Input {...control} {...fields.billingDay} type="text" inputMode="numeric" />}
      </FormField>
      {formError !== undefined && (
        <p role="alert" className="rounded-md bg-error-surface p-4 text-sm text-danger-ink">
          {formError}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Button type="submit" loading={isSubmitting}>
          {t("ui.edit.save")}
        </Button>
        <AppLink
          to={cancelTo}
          onNavigate={onNavigate}
          className="flex min-h-[52px] items-center justify-center text-[15px] font-semibold text-primary"
        >
          {t("ui.cancel")}
        </AppLink>
      </div>
    </form>
  );
}
