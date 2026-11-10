# Family Restaurant ERP

## Struktur dan alur akses data

Project memakai Next.js Pages Router dengan source di `src/`. Semua path berikut relatif terhadap root project ERP.

Alur yang wajib digunakan:

```text
src/pages/ dan komponen
  → src/controller/ (React hooks)
  → src/services/ (Axios)
  → src/pages/api/ (Next.js API handlers)
  → Supabase
```

- **`src/pages/api/`**: tempat seluruh query dan mutation data Supabase. Gunakan client server per request dengan sesi pengguna, validasi input dan otorisasi pada handler. Pertahankan RLS/RBAC; jangan memakai service-role key untuk melewati hak pengguna. Operasi bisnis atomik memanggil RPC database yang sesuai.
- **`src/services/`**: fungsi pemanggilan endpoint API ERP menggunakan Axios, melalui instance `src/lib/http.ts`. Service menangani transport HTTP, parameter dan tipe response; tidak melakukan query Supabase langsung atau menggunakan React hooks.
- **`src/controller/`**: custom hooks yang mengatur `useQuery`, `useMutation`, query key, invalidasi cache, status loading/error, serta mapping response menjadi data yang dibutuhkan halaman. Controller memanggil service; tidak mengakses Supabase atau menjalankan request Axios langsung.
- **`src/pages/`**: menyusun tampilan dan memanggil hooks dari controller. Hindari query/mutation Supabase, pemanggilan Axios/service, definisi React Query dan mapping response API langsung di halaman atau komponen tampilan. Halaman API di `src/pages/api/` merupakan layer backend pada alur di atas.
- Mapping untuk presentasi berada di controller; validasi keamanan, perhitungan bisnis otoritatif dan keputusan hak akses tetap dilakukan pada API/database. State UI lokal dapat menggunakan TanStack Store; data server dan siklus query/mutation menggunakan React Query pada controller.
- Arah dependensi harus mengikuti alur tersebut. Service tidak mengimpor controller/pages, dan API handler tidak mengimpor hooks atau komponen UI.

Kelompokkan file menurut fitur agar mudah ditelusuri, misalnya:

```text
src/pages/api/menu/index.ts
src/services/menu.service.ts
src/controller/menu/use-menu.ts
src/pages/menu/index.tsx
```

Aturan ini berlaku untuk implementasi berikutnya. Jangan merombak kode yang sudah ada di luar lingkup tugas hanya untuk menyesuaikan struktur.

## Penempatan komponen

- Form dengan banyak bagian, baris dinamis, atau unggahan dokumen memakai halaman/rute tersendiri dengan navigasi kembali ke daftar. Form singkat memakai modal yang aksesibel (fokus terkurung, Escape, fokus kembali ke pemicu). Jangan menampilkan form tambah/edit di atas tabel daftar. Gunakan komponen bersama `FormPageFrame` dan `FormModal`; pertahankan guard akses dan validasi API saat memisahkan tampilan. Selama penyimpanan, cegah penutupan modal dan navigasi kembali dari form.

- **`src/components/shared/`**: komponen yang dapat digunakan kembali lintas halaman/fitur. Gunakan props yang jelas dan hindari ketergantungan pada satu halaman tertentu.
- **`src/components/custom/`**: komponen khusus satu halaman/fitur yang dipecah agar file halaman tetap ringkas. Kelompokkan per fitur, misalnya `src/components/custom/menu/menu-table.tsx`.
- Jika komponen custom kemudian dibutuhkan beberapa halaman, pindahkan ke shared dan sesuaikan API props-nya. Jangan menduplikasi komponen yang sudah tersedia.
- Kedua kelompok komponen menerima data dan callback dari halaman/controller; jangan membuat jalur akses API/Supabase tersendiri di dalam komponen.

## Custom hooks, interfaces, dan stores

- **`src/hooks/`**: tempat custom hooks untuk logika komponen, seperti state interaksi, form, filter, modal, event handler dan effect. Ekstrak logika yang mulai menumpuk atau digunakan kembali agar file komponen berfokus pada tampilan dan mudah dibaca. Kelompokkan hooks khusus fitur dalam subfolder, misalnya `src/hooks/menu/use-menu-filters.ts`.
- Hooks di `src/hooks/` boleh menyusun hooks controller untuk kebutuhan interaksi komponen. Definisi React Query, mutation API dan mapping response tetap berada di `src/controller/`; jangan memindahkannya ke hooks UI atau memanggil service/Axios/Supabase langsung dari hooks UI.
- **`src/interfaces/`**: tempat deklarasi `type` dan `interface` aplikasi, termasuk props komponen, nilai form, state store, model tampilan, serta request/response API. Kelompokkan menurut fitur atau tanggung jawab, misalnya `src/interfaces/menu.ts` dan `src/interfaces/erp-ui.ts`, lalu gunakan `import type` pada pemakainya. Hindari deklarasi tipe aplikasi yang tersebar di file komponen, hooks, controller, service atau store.
- Jangan menduplikasi tipe yang sudah disediakan library atau dihasilkan dari schema. Reuse/import tipe tersebut; tempatkan alias atau perluasan tipe aplikasi yang diperlukan di `src/interfaces/`. Pertahankan file deklarasi/generated yang lokasinya diwajibkan framework atau alat pembangkit tipe.
- **`src/stores/`**: tempat seluruh definisi TanStack React Store, factory store, context/provider khusus store, selector, hook akses store dan action pembaruan state. Tipe state/props-nya tetap dideklarasikan di `src/interfaces/`. Kelompokkan store per tanggung jawab; jangan membuat store di file halaman, komponen, controller atau hooks UI.
- Provider aplikasi boleh menyusun provider store dari `src/stores/`. Pada SSR, buat instance store per aplikasi/request, bukan singleton server lintas pengguna. Gunakan store untuk state UI/client; cache data server tetap dikelola React Query pada controller.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
