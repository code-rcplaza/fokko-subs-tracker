import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Screens mount the whole app (router, every route): on a busy machine the
// first one of a file can take more than the default second to show its data.
configure({ asyncUtilTimeout: 5000 });

// No test reaches the network: a test that needs the API passes its own fetch double.
const blockedFetch = vi.fn(async (input: RequestInfo | URL) => {
  throw new Error(`fetch is not available in tests: ${String(input)}`);
});

vi.stubGlobal("fetch", blockedFetch);

afterEach(() => {
  cleanup();
  blockedFetch.mockClear();
});

// jsdom has no modal dialogs: the shim only opens and closes them. Focus trap,
// Esc and the inert background are the browser's; the components handle the
// rest (cancel, outside click, focus back, scroll lock) and tests drive those.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
}
