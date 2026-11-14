import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileHeader, ProfileRows } from "./Profile";

const ana = { name: "Ana Pérez", email: "ana@example.com", initials: "AP" };

describe("ProfileHeader", () => {
  it("shows initials, name and email", () => {
    render(<ProfileHeader account={ana} onNavigate={vi.fn()} />);

    const account = within(screen.getByRole("region", { name: "Tu cuenta" }));
    expect(account.getByText("AP")).toBeInTheDocument();
    expect(account.getByText("Ana Pérez")).toBeInTheDocument();
    expect(account.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("shows a skeleton while the account loads", () => {
    const { container } = render(<ProfileHeader account={undefined} onNavigate={vi.fn()} />);

    expect(screen.queryByRole("region", { name: "Tu cuenta" })).not.toBeInTheDocument();
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });
});

describe("ProfileRows", () => {
  function renderRows(onLogout = vi.fn()) {
    render(
      <ProfileRows
        appearance={{ preference: "system", onChoose: vi.fn() }}
        onLogout={onLogout}
        isLeaving={false}
        onNavigate={vi.fn()}
      />,
    );
    return onLogout;
  }

  it("shows Tus datos, Apariencia and Cerrar sesión, and no post-MVP rows", () => {
    renderRows();

    expect(screen.getByRole("link", { name: /Tus datos/ })).toHaveAttribute("href", "/perfil/eliminar");
    expect(screen.getByRole("group", { name: "Apariencia" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(screen.queryByText(/Cuentas de correo|Notificaciones/)).not.toBeInTheDocument();
  });

  it("closes the session", () => {
    const onLogout = renderRows();

    screen.getByRole("button", { name: "Cerrar sesión" }).click();

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
