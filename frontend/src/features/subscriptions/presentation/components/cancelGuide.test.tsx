import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CancelLink, CancellationStatus, CancelSteps, CancelZone } from "./CancelGuide";

describe("CancelSteps and CancelZone", () => {
  it("shows the three fixed steps in order and the service in the title", () => {
    render(
      <>
        <CancelZone name="Disney+" back={{ to: "/subs/k", label: "Subs" }} onNavigate={vi.fn()} />
        <CancelSteps name="Disney+" />
      </>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Cómo cancelar Disney+" })).toBeInTheDocument();
    const steps = screen.getAllByRole("listitem").map((step) => step.textContent);
    expect(steps).toEqual([
      "1Entra a Disney+Inicia sesión desde su sitio o su app.",
      "2Busca tu suscripciónSuele estar en Cuenta o en Facturación.",
      "3Cancela y guarda el correoDisney+ te enviará una confirmación por correo.",
    ]);
  });
});

describe("CancelLink", () => {
  it("opens an https link in another tab without the opener", () => {
    render(<CancelLink name="Disney+" url="https://www.disneyplus.com/account" />);

    const link = screen.getByRole("link", { name: "Ir a Disney+" });
    expect(link).toHaveAttribute("href", "https://www.disneyplus.com/account");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it.each([
    { name: "no link", url: "" },
    { name: "a link that is not https", url: "http://disneyplus.com" },
  ])("gives a generic tip with $name", ({ url }) => {
    render(<CancelLink name="Disney+" url={url} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/No tenemos el enlace de Disney\+/)).toBeInTheDocument();
  });
});

describe("CancellationStatus", () => {
  it("marks when not marked yet", () => {
    const onMark = vi.fn();
    render(<CancellationStatus markedAt={null} onMark={onMark} isMarking={false} error={undefined} />);

    screen.getByRole("button", { name: "La voy a cancelar" }).click();

    expect(onMark).toHaveBeenCalledTimes(1);
  });

  it("shows the saved mark and leaves the button off", () => {
    const markedAt = Date.UTC(2026, 10, 12, 15) / 1000;
    render(<CancellationStatus markedAt={markedAt} onMark={vi.fn()} isMarking={false} error={undefined} />);

    expect(screen.getByText("Marcada por cancelar el 12 nov.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "La voy a cancelar" })).toBeDisabled();
  });
});
