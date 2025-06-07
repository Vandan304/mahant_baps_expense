"use client";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import React from "react";

const GroupBalances = ({ balances }) => {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  if (!balances?.length || !currentUser) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No balance information availble
      </div>
    );
  }
  const me = balances.find((b) => b.id === currentUser._id);
  if (!me) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        You're not part of this group
      </div>
    );
  }
  const userMap = Object.fromEntries(balances.map((b) => [b.id, b]));
  const owedByMembers = me.owedBy
    .map(({ from, amount }) => ({ ...userMap[from], amount }))
    .sort((a, b) => b.amount - a.amount);
  const owingToMembers = me.owes
    .map(({ to, amount }) => ({ ...userMap[to], amount }))
    .sort((a, b) => b.amount - a.amount);
  return <div></div>;
};

export default GroupBalances;
