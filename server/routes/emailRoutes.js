const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.post("/send-bulk", emailController.sendBulkEmail);

module.exports = router;
