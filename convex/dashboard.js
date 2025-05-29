import { internal } from "./_generated/api";
import { query } from "./_generated/server";

export const getUserBalances = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.user.getCurrentUser);
    const expenses = (await ctx.db.query("expenses").collect).filter(
      (e) =>
        !e.groupId &&
        (e.paidByUserId === user._id ||
          e.splits.some((s) => s.userId === user._id))
    );
    let youOwe = 0;
    let youAreOwed = 0;
    const balanceByUser = {};
    for (const e of expenses) {
      const isPayer = e.paidByUserId === user._id;
      const mySplit = e.splits.find((s) => s.userId === user._id);
      if (isPayer) {
        for (const s of e.splits) {
          if (s.userId === user._id || s.paid) {
            continue;
          }
          youAreOwed += s.amount;
          (balanceByUser[s.user] ??= { owed: 0, owing: 0 }).owed += s.amount;
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
      net > 0 ? youAreOwedByList.push(base) : youAreOwed.push(base);
    }
    youOweList.sort((a, b) => b.amount - a.amount);
    youAreOwedByList.sort((a, b) => b.amount - a.amount);
    return {
      youOwe,
      youAreOwed,
      totalBalance: youAreOwed - youOwe,
      ownDetails: { youOwe: youOweList, youAreOwed: youAreOwedByList },
    };
  },
});
