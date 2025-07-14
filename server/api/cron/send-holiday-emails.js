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
      "07-14": "SinhalaTamilNewYear",
      "06-01": "LaborDay",
      "06-05": "WorldEnvironmentDay",
      "10-31": "Halloween",
      "11-11": "VeteransDay",
      "12-25": "Christmas",
      "12-31": "NewYearsEve",
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
        accent: "#ff69b4",
        emoji: ["💕", "🌹"],
      },
      sinhalatamilnewyear: {
        background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
        accent: "#ffa726",
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
  <div style="background:linear-gradient(135deg, ${theme.background} 0%, ${theme.background}dd 100%);padding:30px 40px;color:#ffffff;text-align:center;border-bottom:1px solid ${theme.accent}40;position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="${theme.accent}" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');opacity:0.3;"></div>
    
    <div style="position:relative;z-index:2;">
      <div style="display:inline-block;width:50px;height:3px;background:${theme.accent};margin-bottom:20px;border-radius:2px;"></div>
      
      <h1 style="margin:0;font-size:28px;font-weight:600;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(0,0,0,0.1);line-height:1.2;">{{company}}</h1>
      
      <div style="margin:15px 0 0;padding:8px 16px;background:rgba(255,255,255,0.1);border-radius:20px;display:inline-block;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);">
        <p style="margin:0;font-size:13px;color:#ffffff;opacity:0.9;font-weight:500;letter-spacing:0.3px;">{{date}}</p>
      </div>
    </div>
    
    <div style="position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle, ${theme.accent}20 0%, transparent 70%);opacity:0.6;pointer-events:none;"></div>
  </div>
`;

    const emailFooter = `
  <div style="background:${theme.background};padding:20px;text-align:center;font-size:12px;color:#e8f5e8;border-top:2px solid ${theme.accent};position:relative;">
    <p style="margin:0;color:${theme.accent};font-weight:bold;position:relative;z-index:2;">&copy; {{year}} {{company}}. All rights reserved.</p>
    <p style="margin:5px 0 0 0;color:#e8f5e8;opacity:0.8;position:relative;z-index:2;">Celebrating every season with you!</p>
  </div>
`;

    const customers = await Customer.find({ email: { $exists: true } });

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
