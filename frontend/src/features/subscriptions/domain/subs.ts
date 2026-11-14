import type { SubscriptionLine } from "./summary";

/** Soonest first; a line without a next charge goes last, by name. */
export function linesByNextCharge(lines: readonly SubscriptionLine[]): readonly SubscriptionLine[] {
  return [...lines].sort(
    (first, second) =>
      (first.nextCharge ?? Number.POSITIVE_INFINITY) - (second.nextCharge ?? Number.POSITIVE_INFINITY) ||
      first.name.localeCompare(second.name, "es-CL"),
  );
}

export function isMarkedForCancellation(line: SubscriptionLine): boolean {
  return line.markedForCancellationAt !== null;
}
