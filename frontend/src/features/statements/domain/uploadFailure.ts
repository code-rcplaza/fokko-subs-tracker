/** How the error screen reads a failed upload: each kind has its title and way out. */
export type FailureKind = "bank" | "imported" | "file" | "unreadable";

const kindByKey: Readonly<Record<string, FailureKind>> = {
  "statements.bank_not_detected": "bank",
  "statements.bank_unknown": "bank",
  "statements.already_imported": "imported",
  "statements.file_too_large": "file",
  "statements.file_kind_unknown": "file",
  "statements.file_empty": "file",
};

/** Any key the screen does not know reads as "could not read this file". */
export function failureKindOf(key: string): FailureKind {
  return kindByKey[key] ?? "unreadable";
}

/** Only a missing bank keeps the file: the person picks the bank and sends the same one. */
export function keepsFileAfter(kind: FailureKind): boolean {
  return kind === "bank";
}
