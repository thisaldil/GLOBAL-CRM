// const Customer = require("../models/customer");
// const crypto = require("crypto");

// // Helper function to generate unsubscribe token
// const generateUnsubscribeToken = () => {
//   return crypto.randomBytes(32).toString("hex");
// };

// // Helper function to calculate engagement rates
// const updateEngagementRates = (customer) => {
//   if (customer.emailEngagement.totalEmailsSent > 0) {
//     customer.emailEngagement.openRate = (
//       (customer.emailEngagement.totalEmailsOpened /
//         customer.emailEngagement.totalEmailsSent) *
//       100
//     ).toFixed(2);

//     customer.emailEngagement.clickRate = (
//       (customer.emailEngagement.totalEmailsClicked /
//         customer.emailEngagement.totalEmailsSent) *
//       100
//     ).toFixed(2);
//   }
// };

// const customerController = {
//   // Create a new customer
//   createCustomer: async (req, res) => {
//     try {
//       const customerData = req.body;

//       // Generate unsubscribe token
//       customerData.unsubscribeToken = generateUnsubscribeToken();

//       const customer = new Customer(customerData);
//       await customer.save();

//       res.status(201).json({
//         success: true,
//         message: "Customer created successfully",
//         data: customer,
//       });
//     } catch (error) {
//       if (error.code === 11000) {
//         return res.status(409).json({
//           success: false,
//           message: "Customer with this email already exists",
//         });
//       }

//       res.status(400).json({
//         success: false,
//         message: "Error creating customer",
//         error: error.message,
//       });
//     }
//   },

//   // Get all customers with pagination and filtering
//   getAllCustomers: async (req, res) => {
//     try {
//       const {
//         page = 1,
//         limit = 10,
//         status,
//         tags,
//         search,
//         sortBy = "createdAt",
//         sortOrder = "desc",
//       } = req.query;

//       // Build query object
//       let query = {};

//       if (status) {
//         query.status = status;
//       }

//       if (tags) {
//         query.tags = { $in: tags.split(",") };
//       }

//       if (search) {
//         query.$or = [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { company: { $regex: search, $options: "i" } },
//         ];
//       }

//       const sortOptions = {};
//       sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

//       const customers = await Customer.find(query)
//         .sort(sortOptions)
//         .limit(limit * 1)
//         .skip((page - 1) * limit)
//         .select("-unsubscribeToken"); // Don't expose unsubscribe token

//       const total = await Customer.countDocuments(query);

//       res.status(200).json({
//         success: true,
//         data: customers,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(total / limit),
//           totalItems: total,
//           itemsPerPage: parseInt(limit),
//         },
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error fetching customers",
//         error: error.message,
//       });
//     }
//   },

//   // Get customer by ID
//   getCustomerById: async (req, res) => {
//     try {
//       const customer = await Customer.findById(req.params.id).select(
//         "-unsubscribeToken"
//       );

//       if (!customer) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         data: customer,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error fetching customer",
//         error: error.message,
//       });
//     }
//   },

//   // Update customer
//   updateCustomer: async (req, res) => {
//     try {
//       const customerId = req.params.id;
//       const updateData = req.body;

//       // Don't allow direct update of certain fields
//       delete updateData.unsubscribeToken;
//       delete updateData.createdAt;
//       delete updateData.updatedAt;

//       const customer = await Customer.findByIdAndUpdate(
//         customerId,
//         updateData,
//         { new: true, runValidators: true }
//       ).select("-unsubscribeToken");

//       if (!customer) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Customer updated successfully",
//         data: customer,
//       });
//     } catch (error) {
//       if (error.code === 11000) {
//         return res.status(409).json({
//           success: false,
//           message: "Email already exists",
//         });
//       }

//       res.status(400).json({
//         success: false,
//         message: "Error updating customer",
//         error: error.message,
//       });
//     }
//   },

//   // Delete customer
//   deleteCustomer: async (req, res) => {
//     try {
//       const customer = await Customer.findByIdAndDelete(req.params.id);

//       if (!customer) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Customer deleted successfully",
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error deleting customer",
//         error: error.message,
//       });
//     }
//   },

//   // Update customer status
//   updateCustomerStatus: async (req, res) => {
//     try {
//       const { status } = req.body;
//       const customerId = req.params.id;

//       if (!["Active", "Inactive", "Unsubscribed", "Bounced"].includes(status)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid status",
//         });
//       }

