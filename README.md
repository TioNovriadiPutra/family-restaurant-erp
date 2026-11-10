# Family Restaurant ERP

Next.js Pages Router, React dan TypeScript. Gunakan npm dan lockfile lokal repository ini. Desain bersama berada di `../design-artifacts/`; migrasi database di `../supabase/`.

## Setup Supabase

Isi `.env.local` di root project ERP (template tersedia di [.env.example](.env.example)):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Ambil Project URL dan publishable key dari dashboard project Supabase. Kedua nilai ini untuk klien publik; jangan memasukkan secret/service-role key. `.env.local` diabaikan Git. Restart development server setelah mengubah environment. Untuk deployment, set environment yang sama lalu build ulang karena NEXT_PUBLIC dibundel saat build.

Client dibuat saat diperlukan, sehingga halaman scaffold dan production build dapat berjalan sebelum kredensial diisi. Fitur yang benar-benar memanggil Supabase memerlukan kedua variabel. Koneksi ke project cloud belum diuji karena kredensial belum diberikan.

## Fondasi library

Design system FigCraft tersedia di `src/styles/globals.css`: seluruh 42 token, 13 style tipografi dan recipe komponen Tailwind v4. Lihat [panduan class dan contoh pemakaian](src/styles/README.md). Inter sudah dimuat global; gunakan token semantic dan class `ui-*` untuk komponen berikutnya.

| Kebutuhan | Paket / lokasi |
|---|---|
| Supabase SDK dan cookie SSR | `@supabase/supabase-js`, `@supabase/ssr`; `src/lib/supabase/` |
| Query, mutation, cache server data | `@tanstack/react-query`; `src/lib/query-client.ts` |
| UI state lokal | `@tanstack/react-store`; `src/stores/erp-ui-store.tsx` |
| Form | `react-hook-form`, logika `useForm` di `src/hooks/` |
| Request HTTP API aplikasi | `axios`; instance `httpClient` dari `src/lib/http.ts` |
| Ikon UI | `iconsax-reactjs`; komponen React dengan variant `Linear`, tanpa file SVG/image atau glyph teks sebagai ikon |
| Animasi | `motion`, import dari `motion/react` |

`src/providers/app-providers.tsx` terpasang melalui `_app.tsx`: QueryClient per app/request, HydrationBoundary, Store per app, serta MotionConfig yang mengikuti preferensi reduced motion pengguna. Saat logout atau identitas akun berubah, query cache dibersihkan dan pilihan outlet direset. Query cache tidak dipersistenkan; sesi Supabase menggunakan cookie.

## Login dan alur akses data

Buka `/login` setelah menjalankan `npm run dev`. Halaman mengikuti frame **ERP 58 · Masuk ke ERP** di FigCraft dan memakai token Tailwind global.

1. Isi email dan kata sandi akun Supabase Auth.
2. Server memverifikasi akun dan memanggil `my_access()` menggunakan sesi pengguna.
3. Pilih outlet yang diizinkan, lalu klik **Lanjut ke ERP**.
4. Halaman `/` memverifikasi sesi di server dan menampilkan dashboard operasional sesuai desain ERP 01 FigCraft.
5. **Keluar dari ERP** mengakhiri sesi perangkat ini dan membersihkan cache aplikasi.

Akun harus sudah memiliki profil `public.users` aktif dengan `auth_user_id` yang cocok, serta penugasan `user_outlet_roles` ke outlet aktif dan role dalam restoran yang sama. Buat akun di Supabase **Authentication → Users**, konfirmasikan email jika diperlukan, lalu gunakan bootstrap owner/RPC administrasi yang disediakan migrasi. Membuat akun Auth saja belum memberikan akses aplikasi. Kedua migrasi di `../supabase/migrations/` (atau installer gabungan) harus sudah diterapkan.

