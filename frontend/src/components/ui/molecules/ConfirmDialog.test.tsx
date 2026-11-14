import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

/** A page with the button that opens the dialog, as a screen would use it. */
function DialogPage({ onConfirm }: { readonly onConfirm: () => void }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        abrir
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        title="¿Dejar de seguir Netflix?"
        text="Dejará de aparecer."
        confirmLabel="Dejar de seguir"
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

async function openDialog(onConfirm = vi.fn()) {
  render(<DialogPage onConfirm={onConfirm} />);
  const opener = screen.getByRole("button", { name: "abrir" });
  await userEvent.click(opener);
  return { opener, dialog: screen.getByRole("dialog", { name: "¿Dejar de seguir Netflix?" }), onConfirm };
}

describe("ConfirmDialog", () => {
  it("opens as a modal named by its title and confirms", async () => {
    const { dialog, onConfirm } = await openDialog();

    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleDescription("Dejará de aparecer.");
    await userEvent.click(screen.getByRole("button", { name: "Dejar de seguir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      name: "Esc",
      close: (dialog: HTMLElement) => fireEvent(dialog, new Event("cancel", { cancelable: true })),
    },
    { name: "a click outside", close: (dialog: HTMLElement) => fireEvent.click(dialog) },
    { name: "Cancelar", close: () => fireEvent.click(screen.getByRole("button", { name: "Cancelar" })) },
  ])("closes with $name without confirming and gives the focus back", async ({ close }) => {
    const { dialog, opener, onConfirm } = await openDialog();

    close(dialog);

    expect(dialog).not.toHaveAttribute("open");
    expect(opener).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("does not close on a click inside its content", async () => {
    const { dialog } = await openDialog();

    fireEvent.click(screen.getByText("Dejará de aparecer."));

    expect(dialog).toHaveAttribute("open");
  });

  it("locks the page scroll while open", async () => {
    await openDialog();
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(document.documentElement.style.overflow).toBe("");
  });
});
