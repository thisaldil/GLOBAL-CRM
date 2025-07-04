const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {Object} param0
 * @param {string} param0.to
 * @param {string} param0.subject
 * @param {string} param0.html
 */
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"ABMSZ" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
