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

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayFormatted = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const year = now.getFullYear();

    const holidayMap = {
      "2025-12-25": "Christmas",
      "2025-01-01": "NewYear",
      "2025-04-14": "SinhalaTamilNewYear",
      "2025-07-12": "CompanyHoliday",
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

    const emailHeader = `
      <div style="background:linear-gradient(135deg, #000000 0%, #1a1a1a 100%);padding:20px;color:#ffd700;text-align:center;border-bottom:3px solid #ffd700;">
        <h1 style="margin:0;font-size:28px;font-weight:bold;text-shadow:0 2px 4px rgba(255,215,0,0.3);">{{company}}</h1>
        <p style="margin:8px 0 0 0;font-size:14px;color:#f5f5f5;opacity:0.9;">{{date}}</p>
      </div>
    `;

    const emailFooter = `
      <div style="background:linear-gradient(135deg, #1a1a1a 0%, #000000 100%);padding:20px;text-align:center;font-size:12px;color:#cccccc;border-top:1px solid #333;">
        <p style="margin:0;color:#ffd700;">&copy; {{year}} {{company}}. All rights reserved.</p>
      </div>
    `;

    const customers = await Customer.find({ email: { $exists: true } });

    for (const customer of customers) {
      const fullHtml = `
        <html>
          <body style="font-family:sans-serif;background:#f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <table width="600" style="background:white;border-radius:8px;overflow:hidden;">
                  <tr><td>${emailHeader}</td></tr>
                  <tr><td style="padding:30px;">${template.body}</td></tr>
                  <tr><td>${emailFooter}</td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;

      const personalizedHtml = fullHtml
        .replace(/{{fullName}}/g, customer.fullName || "Valued Customer")
        .replace(/{{company}}/g, customer.company || "Your Company")
        .replace(/{{date}}/g, todayFormatted)
        .replace(/{{year}}/g, year);

      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html: personalizedHtml,
      });
    }

    res.status(200).json({
      message: `${template.category} emails sent to ${customers.length} customers`,
    });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
