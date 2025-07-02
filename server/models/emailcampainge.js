const mongoose = require("mongoose");

// Email Template Schema
const emailTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Birthday",
        "Anniversary",
        "Holiday",
        "Promotion",
        "Newsletter",
        "Welcome",
        "General",
      ],
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxLength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    variables: [
      {
        name: String,
        description: String,
        defaultValue: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsed: Date,
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

emailTemplateSchema.index({ category: 1, isActive: 1 });

// Email Campaign Schema
const emailCampaignSchema = new mongoose.Schema(
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
        "manual",
        "birthday",
        "anniversary",
        "holiday",
        "promotional",
        "newsletter",
        "automated",
      ],
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    recipients: {
      all: {
        type: Boolean,
        default: false,
      },
      customerIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
        },
      ],
      filters: {
        status: [String],
        tags: [String],
        joinDateRange: {
          start: Date,
          end: Date,
        },
        birthdayMonth: Number,
        customFields: mongoose.Schema.Types.Mixed,
      },
    },
    scheduledDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date();
        },
        message: "Scheduled date must be in the future",
      },
    },
    sentDate: Date,
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed", "cancelled"],
      default: "draft",
    },
    analytics: {
      totalRecipients: {
        type: Number,
        default: 0,
      },
      sent: {
        type: Number,
        default: 0,
      },
      delivered: {
        type: Number,
        default: 0,
      },
      opened: {
        type: Number,
        default: 0,
      },
      clicked: {
        type: Number,
        default: 0,
      },
      bounced: {
        type: Number,
        default: 0,
      },
      unsubscribed: {
        type: Number,
        default: 0,
      },
      complained: {
        type: Number,
        default: 0,
      },
      openRate: {
        type: Number,
        default: 0,
      },
      clickRate: {
        type: Number,
        default: 0,
      },
      bounceRate: {
        type: Number,
        default: 0,
      },
    },
    settings: {
      trackOpens: {
        type: Boolean,
        default: true,
      },
      trackClicks: {
        type: Boolean,
        default: true,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    errorLog: [
      {
        timestamp: Date,
        error: String,
        details: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

emailCampaignSchema.index({ status: 1, scheduledDate: 1 });
emailCampaignSchema.index({ type: 1, createdAt: -1 });
emailCampaignSchema.index({ createdBy: 1, createdAt: -1 });

// Create and export the models
const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);
const EmailCampaign = mongoose.model("EmailCampaign", emailCampaignSchema);

module.exports = {
  EmailTemplate,
  EmailCampaign,
};
