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


## UI redesign dan skill Taste

- Selalu baca dan gunakan `../.agents/skills/design-taste-frontend/SKILL.md` untuk pekerjaan frontend, sesuai permintaan pengguna. Baca juga Modern Hospitality Design System di `../AGENTS.md`. Terapkan pada aplikasi operasional dengan mempertahankan alur/API/RBAC; pola landing page tidak boleh menggantikan workflow aplikasi.
- Fondasi refresh ERP dan status penyelarasan POS dicatat di `../family-restaurant-shared/design/HOSPITALITY-REFRESH.md`. Gunakan token semantik di `src/styles/globals.css`, komponen bersama, Iconsax, dan state aksesibel.


- Untuk konsistensi seluruh halaman ERP, gunakan `PageTitle`, `SectionTitle`, dan `PageHeader` dari `src/components/shared/page-heading.tsx`. Gunakan recipe `ui-form`/`ui-form-panel`, `ui-filter-bar`, `ui-table`, serta FormPageFrame/FormModal yang ada. Skala UI: judul 28px/24px mobile, judul bagian 18px, isi/tabel 14px, bantuan 13px. Jangan menambahkan `text-xs`, ukuran heading lokal, font family kedua atau primitive visual duplikat tanpa kebutuhan yang jelas.
