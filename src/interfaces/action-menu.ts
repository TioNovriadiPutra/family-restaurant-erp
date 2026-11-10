import type { ReactNode } from "react";

export interface ActionMenuPosition { top: number; left: number }
export interface ActionMenuItem { label: string; icon: ReactNode; onSelect: () => void; disabled?: boolean; destructive?: boolean }
export interface ActionMenuProps { label: string; items: ActionMenuItem[] }
