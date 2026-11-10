import { useImperativeHandle, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, Ref } from "react";
import type { SelectInputProps, SelectOption, SelectPosition } from "@/interfaces/shared";
export function useSelectInput(props: SelectInputProps, options: SelectOption[], ref?: Ref<HTMLButtonElement>) {
  const id = useId(); const trigger = useRef<HTMLButtonElement>(null); const list = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(props.defaultValue ?? ""); const value = props.value ?? local;
  const [position, setPosition] = useState<SelectPosition>(); const [container, setContainer] = useState<HTMLElement>();
  const [active, setActive] = useState(0); const typeahead = useRef({ text: "", time: 0 });
  useImperativeHandle(ref, () => trigger.current!, []);
  const enabled = options.map((o, i) => o.disabled ? -1 : i).filter(i => i >= 0);
  const close = (focus = false) => { setPosition(undefined); if (focus) trigger.current?.focus(); };
  const open = (last = false) => {
    const button = trigger.current; if (!button || button.matches(":disabled")) return;
    const rect = button.getBoundingClientRect(); const width = Math.min(Math.max(rect.width, 160), window.innerWidth - 24);
    const below = window.innerHeight - rect.bottom - 12; const above = rect.top - 12;
    const height = Math.min(280, Math.max(80, below >= Math.min(220, above) ? below : above));
    const contentHeight = Math.min(height, options.length * 44 + 12);
    setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: below >= contentHeight ? rect.bottom + 6 : Math.max(12, rect.top - contentHeight - 6), width, maxHeight: height });
    setContainer(button.closest("dialog") ?? document.body);
    const selected = options.findIndex(o => o.value === value && !o.disabled);
    setActive(last ? enabled.at(-1) ?? 0 : selected >= 0 ? selected : enabled[0] ?? 0);
  };
  const choose = (index: number) => {
    const option = options[index]; if (!option || option.disabled || trigger.current?.matches(":disabled")) return;
    setLocal(option.value); props.onValueChange?.(option.value); close(true);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    props.onKeyDown?.(event); if (event.defaultPrevented) return;
    if (event.key === "Tab") { close(); return; }
    if (event.key === "Escape" && position) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault(); if (!position) { open(event.key === "End"); return; }
      const current = enabled.indexOf(active); const next = event.key === "Home" ? enabled[0] : event.key === "End" ? enabled.at(-1) : enabled[(current + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length];
      if (next !== undefined) setActive(next); return;
    }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (position) choose(active); else open(); return; }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); const now = Date.now(); typeahead.current = { text: (now - typeahead.current.time > 700 ? "" : typeahead.current.text) + event.key.toLocaleLowerCase(), time: now };
      if (!position) open(); const start = enabled.indexOf(active);
      const match = [...enabled.slice(start + 1), ...enabled.slice(0, start + 1)].find(i => options[i].label.toLocaleLowerCase().startsWith(typeahead.current.text));
      if (match !== undefined) setActive(match);
    }
  };
  useEffect(() => {
    if (!position) return;
    const outside = (event: Event) => { if (event.target instanceof Node && !trigger.current?.contains(event.target) && !list.current?.contains(event.target)) setPosition(undefined); };
    const dismiss = (event: Event) => { if (event.type !== "scroll" || !(event.target instanceof Node) || !list.current?.contains(event.target)) setPosition(undefined); };
    document.addEventListener("pointerdown", outside); document.addEventListener("focusin", outside);
    window.addEventListener("resize", dismiss); window.addEventListener("scroll", dismiss, true);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); window.removeEventListener("resize", dismiss); window.removeEventListener("scroll", dismiss, true); };
  }, [position]);
  useEffect(() => { if (position) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" }); }, [active, position]);
  return { id, trigger, list, value, position, container, active, setActive, open, close, choose, onKeyDown };
}
