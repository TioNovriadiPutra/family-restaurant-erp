// Browser fixtures only. SQL integration tests verify valuation and atomic posting.
import { randomUUID } from "node:crypto";
export function createRecipesReview(outletId) {
  const kg = "79000000-0000-0000-0000-000000000001",
    g = "79000000-0000-0000-0000-000000000002",
    pcs = "79000000-0000-0000-0000-000000000003";
  const units = [
    { id: kg, code: "kg", dimension: "mass" },
    { id: g, code: "g", dimension: "mass" },
    { id: pcs, code: "pcs", dimension: "count" },
  ];
  const items = ["Beras", "Ayam", "Bawang merah", "Bumbu dasar"].map(
    (name, index) => ({
      id: `79000000-0000-0000-0000-00000000001${index}`,
      name,
      kind: index === 3 ? "semi_finished" : "raw",
      baseUnitId: kg,
      unit: "kg",
      units: [
        { id: kg, code: "kg", factor: "1" },
        { id: g, code: "g", factor: "0.001" },
      ],
    }),
  );
  const lines = items.slice(0, 3).map((s, index) => ({
    id: randomUUID(),
    itemId: s.id,
    name: s.name,
    unit: "g",
    baseUnit: "kg",
    unitId: g,
    quantity: ["100", "60", "20"][index],
    factor: "0.001",
    quantityBase: ["0.1", "0.06", "0.02"][index],
    unitCost: ["15000", "38000", "40000"][index],
    amount: ["1500", "2280", "800"][index],
    active: true,
  }));
  const cost = {
    complete: true,
    missingCount: 0,
    total: "4580",
    perOutput: "4580",
    foodCost: "16.3571",
    margin: "23420",
    minimumPrice: "15267",
    lines,
  };
  const now = "2026-11-09T11:00:00Z";
  const recipe = {
    id: "79000000-0000-0000-0000-000000000020",
    code: "RSP-001",
    name: "Nasi goreng ayam",
    category: "Makanan",
    active: true,
    revision: 1,
    output_item_id: null,
    target_rate: "0.3",
    version_id: randomUUID(),
    version: 1,
    status: "draft",
    yield: "1",
    output_unit_id: pcs,
    unit: "pcs",
    output_factor: "1",
    reference_price: "28000",
    notes: "Gunakan bahan mentah per satu porsi.",
    gross_yield: null,
    output_name: null,
    output_unit: null,
    created_at: now,
    effective_from: null,
    published_version_id: null,
    cost,
  };
  const production = {
    ...recipe,
    id: "79000000-0000-0000-0000-000000000021",
    name: "Bumbu dasar",
    code: "RSP-002",
    category: "Persiapan",
    version_id: randomUUID(),
    output_item_id: items[3].id,
    output_name: "Bumbu dasar",
    output_unit: "kg",
    yield: "0.9",
    unit: "kg",
    output_unit_id: kg,
    reference_price: null,
    status: "published",
    cost: {
      ...cost,
      total: "40000",
      perOutput: "44444.444444",
      foodCost: null,
      margin: null,
      minimumPrice: "148149",
      lines: [
        {
          ...lines[2],
          id: randomUUID(),
          quantity: "1000",
          quantityBase: "1",
          amount: "40000",
        },
      ],
    },
  };
  production.published_version_id = production.version_id;
  const records = [recipe, production];
  const snapshots = [
    {
      id: randomUUID(),
      recipe_version_id: recipe.version_id,
      calculated_at: "2026-11-08T11:00:00Z",
      total: "4340",
      per_output: "4340",
      name: recipe.name,
      code: recipe.code,
      version: 1,
      unit: "pcs",
      metadata: {
        ...cost,
        total: "4340",
        perOutput: "4340",
        name: recipe.name,
        code: recipe.code,
        version: 1,
        yield: "1",
        unit: "pcs",
        referencePrice: "28000",
        targetPercent: "30",
      },
    },
  ];
  const batches = [
    {
      id: randomUUID(),
      number: "BCH-001",
      status: "draft",
      version: 1,
      batch_id: randomUUID(),
      recipe_version_id: production.version_id,
      target: "2",
      actual: "1.8",
      total: null,
      unit_cost: null,
      produced_at: now,
      completed_at: null,
      output_location_id: outletId,
      notes: "Persiapan dapur pagi",
      recipe_name: production.name,
      recipe_code: production.code,
      recipe_version: 1,
      output_item_id: items[3].id,
      output_name: items[3].name,
      unit: "kg",
      output_location: "Gudang utama",
      source_location_id: outletId,
      produced_by_name: "Pemilik",
      created_at: now,
      lines: [
        {
          componentId: production.cost.lines[0].id,
          itemId: items[2].id,
          name: items[2].name,
          unit: "kg",
          quantityBase: "2",
          id: randomUUID(),
          amount: null,
          location: "Gudang utama",
          movementId: null,
        },
      ],
    },
  ];
  return (write, action, data = {}) => {
    const r = records.find((r) => r.id === data.id);
    if (write) {
      if (action === "save") {
        const existing = records.find((r) => r.id === data.id);
        const output = items.find((i) => i.id === data.outputItemId);
        const outputUnit = units.find((u) => u.id === data.outputUnitId);
        const mapped = data.lines.map((l) => {
          const item = items.find((i) => i.id === l.itemId);
          const unit = units.find((u) => u.id === l.unitId);
          return {
            ...lines[0],
            id: randomUUID(),
            itemId: item.id,
            name: item.name,
            unit: unit.code,
            unitId: unit.id,
            quantity: l.quantity,
            quantityBase: l.quantity,
          };
        });
        const next = {
          ...recipe,
          id: data.id ?? randomUUID(),
          name: data.name,
          category: data.category,
          version_id: randomUUID(),
          version: (existing?.version ?? 0) + 1,
          revision: (existing?.revision ?? 0) + 1,
          yield: data.yield,
          unit: outputUnit.code,
          output_unit_id: outputUnit.id,
          output_item_id: output?.id ?? null,
          output_name: output?.name ?? null,
          output_unit: output?.unit ?? null,
          reference_price: data.referencePrice || null,
          target_rate: String(Number(data.targetPercent) / 100),
          notes: data.notes,
          gross_yield: data.grossYield || null,
          cost: { ...cost, lines: mapped },
        };
        if (existing) Object.assign(existing, next);
        else records.push(next);
        return { id: next.id };
      }
      if (action === "publish") {
        r.status = "published";
        r.revision++;
        r.published_version_id = r.version_id;
        return { id: r.id };
      }
      if (action === "active") {
        r.active = data.active;
        r.revision++;
        return { id: r.id };
      }
      if (action === "snapshot") {
        const snap = {
          id: randomUUID(),
          recipe_version_id: r.version_id,
          calculated_at: now,
          total: r.cost.total,
          per_output: r.cost.perOutput,
          name: r.name,
          code: r.code,
          version: r.version,
          unit: r.unit,
          metadata: {
            ...r.cost,
            name: r.name,
            code: r.code,
            version: r.version,
            yield: r.yield,
            unit: r.unit,
            referencePrice: r.reference_price,
            targetPercent: "30",
          },
        };
        snapshots.unshift(snap);
        return { id: r.id, snapshotId: snap.id };
      }
      const b = batches.find((b) => b.id === data.id);
      if (action === "batch_save") {
        const next = {
          ...batches[0],
          id: data.id ?? randomUUID(),
          batch_id: randomUUID(),
          number: b?.number ?? `BCH-${batches.length + 1}`,
          status: "draft",
          version: (b?.version ?? 0) + 1,
          target: data.target,
          actual: data.actual,
          notes: data.notes,
          lines: data.lines.map((l) => ({
            ...batches[0].lines[0],
            ...l,
            id: randomUUID(),
          })),
        };
        if (b) Object.assign(b, next);
        else batches.unshift(next);
        return { id: next.id };
      }
      if (action === "batch_post") {
        b.status = "posted";
        b.version++;
        b.total = "80000";
        b.unit_cost = "44444.444444";
        b.completed_at = now;
        b.lines.forEach((l) => {
          l.amount = "80000";
          l.movementId = randomUUID();
        });
        return { id: b.id };
      }
      if (action === "batch_cancel") {
        b.status = "cancelled";
        b.version++;
        return { id: b.id };
      }
    }
    if (action === "options")
      return {
        units,
        locations: [{ id: outletId, name: "Gudang utama" }],
        items,
        recipes: records
          .filter(
            (r) => r.output_item_id && r.status === "published" && r.active,
          )
          .map((r) => ({
            id: r.version_id,
            recipeId: r.id,
            name: r.name,
            version: r.version,
            outputItemId: r.output_item_id,
            yield: r.yield,
            outputFactor: "1",
            unit: r.unit,
            outputUnit: r.output_unit,
            lines: r.cost.lines.map((l) => ({
              componentId: l.id,
              itemId: l.itemId,
              name: l.name,
              unit: l.baseUnit,
              quantityBase: l.quantityBase,
            })),
          })),
      };
    if (action === "detail")
      return {
        recipe: r,
        cost: r.cost,
        versions: [
          {
            id: r.version_id,
            version: r.version,
            status: r.status,
            yield: r.yield,
            unit: r.unit,
            createdAt: now,
            effectiveFrom: r.status === "published" ? now : null,
            effectiveTo: null,
          },
        ],
      };
    if (action === "snapshot") {
      const snap = snapshots.find((s) => s.id === data.id);
      return {
        id: snap.id,
        calculatedAt: snap.calculated_at,
        total: snap.total,
        perOutput: snap.per_output,
        metadata: snap.metadata,
      };
    }
    if (action === "batch_detail") {
      const b = batches.find((b) => b.id === data.id);
      return { batch: b, lines: b.lines };
    }
    if (action === "movements")
      return {
        items: [
          {
            sequence: 1,
            occurred_at: now,
            name: "Ayam",
            unit: "kg",
            quantity: "10",
            unit_cost: "38000",
            source: "SIM-PRT-01",
          },
        ],
      };
    const list =
      action === "recipes"
        ? records
        : action === "history"
          ? snapshots
          : batches;
    const filtered = list.filter(
      (r) =>
        (!data.search ||
          `${r.name ?? r.recipe_name} ${r.code ?? r.number}`
            .toLowerCase()
            .includes(data.search.toLowerCase())) &&
        (!data.recipeId ||
          records.find((x) => x.id === data.recipeId)?.name === r.name) &&
        (!data.status ||
          data.status === "all" ||
          (data.status === "active" && r.active) ||
          (data.status === "inactive" && !r.active) ||
          data.status === r.status),
    );
    return { items: filtered, total: filtered.length, page: 1, pageSize: 20 };
  };
}
