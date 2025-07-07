const Customer = require("../models/customer");
const EmailTemplate = require("../models/emailTemplate");
const sendEmail = require("../utils/sendEmail");

exports.sendBulkEmail = async (req, res) => {
  const { templateId } = req.body;

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const customers = await Customer.find({ email: { $exists: true } });

    for (const customer of customers) {
      const personalizedBody = template.body
        .replace(/{{fullName}}/g, customer.fullName || "Valued Customer")
        .replace(/{{company}}/g, customer.company || "Your Company")
        .replace(/{{date}}/g, todayFormatted);

      await sendEmail({
        to: customer.email,
        subject: template.subject,
        html: personalizedBody,
      });
    }

    res.status(200).json({
      message: `Emails sent to ${customers.length} customers`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send emails", error: err });
  }
};
