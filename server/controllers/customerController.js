const Customer = require("../models/customer");

// @desc    Create a new customer
// @route   POST /api/customers
exports.createCustomer = async (req, res) => {
  try {
    const existing = await Customer.findOne({ email: req.body.email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Customer with this email already exists." });
    }

    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error creating customer", error });
  }
};

// @desc    Get all customers (with optional search/filter)
// @route   GET /api/customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, status, tag } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (tag) query.tags = tag;

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

// @desc    Update customer by ID
// @route   PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error });
  }
};

// @desc    Delete customer by ID
// @route   DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};

// @desc    Bulk update status or tags
// @route   PATCH /api/customers/bulk-update
exports.bulkUpdateCustomers = async (req, res) => {
  try {
    const { ids, updates } = req.body; // ids = [id1, id2, ...]; updates = { status: "Active" }

    const result = await Customer.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );

    res
      .status(200)
      .json({ message: "Customers updated", modifiedCount: result.nModified });
  } catch (error) {
    res.status(500).json({ message: "Bulk update failed", error });
  }
};
module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  bulkUpdateCustomers,
};
