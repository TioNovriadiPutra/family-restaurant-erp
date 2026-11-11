# Modern Hospitality ERP review

`GATE: OPEN 14 (rounds used up)` after three visual-gate rounds. Remaining marketing-layout findings and the two applied waivers are explained below.

10 November 2026. Scope: semantic CSS foundations, shared app shell and daily dashboard. Reference: root AGENTS.md Modern Hospitality extension and the existing Taste skill. No new dependency, backend, authorization or database change.

## Direction

Software application for restaurant owners/managers. Warm stone, white surfaces and forest green; one Inter family, existing semantic statuses, restrained borders and focus/hover states. Revenue is the featured metric, with paid orders, average order and gross-profit context. Stock, opname and EDC attention counts remain actual API values. No invented comparisons, photos, customers or marketing copy.

Persistent sidebar/header, active navigation, outlet and account controls remain functional. Layout adapts to desktop, tablet drawer and phone; metrics use four columns on wide screens, two below 1400px and one below 480px. Tablet/phone content actions are at least 44px high. Existing RBAC filters and server authorization are preserved. Shared colour foundations also affect forms/tables in other modules; detailed compositions of those modules have not been redesigned. POS adaptation is a subsequent task.

## Checks

- ESLint, TypeScript, all 12 existing tests and production builds passed.
- Real Next.js review app uses a fake Supabase backend bound to loopback with fixture users/data. No hosted database or credentials are used by this harness. Run `node tests/support/review-dashboard.mjs`; set REVIEW_PRODUCTION=1 to build and run its production variant.
- Browser review through Taste headless scripts passed: header alignment/Iconsax icons, persistent shell and collapsed state across navigation (desktop), modal navigation opening/closing (tablet/phone), distinct data after switching outlets, no page overflow and unbroken metric amounts. Functional widths: 390, 768, 820, 1024 and 1440; visual review also at 1920. Screenshots are local ignored artifacts under `.taste-skill/hospitality/`.
- Prefetch disabled on sidebar and dashboard module links to avoid fetching all visible modules at initial load. Pages Router still prefetches on hover; client navigation remains. Three-run production audit at 1440/390: zero FAIL, two WARN (parsed JavaScript about 871 KiB per viewport). No image, font, CSS, broken-request, WebGL or layout-shift failure. This is local fixture/CPU evidence, not a field latency or FPS benchmark. Earlier development results include development tooling overhead and are not production measurements.

## Taste gate limitations

The visual gate includes marketing-specific checks incompatible with the root operational ERP requirements. Do not claim a full visual gate PASS. Open findings cover: no-visual (the checker expects promotional media despite a real chart/table UI), copy-headline (expects a category being sold), heading-scale (expects figures no larger than section labels), hero-screen, section-height, one-section, one-heading, container-edges (expects full-width marketing wraps and aligned marketing headings instead of an app sidebar and data grid), and row-lines (requires equal height despite distinct table/activity contents). The small-text contrast finding was fixed by darkening the muted token.

Existing local waivers for moment-none and container were updated to explain the operational app requirements: no decorative marketing moment, and an existing persistent application container rather than the kit wrap class. Older authentication-specific waivers do not match the current dashboard and are ignored. No blanket waiver or checker modification was added. Remaining warning families include marketing CTA/copy length/share metadata and kit-specific skip-link placement; the application retains its skip-to-main link and noindex authenticated pages.

The standalone layout checker also errored on this app structure (`sections is not iterable`); this was not reported as a successful layout check. Responsive behavior was inspected through screenshots and the working review-app interaction checks instead.

## Delivery boundaries

This first refresh establishes the shell, foundations and dashboard. Login and other modules inherit semantic theme changes; their feature-specific layouts remain. No hosted end-to-end authorization or transaction test is claimed. Shared root design docs remain outside the ERP Git repository and require separate version-control ownership for team distribution.
