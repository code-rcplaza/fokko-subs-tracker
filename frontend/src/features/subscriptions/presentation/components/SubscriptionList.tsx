import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Badge } from "../../../../components/ui/atoms/Badge";
import { ServiceAvatar } from "../../../../components/ui/atoms/ServiceAvatar";
import { formatChargeDate, formatMoney } from "../../../../lib/format";
import { isMessageKey, t } from "../../../../lib/i18n/translate";
import { displayNameOf } from "../../domain/review";
import { isMarkedForCancellation, linesByNextCharge } from "../../domain/subs";
import type { SubscriptionLine, SummaryTotal } from "../../domain/summary";
import { amountTextOf } from "./amounts";
import { addPath, detailPathOf, sourcePath } from "./paths";

function labelOr(key: string, fallback: string): string {
  return isMessageKey(key) ? t(key) : fallback;
}

/** "BCI · crédito"; a manual line has no bank nor card, so nothing. */
export function cardTextOf(line: SubscriptionLine): string | undefined {
  if (line.bank === "") {
    return undefined;
  }
  const bank = labelOr(`ui.bank.${line.bank}`, line.bank.toLocaleUpperCase("es-CL"));
  return line.card === ""
    ? bank
    : t("ui.subs.card", { bank, card: labelOr(`ui.card.${line.card}`, line.card) });
}

function subtitleOf(line: SubscriptionLine): string {
  const parts = [line.nextCharge === null ? undefined : formatChargeDate(line.nextCharge), cardTextOf(line)];
  return parts.filter((part) => part !== undefined).join(" · ");
}

export interface SubscriptionRowProps {
  readonly line: SubscriptionLine;
  readonly onNavigate: Navigate;
}

/** One line: who, when and with what card, how much, and its marks in words. */
export function SubscriptionRow({ line, onNavigate }: SubscriptionRowProps) {
  const name = displayNameOf(line);
  return (
    <AppLink
      to={detailPathOf(line.lineKey)}
      onNavigate={onNavigate}
      className="flex min-h-11 w-full items-center gap-4 rounded-md py-3 text-left"
    >
      <ServiceAvatar name={name} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-ink">{name}</span>
          {isMarkedForCancellation(line) && <Badge kind="toCancel" />}
          {line.hasRise && <Badge kind="rise" />}
        </span>
        <span className="truncate text-sm text-ink-muted">{subtitleOf(line)}</span>
      </span>
      <span className="flex-none text-right font-semibold text-ink">{amountTextOf(line)}</span>
    </AppLink>
  );
}

const primaryLinkClasses =
  "flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[15px] font-semibold text-on-primary";
const secondaryLinkClasses =
  "flex min-h-[52px] items-center justify-center rounded-lg border-[1.5px] border-outline px-6 text-[15px] font-semibold text-outline-ink";

export interface SubsZoneProps {
  readonly count: number;
  readonly total: SummaryTotal;
  readonly onNavigate: Navigate;
}

/** Subs, top: how many and how much a month, and the way to add one by hand. */
export function SubsZone({ count, total, onNavigate }: SubsZoneProps) {
  const amount = formatMoney(total);
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-zone-ink">
          {t("ui.subs.title")}
        </h1>
        <p className="text-sm text-hero-ink-secondary">
          {t(count === 1 ? "ui.subs.count_one" : "ui.subs.count_other", { count, amount })}
        </p>
      </div>
      <AppLink
        to={addPath}
        onNavigate={onNavigate}
        className="inline-flex min-h-11 flex-none items-center rounded-full bg-hero-chip px-4 text-sm font-semibold text-zone-ink"
      >
        {t("ui.add")}
      </AppLink>
    </div>
  );
}

export interface SubscriptionListProps {
  readonly lines: readonly SubscriptionLine[];
  readonly onNavigate: Navigate;
}

/** No lines yet: upload a statement or add one by hand. */
function SubsEmpty({ onNavigate }: { readonly onNavigate: Navigate }) {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-ink">{t("ui.subs.empty_title")}</h2>
      <p className="text-ink-secondary">{t("ui.subs.empty_text")}</p>
      <div className="flex w-full flex-col gap-2">
        <AppLink to={sourcePath} onNavigate={onNavigate} className={primaryLinkClasses}>
          {t("ui.upload_statement")}
        </AppLink>
        <AppLink to={addPath} onNavigate={onNavigate} className={secondaryLinkClasses}>
          {t("ui.add")}
        </AppLink>
      </div>
    </section>
  );
}

/** Subs, sheet: every line, soonest charge first. */
export function SubscriptionList({ lines, onNavigate }: SubscriptionListProps) {
  if (lines.length === 0) {
    return (
      <div className="px-6 pt-8 md:px-0 md:pt-0">
        <SubsEmpty onNavigate={onNavigate} />
      </div>
    );
  }
  return (
    <ul aria-label={t("ui.subs.list")} className="flex flex-col px-6 pt-4 md:px-0 md:pt-0">
      {linesByNextCharge(lines).map((line) => (
        <li key={line.lineKey} className="border-b border-border last:border-b-0">
          <SubscriptionRow line={line} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );
}
