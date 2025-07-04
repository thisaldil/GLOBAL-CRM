// routes/emailTemplateRoutes.js
const express = require("express");
const router = express.Router();
const emailTemplateController = require("../controllers/emailTemplateController");

router.post("/", emailTemplateController.createTemplate);
router.get("/", emailTemplateController.getAllTemplates);
router.get("/:id", emailTemplateController.getTemplateById);
router.put("/:id", emailTemplateController.updateTemplate);
router.delete("/:id", emailTemplateController.deleteTemplate);

module.exports = router;
