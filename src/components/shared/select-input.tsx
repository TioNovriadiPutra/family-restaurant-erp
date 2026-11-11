import { Children, isValidElement } from "react";
import { createPortal } from "react-dom";
import { ArrowDown2, TickCircle } from "iconsax-reactjs";
import type { SelectInputProps, SelectOption } from "@/interfaces/shared";
import { useSelectInput } from "@/hooks/ui/use-select-input";
export function SelectInput({ className = "", children, ref, ...props }: SelectInputProps) {
  const options = Children.toArray(children).filter(isValidElement<{ value?: string; children?: string; disabled?: boolean }>).map(child => ({ value: String(child.props.value ?? ""), label: String(child.props.children ?? ""), disabled: Boolean(child.props.disabled) })) satisfies SelectOption[];
  const { id, trigger, list, value: selectedValue, position, container, active, setActive, open, close, choose, onKeyDown } = useSelectInput(props, options, ref);
  const selected = options.find(o => o.value === selectedValue);
  const { value, defaultValue, onValueChange, required, ...buttonProps } = props;
  void value; void defaultValue; void onValueChange;
  return <>
    <button {...buttonProps} ref={trigger} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={Boolean(position)} aria-controls={`${id}-list`} aria-activedescendant={position && options[active] ? `${id}-${active}` : undefined} aria-required={required || undefined} className={`ui-input ui-select-trigger ${className}`} onKeyDown={onKeyDown} onClick={event => { props.onClick?.(event); if (!event.defaultPrevented) { if (position) close(); else open(); } }}>
      <span className={`min-w-0 flex-1 truncate ${!selectedValue ? "text-muted-foreground" : ""}`}>{selected?.label ?? "Pilih pilihan"}</span><ArrowDown2 size={16} aria-hidden variant="Linear" className={`shrink-0 text-muted-foreground transition-transform ${position ? "rotate-180" : ""}`} />
    </button>
    {position && container && createPortal(<div ref={list} id={`${id}-list`} role="listbox" aria-label={props["aria-label"] ?? "Pilihan"} className="ui-select-menu" style={position}>
      {options.length ? options.map((option, index) => <div key={`${option.value}-${index}`} id={`${id}-${index}`} role="option" aria-selected={selectedValue === option.value} aria-disabled={option.disabled || undefined} data-index={index} data-active={active === index} className="ui-select-option" onPointerDown={event => event.preventDefault()} onPointerMove={() => { if (!option.disabled) setActive(index); }} onClick={() => choose(index)}><span className="min-w-0 flex-1 break-words">{option.label}</span>{selectedValue === option.value && <TickCircle size={17} variant="Bold" aria-hidden className="shrink-0 text-primary" />}</div>) : <p className="px-3 py-4 text-14 text-muted-foreground">Belum ada pilihan</p>}
    </div>, container)}
  </>;
}
