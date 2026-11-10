import type { AuthSession } from "@/interfaces/auth";
export interface PurchaseSupplier { id: string; code: string; name: string; email: string | null; phone: string | null; contact: string | null; active: boolean; payment_terms_days: number }
export interface SupplierForm { id?: string; name: string; email: string; phone: string; contact: string; payment_terms_days: number; active: boolean }
export interface PurchaseOption { id: string; name: string }
export interface PurchaseUnit { id: string; code: string }
export interface PurchaseMaterial extends PurchaseOption { base_unit_id: string; units: PurchaseUnit[] }
export interface PurchaseOptions { suppliers: (PurchaseOption & { payment_terms_days: number })[]; items: PurchaseMaterial[]; units: PurchaseUnit[]; locations: PurchaseOption[]; accounts: PurchaseOption[] }
export interface PurchaseLineForm { stockItemId: string; unitId: string; quantity: string; unitPrice: string }
export interface PurchaseForm { supplierId: string; invoiceNumber: string; invoiceDate: string; dueDate: string; locationId: string; paymentStatus: "paid" | "unpaid"; accountId: string; lines: PurchaseLineForm[] }
export interface PurchaseProof { proofKey: string; proofMime: string; proofSha256: string }
export interface PurchaseRecord { id: string; number: string; created_at: string; supplier_name: string; invoice_number: string; invoice_date: string; due_date: string; total: string; payment_status: "paid" | "unpaid"; invoice_storage_key: string; lines: { name: string; unit: string; quantity: string; unit_price: string; total: string }[] }
export interface PurchaseStock { id: string; name: string; code: string; unit: string; location: string; quantity: string; inventory_value: string; average_unit_cost: string }
export interface PurchasingData { items?: PurchaseSupplier[]; purchases?: PurchaseRecord[]; stock?: PurchaseStock[]; total?: number; page?: number }
export interface PurchasingPageProps { session: AuthSession; view: "suppliers" | "purchases" | "stock" }
export interface PurchaseFormProps { outletId: string; options: PurchaseOptions; onSaved: () => void; onCancel: () => void }
export interface SupplierFormProps { outletId: string; supplier?: PurchaseSupplier; onSaved: () => void; onCancel: () => void }
export interface PurchaseDetailProps { outletId: string; purchase: PurchaseRecord; canManage: boolean; onClose: () => void }
export interface PurchasingMutation { outletId: string; action: "supplier" | "material" | "post" | "pay"; data: Record<string, unknown> }
export interface PurchaseUploadInput { outletId: string; requestId: string; file: File }
export interface PurchaseProofInput { outletId: string; id: string }
export interface MaterialForm { name: string; unitId: string }
export interface PurchaseAttempt { requestId: string; signature: string }
