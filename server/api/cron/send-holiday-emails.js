const connectDB = require("../../database");
const Customer = require("../../models/customer");
const EmailTemplate = require("../../models/emailTemplate");
const sendEmail = require("../../utils/sendEmail");

module.exports = async (req, res) => {
  if (req.method && req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const holidayList = ["2025-12-25", "2025-01-01", "2025-04-14"];

    if (!holidayList.includes(today)) {
      return res.status(200).json({ message: "Not a holiday today." });
    }

    const template = await EmailTemplate.findOne({ category: "Holiday" });
    if (!template) {
      return res.status(404).json({ message: "No holiday template found" });
    }

    const customers = await Customer.find({ email: { $exists: true } });

    for (const customer of customers) {
      const personalizedBody = template.body.replace(
        /{{fullName}}/g,
        customer.fullName || "Valued Customer"
      );

      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html: personalizedBody,
      });
    }

    res.status(200).json({
      message: `Holiday emails sent to ${customers.length} customers`,
    });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
