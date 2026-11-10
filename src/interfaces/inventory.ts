import type { AuthSession } from "./auth";
export type InventoryView =
  | "stock"
  | "materials"
  | "counts"
  | "waste"
  | "adjustments"
  | "approvals";
export type InventoryAction =
  | "material"
  | "conversion"
  | "location"
  | "unit"
  | "count_create"
  | "count_start"
  | "count_save"
  | "adjustment"
  | "submit"
  | "cancel"
  | "approve"
  | "reject";
export interface InventoryChoice {
  id: string;
  name: string;
}
export interface InventoryUnit {
  id: string;
  code: string;
  dimension: string;
}
export interface InventoryItem extends InventoryChoice {
  code: string;
  kind: string;
  baseUnitId: string;
  unit: string;
}
export interface InventoryOptions {
  actorId: string;
  units: InventoryUnit[];
  locations: InventoryChoice[];
  items: InventoryItem[];
}
export interface InventoryPolicy {
  locationId: string;
  location: string;
  minimumQuantity: string;
}
export interface InventoryConversion {
  id: string;
  unit_id: string;
  unit: string;
  base_quantity: string;
  effective_from: string;
}
export interface InventoryMaterial extends Omit<InventoryItem, "baseUnitId"> {
  category: string;
  active: boolean;
  base_unit_id: string;
  policies: InventoryPolicy[];
  conversions: InventoryConversion[];
}
export interface InventoryStock {
  id: string;
  name: string;
  code: string;
  unit: string;
  location_id: string;
  location: string;
  quantity: string;
  inventory_value: string;
  average_unit_cost: string;
  minimum_quantity: string;
  low_stock: boolean;
}
export interface InventoryDocument {
  id: string;
  entity_id: string;
  number: string;
  kind: string;
  status: string;
  version: number;
  location_id: string;
  location_name: string;
  reason: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  scheduled_at: string | null;
  snapshot_at: string | null;
  count_id: string | null;
  approval_id: string | null;
  approval_status: string | null;
  review_reason: string | null;
  reviewed_by_name: string | null;
  line_count: number;
  total: string;
}
export interface InventoryDocumentLine {
  id: string;
  itemId: string;
  name: string;
  unit: string;
  snapshot?: string;
  counted?: string | null;
  expected?: string;
  variance?: string | null;
  unitCost: string | null;
  reason?: string | null;
  quantity?: string;
  movementId?: string | null;
}
export interface InventoryDetail {
  document: InventoryDocument;
  lines: InventoryDocumentLine[];
  canEdit: boolean;
  canReview: boolean;
}
export interface InventoryMovement {
  id: string;
  sequence: string;
  occurred_at: string;
  quantity_delta: string;
  value_delta: string;
  balance_quantity: string;
  balance_value: string;
  number: string;
  document_type: string;
  location: string;
}
export interface InventoryList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  summary?: {
    items?: number;
    low?: number;
    value?: string;
    pending?: number;
    posted?: number;
  };
}
export interface InventoryFilters {
  search: string;
  status: string;
  locationId: string;
  page: number;
  itemId?: string;
}
export interface InventoryCommand {
  outletId: string;
  action: InventoryAction;
  data: Record<string, unknown>;
  requestId: string;
}
export interface InventoryAttempt {
  signature: string;
  requestId: string;
}
export interface InventoryPageProps {
  session: AuthSession;
  view: InventoryView;
}
export interface InventoryWorkspaceProps extends InventoryPageProps {
  outletId: string;
  canManage: boolean;
  canReview: boolean;
  canPost: boolean;
}
export interface InventoryFormProps {
  outletId: string;
  options: InventoryOptions;
  onSaved: (id: string) => void;
  onCancel: () => void;
}
export interface InventoryMaterialFormProps extends InventoryFormProps {
  material?: InventoryMaterial;
}
export interface InventoryMaterialForm {
  id?: string;
  name: string;
  category: string;
  kind: string;
  baseUnitId: string;
  active: boolean;
  minimumQuantity: string;
  locationId: string;
}
export interface InventoryConversionProps extends InventoryFormProps {
  material: InventoryMaterial;
}
export interface InventoryConversionForm {
  unitId: string;
  baseQuantity: string;
}
export interface InventoryCountForm {
  locationId: string;
  scheduledAt: string;
  notes: string;
}
export interface InventoryAdjustmentLineForm {
  itemId: string;
  quantity: string;
  unitCost: string;
  direction: "add" | "remove";
}
export interface InventoryAdjustmentForm {
  kind: string;
  reason: string;
  locationId: string;
  lines: InventoryAdjustmentLineForm[];
}
export interface InventoryAdjustmentProps extends InventoryFormProps {
  waste: boolean;
  detail?: InventoryDetail;
}
export interface InventoryDetailProps {
  outletId: string;
  id: string;
  options: InventoryOptions;
  canManage: boolean;
  canReview: boolean;
  canPost: boolean;
  onClose: () => void;
  onEdit: (detail: InventoryDetail) => void;
}
export interface InventoryCountLineForm {
  itemId: string;
  countedQuantity: string;
  reason: string;
  unitCost: string;
  recount: boolean;
}
export interface InventoryCountValues {
  lines: InventoryCountLineForm[];
}
export interface InventoryCountEditorProps {
  outletId: string;
  detail: InventoryDetail;
}
export interface InventoryAuxForm {
  name: string;
  code: string;
  dimension: string;
}
export interface InventoryAuxProps extends InventoryFormProps {
  mode: "location" | "unit";
}
export interface InventoryHistoryProps {
  outletId: string;
  stock: InventoryStock;
  onClose: () => void;
}
export interface InventoryReviewForm {
  reason: string;
}
