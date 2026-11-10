import type { AuthSession } from "./auth";
export type RecipeView = "recipes" | "history" | "batches";
export type RecipeAction =
  | "save"
  | "publish"
  | "active"
  | "snapshot"
  | "batch_save"
  | "batch_post"
  | "batch_cancel";
export interface RecipeFilters {
  search: string;
  status: string;
  page: number;
  recipeId?: string;
}
export interface RecipeChoice {
  id: string;
  name: string;
}
export interface RecipeUnit {
  id: string;
  code: string;
  dimension?: string;
  factor?: string;
}
export interface RecipeItem extends RecipeChoice {
  kind: string;
  baseUnitId: string;
  unit: string;
  units: RecipeUnit[];
}
export interface RecipeCostLine {
  id: string;
  itemId: string;
  name: string;
  unit: string;
  baseUnit: string;
  unitId: string;
  quantity: string;
  factor: string;
  quantityBase: string;
  unitCost: string | null;
  amount: string | null;
  active: boolean;
}
export interface RecipeCost {
  complete: boolean;
  missingCount: number;
  total: string | null;
  perOutput: string | null;
  foodCost: string | null;
  margin: string | null;
  minimumPrice: string | null;
  lines: RecipeCostLine[];
}
export interface RecipeRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  active: boolean;
  revision: number;
  output_item_id: string | null;
  target_rate: string;
  version_id: string;
  version: number;
  status: string;
  yield: string;
  output_unit_id: string;
  unit: string;
  output_factor: string;
  reference_price: string | null;
  notes: string;
  gross_yield: string | null;
  output_name: string | null;
  output_unit: string | null;
  created_at: string;
  effective_from: string | null;
  published_version_id: string | null;
  cost: RecipeCost;
}
export interface RecipeVersion {
  id: string;
  version: number;
  status: string;
  yield: string;
  unit: string;
  createdAt: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}
export interface RecipeDetail {
  recipe: RecipeRecord;
  cost: RecipeCost;
  versions: RecipeVersion[];
}
export interface RecipeHistory {
  id: string;
  recipe_version_id: string;
  calculated_at: string;
  total: string;
  per_output: string;
  name: string;
  code: string;
  version: number;
  unit: string;
}
export interface RecipeSnapshot {
  id: string;
  calculatedAt: string;
  total: string;
  perOutput: string;
  metadata: RecipeCost & {
    name: string;
    code: string;
    version: number;
    yield: string;
    unit: string;
    referencePrice: string | null;
    targetPercent: string;
  };
}
export interface RecipeBatchInput {
  componentId: string;
  itemId: string;
  name: string;
  unit: string;
  quantityBase: string;
}
export interface RecipeProductionChoice extends RecipeChoice {
  recipeId: string;
  version: number;
  outputItemId: string;
  yield: string;
  outputFactor: string;
  unit: string;
  outputUnit: string;
  lines: RecipeBatchInput[];
}
export interface RecipeOptions {
  units: RecipeUnit[];
  locations: RecipeChoice[];
  items: RecipeItem[];
  recipes: RecipeProductionChoice[];
}
export interface RecipeBatch {
  id: string;
  number: string;
  status: string;
  version: number;
  batch_id: string;
  recipe_version_id: string;
  target: string;
  actual: string;
  total: string | null;
  unit_cost: string | null;
  produced_at: string;
  completed_at: string | null;
  output_location_id: string;
  notes: string;
  recipe_name: string;
  recipe_code: string;
  recipe_version: number;
  output_item_id: string;
  output_name: string;
  unit: string;
  output_location: string;
  source_location_id: string;
  produced_by_name: string;
  created_at: string;
}
export interface RecipeBatchDetail {
  batch: RecipeBatch;
  lines: (RecipeBatchInput & {
    id: string;
    amount: string | null;
    location: string;
    movementId: string | null;
  })[];
}
export interface RecipeMovement {
  sequence: number;
  occurred_at: string;
  name: string;
  unit: string;
  quantity: string;
  unit_cost: string;
  source: string;
}
export interface RecipeList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export interface RecipeCommand {
  outletId: string;
  action: RecipeAction;
  data: Record<string, unknown>;
  requestId: string;
}
export interface RecipeCommandResult {
  id: string;
  snapshotId?: string;
  versionId?: string;
}
export interface RecipeAttempt {
  signature: string;
  requestId: string;
}
export interface RecipeForm {
  id?: string;
  revision?: number;
  name: string;
  category: string;
  yield: string;
  grossYield: string;
  outputUnitId: string;
  outputItemId: string;
  targetPercent: string;
  referencePrice: string;
  notes: string;
  lines: { itemId: string; quantity: string; unitId: string }[];
}
export interface RecipeBatchForm {
  id?: string;
  revision?: number;
  recipeVersionId: string;
  sourceLocationId: string;
  outputLocationId: string;
  target: string;
  actual: string;
  date: string;
  notes: string;
  lines: { componentId: string; quantityBase: string }[];
}
export interface RecipePageProps {
  session: AuthSession;
  view: RecipeView;
}
export interface RecipeWorkspaceProps extends RecipePageProps {
  outletId: string;
  canManage: boolean;
  canProduce: boolean;
  canPost: boolean;
}
export interface RecipeEditorPageProps extends RecipePageProps {
  outletId: string;
}
export interface RecipeEditorProps {
  outletId: string;
  options: RecipeOptions;
  detail?: RecipeDetail;
  onSaved: (id: string) => void;
  onCancel: () => void;
}
export interface RecipeBatchEditorProps {
  outletId: string;
  options: RecipeOptions;
  detail?: RecipeBatchDetail;
  onSaved: (id: string) => void;
  onCancel: () => void;
}
export interface RecipeDetailProps {
  outletId: string;
  id: string;
  canManage: boolean;
  onClose: () => void;
  onEdit: (detail: RecipeDetail) => void;
  onHistory: (id: string) => void;
}
export interface RecipeBatchDetailProps {
  outletId: string;
  id: string;
  canProduce: boolean;
  canPost: boolean;
  onClose: () => void;
  onEdit: (detail: RecipeBatchDetail) => void;
}
export interface RecipeSnapshotProps {
  outletId: string;
  id: string;
  onClose: () => void;
}
export interface RecipeCostTableProps {
  cost: RecipeCost;
  unit: string;
  yieldQuantity: string;
}
export interface RecipeTableProps {
  view: RecipeView;
  items: (RecipeRecord | RecipeHistory | RecipeBatch)[];
  onOpen: (id: string) => void;
}
export interface RecipeRowProps {
  item: RecipeRecord;
  onOpen: (id: string) => void;
}
export interface RecipeHistoryRowProps {
  item: RecipeHistory;
  onOpen: (id: string) => void;
}
export interface RecipeBatchRowProps {
  item: RecipeBatch;
  onOpen: (id: string) => void;
}
export interface RecipeIngredientHistoryProps {
  outletId: string;
  recipeId: string;
}
export interface RecipeMovements {
  items: RecipeMovement[];
}
