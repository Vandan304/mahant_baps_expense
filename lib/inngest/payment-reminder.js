import { ConvexHttpClient } from "convex/browser";
import { inngest } from "./client";
import { api } from "@/convex/_generated/api";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
export const paymentReminders = inngest.createFunction(
  { id: "send-payment-reminders" },
  { cron: "0 10 * * *" },
  async ({ step }) => {
    const users = await step.run("fetch-debts", () =>
      convex.query(api.inngest.getUserWithOutstandingDebts)
    );
    const result = await step.run("send-emails", async () => {
      return Promise.all(
        users.map(async (u) => {
          const rows = u.debts
            .map((d) => (
              <tr key={d.id}>
                <td style="padding:4px 8px;">${d.name}</td>
                <td style="padding:4px 8px;">$${d.amount.toFixed(2)}</td>
              </tr>
            ))
            .join("");
          if (!rows) {
            return {
              userId: u._id,
              skipped: true,
            };
            const html = `
            <h2>Spliter - Payment Reminder</h2>
            <p>Hi ${u.name},you have the following outstandig balances:</p>
            <table cellspacing="0" cellpadding="0" border:"1"
            style="border-collapse:collapse;">
            <thead>
            <tr><th>To</th><th>Amount</th></tr>
            </thead>
            <tbody>${rows}</tbody>
            </table>
            <p>Please settle up soon. Thanks!</p>
            `;
          }
        })
      );
    });
  }
);
