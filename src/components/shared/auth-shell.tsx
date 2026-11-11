import type { AuthShellProps } from "@/interfaces/auth";
export function AuthShell({ children }: AuthShellProps) {
  return (
    <main id="main-content" className="ui-auth-shell">
      <section className="ui-auth-card">
        <div className="ui-auth-brand">
          <span className="erp-brand-mark" aria-hidden="true">
            DK
          </span>
          <span>Dapur Keluarga</span>
        </div>
        {children}
      </section>
    </main>
  );
}
