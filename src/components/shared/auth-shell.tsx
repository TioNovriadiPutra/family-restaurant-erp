import type { AuthShellProps } from "@/interfaces/auth";

export function AuthShell({ children }: AuthShellProps) {
  return <main id="main-content" className="grid min-h-dvh place-items-center bg-background px-4 py-8 sm:py-16">
    <section className="w-full max-w-[520px] rounded-dialog border border-border bg-surface p-6 shadow-card sm:p-10">
      <p className="type-20-semibold text-primary">Dapur Keluarga</p>
      {children}
    </section>
  </main>;
}
