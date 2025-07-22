const Customer = require("../models/customer");
const Company = require("../models/company");
const EmailTemplate = require("../models/emailTemplate");
const sendEmail = require("../utils/sendEmail");

exports.sendBulkEmail = async (req, res) => {
  const { templateId } = req.body;

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    // Fetch the first active company (or fallback to null)
    const company = await Company.findOne({ status: "active" });

    const todayFormatted = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const customers = await Customer.find({
      email: { $exists: true },
      status: "Active",
    });

    for (const customer of customers) {
      const personalizedBody = template.body
        .replace(/{{\s*fullName\s*}}/g, customer.fullName || "Valued Customer")
        .replace(
          /{{\s*company\s*}}/g,
          (company && company.name) || "Your Company"
        )
        .replace(/{{\s*date\s*}}/g, todayFormatted);

      const year = new Date().getFullYear();

      const defaultHeader = `
  <div style="background:#1a202c;padding:20px;text-align:center;color:#ffffff;">
    <h1 style="margin:0;font-size:26px;font-weight:bold;">${
      customer.company || (company && company.name) || "Your Company"
    }</h1>
    <p style="margin:4px 0 0;font-size:14px;opacity:0.8;">${todayFormatted}</p>
  </div>`;

      const defaultFooter = `
  <div style="background:#1a202c;padding:16px;text-align:center;color:#a0aec0;font-size:12px;">
    <p style="margin:0;">&copy; ${year} ${
        (company && company.name) || "Your Company"
      }. All rights reserved.</p>
    <p style="margin:4px 0 0;">Thank you for being with us.</p>
  </div>`;

      const fullHtml = `
  <html>
    <head><meta charset="UTF-8" /></head>
    <body style="font-family:sans-serif;background:#f4f4f4;margin:0;padding:0;">
      <table width="100%" style="background:#f4f4f4;padding:20px 0;">
        <tr>
          <td align="center">
            <table width="600" style="background:#fff;border-radius:8px;overflow:hidden;">
              <tr><td>${defaultHeader}</td></tr>
              <tr><td style="padding:30px;">${personalizedBody}</td></tr>
              <tr><td>${defaultFooter}</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html: fullHtml,
        company: (company && company.name) || "Your Company",
      });
    }

    res.status(200).json({
      message: `${template.category} Emails sent to ${customers.length} customers`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send emails", error: err });
  }
};
