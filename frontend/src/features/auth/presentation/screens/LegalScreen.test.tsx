import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";

function renderWithoutSession(path: string) {
  const getMe = vi.fn(async () => null);
  return { ...renderApp(path, { auth: { ...gatewaysWith({}).auth, getMe } }), getMe };
}

describe("Legal pages", () => {
  it.each([
    { path: "/terminos", title: "Términos de uso" },
    { path: "/privacidad", title: "Política de privacidad" },
  ])("$path opens without a session and says the text is coming", async ({ path, title }) => {
    const { getMe } = renderWithoutSession(path);

    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Próximamente" })).toBeInTheDocument();
    expect(getMe).not.toHaveBeenCalled();
  });

  it.each([
    { link: "Leer los términos", path: "/terminos" },
    { link: "Leer la política de privacidad", path: "/privacidad" },
  ])("Registro links '$link' to $path", async ({ link, path }) => {
    const { router } = renderWithoutSession("/registro");

    await userEvent.click(await screen.findByRole("link", { name: link }));

    await waitFor(() => expect(router.state.location.pathname).toBe(path));
  });
});
