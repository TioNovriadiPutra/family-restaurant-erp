import type { ActionMenuPosition } from "@/interfaces/action-menu";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export function useActionMenu(itemCount: number) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<ActionMenuPosition | null>(null);
  const close = () => { setPosition(null); triggerRef.current?.focus(); };
  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = itemCount * 44 + 10;
    setPosition({ left: Math.max(8, Math.min(rect.right - 208, window.innerWidth - 216)), top: Math.max(8, Math.min(window.innerHeight - height - 8, rect.bottom + height + 8 > window.innerHeight ? rect.top - height - 8 : rect.bottom + 8)) });
  };
  useEffect(() => {
    if (!position) return;
    menuRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) setPosition(null);
    };
    const hide = () => setPosition(null);
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => { document.removeEventListener("pointerdown", dismiss); window.removeEventListener("resize", hide); window.removeEventListener("scroll", hide, true); };
  }, [position]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key === "Tab") close();
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
  };
  return { id, triggerRef, menuRef, position, open, close, onKeyDown };
}
