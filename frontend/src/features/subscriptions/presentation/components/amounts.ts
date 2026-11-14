import { formatMoney } from "../../../../lib/format";
import { t } from "../../../../lib/i18n/translate";
import type { Money } from "../../domain/money";

const pesosCurrency = "CLP";
const foreignNumber = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 });

/** An amount with what it is in pesos, as lines and charges carry it. */
export interface AmountWithPesos {
  readonly amount: Money;
  readonly inPesos: { readonly amount: number } | null;
}

/** Pesos as "$9.990"; dollars as "USD 20 · ≈ $19.000", or only "USD 20" without an exchange rate. */
export function amountTextOf(charged: AmountWithPesos): string {
  if (charged.amount.currency === pesosCurrency) {
    return formatMoney(charged.amount);
  }
  const foreign = {
    currency: charged.amount.currency,
    amount: foreignNumber.format(charged.amount.amount / 100),
  };
  if (charged.inPesos === null) {
    return t("ui.subs.foreign", foreign);
  }
  const pesos = formatMoney({ amount: charged.inPesos.amount, currency: pesosCurrency });
  return t("ui.subs.foreign_in_pesos", { ...foreign, pesos });
}
