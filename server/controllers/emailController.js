const Customer = require("../models/customer");
const EmailTemplate = require("../models/emailTemplate");
const nodemailer = require("nodemailer");

exports.sendBulkEmail = async (req, res) => {
  const { templateId } = req.body;

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const customers = await Customer.find({ email: { $exists: true } });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g., your@gmail.com
        pass: process.env.EMAIL_PASS, // App Password or real password
      },
    });

    for (const customer of customers) {
      const personalizedBody = template.body.replace(
        /{{fullName}}/g,
        customer.fullName
      );

      await transporter.sendMail({
        from: `"Your Company" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: template.subject,
        html: personalizedBody,
      });
    }

    res
      .status(200)
      .json({ message: `Emails sent to ${customers.length} customers` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send emails", error: err });
  }
};
