// controllers/emailTemplateController.js
const EmailTemplate = require("../models/emailTemplate");

exports.createTemplate = async (req, res) => {
  try {
    const template = new EmailTemplate(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: "Error creating template", err });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ error: "Error fetching templates", err });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Not found" });
    res.status(200).json(template);
  } catch (err) {
    res.status(500).json({ error: "Error fetching template", err });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const updated = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating template", err });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await EmailTemplate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting template", err });
  }
};
