const connectDB = require("../../database");
const Customer = require("../../models/customer");
const EmailTemplate = require("../../models/emailTemplate");
const sendEmail = require("../../utils/sendEmail");
const { processEmailTemplate } = require("../../utils/emailWrapper");

module.exports = async (req, res) => {
  if (req.method && req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const holidayMap = {
      "2025-12-25": "Christmas",
      "2025-01-01": "NewYear",
      "2025-04-14": "SinhalaTamilNewYear",
      "2025-07-07": "CompanyHoliday",
    };

    const category = holidayMap[today];

    if (!category) {
      return res.status(200).json({ message: "Not a holiday today." });
    }

    const template = await EmailTemplate.findOne({ category });
    if (!template) {
      return res
        .status(404)
        .json({ message: `No template found for ${category}` });
    }

    const customers = await Customer.find({ email: { $exists: true } });

    for (const customer of customers) {
      // Process the template: wrap with header/footer and personalize
      const personalizedHtml = processEmailTemplate(template.body, customer);

      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html: personalizedHtml,
      });
    }

    res.status(200).json({
      message: `${category} emails sent to ${customers.length} customers`,
    });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
