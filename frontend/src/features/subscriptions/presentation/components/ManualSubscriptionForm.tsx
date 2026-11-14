import type { FormEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { BackLink } from "../../../../components/layout/BackLink";
import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Button } from "../../../../components/ui/atoms/Button";
import { Input } from "../../../../components/ui/atoms/Input";
import { FormField } from "../../../../components/ui/molecules/FormField";
import { SegmentedControl } from "../../../../components/ui/molecules/SegmentedControl";
import { t } from "../../../../lib/i18n/translate";
import { type ManualCurrency, type ManualField, manualCurrencies } from "../../domain/manual";

const currencyOptions = manualCurrencies.map((currency) => ({ value: currency, label: currency }));

function isManualCurrency(value: string): value is ManualCurrency {
  return manualCurrencies.some((currency) => currency === value);
}

export interface FormZoneProps {
  readonly title: string;
  readonly subtitle: string;
  readonly back: { readonly to: string; readonly label: string };
  readonly onNavigate: Navigate;
}

/** Agregar and Editar, top: where it goes back to and what the form is for. */
export function FormZone({ title, subtitle, back, onNavigate }: FormZoneProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <BackLink to={back.to} label={back.label} onNavigate={onNavigate} />
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">{title}</h1>
        <p className="text-sm text-hero-ink-secondary">{subtitle}</p>
      </div>
    </div>
  );
}

export interface ManualSubscriptionFormProps {
  readonly fields: {
    readonly name: UseFormRegisterReturn;
    readonly amount: UseFormRegisterReturn;
    readonly billingDay: UseFormRegisterReturn;
  };
  readonly currency: { readonly value: ManualCurrency; readonly choose: (currency: ManualCurrency) => void };
  /** Already translated, one per field. */
  readonly errors: Readonly<Partial<Record<ManualField, string>>>;
  readonly formError: string | undefined;
  readonly isSubmitting: boolean;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly onNavigate: Navigate;
  /** "Agregar" or "Guardar". */
  readonly submitLabel: string;
  /** Where "Cancelar" goes. */
  readonly cancelTo: string;
  /** Only when editing: quitar the manual line. */
  readonly onRemove?: (() => void) | undefined;
}

/** A subscription by hand: name, currency, monthly amount and billing day. */
export function ManualSubscriptionForm({
  fields,
  currency,
  errors,
  formError,
  isSubmitting,
  onSubmit,
  onNavigate,
  submitLabel,
  cancelTo,
  onRemove,
}: ManualSubscriptionFormProps) {
  const chooseCurrency = (value: string) => {
    if (isManualCurrency(value)) {
      currency.choose(value);
    }
  };
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6 px-6 pt-8 md:px-0 md:pt-0">
      <FormField label={t("ui.manual.name")} error={errors.name}>
        {(control) => (
          <Input {...control} {...fields.name} type="text" placeholder={t("ui.manual.name_placeholder")} />
        )}
      </FormField>
      <div className="flex flex-col gap-2">
        <SegmentedControl
          label={t("ui.manual.currency")}
          options={currencyOptions}
          value={currency.value}
          onChange={chooseCurrency}
        />
        {errors.currency !== undefined && (
          <p role="alert" className="text-sm text-danger-ink">
            {errors.currency}
          </p>
        )}
      </div>
      <FormField label={t("ui.manual.amount")} help={t("ui.manual.amount_help")} error={errors.amount}>
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
          {submitLabel}
        </Button>
        {onRemove !== undefined && (
          <Button variant="text" onClick={onRemove} className="text-danger-ink">
            {t("ui.edit.remove")}
          </Button>
        )}
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
