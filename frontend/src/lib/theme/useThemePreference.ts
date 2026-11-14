import { useState } from "react";
import {
  applyThemePreference,
  browserStorage,
  readThemePreference,
  storeThemePreference,
  type ThemePreference,
} from "./theme";

/** Apariencia: light, dark or system, applied at once and kept in the browser (no endpoint). */
export function useThemePreference() {
  const [preference, setPreference] = useState(() => readThemePreference(browserStorage));

  function choose(next: ThemePreference) {
    storeThemePreference(browserStorage, next);
    applyThemePreference(document.documentElement, next);
    setPreference(next);
  }

  return { preference, choose };
}
