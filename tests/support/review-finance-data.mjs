// UI fixtures only; PostgreSQL tests verify financial invariants.
import { randomUUID } from "node:crypto";
export function createFinanceReview(outletId) {
  const cash = "82000000-0000-0000-0000-000000000001",
    bank = "82000000-0000-0000-0000-000000000002",
    cat = "82000000-0000-0000-0000-000000000003";
  const accounts = [
    {
      id: cash,
      name: "Kas restoran",
      kind: "cash",
      mask: null,
      active: true,
      balance: "750000",
    },
    {
      id: bank,
      name: "Bank operasional",
      kind: "bank",
      mask: "**** 1234",
      active: true,
      balance: "1000000",
    },
  ];
  const categories = [{ id: cat, name: "Listrik dan air" }],
    movements = [],
    expenses = [],
    journals = [],
    banks = [],
    matches = [],
    requests = new Map();
  const addMove = (id, amount, description) => {
    const a = accounts.find((a) => a.id === id);
    a.balance = String(Number(a.balance) + Number(amount));
    const m = {
      id: randomUUID(),
      date: new Date().toISOString(),
      number: "FIN-" + String(movements.length + 1),
      account: a.name,
      accountId: id,
      amount: String(amount),
      remaining: String(amount),
      reference: description,
      description,
    };
    movements.unshift(m);
    return m;
  };
  const addJournal = (description, amount) => {
    const id = randomUUID();
    journals.unshift({
      id,
      date: new Date().toISOString(),
      number: "JRN-" + (journals.length + 1),
      description,
      source: "expense",
      debit: amount,
      credit: amount,
      lines: [
        {
          id: randomUUID(),
          name: "Beban operasional",
          code: "BEBAN",
          debit: amount,
          credit: "0",
        },
        {
          id: randomUUID(),
          name: "Kas / bank",
          code: "KAS",
          debit: "0",
          credit: amount,
        },
      ],
    });
  };
  addMove(bank, "1000000", "Setoran modal bank");
  accounts.find((a) => a.id === bank).balance = "1000000";
  addJournal("Setoran modal bank", "1000000");
  function handle(write, action, data = {}, requestId) {
    if (write) {
      if (requests.has(requestId)) return requests.get(requestId);
      const id = randomUUID();
      let result = { id, added: 0, skipped: 0 };
      if (action === "account") {
        const a = accounts.find((a) => a.id === data.id);
        if (a) Object.assign(a, data);
        else accounts.push({ id, ...data, active: true, balance: "0" });
      }
      if (action === "category") categories.push({ id, name: data.name });
      if (action === "capital") {
        addMove(data.accountId, data.amount, data.description);
        addJournal(data.description, data.amount);
      }
      if (action === "transfer") {
        addMove(data.accountId, -Number(data.amount), data.description);
        addMove(data.toAccountId, data.amount, data.description);
        addJournal(data.description, data.amount);
      }
      if (action === "expense") {
        const a = accounts.find((a) => a.id === data.accountId);
        expenses.unshift({
          id,
          date: data.date,
          number: "EXP-" + (expenses.length + 1),
          amount: data.amount,
          description: data.description,
          account: a.name,
          category: categories.find((c) => c.id === data.categoryId)?.name,
          proof: true,
          key: data.proofKey,
        });
        addMove(a.id, -Number(data.amount), data.description);
        addJournal(data.description, data.amount);
      }
      if (action === "import") {
        for (const row of data.lines) {
          if (
            banks.some(
              (l) => l.key === row.key && l.accountId === data.accountId,
            )
          ) {
            result.skipped++;
            continue;
          }
          banks.push({
            id: randomUUID(),
            accountId: data.accountId,
            ...row,
            remaining: row.amount,
            date: row.date + "T00:00:00Z",
          });
          result.added++;
        }
      }
      if (action === "reconcile") {
        for (const row of data.bank) {
          const l = banks.find((l) => l.id === row.id);
          l.remaining = String(Number(l.remaining) - Number(row.amount));
        }
        for (const row of data.book) {
          const l = movements.find((l) => l.id === row.id);
          l.remaining = String(Number(l.remaining) - Number(row.amount));
        }
        matches.unshift({
          id,
          number: "REC-" + (matches.length + 1),
          date: new Date().toISOString(),
          account: accounts.find((a) => a.id === data.accountId).name,
          amount: String(data.bank.reduce((s, l) => s + Number(l.amount), 0)),
          status: "reconciled",
          bankCount: data.bank.length,
          bookCount: data.book.length,
          difference: "0",
        });
      }
      requests.set(requestId, result);
      return result;
    }
    if (action === "options")
      return { accounts, categories, timezone: "Asia/Jakarta" };
    if (action === "proof")
      return { key: expenses.find((e) => e.id === data.id)?.key };
    if (action === "journal_detail")
      return journals.find((j) => j.id === data.id);
    if (action === "reconcile_options")
      return {
        bank: banks.filter(
          (l) => l.accountId === data.accountId && Number(l.remaining) !== 0,
        ),
        book: movements.filter(
          (l) => l.accountId === data.accountId && Number(l.remaining) !== 0,
        ),
      };
    if (action === "suppliers")
      return {
        items: [
          {
            id: outletId,
            number: "PB-20261109-001",
            supplier_name: "Tani Sejahtera",
            invoice_number: "INV-0091",
            invoice_date: "2026-11-09",
            due_date: "2026-11-16",
            total: "375000",
            payment_status: "unpaid",
            lines: [
              {
                name: "Beras premium",
                unit: "kg",
                quantity: "25",
                unit_price: "15000",
                total: "375000",
              },
            ],
          },
        ],
        total: 1,
        summary: { outstanding: "375000", paid: "0" },
      };
    let items =
      action === "movements"
        ? movements
        : action === "expenses"
          ? expenses
          : action === "journals"
            ? journals
            : matches;
    if (data.search)
      items = items.filter((l) =>
        JSON.stringify(l).toLowerCase().includes(data.search.toLowerCase()),
      );
    if (data.accountId)
      items = items.filter(
        (l) =>
          l.accountId === data.accountId ||
          l.account === accounts.find((a) => a.id === data.accountId)?.name,
      );
    const total = items.length;
    const summary = {
      amount: String(items.reduce((s, l) => s + Number(l.amount ?? 0), 0)),
      debit: String(items.reduce((s, l) => s + Number(l.debit ?? 0), 0)),
      credit: String(items.reduce((s, l) => s + Number(l.credit ?? 0), 0)),
    };
    return {
      items: items.slice(((data.page ?? 1) - 1) * 20, (data.page ?? 1) * 20),
      total,
      summary,
    };
  }
  return handle;
}
