# Design system ERP dari FigCraft

`globals.css` adalah sumber token dan recipe Tailwind CSS v4 untuk komponen ERP. CSS sudah diimpor melalui `_app.tsx`; Inter dimuat sekali dengan `next/font/google` dan tersedia pada root, termasuk untuk elemen portal.

Sumber desain: `../../../design-artifacts/Dapur-Keluarga-POS-ERP.figcraft`, document 5; Foundations 56, Controls 91, Modern UI/density 5862, Commerce 3025, dan contoh shell ERP 1206. Foundations/controls dibaca melalui MCP FigCraft. Setelah koneksi MCP terputus, variabel lengkap dan metadata style dilengkapi dari `document.json` dalam arsip `.figcraft` tersimpan, tanpa mengubah file desain. Ekspor pastel lama digunakan sebagai pembanding.

## Token Tailwind

Seluruh 42 variabel sumber terwakili: 22 warna, 8 spacing, 3 radius, 7 ukuran teks dan 2 ukuran kontrol. Shadow Overlay beserta line-height/tracking dari 13 text style juga dipertahankan.

| Kelompok | Contoh class |
|---|---|
| Permukaan | `bg-background`, `bg-surface`, `bg-secondary`, `bg-card`, `bg-popover` |
| Teks | `text-foreground`, `text-muted-foreground`, `text-disabled-foreground` |
| Aksi | `bg-primary text-primary-foreground`, `border-input`, `outline-ring` |
| Status | `text-success bg-success-background border-success-border`, padanan `warning`, `destructive`, `info` |
| Pastel | `bg-pastel-sage`, `bg-pastel-peach`, `bg-pastel-blue`, `bg-chart-muted` |
| Spacing 4/8/12/16/24/32/48/64 px | `p-1`, `gap-2`, `p-3`, `p-4`, `gap-6`, `p-8`, `p-12`, `p-16` |
| Radius 8/12/16 px | `rounded-control`, `rounded-card`, `rounded-dialog` |
| Elevation | `shadow-control`, `shadow-card`, `shadow-overlay` |
| Kontrol | `h-control`, `min-h-control`, `size-control`, `h-control-erp`, `h-control-pos` |
| Shell ERP | `w-sidebar` (232 px), `min-h-toolbar` (72 px), `px-page` (32 px) |
| Ukuran teks | `text-13`, `text-14`, `text-16`, `text-20`, `text-24`, `text-28`, `text-36` |

Ukuran ditulis dalam rem agar mengikuti preferensi ukuran teks browser. Nilai px di atas adalah padanan pada root 16 px. Tambahan radius badge 6 px dan shadow control/card berasal dari komponen, bukan variabel koleksi. Alias card/popover/accent/muted/ring menggunakan warna sumber yang sama.

Semua 13 text style tersedia sebagai utility lengkap:

```text
type-36-semibold   type-28-semibold
type-24-semibold   type-24-bold      type-24-regular
type-20-semibold   type-20-regular
type-16-semibold   type-16-regular
type-14-semibold   type-14-regular
type-13-semibold   type-13-regular
```

Style ini mencakup font-size, line-height, letter-spacing dan weight. `text-20`, misalnya, memberi ukuran 20/28 px dan tracking -0,25 px; weight dapat dikomposisikan dengan `font-semibold`. Utility kustom mendukung variant Tailwind seperti `md:type-28-semibold`.

## Recipe komponen

Recipe `.ui-*` ditempatkan pada layer components sehingga dapat dioverride dengan utility Tailwind. Gunakan base class dan variant bersama:

```tsx
<button className="ui-button ui-button-primary">Simpan perubahan</button>
<button className="ui-button ui-button-secondary" disabled>Menunggu verifikasi</button>

<div className="ui-field">
  <label className="ui-label" htmlFor="ingredient">Nama bahan</label>
  <input id="ingredient" className="ui-input" aria-describedby="ingredient-help" />
  <p id="ingredient-help" className="ui-help">Gunakan nama bahan yang mudah dicari.</p>
</div>

<section className="ui-card ui-card-sage">
  <h2 className="type-14-semibold">Pendapatan bersih</h2>
  <p className="type-28-semibold ui-amount">Rp3.840.000</p>
</section>

<span className="ui-badge ui-badge-success">Lunas terverifikasi</span>
```

| Kelompok | Base / variant |
|---|---|
| Button | `ui-button` + `ui-button-primary`, `ui-button-secondary`, `ui-button-destructive`, `ui-button-ghost`; `ui-button-icon` untuk tombol ikon |
| Form | `ui-field`, `ui-label`, `ui-input`, `ui-help`, `ui-field-error`; input juga berlaku pada select/textarea |
| Card | `ui-card`; variant `ui-card-sage`, `ui-card-peach`, `ui-card-blue` |
| Badge | `ui-badge`; variant `ui-badge-success`, `ui-badge-warning`, `ui-badge-destructive`, `ui-badge-info`, `ui-badge-neutral` |
| Segmented tabs | `ui-tabs`, `ui-tab`; aktif memakai `aria-selected="true"` atau `data-state="active"` |
| Table | `ui-table-container`, `ui-table`, `ui-pagination`; angka memakai `ui-amount` dan `text-right` |
| Navigasi | `ui-sidebar`, `ui-toolbar`, `ui-nav-item`; halaman aktif memakai `aria-current="page"` |
| Overlay | `ui-dialog` pada dialog native, `ui-popover`, `shadow-overlay` |
| Feedback/toast | `ui-alert` + variant `ui-alert-success`, `ui-alert-warning`, `ui-alert-destructive`, `ui-alert-info` |
| Pola commerce bersama | `ui-product-card`, `ui-cart-item`, `ui-keypad`, `ui-amount` |

Focus keyboard: outline sage 2 px dengan offset 2 px. Field error memakai `aria-invalid="true"` dan pesan terhubung lewat `aria-describedby`. Disabled harus memakai atribut native `disabled` bila tersedia. `aria-disabled` hanya diberi tampilan; komponen tetap bertanggung jawab mencegah event dan menyampaikan semantiknya.

Hover subtle dan pressed 1 px menerjemahkan catatan interaksi FigCraft. Warna hover merupakan turunan palette; durasi 150 ms adalah keputusan implementasi, bukan token baru dari FigCraft. `prefers-reduced-motion` menghentikan transition/pressed movement recipe. CSS tidak membuat logika dialog, focus trap, validasi, notifikasi atau keyboard tabs; perilaku itu tetap tanggung jawab komponen/hooks.

## Density dan platform

ERP memakai kontrol 40 px secara default. Untuk specimen web dengan target sentuh, gunakan `density-touch` pada parent; kontrol menjadi minimal 48 px dan label 16/24 px. `density-erp` mengembalikan 40 px pada subtree. Token POS dipertahankan sebagai referensi sistem bersama; file CSS ini tidak diimpor ke React Native dan tidak mengubah project POS.

FigCraft hanya menentukan light theme. Warna tidak otomatis berubah berdasarkan OS dark mode; variant `dark:` dibuat opt-in melalui class `.dark`. Belum ada palette token dark yang didesain.

Komponen reusable dibangun di `components/shared`; komponen fitur di `components/custom`; hooks UI di `hooks`, query/mutation di `controller`, tipe di `interfaces`, store di `stores`, sesuai AGENTS.md. Gunakan token/class ini daripada menyalin hex, ukuran kontrol atau recipe baru ke setiap komponen.
