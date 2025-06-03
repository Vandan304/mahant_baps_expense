import { internal } from "./_generated/api";
import { query } from "./_generated/server";

export const getUserBalances = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const expenses = (await ctx.db.query("expenses").collect()).filter(
      (e) =>
        !e.groupId &&
        (e.paidByUserId === user._id ||
          (Array.isArray(e.splits) &&
            e.splits.some((s) => s.userId === user._id)))
    );
    let youOwe = 0;
    let youAreOwed = 0;
    const balanceByUser = {};
    for (const e of expenses) {
      const isPayer = e.paidByUserId === user._id;
      const mySplit = Array.isArray(e.splits)
        ? e.splits.find((s) => s.userId === user._id)
        : null;
      if (isPayer) {
        if (Array.isArray(e.splits)) {
          for (const s of e.splits) {
            if (s.userId === user._id || s.paid) {
              continue;
            }
            youAreOwed += s.amount;
            (balanceByUser[s.userId] ??= { owed: 0, owing: 0 }).owed +=
              s.amount;
          }
        }
      } else if (mySplit && !mySplit.paid) {
        youOwe += mySplit.amount;
        (balanceByUser[e.paidByUserId] ??= { owed: 0, owing: 0 }).owing +=
          mySplit.amount;
      }
    }
    const settlements = (await ctx.db.query("settlements").collect()).filter(
      (s) =>
        !s.groupId &&
        (s.paidByUserId === user._id || s.receivedByUserId === user._id)
    );
    for (const s of settlements) {
      if (s.paidByUserId === user._id) {
        youOwe -= s.amount;
        (balanceByUser[s.receivedByUserId] ??= { owed: 0, owing: 0 }).owing -=
          s.amount;
      } else {
        youAreOwed -= s.amount;
        (balanceByUser[s.paidByUserId] ??= { owed: 0, owing: 0 }).owing -=
          s.amount;
      }
    }
    const youOweList = [];
    const youAreOwedByList = [];

    for (const [uid, { owed, owing }] of Object.entries(balanceByUser)) {
      const net = owed - owing;
      if (net === 0) {
        continue;
      }
      const counterpart = await ctx.db.get(uid);
      const base = {
        userId: uid,
        name: counterpart?.name ?? "Unknown",
        imageUrl: counterpart?.imageUrl,
        amount: Math.abs(net),
      };
      net > 0 ? youAreOwedByList.push(base) : youOweList.push(base);
    }
    youOweList.sort((a, b) => b.amount - a.amount);
    youAreOwedByList.sort((a, b) => b.amount - a.amount);
    return {
      youOwe,
      youAreOwed,
      totalBalance: youAreOwed - youOwe,
      oweDetails: { youOwe: youOweList, youAreOwedBy: youAreOwedByList },
    };
  },
});

export const getTotalSpent = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).getTime();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) => q.gte("date", startOfYear))
      .collect();

    const userExpenses = expenses.filter(
      (expense) =>
        expense.paidByUserId === user._id ||
        (Array.isArray(expense.splits) &&
          expense.splits.some((split) => split.userId === user._id))
    );
    let totalSpent = 0;
    userExpenses.forEach((expense) => {
      const userSplit = Array.isArray(expense.splits)
        ? expense.splits.find((split) => split.userId === user._id)
        : null;
      if (userSplit) {
        totalSpent += userSplit.amount;
      }
    });
    return totalSpent;
  },
});

export const getMonthlySpending = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if (!user) {
      return [];
    }

    // Get current year and start timestamp
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).getTime();

    // Fetch expenses from DB using the index "by_date" on date field
    const allExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_date", (q) => q.gte("date", startOfYear))
      .collect();

    // Filter for expenses involving current user
    const userExpenses = allExpenses.filter((expense) => {
      if (!expense) return false;
      if (expense.paidByUserId === user._id) return true;
      if (!Array.isArray(expense.splits)) return false;
      return expense.splits.some((split) => split.userId === user._id);
    });

    // Initialize monthly totals for all months of the year to zero
    const monthlyTotals = {};
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentYear, i, 1);
      monthlyTotals[monthDate.getTime()] = 0;
    }

    // Sum user's share for each expense by month
    userExpenses.forEach((expense) => {
      if (!expense.date) return; // skip invalid dates

      const date = new Date(expense.date);
      if (date.getFullYear() !== currentYear) return; // only current year

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();

      // Find the user's split for this expense
      const userSplit = expense.splits.find((split) => split.userId === user._id);

      if (userSplit && typeof userSplit.amount === "number") {
        monthlyTotals[monthStart] = (monthlyTotals[monthStart] || 0) + userSplit.amount;
      } else if (expense.paidByUserId === user._id && typeof expense.amount === "number") {
        // If user paid the whole expense (no split found), add full amount
        monthlyTotals[monthStart] = (monthlyTotals[monthStart] || 0) + expense.amount;
      }
    });

    // Convert monthlyTotals object to sorted array
    const result = Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month: parseInt(month),
        total,
      }))
      .sort((a, b) => a.month - b.month);

    return result;
  },
});




export const getUserGroups = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);
    const allGroups = await ctx.db.query("groups").collect();
    const groups = allGroups.filter(
      (group) =>
        Array.isArray(group.members) &&
        group.members.some((member) => member.userId === user._id)
    );
    const enhansedGroups = await Promise.all(
      groups.map(async (group) => {
        const expenses = await ctx.db
          .query("expenses")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();
        let balance = 0;
        expenses.forEach((expense) => {
          if (expense.paidByUserId === user._id) {
            if (Array.isArray(expense.splits)) {
              expense.splits.forEach((split) => {
                if (split.userId != user._id && !split.paid) {
                  balance += split.amount;
                }
              });
            }
          } else {
            const userSplit = Array.isArray(expense.splits)
              ? expense.splits.find((split) => split.userId === user._id)
              : null;
            if (userSplit && !userSplit.paid) {
              balance -= userSplit.amount;
            }
          }
        });
        //settlements
        const settlements = await ctx.db
          .query("settlements")
          .filter((q) =>
            q.and(
              q.eq(q.field("groupId"), group._id),
              q.or(
                q.eq(q.field("paidByUserId"), user._id),
                q.eq(q.field("receivedByUserId"), user._id)
              )
            )
          )
          .collect();
        settlements.forEach((settlement) => {
          if (settlement.paidByUserId === user._id) {
            balance += settlement.amount;
          } else {
            balance -= settlement.amount;
          }
        });
        return {
          ...group,
          id: group.id,
          balance,
        };
      })
    );
    return enhansedGroups;
  },
});
