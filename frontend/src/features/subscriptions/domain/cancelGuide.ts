/** Only an https link opens; anything else (http, javascript:, broken) is not shown as one. */
export function safeCancelUrlOf(url: string): string | undefined {
  if (url.trim() === "") {
    return undefined;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : undefined;
  } catch {
    // Not a URL at all: there is no link to give.
    return undefined;
  }
}
