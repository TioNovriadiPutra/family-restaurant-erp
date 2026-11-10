import { validIndonesianPhone } from "@/lib/phone-validation";
import { uuidPattern } from "@/lib/employees-validation";
const record = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, min: number, max: number) => typeof v === "string" && v.trim().length >= min && v.length <= max;
const uuid = (v: unknown) => typeof v === "string" && uuidPattern.test(v);
const optionalUuid = (v: unknown) => v === undefined || v === "" || uuid(v);
const date = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
const keys = (v: Record<string, unknown>, allowed: string[]) => Object.keys(v).every(k => allowed.includes(k));
export function validPurchasingInput(action: string, data: unknown) {
  if (!record(data)) return false;
  if (action === "supplier") return keys(data,["id","name","email","phone","contact","payment_terms_days","active"]) && optionalUuid(data.id) && text(data.name,2,120) &&
    text(data.email,0,254) && (!data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) && typeof data.phone === "string" && validIndonesianPhone(data.phone) && text(data.contact,0,120) && typeof data.active === "boolean" && Number.isInteger(data.payment_terms_days) && Number(data.payment_terms_days)>=0 && Number(data.payment_terms_days)<=365;
  if (action === "material") return keys(data,["name","unitId"]) && text(data.name,2,120) && uuid(data.unitId);
  if (action === "pay") return keys(data,["id","accountId"]) && uuid(data.id) && optionalUuid(data.accountId);
  return action === "post" && keys(data,["requestId","supplierId","invoiceNumber","invoiceDate","dueDate","paymentStatus","locationId","accountId","lines","proofKey","proofMime","proofSha256"]) &&
    uuid(data.requestId) && uuid(data.supplierId) && text(data.invoiceNumber,1,100) && date(data.invoiceDate) && date(data.dueDate) && String(data.dueDate)>=String(data.invoiceDate) && ["paid","unpaid"].includes(String(data.paymentStatus)) && optionalUuid(data.locationId) && optionalUuid(data.accountId) &&
    text(data.proofKey,1,200) && ["application/pdf","image/png","image/jpeg"].includes(String(data.proofMime)) && typeof data.proofSha256 === "string" && /^[a-f0-9]{64}$/.test(data.proofSha256) &&
    Array.isArray(data.lines) && data.lines.length>=1 && data.lines.length<=100 && data.lines.every(line => record(line) && keys(line,["stockItemId","unitId","quantity","unitPrice"]) && uuid(line.stockItemId) && uuid(line.unitId) && typeof line.quantity === "string" && /^\d{1,9}(\.\d{1,3})?$/.test(line.quantity) && Number(line.quantity)>0 && Number(line.quantity)<=1000000 && typeof line.unitPrice === "string" && /^\d{1,12}(\.\d{1,2})?$/.test(line.unitPrice) && Number(line.unitPrice)>0 && Number(line.unitPrice)<=1000000000);
}
