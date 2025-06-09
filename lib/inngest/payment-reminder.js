import { ConvexHttpClient } from "convex/browser";
import { inngest } from "./client";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const paymentReminders = inngest.createFunction(
  { id: "send-payment-reminders" },
  { cron: "0 10 * * *" }, // Every day at 10:00 AM
  async ({ step }) => {
    const users = await step.run("fetch-debts", () =>
      convex.query(api.inngest.getUserWithOutstandingDebts)
    );

    const results = await step.run("send-emails", async () => {
      return Promise.all(
        users.map(async (u) => {
          if (!u.debts || u.debts.length === 0) {
            return {
              userId: u._id,
              skipped: true,
            };
          }

          // Generate table rows manually using template literals
          const rows = u.debts
            .map((d) => {
              return `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ccc;">${d.name}</td>
                  <td style="padding: 8px; border: 1px solid #ccc;">$${d.amount.toFixed(2)}</td>
                </tr>
              `;
            })
            .join("");

          const html = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="margin-bottom: 8px;">Spliter - Payment Reminder</h2>
    <p style="margin-top: 0;">Hi ${u.name},</p>
    <p style="margin-bottom: 16px;">You have the following outstanding balances:</p>
    <table style="border-collapse: collapse; width: auto; margin-bottom: 16px;">
      <thead>
        <tr>
          <th style="border: 1px solid #ccc; padding: 6px 12px; text-align: left; background-color: #f5f5f5;">To</th>
          <th style="border: 1px solid #ccc; padding: 6px 12px; text-align: left; background-color: #f5f5f5;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${u.debts
          .map(
            (d) => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 6px 12px;">${d.name}</td>
            <td style="border: 1px solid #ccc; padding: 6px 12px;">$${d.amount.toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    <p style="margin-top: 0;">Please settle up soon. Thanks!</p>
  </div>
`;

          try {
            await convex.action(api.email.sendEmail, {
              to: u.email,
              subject: "You have pending payments on Spliter",
              html,
              apiKey: process.env.RESEND_API_KEY,
            });
            return { userId: u._id, success: true };
          } catch (err) {
            return { userId: u._id, success: false, error: err.message };
          }
        })
      );
    });

    return {
      processed: results.length,
      successes: results.filter((r) => r.success).length,
      failures: results.filter((r) => r.success === false).length,
    };
  }
);
