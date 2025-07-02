const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Validation middleware (you can create separate validation files)
const validateCustomer = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required",
    });
  }

  // Basic email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const mongoose = require("mongoose");
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  next();
};

// Basic rate limiting middleware (you might want to use express-rate-limit in production)
const rateLimiter = (req, res, next) => {
  // This is a simple example - use proper rate limiting in production
  next();
};

// Routes

// GET /api/customers - Get all customers with pagination and filtering
router.get("/", customerController.getAllCustomers);

// GET /api/customers/stats - Get customer statistics
router.get("/stats", customerController.getCustomerStats);

// GET /api/customers/:id - Get customer by ID
router.get("/:id", validateObjectId, customerController.getCustomerById);

// POST /api/customers - Create new customer
router.post("/", validateCustomer, customerController.createCustomer);

// POST /api/customers/bulk-import - Bulk import customers
router.post(
  "/bulk-import",
  rateLimiter,
  customerController.bulkImportCustomers
);

// PUT /api/customers/:id - Update customer
router.put(
  "/:id",
  validateObjectId,
  validateCustomer,
  customerController.updateCustomer
);

// PATCH /api/customers/:id/status - Update customer status
router.patch(
  "/:id/status",
  validateObjectId,
  customerController.updateCustomerStatus
);

// PATCH /api/customers/:id/engagement - Update email engagement data
router.patch(
  "/:id/engagement",
  validateObjectId,
  customerController.updateEmailEngagement
);

// DELETE /api/customers/:id - Delete customer
router.delete("/:id", validateObjectId, customerController.deleteCustomer);

module.exports = router;
