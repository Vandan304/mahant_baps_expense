"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ExpenseSummary = ({ monthlySpending , totalSpent }) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Ensure monthlySpending is an array before mapping
  const chartData = Array.isArray(monthlySpending)
    ? monthlySpending.map((item) => {
        const date = new Date(item.month);
        return {
          name: monthNames[date.getMonth()] || "Unknown",
          amount: typeof item.total === "number" ? item.total : 0,
        };
      })
    : [];

  // Find the data for the current month safely
  const thisMonthData = Array.isArray(monthlySpending)
    ? monthlySpending.find((item) => {
        const date = new Date(item.month);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total this month</p>
            <h3 className="text-2xl font-bold mt-1">
              $
              {typeof thisMonthData?.total === "number"
                ? thisMonthData.total.toFixed(2)
                : "0.00"}
            </h3>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total this year</p>
            <h3 className="text-2xl font-bold mt-1">
              ${typeof totalSpent === "number" ? totalSpent.toFixed(2) : "0.00"}
            </h3>
          </div>
        </div>

        <div className="h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="amount" fill="#36d7b7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Monthly spending for {currentYear}
        </p>
      </CardContent>
    </Card>
  );
};

export default ExpenseSummary;
