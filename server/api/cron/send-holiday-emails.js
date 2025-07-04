// /api/cron/send-holiday-emails.js
import dbConnect from "../../utils/dbConnect"; // your MongoDB connector
import Customer from "../../models/customer";
import EmailTemplate from "../../models/emailTemplate";
import { sendEmail } from "../../utils/mailer"; // your sendEmail util
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  await dbConnect();

  const today = new Date().toISOString().split("T")[0];

  // 🌍 Check holidays from Calendarific API
  const calendarKey = process.env.CALENDARIFIC_KEY;

  try {
    const response = await axios.get(
      `https://calendarific.com/api/v2/holidays`,
      {
        params: {
          api_key: calendarKey,
          country: "US", // or "LK" for Sri Lanka
          year: new Date().getFullYear(),
        },
      }
    );

    const holidays = response.data.response.holidays;
    const todayHoliday = holidays.find((h) => h.date.iso === today);
    if (!todayHoliday)
      return res.status(200).json({ message: "No holiday today." });

    const template = await EmailTemplate.findOne({
      category: "Holiday",
      name: new RegExp(todayHoliday.name, "i"),
    });

    if (!template)
      return res.status(404).json({ message: "No matching template found." });

    const customers = await Customer.find({ isSubscribed: true });

    for (const customer of customers) {
      const html = template.body.replace("[customer name]", customer.fullName);

      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html,
      });
    }

    return res.status(200).json({
      message: `🎉 Sent ${todayHoliday.name} emails to ${customers.length} customers.`,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to process holiday campaign", err });
  }
}
