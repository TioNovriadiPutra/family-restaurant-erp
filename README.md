<div align="center">

# Family Restaurant ERP

### Ingredients, recipes, and finance in one back office.

A restaurant management application for **Dapur Keluarga**, connecting purchasing, inventory, recipe costing, kitchen preparation, and financial records.

[![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=flat-square&logo=nextdotjs)](package.json)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](src/styles/globals.css)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%26_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](src/lib/supabase/config.ts)

[Features](#features) · [Technology](#technology) · [Architecture](#architecture) · [Getting started](#getting-started)

<img src="docs/images/finance-overview.png" alt="Dapur Keluarga ERP: cash and bank balances with a transaction ledger" width="100%" />

*Application preview using local demo data. The interface is in Indonesian.*

</div>

## About the project

Family Restaurant ERP is the web back office of a small family restaurant system. It helps owners and managers follow ingredients from supplier invoices to stock, recipes, prepared ingredients, and operating costs.

The application uses **Next.js Pages Router** with **Supabase** as its primary backend. PostgreSQL RPCs handle atomic business operations, while Supabase Auth and private Storage handle identities and transaction evidence. The tablet POS is a separate application.

## Explore the application

| Module | What you can do | Route |
| --- | --- | --- |
| Overview | Review sales indicators, low stock, and operational activity | `/` |
| Employees | Manage employee profiles, roles, status, and cashier PINs | `/karyawan` |
| Purchasing | Manage suppliers, record received ingredients, attach invoices, and track payment | `/pembelian` |
| Inventory | Manage materials and units, inspect balances, count physical stock, and review adjustments | `/persediaan` |
| Recipes & costing | Build recipe versions, inspect costs, save HPP snapshots, and record ingredient production | `/resep` |
| Finance | Manage cash/bank accounts, expenses, supplier payments, journals, and bank reconciliation | `/keuangan` |

Business screens require sign-in and the appropriate permissions. Employee creation stores a profile; linking a Supabase Auth login is a separate step.

## Features

- **Received purchases → stock** — record an invoice once and increase ingredient quantities and inventory value together. Purchases can be paid or unpaid; later settlement does not add stock again.
- **Inventory control** — material masters, unit conversions, minimum stock levels, movement history, physical counts, waste, and reviewed stock corrections.
- **Recipe costing** — ingredient composition, net yield, versioned recipes, weighted-average ingredient costs, reference selling prices, and saved historical HPP snapshots.
- **Ingredient production** — record actual consumption and output for prepared ingredients, then post stock movements and balanced journal entries together.
- **Financial records** — cash/bank balances, owner capital, internal transfers, operating expenses, supplier settlement, and journal details.
- **Bank reconciliation** — import a standard CSV, skip duplicate transaction IDs, and match full or partial allocations between bank and book records.
- **Role-based access** — ERP sign-in is restricted to owners and managers. Module permissions and outlet scope are checked again on the server and in database operations.
- **Private evidence** — invoices and expense receipts use private Storage with short-lived download URLs. PDF, JPG, and PNG uploads are limited to 8 MB.
- **Readable workflows** — long forms have dedicated pages; short forms use accessible dialogs. Shared layouts, custom dropdowns, and reusable components keep navigation consistent.

<details>
<summary><strong>Preview: recipe editor</strong></summary>

<br />

<img src="docs/images/recipe-editor.png" alt="Recipe editor with ingredient composition, net yield, and target food cost" width="100%" />

*A dedicated form page keeps recipe composition separate from the list view.*

</details>

### Implementation status

Employee, purchasing, inventory, recipe/production, and finance workflows are implemented. The application remains under active development.

The **Reports** and **Settings** menus currently contain navigation/design placeholders. POS ordering, payment-provider integration, and consumption of recipe ingredients during POS sales belong to separate implementation work. Current HPP estimates describe recipe costs; they are not a completed actual-sales profitability report.

## Technology

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16, Pages Router, Turbopack |
| Interface | React 19, TypeScript, Tailwind CSS 4, Inter |
| Backend | Next.js API routes and Supabase PostgreSQL RPCs |
| Authentication & files | Supabase Auth, cookie-based sessions, private Storage |
| Server state | TanStack React Query |
| UI state | TanStack React Store |
| Forms | React Hook Form |
| HTTP client | Axios |
| Animation & icons | Motion and Iconsax |
| Validation | Node.js API tests, isolated PostgreSQL checks, Playwright browser reviews |

Exact versions are recorded in [package.json](package.json) and [package-lock.json](package-lock.json).

## Architecture

```mermaid
flowchart LR
    UI[Pages and components] --> Hooks[Controller hooks]
    Hooks --> Service[Axios services]
    Service --> API[Next.js API routes]
    API --> Auth[Supabase Auth]
    API --> RPC[Authorized database RPCs]
    RPC --> DB[(PostgreSQL)]
    API --> Storage[Private Storage]
```

- **Pages and components** render the interface; UI/form behavior lives in feature hooks.
- **Controllers** manage React Query requests, mutations, cache invalidation, and response mapping.
- **Services** call application APIs through the shared Axios client.
- **API routes** validate requests, verify sessions and permissions, and access Supabase with the user's session.
- **Database RPCs** validate business references and post related stock, money, journal, and audit records atomically.

See [AGENTS.md](AGENTS.md) for implementation conventions and [the development guide](docs/DEVELOPMENT.md) for backend prerequisites and verification details.

### Project structure

```text
.
|-- docs/                     # Development guide and demo screenshots
|-- public/                   # Public application assets
|-- src/
|   |-- components/
|   |   |-- custom/           # Employee, purchasing, inventory, recipe, finance UI
|   |   `-- shared/           # Reusable fields, dropdowns, dialogs, tables
|   |-- controller/           # React Query hooks and response mapping
|   |-- hooks/                # Form logic and local interactions
|   |-- interfaces/           # DTOs, form values, and component props
|   |-- lib/                  # Access checks, validation, server helpers
|   |-- pages/
|   |   |-- api/              # Auth and business API handlers
|   |   |-- karyawan/
|   |   |-- pembelian/
|   |   |-- persediaan/
|   |   |-- resep/
|   |   `-- keuangan/
|   |-- providers/            # Query, store, and motion providers
|   |-- services/             # Axios API functions
|   |-- stores/               # TanStack Store UI state
|   `-- styles/               # Global tokens and Tailwind recipes
|-- tests/                    # API tests and local browser fixtures
`-- .env.example              # Empty environment template
```

## Getting started

### Requirements

- Node.js **20.9 or later**, using a supported LTS release.
- npm and Git.
- A configured Supabase backend and an authorized ERP account.

### 1. Install

```bash
git clone https://github.com/TioNovriadiPutra/family-restaurant-erp.git
cd family-restaurant-erp
npm ci
```

### 2. Configure the environment

Copy [.env.example](.env.example) to `.env.local`, then fill in the project URL and publishable key for your authorized development backend:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The current business flows use the authenticated user's session. `SUPABASE_SECRET_KEY` in the template is reserved for future server-side Auth administration and can remain empty.

Backend schema, RPC migrations, and owner bootstrap are maintained in the parent restaurant-system workspace and are **not included in this standalone ERP repository**. Coordinate backend setup with the maintainer; connecting to an empty Supabase project alone will not create the required tables or permissions.

### 3. Start development

```bash
npm run dev
```

Open **http://localhost:3000** and sign in through `/login`. Your Auth account must be linked to an active employee profile with an authorized owner/manager role.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Validate TypeScript and create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript without generating files |

API tests and fixture browser reviews are documented in [Development & verification](docs/DEVELOPMENT.md#verification).

## Design system

The interface uses a sage-green palette, neutral surfaces, Inter typography, and shared form/table styles. Tokens and Tailwind component recipes live in [globals.css](src/styles/globals.css), with examples in [the style guide](src/styles/README.md).

The header and sidebar share a persistent ERP layout across page transitions. Common controls live in `components/shared`; feature-specific sections live in `components/custom`. Form interactions, interfaces, and UI stores each have their own folders.

## Deployment

Deploy using a **Next.js server runtime**, such as Vercel or a Node.js host:

1. Install dependencies using the committed npm lockfile.
2. Configure the authorized Supabase environment variables before building.
3. Run `npm run build` and use the platform's Next.js runtime, or `npm start` on a Node.js host.
4. Verify login, route permissions, API requests, and private file downloads against the configured backend.

The application uses API routes and server-side session checks; static export is not supported by these workflows. Changes to `NEXT_PUBLIC_*` values require a rebuild.

## Security & repository scope

- Commit the empty `.env.example`; keep local environment values, secret keys, tokens, and authenticated browser sessions private.
- The public repository contains application source and reviewed demo screenshots. Local review artifacts, backups, and tool configuration are excluded by `.gitignore`.
- ERP access uses Supabase Auth, scoped permissions, RLS, and guarded business RPCs. The current business APIs do not use a service-role key to bypass user authorization.
- Employee profiles and cashier PIN administration are separate from provisioning a new Supabase Auth login.

## Maintainer

Developed by [Tio Novriadi Putra](https://github.com/TioNovriadiPutra).

No open-source license has been declared in this repository.

<div align="center">

[Getting started](#getting-started) · [Development guide](docs/DEVELOPMENT.md) · [Back to top](#family-restaurant-erp)

</div>
