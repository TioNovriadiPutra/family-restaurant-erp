import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
export function useFormModal(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  const close = () => {
    if (!ref.current?.querySelector('[aria-busy="true"]')) onClose();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const dialog = ref.current;
    if (!dialog) return;
    const controls = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return { ref, close, onKeyDown };
}