ERP hanya menerima role **Pemilik** dan **Manajer**, dibaca dari `my_access()` di server. Kasir, Staf Gudang dan role lainnya ditolak saat login, pembacaan sesi, akses langsung halaman serta API dashboard. Penugasan outlet dengan role selain kedua role ERP dibuang dari response. Permission modul tetap diperiksa per outlet; nama role tidak menggantikan pemeriksaan permission atau RLS. POS tidak diubah oleh pembatasan aplikasi ERP ini.

Pilihan outlet adalah preferensi UI di sessionStorage dan TanStack Store, bukan bukti otorisasi. Seluruh API bisnis berikutnya wajib memvalidasi izin dan outlet melalui sesi/RLS/RBAC.

Alur implementasi mengikuti AGENTS.md:

| Layer | File |
|---|---|
| Halaman | `src/pages/login.tsx`, `src/pages/index.tsx` |
| Komponen login | `src/components/custom/auth/login-form.tsx` |
| Form dan interaksi | `src/hooks/auth/` |
| React Query dan mapping | `src/controller/auth/use-auth.ts` |
| Axios | `src/services/auth.service.ts` |
| Supabase Auth dan query akses | `src/pages/api/auth/[action].ts` |
| Kontrak TypeScript | `src/interfaces/auth.ts` |

Endpoint:

- `POST /api/auth/login`: body `{ email, password }`, response `{ session: { user: { id, email }, access } }`.
- `GET /api/auth/session`: memverifikasi identitas melalui Auth `getUser()`, lalu membaca akses terbaru.
- `POST /api/auth/logout`: logout scope `local`.

POST memerlukan JSON dan header Origin dengan host yang sama. Service Axios dari browser mengirimnya secara otomatis. Response memakai private/no-store; token dikirim oleh SDK melalui cookie, bukan JSON atau page props. Tidak ada service-role key. Error Auth disederhanakan dan kata sandi dihapus dari form/mutation setelah request selesai. Supabase tetap menangani pembatasan percobaan login di layanan Auth.

Pada SSR, halaman utama memakai `readAuthSession()` yang diekspor module API agar query Supabase tetap terpusat di `pages/api`. Ini guard server; interaksi client tetap melalui controller → service → API. Browser client yang tersedia dipakai provider untuk subscription perubahan sesi, bukan query data langsung dari komponen.


## Home, layout persisten dan migrasi dashboard

Jalankan [migrasi dashboard](../supabase/migrations/20261108020000_erp_dashboard.sql) satu kali di Supabase SQL Editor setelah dua migrasi sebelumnya. Untuk project yang sudah terpasang, **jangan menjalankan ulang installer/schema awal**. Tanpa RPC baru ini login tetap tersedia dan home menampilkan pesan agar administrator menerapkan migrasi.

`src/pages/_app.tsx` menyusun `ErpLayout` di luar komponen halaman. Halaman ERP memakai properti statis `erpLayout = true` dan guard `requireErpPage(permission?)` pada `getServerSideProps`. Navigasi menggunakan `next/link`; jangan memberi `key={router.asPath}` pada layout atau mengimpor/memasang layout lagi di setiap page. React mempertahankan instance sidebar/header beserta state collapse, menu akun dan pilihan outlet ketika berpindah antarhalaman ERP. Login memakai layout tersendiri. Guard server tetap dijalankan setiap navigasi untuk memeriksa izin terbaru.

Home menampilkan kartu KPI, grafik tujuh hari, tindak lanjut, menu terlaris dan aktivitas terbaru. Data berasal dari `GET /api/dashboard?outletId=UUID` → RPC `erp_dashboard`, dengan sesi pengguna/publishable key dan RLS. Tidak ada data desain yang dipasang sebagai fallback produksi. Query key mengandung outlet dan tidak memakai data outlet sebelumnya sebagai placeholder. Permintaan diperbarui setiap menit selama halaman aktif.

