import { AppLink, type Navigate } from "../../../../components/ui/atoms/AppLink";
import { Button } from "../../../../components/ui/atoms/Button";
import { ServiceAvatar } from "../../../../components/ui/atoms/ServiceAvatar";
import { SegmentedControl } from "../../../../components/ui/molecules/SegmentedControl";
import { classNames } from "../../../../lib/classNames";
import { formatMoney } from "../../../../lib/format";
import { t } from "../../../../lib/i18n/translate";
import {
  billingDayOf,
  type Cadence,
  type CadenceChoice,
  type CardState,
  cadences,
  displayNameOf,
  type Possible,
  type ReviewCardView,
} from "../../domain/review";
import { editPathOf } from "./paths";

/** What a card can ask for; every action names its line. */
export interface ReviewCardActions {
  readonly onYes: (lineKey: string) => void;
  readonly onChooseCadence: (choice: CadenceChoice) => void;
  readonly onCancel: (lineKey: string) => void;
  readonly onConfirm: (lineKey: string) => void;
  readonly onDismiss: (lineKey: string) => void;
  readonly onUndo: (lineKey: string) => void;
}

export interface ReviewCardProps {
  readonly card: ReviewCardView;
  readonly actions: ReviewCardActions;
}

export interface ReviewCardWithLinkProps extends ReviewCardProps {
  readonly onNavigate: Navigate;
}

const cadenceLabels = { monthly: "ui.review.monthly", yearly: "ui.review.yearly" } as const;
const addedLabels = { monthly: "ui.review.added_monthly", yearly: "ui.review.added_yearly" } as const;
const cadenceOptions = cadences.map((cadence) => ({ value: cadence, label: t(cadenceLabels[cadence]) }));

function isCadence(value: string): value is Cadence {
  return cadences.some((cadence) => cadence === value);
}

/** The descriptor as the statement wrote it, the day and how many times: why we think so. */
export function evidenceOf(possible: Possible): string {
  const day = billingDayOf(possible.charges);
  const params = { name: possible.name, count: possible.charges.length };
  return day === undefined
    ? t("ui.review.evidence_without_day", params)
    : t("ui.review.evidence", { ...params, day });
}

/** The look of each state: a resolved card steps back, an added one shows it in green. */
const stateClasses: Readonly<Record<CardState["kind"], string>> = {
  pending: "",
  choosing: "",
  added: "border-l-4 border-success pl-4",
  dismissed: "opacity-70",
};

function PendingActions({ card, actions }: ReviewCardProps) {
  const { lineKey } = card.possible;
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => actions.onYes(lineKey)} disabled={card.isSending}>
        {t("ui.review.yes")}
      </Button>
      <Button variant="secondary" onClick={() => actions.onDismiss(lineKey)} loading={card.isSending}>
        {t("ui.review.no")}
      </Button>
    </div>
  );
}

function CadenceActions({
  card,
  actions,
  cadence,
}: ReviewCardProps & { readonly cadence: Cadence | undefined }) {
  const { lineKey } = card.possible;
  const choose = (value: string) => {
    if (isCadence(value)) {
      actions.onChooseCadence({ lineKey, cadence: value });
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label={t("ui.review.cadence")}
        options={cadenceOptions}
        value={cadence ?? ""}
        onChange={choose}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => actions.onConfirm(lineKey)}
          disabled={cadence === undefined}
          loading={card.isSending}
        >
          {t("ui.add")}
        </Button>
        <Button variant="text" onClick={() => actions.onCancel(lineKey)} disabled={card.isSending}>
          {t("ui.cancel")}
        </Button>
      </div>
    </div>
  );
}

function ResolvedActions({ card, actions, result }: ReviewCardProps & { readonly result: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-ink">{result}</p>
      <Button variant="text" onClick={() => actions.onUndo(card.possible.lineKey)} loading={card.isSending}>
        {t("ui.review.undo")}
      </Button>
    </div>
  );
}

function CardActions({ card, actions }: ReviewCardProps) {
  const { state } = card;
  switch (state.kind) {
    case "pending":
      return <PendingActions card={card} actions={actions} />;
    case "choosing":
      return <CadenceActions card={card} actions={actions} cadence={state.cadence} />;
    case "added":
      return <ResolvedActions card={card} actions={actions} result={t(addedLabels[state.cadence])} />;
    case "dismissed":
      return <ResolvedActions card={card} actions={actions} result={t("ui.review.dismissed")} />;
  }
}

/** One possible subscription: who charged, how much, the evidence and the decision. */
export function ReviewCard({ card, actions, onNavigate }: ReviewCardWithLinkProps) {
  const name = displayNameOf(card.possible);
  return (
    <article
      aria-label={name}
      data-state={card.state.kind}
      className={classNames("flex flex-col gap-4 border-b border-border py-6", stateClasses[card.state.kind])}
    >
      <div className="flex items-center gap-4">
        <ServiceAvatar name={name} />
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-[17px] font-semibold text-ink">{name}</h3>
          <p className="text-sm text-ink-secondary">{formatMoney(card.possible.amount)}</p>
        </div>
      </div>
      <p className="text-sm text-ink-secondary">{evidenceOf(card.possible)}</p>
      <CardActions card={card} actions={actions} />
      {card.state.kind === "pending" && (
        <AppLink
          to={`${editPathOf(card.possible.lineKey)}?desde=revision`}
          onNavigate={onNavigate}
          className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-primary"
        >
          {t("ui.review.edit")}
        </AppLink>
      )}
      {card.error !== undefined && (
        <p role="alert" className="rounded-md bg-error-surface p-4 text-sm text-danger-ink">
          {card.error}
        </p>
      )}
    </article>
  );
}
