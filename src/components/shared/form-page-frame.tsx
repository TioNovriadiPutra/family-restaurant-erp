import Link from "next/link";
import { ArrowLeft2 } from "iconsax-reactjs";
import type { FormPageFrameProps } from "@/interfaces/form-surface";
export function FormPageFrame({
  backHref,
  backLabel,
  children,
}: FormPageFrameProps) {
  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        onClick={(event) => {
          if (
            event.currentTarget.parentElement?.querySelector(
              '[aria-busy="true"]',
            )
          )
            event.preventDefault();
        }}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft2 size={16} aria-hidden />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}
