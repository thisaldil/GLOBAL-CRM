const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Create a new customer
router.post("/", customerController.createCustomer);

// Get all customers (with optional filters)
router.get("/", customerController.getAllCustomers);

// Get a specific customer by ID
router.get("/:id", customerController.getCustomerById);

// Update a customer by ID
router.put("/:id", customerController.updateCustomer);

// Delete a customer by ID
router.delete("/:id", customerController.deleteCustomer);

// Bulk update (e.g., status or tags)
router.patch("/bulk-update", customerController.bulkUpdateCustomers);

module.exports = router;
