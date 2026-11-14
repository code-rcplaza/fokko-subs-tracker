import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CardState, Possible, ReviewCardView } from "../../domain/review";
import type { ReviewCardActions } from "./ReviewCard";
import { ReviewList } from "./ReviewList";
import { ReviewZone } from "./ReviewProgress";

const secondOfSeptember = Date.UTC(2026, 8, 2, 15) / 1000;
const secondOfOctober = Date.UTC(2026, 9, 2, 15) / 1000;

function possibleNamed(name: string, amount: Possible["amount"]): Possible {
  const charge = { date: secondOfSeptember, amount };
  return {
    lineKey: `k-${name}`,
    name,
    alias: "",
    amount,
    charges: [charge, charge, { ...charge, date: secondOfOctober }],
  };
}

const pesos = (amount: number) => ({ amount, currency: "CLP" });

function cardOf(possible: Possible, state: CardState = { kind: "pending" }): ReviewCardView {
  return { possible, state, isSending: false, error: undefined };
}

const actions: ReviewCardActions = {
  onYes: vi.fn(),
  onChooseCadence: vi.fn(),
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
  onDismiss: vi.fn(),
  onUndo: vi.fn(),
};

function renderList(cards: readonly ReviewCardView[], resolved = 0) {
  return render(
    <ReviewList
      cards={cards}
      progress={{ resolved, total: cards.length }}
      actions={actions}
      onNavigate={vi.fn()}
    />,
  );
}

describe("ReviewList", () => {
  it("shows a card per possible with its name, amount and evidence", () => {
    renderList([
      cardOf(possibleNamed("APPLE.COM/BILL", pesos(990_000))),
      cardOf(possibleNamed("GOOGLE *STORAGE", pesos(299_000))),
      cardOf(possibleNamed("AMZN PRIME", pesos(579_000))),
    ]);

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    const icloud = within(screen.getByRole("article", { name: "APPLE.COM/BILL" }));
    expect(icloud.getByText("$9.900")).toBeInTheDocument();
    expect(
      icloud.getByText("Lo vimos en tu archivo: APPLE.COM/BILL, el día 2 de cada mes (3 cargos)."),
    ).toBeInTheDocument();
  });

  it("shows a dollar amount as it was charged, since the back sends no equivalent for possible ones", () => {
    renderList([cardOf(possibleNamed("OPENAI *CHATGPT", { amount: 2_000, currency: "USD" }))]);

    expect(screen.getByText("US$20,00")).toBeInTheDocument();
  });

  it.each([
    { state: { kind: "pending" }, shows: ["Sí, es una suscripción", "No lo es"] },
    { state: { kind: "choosing", cadence: undefined }, shows: ["Agregar", "Cancelar"] },
    { state: { kind: "added", cadence: "yearly" }, shows: ["Agregada: se cobra cada año.", "Deshacer"] },
    { state: { kind: "dismissed" }, shows: ["No la seguiremos.", "Deshacer"] },
  ] as const)("draws a $state.kind card with its own look", ({ state, shows }) => {
    renderList([cardOf(possibleNamed("AMZN PRIME", pesos(579_000)), state)]);

    expect(screen.getByRole("article")).toHaveAttribute("data-state", state.kind);
    for (const text of shows) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it("asks for the cadence before adding", () => {
    renderList([
      cardOf(possibleNamed("AMZN PRIME", pesos(579_000)), { kind: "choosing", cadence: undefined }),
    ]);

    expect(screen.getByRole("group", { name: "¿Cada cuánto se cobra?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar" })).toBeDisabled();
  });

  it("leads a pending card to Editar, back to Revisión", () => {
    renderList([cardOf(possibleNamed("AMZN PRIME", pesos(579_000)))]);

    expect(screen.getByRole("link", { name: "Editar nombre o monto" })).toHaveAttribute(
      "href",
      "/subs/k-AMZN%20PRIME/editar?desde=revision",
    );
  });

  it("shows the error of a card on that card", () => {
    const card = { ...cardOf(possibleNamed("AMZN PRIME", pesos(579_000))), error: "No pudimos guardar." };
    renderList([card]);

    expect(within(screen.getByRole("article")).getByRole("alert")).toHaveTextContent("No pudimos guardar.");
  });

  it("offers to resolve later while some are pending", () => {
    renderList([cardOf(possibleNamed("AMZN PRIME", pesos(579_000)))]);

    expect(screen.getByRole("link", { name: "Resolver después" })).toHaveAttribute("href", "/resumen");
    expect(screen.queryByRole("link", { name: "Ir a mi resumen" })).not.toBeInTheDocument();
  });

  it("leads to the summary once all are resolved", () => {
    renderList([cardOf(possibleNamed("AMZN PRIME", pesos(579_000)), { kind: "dismissed" })], 1);

    expect(screen.getByRole("link", { name: "Ir a mi resumen" })).toHaveAttribute("href", "/resumen");
    expect(screen.queryByRole("link", { name: "Resolver después" })).not.toBeInTheDocument();
  });
});

describe("ReviewZone", () => {
  it("shows 2 of 5 in the ring and the 3 left in its center", () => {
    render(<ReviewZone progress={{ resolved: 2, total: 5 }} />);

    expect(screen.getByRole("img", { name: "2 de 5 revisadas" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("por revisar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "¿Esto es una suscripción?" })).toBeInTheDocument();
  });

  it("shows the check, not a count, once all are resolved", () => {
    render(<ReviewZone progress={{ resolved: 3, total: 3 }} />);

    expect(screen.queryByText("por revisar")).not.toBeInTheDocument();
  });

  it("shows the empty state when there is nothing to review", () => {
    const { container } = render(<ReviewZone progress={{ resolved: 0, total: 0 }} />);

    expect(screen.getByRole("heading", { level: 1, name: "Nada por revisar" })).toBeInTheDocument();
    expect(container.querySelector("[data-empty]")).not.toBeNull();
  });
});
