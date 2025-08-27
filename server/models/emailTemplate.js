// models/emailTemplate.js
const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Welcome Email"
    subject: { type: String, required: true },
    body: { type: String, required: true }, // Store HTML or plain text
    type: { type: String, required: true },
    category: { type: String }, // e.g., "Onboarding", "Promotion"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
