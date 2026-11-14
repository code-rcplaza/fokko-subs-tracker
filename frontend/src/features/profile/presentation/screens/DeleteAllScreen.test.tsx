import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "../../../../app/renderApp";
import { ApiError } from "../../../../lib/api/client";
import { gatewaysWith } from "../../../../lib/gateways/renderWithGateways";
import type { ProfileGateway } from "../../application/ports";

const ana = { id: "u1", name: "Ana Pérez", email: "ana@example.com", initials: "AP" };
const copy = { blob: new Blob(["name,amount\n"]), filename: "fokko-copia.csv" };

function renderDeleteAll(overrides: Partial<ProfileGateway>) {
  const profile: ProfileGateway = {
    ...gatewaysWith({}).profile,
    exportCopy: vi.fn(async () => copy),
    deleteAccount: vi.fn(async () => {}),
    ...overrides,
  };
  // After DELETE /api/me there is no session: /api/me answers 401.
  const getMe = vi.fn().mockResolvedValueOnce(ana).mockResolvedValue(null);
  const auth = { ...gatewaysWith({}).auth, getMe };
  return { ...renderApp("/perfil/eliminar", { auth, profile }), profile };
}

beforeEach(() => {
  vi.stubGlobal(
    "URL",
    Object.assign(URL, { createObjectURL: vi.fn(() => "blob:copia"), revokeObjectURL: vi.fn() }),
  );
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Delete all screen", () => {
  it("lists what goes away and downloads the copy as CSV by default", async () => {
    const { profile } = renderDeleteAll({});

    expect(await screen.findByRole("list", { name: "Se eliminará" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "CSV" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Descargar copia primero" }));

    await waitFor(() => expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1));
    expect(profile.exportCopy).toHaveBeenCalledWith("csv");
  });

  it("downloads JSON when chosen", async () => {
    const { profile } = renderDeleteAll({});

    await userEvent.click(await screen.findByRole("radio", { name: "JSON" }));
    await userEvent.click(screen.getByRole("button", { name: "Descargar copia primero" }));

    await waitFor(() => expect(profile.exportCopy).toHaveBeenCalledWith("json"));
  });

  it("warns when the copy fails and still lets delete", async () => {
    renderDeleteAll({
      exportCopy: () => Promise.reject(new ApiError({ status: 500, key: "common.internal" })),
    });

    await userEvent.click(await screen.findByRole("button", { name: "Descargar copia primero" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos preparar tu copia.");
    expect(screen.getByRole("button", { name: "Sí, eliminar todo" })).toBeEnabled();
  });

  it("closes the confirmation with Esc without calling the API", async () => {
    const { profile } = renderDeleteAll({});

    await userEvent.click(await screen.findByRole("button", { name: "Sí, eliminar todo" }));
    const dialog = screen.getByRole("dialog", { name: "¿Eliminar todo ahora?" });
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(dialog).not.toHaveAttribute("open");
    expect(profile.deleteAccount).not.toHaveBeenCalled();
  });

  it("deletes after confirming, empties the cache and goes to Registro", async () => {
    const { profile, router, queryClient } = renderDeleteAll({});

    await userEvent.click(await screen.findByRole("button", { name: "Sí, eliminar todo" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar todo" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/registro"));
    expect(profile.deleteAccount).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(["session"])).toBeNull();
  });

  it("stays with the message when deleting fails", async () => {
    const { router } = renderDeleteAll({
      deleteAccount: () => Promise.reject(new ApiError({ status: 500, key: "common.internal" })),
    });

    await userEvent.click(await screen.findByRole("button", { name: "Sí, eliminar todo" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar todo" }));

    expect(await within(screen.getByRole("dialog")).findByRole("alert")).toHaveTextContent("Algo salió mal");
    expect(router.state.location.pathname).toBe("/perfil/eliminar");
  });
});
