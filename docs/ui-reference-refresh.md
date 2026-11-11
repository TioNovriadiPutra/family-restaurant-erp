# ERP reference redesign

Latest visual direction: user's supplied white / teal / orange restaurant dashboard reference. This supersedes the earlier stone direction in ui-refresh.md for ERP only. POS is unchanged.

## Implemented

- White application canvas, light borders, teal selected navigation, orange brand mark and icon accents. Existing Inter and semantic status colours retained.
- Three distinct top cards: revenue, paid orders and average order. Revenue uses teal with subtle static rings. No invented comparison percentages or customer totals.
- Actual seven-day sales in the orange/teal bar chart; actual top-menu portions/revenue in a ranked performance list. Bars compare quantities to the largest entry in this list, not to stock levels. No fabricated product photographs.
- Gross profit/HPP, stock/opname/EDC follow-up and activity remain visible in the lower row. Refund warning, unknown HPP, no-sales, no-menu and no-activity states retained.
- Sidebar separates main modules from management links. Its filtering still comes from the existing permission-based navigation. Header/sidebar remain mounted across page navigation.
- Header search filters the already-authorized menu labels, supports Enter to open the first match, result links, no-result state, Escape and blur dismissal. Search state lives in its own component/hook, so typing does not rerender the dashboard.
- Tablet puts the featured metric above two supporting cards when space is narrow; phone stacks cards. Drawer, account, outlet controls, focus states, reduced motion and 44px mobile action targets are retained.
- Shared tokens/primitives restyle the existing forms/tables/module cards; their business data and workflows remain intact. No backend/API/Auth/RBAC/store migration, dependency installation, external payment or POS change.

## Validation

ESLint, TypeScript, all 12 existing tests and the production review build passed. Browser tests run the real Next.js app against an isolated loopback fixture backend, not hosted Supabase. Search, persistent shell, selected navigation, sidebar collapse/drawer, outlet switching, readable amounts and page overflow are checked. Screenshots are ignored local artifacts in .taste-skill/reference-refresh/.

Taste is applied to hierarchy, composition, colour, typography, copy, interactions and responsive review. Its marketing-specific hero/section/photo-moment requirements do not replace the root operational ERP requirements. Automated marketing gate results are reported separately; no full marketing gate PASS is claimed.

No claims of hosted transaction verification, field latency or FPS improvements. Shared root documentation remains outside the ERP repository and requires separate version-control ownership.


Production browser review: desktop search/navigation and tablet search/drawer checks passed; phone drawer and outlet switching passed after allowing interaction checks to finish before screenshot scrolling. Final screenshot widths: 390, 768, 1024, 1440 and 1920; 820 was also reviewed during iteration. Three-run production performance audit at 1440/390: 0 FAIL, 2 WARN for parsed JavaScript (about 881 KiB at each width). No WebGL, new image payload, layout shift or broken request failure. These are local fixture measurements, not hosted or field-performance claims.


## Automated visual gate

`GATE: OPEN 21 (rounds used up)`. No full gate PASS is claimed. The gate expects a marketing hero, screen-height sections, all headings on marketing wrap edges, promotional imagery and figures smaller than section labels. Those requirements conflict with the supplied operational-dashboard composition.

Other reported checks need context: DK is a brand mark (white on orange, logo text contrast exception); the helper line is 5.43:1, above WCAG AA normal-text contrast but below the kit's 7:1 body target. The header search has an associated screen-reader label and the reference's visible search placeholder; its focus ring is drawn on the field wrapper through :focus-within rather than on the input. The checker flags those input-only styles. This is not a claim of a full accessibility audit.

Applied local waivers remain moment-none (avoid decorative marketing moments in an operational app) and container (retain the persistent Next.js app shell). Historical login-specific waivers do not match and are ignored. No kit file or checker was modified.

Open findings reported by the tool:

- `fold-cut`: div.dashboard-secondary-grid > section.ui-card:nth-of-type(1) > div.dashboard-section-heading > h2 "Estimasi laba kotor"
- `fold-cut`: section.ui-card:nth-of-type(2) > div.dashboard-section-heading > div > h2 "Perlu ditindaklanjuti"
- `fold-cut`: section.ui-card:nth-of-type(3) > div.dashboard-section-heading > div > h2 "Aktivitas operasional"
- `no-visual`: main#main-content > div.space-y-6 "Ringkasan hari ini"
- `copy-headline`: div.space-y-6 > div.flex.flex-wrap > div > h1.type-28-semibold.tracking-tight "Ringkasan hari ini"
- `heading-scale`: li.menu-performance-row:nth-of-type(1) > div.min-w-0.flex-1 > div.flex.flex-wrap > h3.type-14-semibold "Nasi goreng ayam"
- `text-contrast`: aside#erp-desktop-sidebar > a.erp-sidebar-brand > span.erp-brand-mark "DK"
- `text-contrast`: div.space-y-6 > div.dashboard-secondary-grid > section.ui-card:nth-of-type(1) > p.mt-6.type-13-regular "Pendapatan setelah diskon, sebelum pajak"
- `field-label`: div.hidden.w-64 > form.erp-search > div.erp-search-field > input
- `focus-visible`: div.hidden.w-64 > form.erp-search > div.erp-search-field > input
- `moment-none`: (the page)
- `hero-screen`: main#main-content > div.space-y-6 "Ringkasan hari iniMinggu, 8 November 202"
- `section-height`: main#main-content > div.space-y-6 "Ringkasan hari iniMinggu, 8 November 202"
- `one-section`: main#main-content > div.space-y-6 "Ringkasan hari iniMinggu, 8 November 202"
- `one-heading`: div.space-y-6 > div.dashboard-metrics > section.dashboard-metric:nth-of-type(1) > h2.dashboard-metric-label "Pendapatan bersih"
- `container-edges`: main#main-content > div.space-y-6 "Ringkasan hari iniMinggu, 8 November 202"
- `container-edges`: div > div.min-h-dvh.bg-background > div.erp-shell-body > header.sticky.top-0 "Cari menu ERPOperasionalRingkasanOutlet "
- `container-edges`: div "Lewati navigasiDKDapur KeluargaManajemen"
- `container-edges`: div.space-y-6 > div.dashboard-metrics > section.dashboard-metric:nth-of-type(3) > h2.dashboard-metric-label "Rata-rata transaksi"
- `container-edges`: section.ui-card:nth-of-type(3) > div.dashboard-section-heading > div > h2 "Aktivitas operasional"
- `container-edges`: section.ui-card:nth-of-type(2) > div.dashboard-section-heading > div > h2 "Performa menu"
- `heading-scale`: div.space-y-6 > div.dashboard-metrics > section.dashboard-metric:nth-of-type(1) > p.mt-3.break-words "Rp3.840.000"
- `container`: page

Remaining warning families include marketing CTA/copy/share tags, fold/action positioning and kit-specific skip-link placement. The app retains its skip-to-main link and private noindex pages.
