import { type MouseEvent, type SyntheticEvent, useEffect, useId, useRef } from "react";
import { t } from "../../../lib/i18n/translate";
import { Button } from "../atoms/Button";

export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly text: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  /** The confirmation is on its way: the button waits and nothing else closes it. */
  readonly isConfirming?: boolean;
  readonly error?: string | undefined;
}

/** While a modal is open the page behind does not scroll. */
function lockPageScroll(): () => void {
  const page = document.documentElement;
  const before = page.style.overflow;
  page.style.overflow = "hidden";
  return () => {
    page.style.overflow = before;
  };
}

/**
 * A native modal `<dialog>`: the browser traps focus, makes the page inert and
 * turns Esc into `cancel`. On top of that it closes on an outside click, locks
 * the scroll and gives the focus back to what opened it.
 */
export function ConfirmDialog({
  isOpen,
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
  isConfirming = false,
  error,
}: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || element === null) {
      return;
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    const unlockPageScroll = lockPageScroll();
    return () => {
      element.close();
      unlockPageScroll();
      opener?.focus();
    };
  }, [isOpen]);

  const cancelUnlessConfirming = () => {
    if (!isConfirming) {
      onCancel();
    }
  };
  // Esc: the parent decides whether it closes, so the dialog never closes on its own.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    cancelUnlessConfirming();
  };
  // A click on the dialog itself, not on its content, is a click on the backdrop.
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      cancelUnlessConfirming();
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard way out of the backdrop is Esc, handled as `cancel`
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={textId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="m-auto w-[calc(100%-32px)] max-w-sm rounded-sheet bg-page p-0 text-ink backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={textId} className="text-ink-secondary">
          {text}
        </p>
        {error !== undefined && (
          <p role="alert" className="rounded-md bg-error-surface p-4 text-sm text-danger-ink">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Button variant="danger" onClick={onConfirm} loading={isConfirming}>
            {confirmLabel}
          </Button>
          <Button variant="text" onClick={onCancel} disabled={isConfirming}>
            {t("ui.cancel")}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
