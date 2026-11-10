import {
  ArrangeHorizontal, Book1, Box1, BoxAdd, Chart2,
  ClipboardTick, Clock, DocumentText, Layer,
  MoneySend, People, ReceiptItem, ReceiptText, Setting2,
  ShieldTick, Shop, ShoppingCart, Trash, Wallet2,
} from "iconsax-reactjs";
import type { ModuleDefinition } from "@/interfaces/module-menu";

// Navigation metadata from the shared FigCraft ERP flows; never server data.
export const moduleMenus: Partial<Record<string, ModuleDefinition>> = {
  persediaan: {
    description: "Pantau bahan, periksa stok fisik, dan telusuri perubahan persediaan outlet.",
    sections: [
      { slug: "stok-bahan", title: "Stok bahan", description: "Lihat saldo bahan, nilai persediaan, dan stok yang berada di bawah batas minimum.", icon: Box1, designNode: 1284 },
      { slug: "master-bahan", title: "Master bahan & konversi", description: "Atur informasi bahan, satuan dasar, dan konversi satuan pembelian ke pemakaian.", icon: Setting2, permission: "inventory.manage", designNode: 5354 },
      { slug: "stock-opname", title: "Stock opname", description: "Buka daftar sesi hitung fisik dan bandingkan hasilnya dengan catatan persediaan.", icon: ClipboardTick, designNode: 6267 },
      { slug: "bahan-terbuang", title: "Bahan terbuang", description: "Telusuri bahan rusak atau terbuang, alasan pencatatan, dan bukti pendukungnya.", icon: Trash, designNode: 6375 },
      { slug: "penyesuaian-stok", title: "Penyesuaian stok", description: "Tinjau koreksi stok beserta alasan perubahan dan dokumen yang mendasarinya.", icon: BoxAdd, designNode: 9075 },
      { slug: "persetujuan-opname", title: "Persetujuan opname", description: "Periksa selisih hasil hitung sebelum perubahan persediaan disetujui dan diposting.", icon: ShieldTick, permission: "approvals.review", designNode: 1994 },
    ],
  },
  pembelian: {
    description: "Kelola supplier dan catat pembelian bahan yang sudah diterima dengan bukti invoice. Stok bertambah otomatis.",
    sections: [
      { slug: "supplier", title: "Data supplier", description: "Kelola nama pemasok, kontak, dan status supplier untuk pembelian bahan baku.", icon: People, designNode: 1862 },
      { slug: "pembelian-bahan", title: "Pembelian bahan baku", description: "Catat bahan yang diterima, lampirkan invoice, lalu stok bertambah otomatis. Pembayaran dapat lunas atau belum dibayar.", icon: ShoppingCart, designNode: 1585 },
    ],
  },
  resep: {
    description: "Hubungkan komposisi bahan, hasil produksi, dan biaya per porsi dalam satu alur.",
    sections: [
      { slug: "daftar-resep", title: "Resep & HPP", description: "Lihat komposisi bahan, yield, dan rincian harga pokok untuk setiap resep.", icon: Book1, designNode: 6159 },
      { slug: "riwayat-biaya", title: "Riwayat biaya", description: "Telusuri perubahan biaya bahan dan perhitungan HPP pada periode sebelumnya.", icon: Clock, designNode: 1527 },
      { slug: "batch-produksi", title: "Produksi bahan", description: "Tinjau penggunaan bahan, hasil aktual, dan biaya setiap proses persiapan dapur.", icon: Layer, permission: "inventory.read", designNode: 8535 },
    ],
  },
  keuangan: {
    description: "Telusuri arus kas, kewajiban supplier, dan dokumen pencatatan keuangan outlet.",
    sections: [
      { slug: "kas-bank", title: "Kas & bank", description: "Periksa rekening, saldo, dan riwayat transaksi kas maupun bank di outlet.", icon: Wallet2, designNode: 2111 },
      { slug: "pembayaran-supplier", title: "Pembayaran supplier", description: "Telusuri pembayaran tagihan, alokasi utang, dan bukti pembayaran supplier.", icon: MoneySend, designNode: 7239 },
      { slug: "rekonsiliasi", title: "Rekonsiliasi pembayaran", description: "Cocokkan pencatatan pembayaran dengan settlement dan mutasi rekening.", icon: ArrangeHorizontal, designNode: 2232 },
      { slug: "jurnal-umum", title: "Jurnal umum", description: "Telusuri pencatatan debit-kredit dan hubungan jurnal dengan dokumen sumber.", icon: DocumentText, designNode: 2345 },
      { slug: "pengeluaran", title: "Pengeluaran operasional", description: "Tinjau beban operasional, akun biaya, dan bukti pengeluaran outlet.", icon: ReceiptItem, designNode: 7455 },
    ],
  },
  laporan: {
    description: "Pilih laporan untuk meninjau penjualan, persediaan, pembelian, dan hasil usaha.",
    sections: [
      { slug: "penjualan", title: "Penjualan & pembayaran", description: "Tinjau transaksi dan penerimaan berdasarkan periode serta metode pembayaran.", icon: Chart2, designNode: 2538 },
      { slug: "produk-kasir", title: "Produk & kasir", description: "Bandingkan penjualan produk dan aktivitas kasir dalam periode yang dipilih.", icon: People, designNode: 2538 },
      { slug: "stok-selisih", title: "Stok & selisih", description: "Telusuri persediaan, pergerakan bahan, dan hasil perbandingan hitung fisik.", icon: Box1, permission: "inventory.read", designNode: 2538 },
      { slug: "food-cost", title: "Food cost", description: "Periksa biaya bahan dan kontribusi harga pokok pada penjualan menu.", icon: Book1, permission: "recipes.read", designNode: 2960 },
      { slug: "belanja-supplier", title: "Belanja supplier", description: "Tinjau pembelian dan nilai belanja menurut supplier pada periode tertentu.", icon: ShoppingCart, permission: "purchasing.read", designNode: 2538 },
      { slug: "laba-rugi", title: "Laba rugi", description: "Tinjau pendapatan, harga pokok, dan beban dari pencatatan jurnal yang diposting.", icon: DocumentText, permission: "finance.read", designNode: 2427 },
    ],
  },
  pengaturan: {
    description: "Kelola konfigurasi restoran dan aturan operasional yang berlaku di outlet.",
    sections: [
      { slug: "restoran-outlet", title: "Restoran & outlet", description: "Atur informasi restoran, zona waktu, serta kebijakan pajak dan layanan.", icon: Shop, designNode: 2607 },
      { slug: "menu-harga", title: "Menu & harga", description: "Tinjau produk jual, hubungan resep, dan harga yang berlaku pada outlet.", icon: Book1, permission: "menu.read", designNode: 2713 },
      { slug: "pembayaran-struk", title: "Pembayaran & struk", description: "Atur metode pembayaran dan preferensi struk cetak maupun digital.", icon: ReceiptText, designNode: 2607 },
      { slug: "hak-akses", title: "Karyawan & hak akses", description: "Tinjau peran, permission, dan penugasan karyawan pada masing-masing outlet.", icon: ShieldTick, permission: "rbac.read", designNode: 2649 },
    ],
  },
};
