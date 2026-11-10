export function createSettingsReview(id) {
  const profile = {
    revision: 1,
    restaurantName: "Dapur Keluarga",
    outletName: "Restoran utama",
    address: "",
    phone: "",
    timezone: "Asia/Jakarta",
    taxPercent: "0",
    servicePercent: "0",
    rounding: "nearest_1",
    currency: "IDR",
    timezoneLocked: true,
    canRenameRestaurant: true,
  };
  const receipt = {
    revision: 1,
    header: "Selamat menikmati",
    footer: "Terima kasih",
    paperWidth: 80,
    digitalEnabled: false,
    printerId: "",
    printers: [],
  };
  const categories = [
    {
      id,
      name: "Makanan",
      kind: "food",
      sortOrder: 0,
      active: true,
      visible: true,
      revision: 1,
    },
  ];
  const menus = [];
  const payments = [];
  const roles = [
    {
      id,
      name: "Pemilik",
      revision: 1,
      discountPercent: "100",
      permissions: ["organization.read"],
    },
    {
      id: "65ef7c2e-d91a-4efb-a0bb-019c422063a1",
      name: "Manajer",
      revision: 1,
      discountPercent: "10",
      permissions: ["menu.read"],
    },
  ];
  return (write, action, data) => {
    if (write) {
      if (action === "profile")
        Object.assign(profile, data, { revision: profile.revision + 1 });
      if (action === "receipt")
        Object.assign(receipt, data, { revision: receipt.revision + 1 });
      if (action === "category") {
        const old = categories.find((c) => c.id === data.id);
        if (old) Object.assign(old, data, { revision: old.revision + 1 });
        else categories.push({ ...data, id: crypto.randomUUID(), revision: 1 });
      }
      if (action === "menu") {
        const old = menus.find((m) => m.id === data.id);
        if (old) Object.assign(old, data, { revision: old.revision + 1 });
        else
          menus.push({
            ...data,
            id: crypto.randomUUID(),
            revision: 1,
            code: "MENU-001",
            category: "Makanan",
            categoryStatus: "active",
            categoryVisible: true,
            recipeName: null,
            cost: null,
            prices: [],
          });
      }
      if (action === "price") {
        const m = menus.find((m) => m.id === data.id);
        m.price = data.amount;
        m.revision++;
        m.prices.push({
          id: crypto.randomUUID(),
          amount: data.amount,
          valid_from: new Date().toISOString(),
          valid_to: null,
          reason: data.reason,
          cancelled_at: null,
        });
      }
      if (action === "payment") {
        const old = payments.find((m) => m.id === data.id);
        if (old) Object.assign(old, data, { revision: old.revision + 1 });
        else
          payments.push({
            ...data,
            id: crypto.randomUUID(),
            revision: 1,
            clearingAccount: "Kas restoran",
            approval: data.kind === "edc",
            used: false,
          });
      }
      if (action === "role")
        Object.assign(
          roles.find((r) => r.id === data.id),
          data,
        );
      return { id: data.id ?? id };
    }
    if (action === "profile") return profile;
    if (action === "receipt") return receipt;
    if (action === "options")
      return {
        categories,
        recipes: [],
        canLinkRecipe: true,
        canReadCost: true,
      };
    if (action === "menus") {
      const items = menus.filter((m) =>
        m.name.toLowerCase().includes((data.search ?? "").toLowerCase()),
      );
      return { items, total: items.length };
    }
    if (action === "menu_detail") return menus.find((m) => m.id === data.id);
    if (action === "payments")
      return { items: payments, accounts: [{ id, name: "Kas restoran" }] };
    if (action === "access")
      return {
        actorId: id,
        canReadStaff: true,
        roles,
        permissions: [
          { code: "menu.read", description: "Melihat menu" },
          { code: "menu.manage", description: "Mengelola menu" },
          {
            code: "rbac.manage",
            description: "Mengatur role (khusus Pemilik)",
          },
        ],
        employees: [
          {
            id,
            name: "Pemilik restoran",
            code: "KRY-001",
            active: true,
            roleIds: [id],
          },
        ],
      };
    throw new Error("Unknown settings fixture");
  };
}
