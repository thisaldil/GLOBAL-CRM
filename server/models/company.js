const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    website: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    logoUrl: {
      type: String, // optional logo image
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Admin"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
