import { useConvexQuery } from "@/hooks/use-convex-query";
import React from "react";

const DashboardPage = () => {
  const { data: balances, isLoading: balancesLoading } = useConvexQuery(
    api.dashboard.getUserBalances
  );
  const { data: groups, isLoading: groupsLoading } = useConvexQuery(
    api.dashboard.getUserGroups
  );
  const { data: totalSpent, isLoading: totalSpentLoading } = useConvexQuery(
    api.dashboard.getTotalSpent
  );
  const { data: monthlySpending, isLoading: monthlySpendingLoading } = useConvexQuery(
    api.dashboard.getTotalSpent
  );
  return <div>dashboard</div>;
};

export default DashboardPage;
