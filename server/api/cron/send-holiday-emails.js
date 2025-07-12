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
      "2025-07-12": "Christmas",
      "2025-01-01": "NewYear",
      "2025-04-14": "SinhalaTamilNewYear",
      "2025-07-11": "CompanyHoliday",
    };

    const category = holidayMap[today];

    if (!category) {
      return res.status(200).json({ message: "Not a holiday today." });
    }
    const themeKey = category.toLowerCase();
    const theme = holidayThemes[themeKey] || {};

    const template = await EmailTemplate.findOne({ category });
    if (!template) {
      return res
        .status(404)
        .json({ message: `No template found for ${category}` });
    }

    const emailHeader = `
  <div style="background:${
    theme.background
  };padding:25px;color:#ffffff;text-align:center;border-bottom:4px solid ${
      theme.accent
    };position:relative;overflow:hidden;">
    <div style="position:absolute;top:10px;right:15px;font-size:24px;opacity:0.7;">${
      theme.emoji?.[0] || ""
    }</div>
    <div style="position:absolute;top:10px;left:15px;font-size:24px;opacity:0.7;">${
      theme.emoji?.[1] || ""
    }</div>
    <h1 style="margin:0;font-size:32px;font-weight:bold;text-shadow:0 3px 6px rgba(0,0,0,0.3);color:#ffffff;position:relative;z-index:2;">{{company}}</h1>
    <p style="margin:12px 0 0 0;font-size:16px;color:#e8f5e8;opacity:0.95;position:relative;z-index:2;">{{date}}</p>
  </div>
`;

    const emailFooter = `
  <div style="background:${theme.background};padding:20px;text-align:center;font-size:12px;color:#e8f5e8;border-top:2px solid ${theme.accent};position:relative;">
    <p style="margin:0;color:${theme.accent};font-weight:bold;position:relative;z-index:2;">&copy; {{year}} {{company}}. All rights reserved.</p>
    <p style="margin:5px 0 0 0;color:#e8f5e8;opacity:0.8;position:relative;z-index:2;">Celebrating every season with you!</p>
  </div>
`;

    // Optional: Holiday-specific color variants
    const holidayThemes = {
      christmas: {
        background: "linear-gradient(135deg, #2c5530 0%, #1e3a21 100%)",
        accent: "#d4af37",
        emoji: "🎄✨",
      },
      valentine: {
        background: "linear-gradient(135deg, #8b1538 0%, #5d0e26 100%)",
        accent: "#ff69b4",
        emoji: "💕🌹",
      },
      easter: {
        background: "linear-gradient(135deg, #9b59b6 0%, #663399 100%)",
        accent: "#f1c40f",
        emoji: "🐰🥚",
      },
      halloween: {
        background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
        accent: "#2c3e50",
        emoji: "🎃👻",
      },
      thanksgiving: {
        background: "linear-gradient(135deg, #a0522d 0%, #8b4513 100%)",
        accent: "#ffa500",
        emoji: "🦃🍂",
      },
      newyear: {
        background: "linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)",
        accent: "#f39c12",
        emoji: "🎊🥳",
      },
    };

    const customers = await Customer.find({ email: { $exists: true } });

    let successCount = 0;
    let failedEmails = [];

    await Promise.all(
      customers.map(async (customer) => {
        try {
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

          successCount++;
        } catch (err) {
          console.error(`Failed to send to ${customer.email}:`, err.message);
          failedEmails.push(customer.email);
        }
      })
    );

    res.status(200).json({
      message: `${template.category} emails processed.`,
      sent: successCount,
      failed: failedEmails.length,
      failedEmails,
    });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
