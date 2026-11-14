import type { LineDetail } from "../domain/detail";
import type { AliasChange, OverrideChange } from "../domain/edit";
import type { ManualInput } from "../domain/manual";
import type { Decision, Possible } from "../domain/review";
import type { Summary } from "../domain/summary";

export interface ManualEdit {
  readonly publicId: string;
  readonly input: ManualInput;
}

/** What the subscriptions feature needs from the outside; tests give a double. */
export interface SubscriptionsGateway {
  readSummary(): Promise<Summary>;
  readPossible(): Promise<readonly Possible[]>;
  readLineDetail(lineKey: string): Promise<LineDetail>;
  decide(decision: Decision): Promise<void>;
  /** The line goes back to the possible ones. */
  undoDecision(lineKey: string): Promise<void>;
  /** "Dejar de seguir": the line is hidden; its charges stay. */
  stopFollowing(lineKey: string): Promise<void>;
  /** A subscription the statement does not show; answers its public id. */
  createManual(input: ManualInput): Promise<string>;
  /** An empty alias clears it. */
  nameLine(change: AliasChange): Promise<void>;
  saveOverride(change: OverrideChange): Promise<void>;
  editManual(edit: ManualEdit): Promise<void>;
  removeManual(publicId: string): Promise<void>;
  /** "Mantener": the user accepts the new price; the alert leaves the pending ones. */
  keepRise(lineKey: string): Promise<void>;
  /** The service's own site; empty when the catalog has none. */
  readCancelGuide(lineKey: string): Promise<string>;
  /** "Por cancelar": only a mark, the app cancels nothing. */
  markForCancellation(lineKey: string): Promise<void>;
}
