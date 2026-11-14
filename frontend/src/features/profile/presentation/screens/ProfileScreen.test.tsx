import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import { readThemePreference } from "../../../../lib/theme/theme";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };

function renderProfile(logout = vi.fn(async () => {})) {
  // After the logout the back answers 401 to /api/me: no session any more.
  const getMe = vi.fn().mockResolvedValueOnce(ana).mockResolvedValue(null);
  const auth = { ...gatewaysWith({}).auth, getMe };
  const rendered = renderApp("/perfil", { auth, profile: { ...gatewaysWith({}).profile, logout } });
  return { ...rendered, logout };
}

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("Profile screen", () => {
  it("shows the account of the session", async () => {
    renderProfile();

    expect(await screen.findByRole("region", { name: "Tu cuenta" })).toHaveTextContent("Ana Pérez");
  });

  it("changes the theme at once and keeps it in the browser, without calling the API", async () => {
    const fetchSpy = vi.mocked(globalThis.fetch);
    renderProfile();

    await userEvent.click(await screen.findByRole("radio", { name: "Oscuro" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(readThemePreference(window.localStorage)).toBe("dark");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("closes the session and goes to Login", async () => {
    const { router, logout } = renderProfile();

    await userEvent.click(await screen.findByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/entrar"));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
