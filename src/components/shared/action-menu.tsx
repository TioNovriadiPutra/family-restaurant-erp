import { createPortal } from "react-dom";
import { More } from "iconsax-reactjs";
import type { ActionMenuProps } from "@/interfaces/action-menu";
import { useActionMenu } from "@/hooks/use-action-menu";

export function ActionMenu({ label, items }: ActionMenuProps) {
  const { id, triggerRef, menuRef, position, open, close, onKeyDown } = useActionMenu(items.length);
  return <>
    <button ref={triggerRef} type="button" className="ui-button ui-button-ghost min-h-11 min-w-11 !px-2" aria-label={label} aria-haspopup="menu" aria-expanded={Boolean(position)} aria-controls={position ? id : undefined}
      onClick={() => position ? close() : open()} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); open(); } }}><More aria-hidden="true" size={22} variant="Linear" /></button>
    {position && createPortal(<div id={id} ref={menuRef} role="menu" aria-label={label} onKeyDown={onKeyDown} style={position} className="fixed z-50 w-52 rounded-control border border-border bg-surface p-1 shadow-overlay">
      {items.map(item => <button key={item.label} role="menuitem" type="button" disabled={item.disabled} className={`ui-button ui-button-ghost min-h-11 w-full !justify-start !px-3 ${item.destructive ? "!text-destructive" : ""}`} onClick={() => { close(); item.onSelect(); }}>{item.icon}<span>{item.label}</span></button>)}
    </div>, document.body)}
  </>;
}
