const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    company: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    location: {
      type: String,
    },

    // Email Preferences
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    emailTopics: {
      type: [String], // e.g., ["Newsletters", "Promotions"]
      default: [],
    },
    emailFrequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Only Important"],
      default: "Monthly",
    },
    lastEmailOpenedDate: {
      type: Date,
    },
    lastContactDate: {
      type: Date,
    },
    bounceStatus: {
      type: Boolean,
      default: false,
    },

    // Segmentation & CRM
    tags: {
      type: [String],
      default: [],
    },
    leadSource: {
      type: String, // e.g., "Website", "Referral", "Ad Campaign"
    },
    customerValueScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    engagementStatus: {
      type: String,
      enum: ["Engaged", "Inactive", "Unsubscribed", "Bounced"],
      default: "Engaged",
    },

    // Lifecycle Info
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Trial", "Lost"],
      default: "Active",
    },

    // Custom Fields & Notes
    notes: {
      type: String,
    },
    customFields: {
      type: mongoose.Schema.Types.Mixed, // flexible key-value fields
      default: {},
    },
    assignedRep: {
      type: String, // Could also be ObjectId ref to User model
    },
    nextFollowUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Field - Years with Company
customerSchema.virtual("yearsWithCompany").get(function () {
  if (!this.joinDate) return 0;
  const now = new Date();
  const years = now.getFullYear() - this.joinDate.getFullYear();
  return years >= 0 ? years : 0;
});

module.exports = mongoose.model("Customer", customerSchema);
