const connectDB = require("../../database");
const Company = require("../../models/company");
const Customer = require("../../models/customer");
const EmailTemplate = require("../../models/emailTemplate");
const sendEmail = require("../../utils/sendEmail");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const company = await Company.findOne();
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
      "07-22": "WorldEnvironmentDay",
      "10-31": "Halloween",
      "11-11": "VeteransDay",
      "12-25": "Christmas",
      "12-31": "NewYearsEve",
    };

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
        accent: "#fff",
        emoji: ["💕", "🌹"],
      },
      sinhalatamilnewyear: {
        background: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
        accent: "#fff",
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

    const customers = await Customer.find({
      email: { $exists: true },
      status: "Active",
    });
    const monthDayMatch = (date) =>
      new Date(date).toISOString().slice(5, 10) === monthDay;

    let results = [];

    // --- Handle Holiday Emails ---
    if (holidayMap[monthDay]) {
      const category = holidayMap[monthDay];
      const theme = holidayThemes[category.toLowerCase()] || {};
      const template = await EmailTemplate.findOne({ category });

      if (template) {
        let successCount = 0,
          failed = [];

        const emailHeader = `
          <div style="background:${
            theme.background || "#000000"
          };padding:15px 25px;color:${
          theme.accent || "#ffffff"
        };text-align:center;border-bottom:4px solid ${
          theme.accent || "#ffffff"
        };">
            <div style="font-size:20px;opacity:0.85;display:flex;justify-content:space-between;">
              <span>${theme.emoji?.[0] || ""}</span>
              <span>${theme.emoji?.[1] || ""}</span>
            </div>
            <h1>{{company}}</h1>
            <p style="font-size:14px;color:${
              theme.accent || "#ffffff"
            };opacity:0.95;">${todayFormatted}</p>
          </div>
        `;

        const emailFooter = `
          <div style="background:${
            theme.background || "#000000"
          };padding:20px;text-align:center;font-size:12px;color:${
          theme.accent || "#ffffff"
        };border-top:2px solid ${theme.accent || "#ffffff"};">
            <p style="font-weight:bold;">&copy; ${year} {{company}}. All rights reserved.</p>
            <p style="opacity:0.8;">Celebrating every season with you!</p>
          </div>
        `;

        await Promise.all(
          customers.map(async (c) => {
            try {
              const html = `
              <html><body>
                <table><tr><td>
                  ${emailHeader}
                  <div style="padding:30px;">${template.body}</div>
                  ${emailFooter}
                </td></tr></table>
              </body></html>
            `
                .replace(/{{fullName}}/g, c.fullName || "Valued Customer")
                .replace(/{{company}}/g, company?.name || "Your Company");

              await sendEmail({
                to: c.email,
                subject: template.subject,
                html,
                company: company?.name,
              });

              successCount++;
            } catch (err) {
              failed.push(c.email);
            }
          })
        );

        results.push({
          type: category,
          sent: successCount,
          failed: failed.length,
          failedEmails: failed,
        });
      }
    }

    // --- Handle Customer Anniversaries ---
    const anniversaryTemplate = await EmailTemplate.findOne({
      category: "CustomerAnniversary",
    });
    const anniversaryCustomers = customers.filter(
      (c) => c.joinDate && monthDayMatch(c.joinDate)
    );

    if (anniversaryTemplate && anniversaryCustomers.length > 0) {
      let successCount = 0,
        failed = [];

      await Promise.all(
        anniversaryCustomers.map(async (c) => {
          try {
            const html = `
            <html><body>
              <table><tr><td>
                <div style="background:#000000;padding:15px 25px;color:#ffffff;text-align:center;border-bottom:4px solid #ffffff;">
                  <h1>{{company}}</h1>
                  <p style="font-size:14px;color:#ffffff;opacity:0.95;">${todayFormatted}</p>
                </div>
                <div style="padding:30px;">${anniversaryTemplate.body}</div>
                <div style="background:#000000;padding:20px;text-align:center;font-size:12px;color:#ffffff;border-top:2px solid #ffffff;">
                  <p style="font-weight:bold;">&copy; ${year} {{company}}. All rights reserved.</p>
                </div>
              </td></tr></table>
            </body></html>
          `
              .replace(/{{fullName}}/g, c.fullName || "Valued Customer")
              .replace(/{{company}}/g, company?.name || "Your Company");

            await sendEmail({
              to: c.email,
              subject: anniversaryTemplate.subject,
              html,
              company: company?.name,
            });

            successCount++;
          } catch (err) {
            failed.push(c.email);
          }
        })
      );

      results.push({
        type: "CustomerAnniversary",
        sent: successCount,
        failed: failed.length,
        failedEmails: failed,
      });
    }

    if (results.length === 0) {
      return res.status(200).json({ message: "No events to process today." });
    }

    res.status(200).json({
      message: "Emails processed.",
      results,
    });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
