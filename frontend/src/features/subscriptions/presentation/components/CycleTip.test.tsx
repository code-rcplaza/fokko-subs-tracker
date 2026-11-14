import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Upcoming } from "../../domain/summary";
import { CycleTip } from "./CycleTip";

function upcomingOn(days: readonly number[]): readonly Upcoming[] {
  return days.map((day, position) => ({
    lineKey: `k${position}`,
    name: `S${position}`,
    alias: "",
    amount: { amount: 100, currency: "CLP" },
    date: Date.UTC(2026, 10, day, 15) / 1000,
  }));
}

describe("CycleTip", () => {
  it.each([
    { days: [20, 20, 20, 5], text: "Se te juntan cobros el día 20." },
    { days: [5, 5, 5, 20, 20, 20], text: "Se te juntan cobros los días 5 y 20." },
  ])("names the days where charges pile up: $text", ({ days, text }) => {
    render(<CycleTip upcoming={upcomingOn(days)} />);

    expect(screen.getByRole("heading", { name: "Optimización de ciclo sugerida" })).toBeInTheDocument();
    expect(screen.getByText((content) => content.startsWith(text))).toBeInTheDocument();
  });

  it("is not there when the charges are spread", () => {
    const { container } = render(<CycleTip upcoming={upcomingOn([2, 5, 9, 18])} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("never speaks of bank accounts nor of access to the bank", () => {
    const { container } = render(<CycleTip upcoming={upcomingOn([20, 20, 20])} />);

    expect(container.textContent).not.toMatch(/cuenta|banco|bancari/i);
  });
});
