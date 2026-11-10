// Browser review fixtures only. Atomic posting is tested in PostgreSQL, not here.
import { randomUUID } from "node:crypto";
export function createInventoryReview(outletId, actorId, otherId) {
  const units = [
    { id: outletId, code: "kg", dimension: "mass" },
    { id: otherId, code: "g", dimension: "mass" },
  ];
  const locations = [{ id: outletId, name: "Gudang utama" }];
  const materials = [
    {
      id: outletId,
      name: "Beras premium",
      code: "BHN-001",
      kind: "raw",
      category: "Bahan pokok",
      base_unit_id: outletId,
      baseUnitId: outletId,
      unit: "kg",
      active: true,
      policies: [
        {
          locationId: outletId,
          location: "Gudang utama",
          minimumQuantity: "10",
        },
      ],
      conversions: [
        {
          id: otherId,
          unit_id: otherId,
          unit: "g",
          base_quantity: "0.001",
          effective_from: "2026-11-01T00:00:00Z",
        },
      ],
    },
  ];
  const docs = [],
    requests = new Map();
  const addDoc = (kind, status, creator = actorId) => {
    const id = randomUUID();
    const d = {
      id,
      entity_id: id,
      number:
        (kind === "count" ? "OPN-" : kind === "manual" ? "ADJ-" : "WST-") +
        String(docs.length + 1).padStart(3, "0"),
      kind,
      status,
      version: 1,
      location_id: outletId,
      location_name: "Gudang utama",
      reason: "Pemeriksaan stok gudang",
      created_by: creator,
      created_by_name: creator === actorId ? "Pemilik" : "Manajer",
      created_at: "2026-11-09T03:00:00Z",
      scheduled_at: "2026-11-09T03:00:00Z",
      count_id: null,
      approval_id: status === "pending" ? randomUUID() : null,
      approval_status: status === "pending" ? "pending" : null,
      reviewed_by_name: null,
      line_count: 1,
      total: "-30000",
      lines: [
        {
          id: randomUUID(),
          itemId: outletId,
          name: "Beras premium",
          unit: "kg",
          snapshot: "25",
          expected: "25",
          counted: "23",
          variance: "-2",
          unitCost: "15000",
          reason: "Beras tercecer",
          quantity: "-2",
        },
      ],
    };
    docs.push(d);
    return d;
  };
  addDoc("count", "pending", otherId);
  addDoc("waste", "draft");
  addDoc("manual", "draft");
  return (write, action, data = {}) => {
    if (write) {
      if (requests.has(data.requestId)) return requests.get(data.requestId);
      let result;
      if (action === "material") {
        let item = materials.find((m) => m.id === data.id);
        if (!item) {
          item = {
            id: randomUUID(),
            code: "BHN-00" + (materials.length + 1),
            conversions: [],
          };
          materials.push(item);
        }
        Object.assign(item, data, {
          base_unit_id: data.baseUnitId,
          unit: units.find((u) => u.id === data.baseUnitId)?.code ?? "kg",
          policies: [
            {
              locationId: data.locationId || outletId,
              location: locations.find(
                (l) => l.id === (data.locationId || outletId),
              )?.name,
              minimumQuantity: data.minimumQuantity,
            },
          ],
        });
        result = { id: item.id };
      } else if (action === "conversion") {
        const item = materials.find((m) => m.id === data.itemId);
        const unit = units.find((u) => u.id === data.unitId);
        item.conversions = item.conversions.filter(
          (c) => c.unit_id !== data.unitId,
        );
        item.conversions.push({
          id: randomUUID(),
          unit_id: unit.id,
          unit: unit.code,
          base_quantity: data.baseQuantity,
          effective_from: new Date().toISOString(),
        });
        result = { id: item.id };
      } else if (action === "location") {
        const id = randomUUID();
        locations.push({ id, name: data.name });
        result = { id };
      } else if (action === "unit") {
        const id = randomUUID();
        units.push({ id, code: data.code, dimension: data.dimension });
        result = { id };
      } else if (action === "count_create") {
        const d = addDoc("count", "draft");
        d.reason = data.notes;
        d.lines = [];
        d.line_count = 0;
        result = { id: d.id };
      } else if (action === "adjustment") {
        const d = data.id
          ? docs.find((d) => d.id === data.id)
          : addDoc(data.kind, "draft");
        d.reason = data.reason;
        d.lines = data.lines.map((l) => ({
          id: randomUUID(),
          ...l,
          name: materials.find((m) => m.id === l.itemId)?.name,
          unit: "kg",
          quantity:
            data.kind === "manual" ? l.quantity : String(-Number(l.quantity)),
          unitCost: "15000",
        }));
        d.line_count = d.lines.length;
        result = { id: d.id };
      } else {
        const d = docs.find((d) => d.id === data.id);
        if (!d) return { id: data.id };
        if (action === "count_start") {
          d.status = "counting";
          d.lines = [
            {
              id: randomUUID(),
              itemId: outletId,
              name: "Beras premium",
              unit: "kg",
              snapshot: "25",
              expected: "25",
              counted: null,
              variance: null,
              unitCost: "15000",
              reason: "",
            },
          ];
          d.line_count = 1;
        }
        if (action === "count_save") {
          d.lines = d.lines.map((l) => {
            const v = data.lines.find((x) => x.itemId === l.itemId);
            return {
              ...l,
              counted: v.countedQuantity || null,
              variance: v.countedQuantity
                ? String(Number(v.countedQuantity) - 25)
                : null,
              reason: v.reason,
            };
          });
          if (data.submit) {
            d.status = "pending";
            d.approval_id = randomUUID();
            d.approval_status = "pending";
          }
        }
        if (action === "submit") {
          d.status = "pending";
          d.approval_id = randomUUID();
          d.approval_status = "pending";
        }
        if (action === "approve") {
          d.status = "posted";
          d.approval_status = "approved";
          d.reviewed_by_name = "Pemilik";
        }
        if (action === "reject") {
          d.status = "rejected";
          d.approval_status = "rejected";
          d.review_reason = data.reason;
          d.reviewed_by_name = "Pemilik";
        }
        if (action === "cancel") d.status = "cancelled";
        d.version++;
        result = { id: d.id };
      }
      requests.set(data.requestId, result);
      return result;
    }
    if (action === "options")
      return {
        actorId,
        units,
        locations,
        items: materials
          .filter((m) => m.active)
          .map((m) => ({
            id: m.id,
            name: m.name,
            code: m.code,
            kind: m.kind,
            baseUnitId: m.base_unit_id,
            unit: m.unit,
          })),
      };
    if (action === "detail") {
      const d = docs.find((d) => d.id === data.id);
      return {
        document: { ...d, lines: undefined },
        lines: d.lines,
        canEdit:
          d.created_by === actorId &&
          ["draft", "counting", "pending"].includes(d.status),
        canReview: d.created_by !== actorId && d.status === "pending",
      };
    }
    let items;
    if (action === "materials")
      items = materials.filter(
        (m) =>
          (data.status === "all" ||
            !data.status ||
            m.active === (data.status === "active")) &&
          (!data.search ||
            `${m.name} ${m.code} ${m.category}`.toLowerCase().includes(data.search.toLowerCase())),
      );
    else if (action === "stock")
      items = materials
        .filter((m) => m.active)
        .map((m, i) => ({
          id: m.id,
          name: m.name,
          code: m.code,
          unit: m.unit,
          location_id: outletId,
          location: "Gudang utama",
          quantity: i ? "2" : "25",
          inventory_value: i ? "60000" : "375000",
          average_unit_cost: i ? "30000" : "15000",
          minimum_quantity: "10",
          low_stock: i > 0,
        }))
        .filter((m) => data.status !== "low" || m.low_stock);
    else if (action === "movements")
      items = [
        {
          id: outletId,
          sequence: "1",
          occurred_at: "2026-11-09T03:00:00Z",
          number: "PB-0091",
          document_type: "direct_purchase",
          location: "Gudang utama",
          quantity_delta: "25",
          value_delta: "375000",
          balance_quantity: "25",
          balance_value: "375000",
        },
      ];
    else
      items = docs
        .filter(
          (d) =>
            (action === "counts"
              ? d.kind === "count"
              : action === "waste"
                ? [
                    "waste",
                    "spoilage",
                    "shrinkage",
                    "staff_consumption",
                  ].includes(d.kind)
                : action === "adjustments"
                  ? d.kind === "manual"
                  : Boolean(d.approval_id)) &&
            (data.status === "all" || !data.status || d.status === data.status),
        )
        .map((d) => ({ ...d, lines: undefined }));
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: 20,
      summary: {
        items: items.length,
        low: items.filter((i) => i.low_stock).length,
        value: "375000",
        pending: items.filter((i) => i.status === "pending").length,
        posted: items.filter((i) => i.status === "posted").length,
      },
    };
  };
}