Ringkasan memakai timezone outlet, tanggal `paid_at`, order non-void dengan status pembayaran paid/partially_refunded/refunded, subtotal dikurangi diskon **sebelum pajak, layanan dan retur**. Penjualan menu memakai snapshot item aktif, sebelum pajak/layanan. Terdapat peringatan bila transaksi hari ini memiliki retur. Estimasi laba menggunakan snapshot `sale_consumptions`; jika ada item tanpa snapshot HPP, order tanpa item, atau transaksi dengan retur, laba/HPP ditampilkan sebagai belum lengkap (`—`). Ini ringkasan operasional, bukan laporan laba rugi final. Angka uang dikirim sebagai string desimal dan diformat tanpa konversi seluruh nominal ke floating point.

Sidebar menyesuaikan permission outlet aktif. Persediaan, Pembelian, Resep, Keuangan, Laporan dan Pengaturan memiliki halaman menu berbentuk grid card dengan ikon Iconsax, judul dan keterangan. Card mengikuti permission outlet dan menuju route `/<module>/<section>` yang dijaga server; permission induk serta submenu harus berlaku pada outlet yang sama. Sidebar mempertahankan status aktif pada route turunan. Pengaturan tersembunyi bagi Manajer default karena tidak memiliki `organization.manage`.

Definisi submenu berada di `src/lib/module-menu.ts`, beserta node sumber FigCraft. Komponen card reusable berada di `src/components/shared/module-menu-card.tsx`, recipe `.module-menu-card` di `globals.css`. Hover pada pointer halus mengangkat card 2px, menggeser panah 3px, dan memperjelas border/shadow; keyboard mendapatkan focus ring dan reduced motion meniadakan pergerakan/transisi. Grid memakai 3 kolom desktop lebar, 2 kolom tablet, 1 kolom mobile.

Halaman operasional/CRUD pada tujuan submenu **belum diimplementasikan**, dan ditandai dengan jelas ketika dibuka.

## Karyawan

Jalankan [migrasi Karyawan](../supabase/migrations/20261108030000_employee_directory.sql) sekali setelah migrasi sebelumnya. Jangan menjalankan ulang installer awal pada database existing.

`/karyawan` menampilkan daftar per outlet dengan pencarian, filter role/status, pagination dan indikator akun login. `/karyawan/tambah` menyimpan nama, email, HP opsional, role dan status. ID dibuat otomatis saat simpan (`KRY-000001` dan seterusnya per restoran); input ID manual tidak diperlukan. Terapkan juga [migrasi ID otomatis](../supabase/migrations/20261108040000_employee_auto_code.sql) setelah migrasi direktori. Nomor lama dipertahankan. Profil baru belum memiliki akun Supabase Auth; penautan akun dibuat kemudian. Menu Aksi menyediakan Edit dan Hapus; undangan akun belum tersedia.

Daftar memerlukan `staff.read` dan `rbac.read`; penambahan juga memerlukan `staff.manage` dan `rbac.manage` pada outlet yang sama. Dengan permission bawaan, Pemilik dapat menambah dan Manajer hanya membaca. API `/api/employees` memakai sesi pengguna tanpa service-role key. RPC menyimpan profil, penugasan dan audit dalam satu transaksi, serta menolak duplikat ID/email dalam restoran.

Review browser lokal dapat dijalankan dengan `node tests/support/review-dashboard.mjs`. Harness memakai salinan aplikasi di `../design-artifacts/erp-home-review/app`, dependency yang sudah terpasang melalui junction, akun/layanan Supabase tiruan pada loopback, dan tidak membaca `.env.local` project asli. Buka URL yang dicetak untuk review. Script assertion memeriksa navigasi SPA, instance layout, collapse/menu state, drawer mobile dan pergantian outlet. Hentikan harness dengan Ctrl+C. Folder salinan review bersifat sementara dan tidak untuk distribusi/CI.

## Pemeriksaan

### PIN kasir pada Karyawan

Terapkan [migrasi PIN kasir](../supabase/migrations/20261109010000_employee_pos_pin.sql) sekali setelah migrasi sebelumnya, lalu buka `/karyawan`. Kolom PIN POS menampilkan status konfigurasi dan tombol **Atur PIN / Reset PIN** untuk Kasir aktif. Hanya pengelola dengan permission staff/rbac read/manage pada outlet tersebut yang dapat menyimpan; Manajer default hanya melihat. Dialog meminta PIN 6 angka beserta konfirmasi dan menolak pola berulang/berurutan.