//       const customer = await Customer.findByIdAndUpdate(
//         customerId,
//         { status },
//         { new: true, runValidators: true }
//       ).select("-unsubscribeToken");

//       if (!customer) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Customer status updated successfully",
//         data: customer,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error updating customer status",
//         error: error.message,
//       });
//     }
//   },

//   // Update email engagement data
//   updateEmailEngagement: async (req, res) => {
//     try {
//       const customerId = req.params.id;
//       const {
//         emailsSent = 0,
//         emailsOpened = 0,
//         emailsClicked = 0,
//         lastOpenedDate,
//         lastClickedDate,
//       } = req.body;

//       const customer = await Customer.findById(customerId);

//       if (!customer) {
//         return res.status(404).json({
//           success: false,
//           message: "Customer not found",
//         });
//       }

//       // Update engagement metrics
//       customer.emailEngagement.totalEmailsSent += emailsSent;
//       customer.emailEngagement.totalEmailsOpened += emailsOpened;
//       customer.emailEngagement.totalEmailsClicked += emailsClicked;

//       if (lastOpenedDate) {
//         customer.emailEngagement.lastOpenedDate = lastOpenedDate;
//       }

//       if (lastClickedDate) {
//         customer.emailEngagement.lastClickedDate = lastClickedDate;
//       }

//       // Update last contact date if email was sent
//       if (emailsSent > 0) {
//         customer.lastContactDate = new Date();
//       }

//       // Calculate engagement rates
//       updateEngagementRates(customer);

//       await customer.save();

//       res.status(200).json({
//         success: true,
//         message: "Email engagement updated successfully",
//         data: customer.emailEngagement,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error updating email engagement",
//         error: error.message,
//       });
//     }
//   },

//   // Get customer statistics
//   getCustomerStats: async (req, res) => {
//     try {
//       const stats = await Customer.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalCustomers: { $sum: 1 },
//             activeCustomers: {
//               $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
//             },
//             inactiveCustomers: {
//               $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
//             },
//             unsubscribedCustomers: {
//               $sum: { $cond: [{ $eq: ["$status", "Unsubscribed"] }, 1, 0] },
//             },
//             bouncedCustomers: {
//               $sum: { $cond: [{ $eq: ["$status", "Bounced"] }, 1, 0] },
//             },
//             totalEmailsSent: { $sum: "$emailEngagement.totalEmailsSent" },
//             totalEmailsOpened: { $sum: "$emailEngagement.totalEmailsOpened" },
//             totalEmailsClicked: { $sum: "$emailEngagement.totalEmailsClicked" },
//             avgOpenRate: { $avg: "$emailEngagement.openRate" },
//             avgClickRate: { $avg: "$emailEngagement.clickRate" },
//           },
//         },
//       ]);

//       const result = stats[0] || {
//         totalCustomers: 0,
//         activeCustomers: 0,
//         inactiveCustomers: 0,
//         unsubscribedCustomers: 0,
//         bouncedCustomers: 0,
//         totalEmailsSent: 0,
//         totalEmailsOpened: 0,
//         totalEmailsClicked: 0,
//         avgOpenRate: 0,
//         avgClickRate: 0,
//       };

//       res.status(200).json({
//         success: true,
//         data: result,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error fetching customer statistics",
//         error: error.message,
//       });
//     }
//   },

//   // Bulk import customers
//   bulkImportCustomers: async (req, res) => {
//     try {
//       const { customers } = req.body;

//       if (!Array.isArray(customers)) {
//         return res.status(400).json({
//           success: false,
//           message: "Customers data must be an array",
//         });
//       }

//       const results = {
//         success: [],
//         errors: [],
//       };

//       for (let i = 0; i < customers.length; i++) {
//         try {
//           const customerData = customers[i];
//           customerData.unsubscribeToken = generateUnsubscribeToken();

//           const customer = new Customer(customerData);
//           await customer.save();

//           results.success.push({
//             index: i,
//             email: customerData.email,
//             id: customer._id,
//           });
//         } catch (error) {
//           results.errors.push({
//             index: i,
//             email: customers[i].email,
//             error: error.message,
//           });
//         }
//       }

//       res.status(200).json({
//         success: true,
//         message: `Imported ${results.success.length} customers successfully`,
//         data: results,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error during bulk import",
//         error: error.message,
//       });
//     }
//   },
// };

// module.exports = customerController;
