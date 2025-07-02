const mongoose = require("mongoose");

// Customer Schema
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxLength: 20,
    },
    company: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    joinDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Unsubscribed", "Bounced"],
      default: "Active",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    customFields: {
      jobTitle: String,
      department: String,
      location: String,
      notes: String,
      leadSource: String,
      customerValue: {
        type: String,
        enum: ["High", "Medium", "Low"],
      },
    },
    emailPreferences: {
      birthday: {
        type: Boolean,
        default: true,
      },
      anniversary: {
        type: Boolean,
        default: true,
      },
      promotions: {
        type: Boolean,
        default: true,
      },
      holidays: {
        type: Boolean,
        default: true,
      },
      newsletters: {
        type: Boolean,
        default: true,
      },
    },
    lastContactDate: {
      type: Date,
    },
    emailEngagement: {
      totalEmailsSent: {
        type: Number,
        default: 0,
      },
      totalEmailsOpened: {
        type: Number,
        default: 0,
      },
      totalEmailsClicked: {
        type: Number,
        default: 0,
      },
      lastOpenedDate: Date,
      lastClickedDate: Date,
      openRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      clickRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for age calculation
customerSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Virtual for years with company
customerSchema.virtual("yearsWithCompany").get(function () {
  const today = new Date();
  const joinDate = new Date(this.joinDate);
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < joinDate.getDate())
  ) {
    years--;
  }
  return years;
});

// Index for efficient queries
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ dateOfBirth: 1 });
customerSchema.index({ joinDate: 1 });
customerSchema.index({ createdAt: -1 });

// Create and export the model
const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
