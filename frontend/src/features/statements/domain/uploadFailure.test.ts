import { describe, expect, it } from "vitest";
import { failureKindOf, keepsFileAfter } from "./uploadFailure";

describe("failureKindOf", () => {
  it.each([
    ["statements.bank_not_detected", "bank"],
    ["statements.bank_unknown", "bank"],
    ["statements.already_imported", "imported"],
    ["statements.file_too_large", "file"],
    ["statements.file_kind_unknown", "file"],
    ["statements.file_empty", "file"],
    ["statements.no_charges", "unreadable"],
    ["common.internal", "unreadable"],
    ["algo.que.no.existe", "unreadable"],
  ])("sorts %s as %s", (key, kind) => {
    expect(failureKindOf(key)).toBe(kind);
  });

  it("keeps the file only when the bank is what is missing", () => {
    expect(keepsFileAfter("bank")).toBe(true);
    expect(keepsFileAfter("file")).toBe(false);
    expect(keepsFileAfter("imported")).toBe(false);
    expect(keepsFileAfter("unreadable")).toBe(false);
  });
});
