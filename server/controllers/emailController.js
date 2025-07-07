const Customer = require("../models/customer");
const EmailTemplate = require("../models/emailTemplate");
const sendEmail = require("../utils/sendEmail");

exports.sendBulkEmail = async (req, res) => {
  const { templateId } = req.body;

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const todayFormatted = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const customers = await Customer.find({ email: { $exists: true } });

    for (const customer of customers) {
      const personalizedBody = template.body
        .replace(/{{\s*fullName\s*}}/g, customer.fullName || "Valued Customer")
        .replace(/{{\s*company\s*}}/g, customer.company || "Your Company")
        .replace(/{{\s*date\s*}}/g, todayFormatted);

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