PIN di-hash bcrypt cost 12 di `private.pos_pin_credentials`, tidak dibaca kembali atau dimasukkan ke audit. Penyimpanan dan audit atomik; status stale ditolak agar aksi Atur tidak menimpa PIN yang baru dibuat pihak lain. Data PIN dihapus dari form dan state mutation setelah request. Tidak memakai secret/service-role key. Migrasi menambahkan pgcrypto jika belum tersedia tanpa memindahkan instalasi existing.

Ini fitur administrasi PIN ERP. Penerbitan sesi dan verifikasi login PIN pada POS belum diimplementasikan, dan penambahan profil tetap tidak membuat akun Supabase Auth.

```bash
npm run lint
node --test tests/auth-api.test.mjs tests/employees-api.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Setup ini sudah lolos lint, TypeScript dan production build tanpa kredensial cloud. Smoke check memakai SDK aktual dan respons Auth tiruan untuk memeriksa penulisan cookie/header, validasi environment, serta isolasi sesi/cache antar-request. Login nyata, policy remote dan koneksi project Supabase belum diuji.

Audit npm saat pemasangan melaporkan 8 temuan moderate pada rantai tooling ESLint/TypeScript yang sudah digunakan project. Paket runtime baru tidak masuk daftar temuan tersebut. Tidak menjalankan audit fix --force karena saran npm mengubah versi mayor konfigurasi Next.js.

## Keuangan

Menu `/keuangan` menyediakan Kas & Bank, Pembayaran Supplier, Pengeluaran Operasional, Jurnal Umum, dan Rekonsiliasi Bank. Memakai RPC Supabase berizin melalui `/api/finance`; client tidak menulis langsung ke tabel. Migrasi `20261109144948_finance_workflows.sql` sudah diterapkan pada project terhubung. Lihat [kontrak dan batasan Keuangan](../family-restaurant-shared/contracts/finance.md).

Form panjang mempunyai rute sendiri (`/keuangan/pengeluaran/form`, `/keuangan/rekonsiliasi/impor`, `/keuangan/rekonsiliasi/cocokkan`); rekening, kategori, modal dan transfer memakai modal. Bukti pengeluaran wajib berupa PDF/JPG/PNG maksimal 8 MB di Storage private. Pelunasan supplier mengikuti pembelian dan tidak menambah stok kembali. Impor CSV memakai header `id,tanggal,jumlah,referensi,keterangan`, maksimal 100 baris/150 KB, angka bertanda dengan titik desimal tanpa pemisah ribuan. Review shift tidak menjadi prasyarat.

Pengujian browser mutation memakai fixture loopback, bukan transaksi dummy Supabase. Jalankan `$env:REVIEW_STATIC='1'; node tests/support/review-dashboard.mjs` untuk review manual di PowerShell. Pengujian API mencakup `tests/finance-api.test.mjs`; pengujian SQL berada di `../supabase/tests/finance_checks.sql` dan dijalankan validator terisolasi, jangan di hosted.

## Development

Jalankan `npm run dev`, lalu buka http://localhost:3000. Entry halaman berada di `src/pages/index.tsx`. Endpoint contoh yang sudah ada tetap tersedia pada `/api/hello`.

## Menu Aksi Karyawan

Tombol tiga titik di kolom Aksi membuka Atur/Reset PIN, Edit dan Hapus. Terapkan [migrasi pengelolaan Karyawan](../supabase/migrations/20261109020000_employee_management.sql) setelah migrasi PIN. Edit memakai field form yang sama dengan Tambah; ID tetap dan email akun Auth read-only. Hapus meminta konfirmasi, hanya untuk profil belum terhubung Auth dan tanpa riwayat terkait; gunakan Nonaktif untuk karyawan dengan histori. Profil Pemilik dilindungi. Perubahan status/profil mensyaratkan hak pengelolaan seluruh outlet penugasan karyawan.
