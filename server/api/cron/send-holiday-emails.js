const connectDB = require("../../database");
const company = require("../../models/company");
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
    const monthDay = now.toISOString().slice(5, 10);
    const todayFormatted = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const year = now.getFullYear();

    const holidayMap = {
      "01-01": "NewYear",
      "02-04": "IndependenceDaySrilanka",
      "02-14": "Valentine",
      "04-14": "SinhalaTamilNewYear",
      "06-01": "LaborDay",
      "06-05": "WorldEnvironmentDay",
      "10-31": "Halloween",
      "11-11": "VeteransDay",
      "12-25": "Christmas",
      "12-31": "NewYearsEve",
      "07-22": "CustomerAnniversary",
    };

    // Optional: Holiday-specific color variants
    const holidayThemes = {
      newyear: {
        background: "linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)",
        accent: "#f39c12",
        emoji: ["🎊", "🥳"],
      },
      independencedaysrilanka: {
        background: "linear-gradient(135deg, #005b9a 0%, #f8c300 100%)",
        accent: "#dc143c",
        emoji: ["🇱🇰", "🎉"],
      },
      valentine: {
        background: "linear-gradient(135deg, #8b1538 0%, #5d0e26 100%)",
        accent: "#ffffff",
        emoji: ["💕", "🌹"],
      },
      sinhalatamilnewyear: {
        background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
        accent: "#ffffff",
        emoji: ["🎉", "🌞"],
      },
      laborday: {
        background: "linear-gradient(135deg, #3c3b3f 0%, #605c3c 100%)",
        accent: "#ffd700",
        emoji: ["🛠️", "💼"],
      },
      worldenvironmentday: {
        background: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
        accent: "#2e7d32",
        emoji: ["🌍", "🌱"],
      },
      halloween: {
        background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
        accent: "#2c3e50",
        emoji: ["🎃", "👻"],
      },
      veteransday: {
        background: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
        accent: "#ff6f61",
        emoji: ["🎖️", "🇺🇸"],
      },
      christmas: {
        background: "linear-gradient(135deg, #2c5530 0%, #1e3a21 100%)",
        accent: "#d4af37",
        emoji: ["🎄", "✨"],
      },
      newyearseve: {
        background: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
        accent: "#e1b12c",
        emoji: ["🎆", "🍾"],
      },
    };

    const category = holidayMap[monthDay];

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
  };padding:15px 25px;color:#ffffff;text-align:center;border-bottom:4px solid ${
      theme.accent
    };position:relative;overflow:hidden;">
    <div style="font-size:20px;opacity:0.85;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span>${theme.emoji?.[0] || ""}</span>
      <span>${theme.emoji?.[1] || ""}</span>
    </div>
    <h1 style="margin:0;font-size:24px;font-weight:bold;text-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:2;">{{company}}</h1>
    <p style="margin:4px 0 0;font-size:14px;color:#e8f5e8;opacity:0.95;">{{date}}</p>
  </div>
`;

    const emailFooter = `
  <div style="background:${theme.background};padding:20px;text-align:center;font-size:12px;color:#e8f5e8;border-top:2px solid ${theme.accent};position:relative;">
    <p style="margin:0;color:${theme.accent};font-weight:bold;position:relative;z-index:2;">&copy; {{year}} {{company}}. All rights reserved.</p>
    <p style="margin:5px 0 0 0;color:#e8f5e8;opacity:0.8;position:relative;z-index:2;">Celebrating every season with you!</p>
  </div>
`;

    const customers = await Customer.find({
      email: { $exists: true },
      status: "Active",
    });

    let successCount = 0;
    let failedEmails = [];

    await Promise.all(
      customers.map(async (customer) => {
        try {
          const fullHtml = `
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI', sans-serif;
        background: #f4f4f4;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:8px;overflow:hidden;">
            <tr>
              <td>${emailHeader}</td>
            </tr>
            <tr>
              <td style="padding:30px;">${template.body}</td>
            </tr>
            <tr>
              <td>${emailFooter}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

          const personalizedHtml = fullHtml
            .replace(/{{fullName}}/g, customer.fullName || "Valued Customer")
            .replace(/{{company}}/g, company.company || "Your Company")
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
