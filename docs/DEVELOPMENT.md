# Development & verification

For a product overview, see the [README](../README.md). Follow [AGENTS.md](../AGENTS.md) when implementing changes.

## Backend prerequisites

This repository contains the Next.js ERP. Database migrations, SQL tests, shared contracts, and editable designs are maintained in the parent restaurant-system workspace, outside this standalone repository.

An operational backend needs the schema and Auth/RBAC baseline, followed by dashboard, employee, purchasing, invoice Storage, inventory, recipe/HPP, and finance migrations. Follow the workspace's Supabase documentation for their order and preserve applied migration history. Do not run the initial installer against an existing database.

| Workspace location | Responsibility |
| --- | --- |
| `supabase/migrations/` | Schema, authorization, Storage policies, and business RPCs |
| `supabase/README.md` | Installation and deployment notes |
| `supabase/tests/` | SQL authorization and business-invariant checks |
| `supabase/scripts/validate_migration.py` | Isolated PostgreSQL validation harness |
| `family-restaurant-shared/contracts/` | Shared business contracts |
| `design-artifacts/` | Editable designs and review outputs |

These are workspace-relative paths, not files bundled with the standalone clone.

## Environment and access

Copy the [empty environment template](../.env.example) to `.env.local`. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for an authorized backend. Restart development after changes and configure values before a production build.

`SUPABASE_SECRET_KEY` is reserved for future server-side Auth administration. Current business flows do not require it. Keep secret/service-role keys out of public environment variables and source files.

The server verifies the Supabase Auth identity and calls `my_access()` with the user's session. ERP admission requires an active **Pemilik** or **Manajer** assignment on an authorized outlet. Page guards, API handlers, and database operations enforce module permissions; admission does not grant every mutation.

An Auth account needs an active profile linked through `auth_user_id` and the appropriate role assignment. Adding an employee profile does not automatically create an Auth login. Logging out clears the query cache and selected outlet.

The selected outlet is a UI preference in sessionStorage and TanStack Store, not authorization evidence. Query keys include outlet scope; the application does not persist its React Query cache to disk.

## Implementation conventions

```text
Pages / components
  -> Controller hooks (React Query)
  -> Services (Axios)
  -> pages/api (validation and Supabase access)
  -> Authorized database RPCs
```

Keep UI/form behavior in `src/hooks`, types in `src/interfaces`, and UI stores in `src/stores`. Use `FormPageFrame` for long forms and `FormModal` for short forms. Custom dropdowns support keyboard interaction and dialogs; use Iconsax components for icons. See the [style guide](../src/styles/README.md) for shared tokens and classes.

## Business behavior

| Area | Current behavior |
| --- | --- |
| Employees | Automatic employee codes; profiles, roles, status, and cashier PIN actions. Linked identities and referenced history limit deletion. |
| PINs | Six digits with confirmation; weak patterns rejected; bcrypt hashes stored privately. Configured PINs cannot be read back. |
| Purchases | Received goods only. Posting creates stock/value changes, payables, and balanced journals atomically. Payment can be immediate or later, in full. |
| Evidence | Private PDF/JPG/PNG files, up to 8 MB. Signed downloads expire after 60 seconds. Posted purchases are not edited/deleted through the UI. |
| Inventory | Counts snapshot stock before physical entry. Review requires permissions, and creators cannot approve their own documents. |
| Recipe HPP | Weighted-average ingredient balances; missing costs are incomplete, not zero. Saved snapshots preserve their historical values. |
| Production | Drafts have no stock effect. Completion consumes inputs and creates output at the same total value, with a balanced journal. |
| Finance | Capital, transfers, expenses, journals, and bank reconciliation. Bank imports do not change book balances or verify POS payments. |

Supported posting operations use idempotency guards. After an ambiguous timeout, inspect the record before changing the payload or starting a new transaction. Closed accounting periods reject financial posting.

Bank CSV uses `id,tanggal,jumlah,referensi,keterangan`, up to 100 rows / 150 KB. IDs must be stable per bank account. Amounts use a decimal point without thousands separators; outgoing funds are negative. Matching supports partial allocations with equal bank/book totals and the same direction. Record missing bank fees as expenses before matching.

Uploads precede posting. Cancelled forms or failed posts can leave unattached files; scheduled orphan-file cleanup is not implemented. Other current boundaries include supplier installments, posted-document reversals, automated bank/provider connections, and POS recipe consumption.

## Verification

### Application checks

Run from the ERP repository:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

### API and validation tests

Tests use the real Supabase SDK against local fake HTTP services with synthetic identities and credentials. Coverage includes Auth/session handling, CSRF, permissions, outlet scoping, safe errors, validation, and upload constraints.

For Bash or a shell that expands file globs:

```bash
node --test tests/*.test.mjs
```

For PowerShell:

```powershell
$testFiles = Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object FullName
node --test $testFiles
```

There is no `npm test` script; invoke the test runner directly.

### Browser review with demo data

The harness copies the application into a temporary sibling workspace directory and uses loopback services with fixtures. It does not copy `.env.local`. It requires installed dependencies and permission to create a dependency symlink/junction.

For Bash:

```bash
REVIEW_STATIC=1 node tests/support/review-dashboard.mjs
```

For PowerShell:

```powershell
$env:REVIEW_STATIC = '1'
node tests/support/review-dashboard.mjs
```

Open the printed URL. `REVIEW_STATIC=1` allows manual navigation without the harness's automatic assertions. Use Ctrl+C to stop it. Review copies, screenshots, and browser state are local artifacts. The two images under `docs/images` were selected from this fixture environment for public documentation.

### Database checks

The workspace validator starts its own temporary PostgreSQL cluster to check schema, permissions, idempotency, journals, inventory valuation, and state transitions. Follow the workspace documentation to run it. Never run platform stubs or fixture SQL against an existing or hosted restaurant database.

Mock/API tests and local SQL checks do not verify hosted Auth, Storage, or deployment configuration. Validate those separately against an authorized environment.
