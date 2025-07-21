const Customer = require("../models/customer");

// @desc    Create a new customer
// @route   POST /api/customers
const createCustomer = async (req, res) => {
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
const getAllCustomers = async (req, res) => {
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
const getCustomerById = async (req, res) => {
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
const updateCustomer = async (req, res) => {
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
const deleteCustomer = async (req, res) => {
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
const bulkUpdateCustomers = async (req, res) => {
  try {
    const { ids, updates } = req.body;

    const result = await Customer.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );

    res.status(200).json({
      message: "Customers updated",
      modifiedCount: result.nModified || result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk update failed", error });
  }
};

// @desc    Get customer stats (total, active, inactive, trial, lost, unsubscribed, bounced, email engagement)
// @route   GET /api/customers/stats
const getCustomerStats = async (req, res) => {
  try {
    // Customer status counts
    const [total, active, inactive, trial, lost, unsubscribed, bounced] =
      await Promise.all([
        Customer.countDocuments(),
        Customer.countDocuments({ status: "Active" }),
        Customer.countDocuments({ status: "Inactive" }),
        Customer.countDocuments({ status: "Trial" }),
        Customer.countDocuments({ status: "Lost" }),
        Customer.countDocuments({ engagementStatus: "Unsubscribed" }),
        Customer.countDocuments({ bounceStatus: true }),
      ]);

    // Email engagement (basic estimation)
    // For demo: count customers with lastEmailOpenedDate as 'opened', and engagementStatus 'Engaged' as 'clicked'
    const totalEmailsSent = total; // Assume one email sent per customer for now
    const totalEmailsOpened = await Customer.countDocuments({
      lastEmailOpenedDate: { $exists: true, $ne: null },
    });
    const totalEmailsClicked = await Customer.countDocuments({
      engagementStatus: "Engaged",
    });

    // Calculate rates
    const avgOpenRate =
      totalEmailsSent > 0
        ? Math.round((totalEmailsOpened / totalEmailsSent) * 100)
        : 0;
    const avgClickRate =
      totalEmailsSent > 0
        ? Math.round((totalEmailsClicked / totalEmailsSent) * 100)
        : 0;

    res.status(200).json({
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: inactive,
      trialCustomers: trial,
      lostCustomers: lost,
      unsubscribedCustomers: unsubscribed,
      bouncedCustomers: bounced,
      totalEmailsSent,
      totalEmailsOpened,
      totalEmailsClicked,
      avgOpenRate,
      avgClickRate,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer stats", error });
  }
};

// ✅ Export all controller functions
module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  bulkUpdateCustomers,
  getCustomerStats,
};
