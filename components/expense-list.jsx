import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { getCategoryById, getCategoryIcon } from "@/lib/expense-categories";
import { format } from "date-fns";

const ExpenseList = ({
  expenses,
  showOtherPerson = true,
  isGroupExpense = true,
  otherPersonId = null,
  userLookupMap = {},
}) => {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const deleteExpense = useConvexMutation(api.expenses.deleteExpense);
  if (!expenses || !expenses.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No expenses found
        </CardContent>
      </Card>
    );
  }
  const getUserDetails = (userId) => {
    return {
      name:
        userId === currentUser?._id
          ? "You"
          : userLookupMap[userId]?.name || "Other User",
      imageUrl: null,
      id: userId,
    };
  };

  const canDeleteExpense = (expense) => {
    if (!currentUser) {
      return false;
    }
    return (
      expense.createBy === currentUser._id ||
      expense.paidByUserId === currentUser._id
    );
  };
  return (
    <div className="flex flex-col gap-4">
      {expenses.map((expense) => {
        const payer = getUserDetails(expense.paidByUserId);
        const isCurrentUserPayer = expense.paidByUserId === currentUser?._id;
        const category = getCategoryById(expense.category);
        const CategoryIcon = getCategoryIcon(category.id);
        const showDeleteOption = canDeleteExpense(expense);
        return (
          <Card key={expense._id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CategoryIcon className="h-5 w-5 text-primary " />
                  </div>
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>

                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>
                        {expense.date
                          ? format(new Date(expense.date), "MMM d, yyyy")
                          : "Invalid date"}
                      </span>
                      {showOtherPerson && (
                        <>
                          <span>•</span>
                          <span>
                            {isCurrentUserPayer ? "You" : payer.name} paid
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ExpenseList;
