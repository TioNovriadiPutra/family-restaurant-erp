# ERP UI rollout across modules

11 November 2026. This supersedes the dashboard-only rollout boundary in earlier review notes. Existing ERP feature pages now share the white/teal/orange reference design. POS is unchanged.

## Shared system

- Inter remains the single loaded UI family. Page titles: 28px desktop / 24px phone, section titles 18px, body/table/control text 14px, supporting text 13px. Inputs use 16px text on narrow phones to avoid browser zoom.
- PageTitle, SectionTitle and PageHeader are shared primitives in components/shared/page-heading.tsx; their types are in interfaces/ui.ts. Applied to list pages, form pages, detail panels, dialogs and module hubs rather than only Ringkasan.
- Tables share neutral headers, row padding, numeric alignment, hover and pagination. Search/filter shelves, field labels, input borders/focus, 44px field/button heights, badges, cards, select menus and dialogs use shared recipes.
- Forms retain their original field grouping, validation, disabled/saving states and navigation guards. FormPageFrame provides the editor container; FormModal retains native focus management and Escape behavior. Login uses the same typography and white/teal/orange foundations in a centered, content-sized card.
- Existing headings/table cells were migrated structurally; business expressions and handlers were preserved. No query, mutation, service, API, Auth/RBAC, transaction or schema changes.

## Coverage

Persediaan (materials, stock, conversions, counts, waste, adjustments, approval, detail/history), Pembelian (supplier, purchase list/form/detail), Resep & HPP (recipe, costs, production, history/detail/forms), Keuangan (accounts/movements, suppliers, reconciliation/import, journals, expense forms/detail), Karyawan (list/create/edit/delete/PIN), Pengaturan (profile, menu/price, receipt/payment, access and dining tables), module hubs, existing report states, login and access/error states. Feature-specific data/flows remain as implemented; styling an unavailable report does not implement its business logic.

## Verification

ESLint, TypeScript, all 12 existing tests and a full production build passed. Browser review uses the real Next.js app and a loopback fixture backend, without hosted data writes. It checks computed Inter/title/table type, 44px fields, page overflow and dialog focus/viewport. Representative list/form/modal screens are captured across desktop, tablet and phone; this does not claim an end-to-end hosted test of every transaction.

Screenshots and detailed local audit outputs are ignored artifacts in .taste-skill/all-pages/. Review harness: tests/support/review-dashboard.mjs, production mode REVIEW_PRODUCTION=1, per-screen assertions via ?review-ui=1. Fake dining-table read data exists only in this local review harness.

The Taste marketing gate does not replace the operational-app acceptance criteria. Full-screen heroes, marketing wraps/imagery and promotional moments are not added to working forms or tables; any gate findings are reported separately. No full marketing gate PASS is claimed.


## Final browser audit

18 representative list, hub, form, settings/report-state and modal screens passed the computed-style, target-height, focus and viewport checks. Login was visually reviewed at 390px using a fresh unauthenticated browser profile. No real employee, stock, purchase, recipe or finance data was written. Source coverage is broader than these representative runtime cases.

`GATE: OPEN 17 (rounds used up)` for the representative employee page: remaining findings include marketing hero/section/CTA/imagery/wrap/row-height rules, sales-category headline rules, and a 7:1 body-text target stricter than the current AA contrast in the information alert. Header search retains an associated screen-reader label and visible placeholder; focus is shown on its wrapper using :focus-within, which the input-only check does not detect. Existing operational-app waivers for the promotional moment and kit container remain; no checker or skill file was modified. Full marketing-gate and full accessibility-audit PASS are not claimed.

ESLint excludes only generated `.taste-skill/` audit/browser artifacts (including Chrome extension JavaScript); application and test sources remain checked.

Typography context: focused Login keeps a 28px title on phone; dialog page-level titles use 24px. These are explicit shared-context variants rather than feature-local font sizes.
