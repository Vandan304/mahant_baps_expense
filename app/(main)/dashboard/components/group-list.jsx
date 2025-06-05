import { Users } from "lucide-react";
import Link from "next/link";
import React from "react";

const GroupList = ({ groups }) => {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No Groups yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a group to start tracking shared expenses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group, index) => {
        const balance = group.balance || 0;
        const hasBalance = balance !== 0;

        // Use group.id if defined and unique, otherwise fallback to index (less ideal)
        const key = group.id ?? index;

        return (
          <Link
            href={`/groups/${group._id}`}
            key={key}
            className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.members.length} members
                </p>
                {/* Example rendering members - ensure unique key here too */}
                {/* 
                {group.members.map((member) => (
                  <div key={member.id}>{member.name}</div>
                ))} 
                */}
              </div>
            </div>
            {hasBalance && (
              <span
                className={`text-sm font-medium ${
                  balance > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {balance > 0 ? "+" : ""}
                ${balance.toFixed(2)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default GroupList;
