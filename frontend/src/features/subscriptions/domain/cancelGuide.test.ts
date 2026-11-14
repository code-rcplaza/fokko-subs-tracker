import { describe, expect, it } from "vitest";
import { safeCancelUrlOf } from "./cancelGuide";

describe("safeCancelUrlOf", () => {
  it.each([
    { url: "https://www.disneyplus.com/account", expected: "https://www.disneyplus.com/account" },
    { url: "", expected: undefined },
    { url: "http://example.com", expected: undefined },
    { url: "javascript:alert(1)", expected: undefined },
    { url: "no es un enlace", expected: undefined },
  ])("gives $expected for '$url'", ({ url, expected }) => {
    expect(safeCancelUrlOf(url)).toBe(expected);
  });
});
