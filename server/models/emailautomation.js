const mongoose = require("mongoose");

// Automation Rule Schema
const automationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    type: {
      type: String,
      enum: [
        "birthday",
        "anniversary",
        "holiday",
        "welcome",
        "follow_up",
        "inactive_customer",
      ],
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    triggerConditions: {
      // For birthday automation
      daysBeforeBirthday: {
        type: Number,
        default: 0,
        min: 0,
        max: 30,
      },
      // For anniversary automation
      daysBeforeAnniversary: {
        type: Number,
        default: 0,
        min: 0,
        max: 30,
      },
      // For holiday automation
      holidayDate: Date,
      daysBeforeHoliday: {
        type: Number,
        default: 0,
        min: 0,
        max: 30,
      },
      // For follow-up automation
      daysAfterLastContact: Number,
      // For inactive customer automation
      daysOfInactivity: Number,
      // Customer filters
      customerFilters: {
        status: [String],
        tags: [String],
        customFields: mongoose.Schema.Types.Mixed,
        emailPreferences: mongoose.Schema.Types.Mixed,
      },
    },
    sendingSettings: {
      sendTime: {
        type: String,
        default: "09:00",
        match: [
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Please enter valid time in HH:MM format",
        ],
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      sendOnWeekends: {
        type: Boolean,
        default: true,
      },
      sendOnHolidays: {
        type: Boolean,
        default: false,
      },
    },
    executionHistory: [
      {
        executedAt: {
          type: Date,
          default: Date.now,
        },
        customersProcessed: Number,
        emailsSent: Number,
        errors: Number,
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    analytics: {
      totalExecutions: {
        type: Number,
        default: 0,
      },
      totalEmailsSent: {
        type: Number,
        default: 0,
      },
      averageOpenRate: {
        type: Number,
        default: 0,
      },
      averageClickRate: {
        type: Number,
        default: 0,
      },
      lastExecuted: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

automationRuleSchema.index({ type: 1, isActive: 1 });
automationRuleSchema.index({ "triggerConditions.holidayDate": 1 });

// Email Activity Log Schema (for tracking individual email interactions)
const emailActivitySchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailCampaign",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    automationRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomationRule",
    },
    activityType: {
      type: String,
      enum: [
        "sent",
        "delivered",
        "opened",
        "clicked",
        "bounced",
        "unsubscribed",
        "complained",
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      emailAddress: String,
      userAgent: String,
      ipAddress: String,
      clickedUrl: String,
      bounceReason: String,
      deviceType: String,
      location: String,
    },
  },
  {
    timestamps: true,
  }
);

emailActivitySchema.index({ campaignId: 1, customerId: 1 });
emailActivitySchema.index({ customerId: 1, timestamp: -1 });
emailActivitySchema.index({ activityType: 1, timestamp: -1 });

// Create and export the models
const AutomationRule = mongoose.model("AutomationRule", automationRuleSchema);
const EmailActivity = mongoose.model("EmailActivity", emailActivitySchema);

module.exports = {
  AutomationRule,
  EmailActivity,
};
