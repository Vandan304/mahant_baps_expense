import { query } from "./_generated/server";

export const getUserWithOutstandingDebts = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const result = [];
    const expenses = await ctx.db
      .query("expenses")
      .filter((q) => q.eq(q.field("groupId"), undefined))
      .collect();
    const settlements = await ctx.db
      .query("settlements")
      .filter((q) => q.eq(q.field("groupId"), undefined))
      .collect();
    const userCache = new Map();
    const getUser = async (id) => {
      if (!userCache.has(id)) {
        userCache.set(id, await ctx.db.get(id));
      }
      return userCache.get(id);
    };
    for (const user of users) {
      const ledger = new Map();
      for (const exp of expenses) {
        if (exp.paidByUserId !== user._id) {
          const split = exp.splits.find(
            (s) => s.userId === user._id && !s.paid
          );
          if (!split) {
            continue;
          }
          const entry = ledger.get(exp.paidByUserId) ?? {
            amount: 0,
            since: exp.date,
          };
          entry.amount += split.amount;
          entry.since = Math.min(entry.since, exp.date);
          ledger.set(exp.paidByUserId, entry);
        } else {
          for (const s of exp.splits) {
            if (s.userId === user._id || s.paid) {
              continue;
            }
            const entry = ledger.get(s.userId) ?? {
              amount: 0,
              since: exp.date,
            };
            entry.amount -= s.amount;
            ledger.set(s.userId, entry);
          }
        }
      }
      for (const st of settlements) {
        if (st.paidByUserId === user._id) {
          const entry = ledger.get(st.receivedByUserId);
          if (entry) {
            entry.amount -= st.amount;
            if (entry.amount === 0) {
              ledger.delete(st.receivedByUserId);
            } else {
              ledger.set(st.receivedByUserId, entry);
            }
          }
        } else if (st.receivedByUserId === user._id) {
          const entry = ledger.get(st.paidByUserId);
          if (entry) {
            entry.amount += st.amount;
            if (entry.amount === 0) {
              ledger.delete(st.paidByUserId);
            } else {
              ledger.set(st.paidByUserId, entry);
            }
          }
        } else if (st.receivedByUserId === user._id) {
          const entry = ledger.get(st.paidByUserId);
          if (entry) {
            entry.amount += st.amount;
            if (entry.amount === 0) {
              ledger.delete(st.paidByUserId);
            } else {
              ledger.set(st.paidByUserId, entry);
            }
          }
        }
      }
      const debts = [];
      for (const [counterId, { amount, since }] of ledger) {
        if (amount > 0) {
          const counter = await getUser(counterId);
          debts.push({
            userId: counterId,
            name: counter?.name ?? "Unknown",
            amount,
            since,
          });
        }
      }
      if (debts.length) {
        result.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          debts,
        });
      }
    }
    return result;
  },
});

export const getUserWithExpenses = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const result = [];
    const now = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    const monthStart = oneMonthAgo.getTime();
    for (const user of users) {
      const paidExpenses = await ctx.db
        .query("expenses")
        .withIndex("by_date", (q) => q.gte("date", monthStart))
        .filter((q) => q.eq(q.field("paidByUserId"), user._id))
        .collect();

      const allRecentExpenses = await ctx.db
        .query("expenses")
        .withIndex("by_date", (q) => q.gte("date", monthStart))
        .collect();
      const splitExpenses = allRecentExpenses.filter((expense) =>
        expense.splits.some((split) => split.userId === user._id)
      );
      const userExpenses = [...new Set([...paidExpenses, ...splitExpenses])];
      if (userExpenses.length > 0) {
        result.push({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      }
    }
    return result;
  },
});
