import { z } from "zod";
import { moneySchema } from "./money";

/** The same cadences as the back (`subscriptions/domain.Cadence`). */
export const cadences = ["monthly", "yearly"] as const;
export type Cadence = (typeof cadences)[number];

/** A possible subscription of `GET /api/summary`: no cadence yet, the user gives it. */
export const possibleSchema = z.object({
  lineKey: z.string(),
  name: z.string(),
  alias: z.string(),
  amount: moneySchema,
  charges: z.array(z.object({ date: z.number(), amount: moneySchema })),
});

export type Possible = Readonly<z.infer<typeof possibleSchema>>;
export type SeenCharge = Possible["charges"][number];

/** Revisión reads only the possible ones of the summary. */
export const possibleListSchema = z
  .object({ possible: z.array(possibleSchema) })
  .transform((summary) => summary.possible);

/** What `POST /api/subscriptions/decisions` takes. */
export type Decision =
  | { readonly lineKey: string; readonly decision: "confirm"; readonly cadence: Cadence }
  | { readonly lineKey: string; readonly decision: "dismiss" };

/** A card of Revisión: undecided, choosing the cadence after "Sí", or resolved. */
export type CardState =
  | { readonly kind: "pending" }
  | { readonly kind: "choosing"; readonly cadence: Cadence | undefined }
  | { readonly kind: "added"; readonly cadence: Cadence }
  | { readonly kind: "dismissed" };

export type CardStates = Readonly<Record<string, CardState>>;

export interface ReviewProgress {
  readonly resolved: number;
  readonly total: number;
}

/** A card as Revisión draws it: the line, what was decided and whether it is on its way. */
export interface ReviewCardView {
  readonly possible: Possible;
  readonly state: CardState;
  readonly isSending: boolean;
  readonly error: string | undefined;
}

export interface CadenceChoice {
  readonly lineKey: string;
  readonly cadence: Cadence;
}

export const pendingCard: CardState = { kind: "pending" };

export interface NamedLine {
  readonly name: string;
  readonly alias: string;
}

/** The name the user gave, or the one the back read. */
export function displayNameOf(line: NamedLine): string {
  return line.alias.trim() === "" ? line.name : line.alias;
}

const dayFormat = new Intl.DateTimeFormat("es-CL", { day: "numeric", timeZone: "America/Santiago" });

/** The day of the month of the last charge, as the UI reads dates (Santiago). */
export function billingDayOf(charges: readonly SeenCharge[]): number | undefined {
  const last = charges[charges.length - 1];
  return last === undefined ? undefined : Number(dayFormat.format(new Date(last.date * 1000)));
}

export function cardStateOf(states: CardStates, lineKey: string): CardState {
  return states[lineKey] ?? pendingCard;
}

/** Only a "Sí" with its cadence chosen can be sent. */
export function decisionOf(lineKey: string, state: CardState): Decision | undefined {
  if (state.kind !== "choosing" || state.cadence === undefined) {
    return undefined;
  }
  return { lineKey, decision: "confirm", cadence: state.cadence };
}

/** How the card looks once the back took the decision. */
export function resolvedStateOf(decision: Decision): CardState {
  if (decision.decision === "dismiss") {
    return { kind: "dismissed" };
  }
  return { kind: "added", cadence: decision.cadence };
}

export function isResolved(state: CardState): boolean {
  return state.kind === "added" || state.kind === "dismissed";
}

export function progressOf(lineKeys: readonly string[], states: CardStates): ReviewProgress {
  const resolved = lineKeys.filter((lineKey) => isResolved(cardStateOf(states, lineKey))).length;
  return { resolved, total: lineKeys.length };
}
