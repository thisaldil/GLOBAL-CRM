const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

// Validation middleware (optional, you can expand this)
const validateObjectId = (req, res, next) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid customer ID" });
  }
  next();
};

// CREATE a new customer
router.post("/", customerController.createCustomer);

// READ all customers
router.get("/", customerController.getAllCustomers);

// READ a single customer by ID
router.get("/:id", validateObjectId, customerController.getCustomerById);

// UPDATE a customer by ID
router.put("/:id", validateObjectId, customerController.updateCustomer);

// DELETE a customer by ID
router.delete("/:id", validateObjectId, customerController.deleteCustomer);

module.exports = router;
