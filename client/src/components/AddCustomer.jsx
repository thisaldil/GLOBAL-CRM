import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Upload,
  Download,
  Mail,
  TrendingUp,
  UserCheck,
  Eye,
  Edit3,
  Trash2,
  X,
  ChevronUp, // Added for sort icon
  ChevronDown, // Added for sort icon
} from "lucide-react";
import toast from "react-hot-toast";
import CustomerForm from "./CustomerForm"; // Import the new CustomerForm component

const API_BASE = "https://global-crm-1zi3.vercel.app";

const CustomerManagementApp = () => {
  const [customers, setCustomers] = useState([]); // All customers from API
  const [filteredCustomers, setFilteredCustomers] = useState([]); // Customers after client-side search/filter/sort
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Not actively used for backend pagination yet, but good to keep.
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState(""); // New: for tag filtering
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false); // For bulk import/export
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Helper to determine status color based on backend enum
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Unsubscribed": // From frontend - Backend uses "Inactive" for unsubs, "Lost" for explicit lost
      case "Lost":
        return "bg-red-100 text-red-800";
      case "Trial":
        return "bg-yellow-100 text-yellow-800";
      case "Bounced": // From frontend - Backend has bounceStatus boolean, consider how to map
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to determine customer value color
  const getValueColor = (value) => {
    switch (value) {
      case "High":
        return "text-green-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Build query string for search, status, and tag filters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter); // Matches backend `status` filter
      if (tagFilter) params.append("tag", tagFilter); // Matches backend `tag` filter

      // Backend does not currently support sortBy/sortOrder on getAllCustomers.
      // We will fetch all and sort client-side for now, but in a real scenario
      // this would be added to the backend API: params.append("sortBy", sortBy); params.append("sortOrder", sortOrder);

      const url = `${API_BASE}/customers?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data); // Store raw data
      // Filter/sort logic will be in useEffect(searchTerm, statusFilter, customers, sortBy, sortOrder)
    } catch (error) {
      toast.error(`Failed to fetch customers: ${error.message}`);
      console.error("Fetch customers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error(`Failed to fetch stats: ${error.message}`);
      console.error("Fetch stats error:", error);
    }
  };

  const createCustomer = async (customerData) => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create customer");
      }
      toast.success("Customer created successfully!");
      fetchCustomers(); // Refresh list after creation
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error(error.message);
      console.error("Create customer error:", error);
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update customer");
      }
      toast.success("Customer updated successfully!");
      fetchCustomers(); // Refresh list after update
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error(error.message);
      console.error("Update customer error:", error);
    }
  };

  const deleteCustomer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete customer");
      }
      toast.success("Customer deleted successfully!");
      fetchCustomers(); // Refresh list after deletion
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error(error.message);
      console.error("Delete customer error:", error);
    }
  };

  // Initial fetch on component mount and when filters/sort change
  // Note: currentPage is not used in the current backend API, so removing from dependencies
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [searchTerm, statusFilter, tagFilter]); // Removed sortBy/sortOrder from here, as they're client-side handled

  // Client-side filtering and sorting logic
  useEffect(() => {
    let currentFiltered = [...customers]; // Start with a copy of all customers

    // Apply search filter (already done in fetchCustomers, but keeping here for consistency/future client-side-only filters)
    // The backend now handles 'search', 'status', 'tag' directly, so this client-side filtering part
    // becomes redundant if the backend filters perfectly. However, if the backend only does a partial
    // search (e.g., only `fullName`) and you want more client-side, keep it.
    // For now, let's assume backend `getAllCustomers` will return already filtered data.
    // So, `customers` state will already be filtered by search, status, tag from the API call.

    // If backend doesn't handle sorting, do it client-side here.
    // The current backend `getAllCustomers` sorts by `createdAt: -1` by default.
    // To support `name-asc`, `name-desc` from frontend, you'd need to extend backend.
    // For demonstration, let's assume we sort client-side after fetch for now if the API doesn't support generic sorting.
    const sorted = currentFiltered.sort((a, b) => {
      let valA, valB;

      // Special handling for 'fullName' since that's the field name in the schema
      if (sortBy === "name") {
        valA = a.fullName;
        valB = b.fullName;
      } else if (sortBy === "createdAt") {
        valA = new Date(a.createdAt);
        valB = new Date(b.createdAt);
      } else {
        // Fallback for other direct fields if needed
        valA = a[sortBy];
        valB = b[sortBy];
      }

      if (valA === undefined || valA === null) valA = ""; // Handle undefined/null values
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      } else if (valA instanceof Date && valB instanceof Date) {
        return sortOrder === "asc"
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }
      return 0; // No meaningful sort
    });

    setFilteredCustomers(sorted);
  }, [customers, sortBy, sortOrder]); // Depend on 'customers' (which is now API-filtered), and sort parameters

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Customer Management
                </h1>
                <p className="text-gray-600">
                  Manage your customer relationships
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "customers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Customers"
                value={stats.totalCustomers || 0}
                icon={Users}
                color="text-blue-600"
              />
              <StatsCard
                title="Active Customers"
                value={stats.activeCustomers || 0}
                icon={UserCheck}
                color="text-green-600"
                subtitle={
                  stats.totalCustomers > 0
                    ? `${Math.round(
                        (stats.activeCustomers / stats.totalCustomers) * 100
                      )}% of total`
                    : "0% of total"
                }
              />
              {/* Note: Backend stats `avgOpenRate` and `avgClickRate` are not present in provided backend code.
                  If these were present, they'd come from aggregated data. For now, showing 0 or placeholder.
                  Also, `emailEngagement` in customer schema is not present. Backend needs to return these.
              */}
              <StatsCard
                title="Avg Open Rate"
                value={`${stats.avgOpenRate || 0}%`}
                icon={Mail}
                color="text-purple-600"
              />
              <StatsCard
                title="Avg Click Rate"
                value={`${stats.avgClickRate || 0}%`}
                icon={TrendingUp}
                color="text-orange-600"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Status Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats.activeCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inactive</span>
                    <span className="text-sm font-medium text-gray-600">
                      {stats.inactiveCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Unsubscribed (Lost)
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      {stats.unsubscribedCustomers || stats.lostCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trial</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {stats.trialCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bounced</span>
                    <span className="text-sm font-medium text-orange-600">
                      {stats.bouncedCustomers || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Email Engagement
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sent</span>
                    <span className="text-sm font-medium">
                      {stats.totalEmailsSent || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Opened</span>
                    <span className="text-sm font-medium">
                      {stats.totalEmailsOpened || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Clicked</span>
                    <span className="text-sm font-medium">
                      {stats.totalEmailsClicked || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    {/* Ensure these match backend schema `status` enum */}
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Trial">Trial</option>
                    <option value="Lost">Lost</option>
                  </select>
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Tags</option>
                    {/* Dynamically populate common tags here if available from API, or hardcode common ones */}
                    <option value="VIP">VIP</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Designer">Designer</option>
                  </select>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {/* 'createdAt' and 'fullName' are directly from schema */}
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="fullName-asc">Name A-Z</option>
                    <option value="fullName-desc">Name Z-A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No customers found
                          {searchTerm || statusFilter || tagFilter ? (
                            <p className="mt-2 text-sm">
                              Adjust your filters or add a new customer.
                            </p>
                          ) : (
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add your first
                              customer
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {customer.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.company}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {customer.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                customer.status
                              )}`}
                            >
                              {customer.status}
                            </span>
                            <div
                              className={`text-xs mt-1 ${getValueColor(
                                customer.customFields?.customerValue
                              )}`}
                            >
                              {customer.customFields?.customerValue} Value
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <div className="text-xs">
                                {/* These are hypothetical as per original code, backend needs to provide `emailEngagement` data directly or in stats */}
                                <div>
                                  Open:{" "}
                                  {customer.emailEngagement?.openRate || "N/A"}%
                                </div>
                                <div>
                                  Click:{" "}
                                  {customer.emailEngagement?.clickRate || "N/A"}
                                  %
                                </div>
                                {/* Or perhaps use backend engagementStatus directly from schema */}
                                <div className="text-gray-500">
                                  Status: {customer.engagementStatus || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {customer.tags?.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {customer.tags?.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{customer.tags.length - 2} more
                                </span>
                              )}
                              {customer.tags?.length === 0 && (
                                <span className="text-xs text-gray-400">
                                  No tags
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowViewModal(true);
                                }}
                                className="text-gray-600 hover:text-blue-600"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowEditModal(true);
                                }}
                                className="text-gray-600 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteCustomer(customer._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer"
      >
        <CustomerForm
          onSave={(data) => {
            createCustomer(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Customer"
      >
        <CustomerForm
          customer={selectedCustomer}
          onSave={(updatedData) => {
            updateCustomer(selectedCustomer._id, updatedData);
            setShowEditModal(false);
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Customer Details"
      >
        {selectedCustomer ? (
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <strong>Full Name:</strong> {selectedCustomer.fullName}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCustomer.phone || "N/A"}
            </p>
            <p>
              <strong>Company:</strong> {selectedCustomer.company || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {selectedCustomer.status}
            </p>
            {/* Displaying customFields directly */}
            <p>
              <strong>Customer Value:</strong>{" "}
              {selectedCustomer.customFields?.customerValue || "N/A"}
            </p>
            <p>
              <strong>Job Title:</strong>{" "}
              {selectedCustomer.customFields?.jobTitle || "N/A"}
            </p>
            <p>
              <strong>Location:</strong>{" "}
              {selectedCustomer.customFields?.location || "N/A"}
            </p>
            <p>
              <strong>Tags:</strong>{" "}
              {selectedCustomer.tags?.length > 0
                ? selectedCustomer.tags.join(", ")
                : "None"}
            </p>
            <p>
              <strong>Notes:</strong>{" "}
              {selectedCustomer.customFields?.notes || "N/A"}
            </p>
            <p>
              <strong>Join Date:</strong>{" "}
              {new Date(selectedCustomer.joinDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Years With Company:</strong>{" "}
              {selectedCustomer.yearsWithCompany || 0}
            </p>
            <p>
              <strong>Assigned Rep:</strong>{" "}
              {selectedCustomer.assignedRep || "N/A"}
            </p>
            <p>
              <strong>Next Follow Up:</strong>{" "}
              {selectedCustomer.nextFollowUpDate
                ? new Date(
                    selectedCustomer.nextFollowUpDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Email Subscription:</strong>{" "}
              {selectedCustomer.isSubscribed ? "Subscribed" : "Unsubscribed"}
            </p>
            <p>
              <strong>Email Topics:</strong>{" "}
              {selectedCustomer.emailTopics?.length > 0
                ? selectedCustomer.emailTopics.join(", ")
                : "None"}
            </p>
            <p>
              <strong>Email Frequency:</strong>{" "}
              {selectedCustomer.emailFrequency || "N/A"}
            </p>
            <p>
              <strong>Last Email Opened:</strong>{" "}
              {selectedCustomer.lastEmailOpenedDate
                ? new Date(
                    selectedCustomer.lastEmailOpenedDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Last Contact Date:</strong>{" "}
              {selectedCustomer.lastContactDate
                ? new Date(
                    selectedCustomer.lastContactDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>Bounce Status:</strong>{" "}
              {selectedCustomer.bounceStatus ? "Bounced" : "No Bounce"}
            </p>
            <p>
              <strong>Lead Source:</strong>{" "}
              {selectedCustomer.leadSource || "N/A"}
            </p>
            <p>
              <strong>Customer Value Score:</strong>{" "}
              {selectedCustomer.customerValueScore || "N/A"}
            </p>
            <p>
              <strong>Engagement Status:</strong>{" "}
              {selectedCustomer.engagementStatus || "N/A"}
            </p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>

      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Import Customers"
      >
        <div className="text-sm text-gray-700">
          <p>
            This is a placeholder for the customer import functionality. You
            could drag and drop a CSV or connect an integration here.
          </p>
          {/* Example of a basic file input for CSV upload */}
          <div className="mt-4">
            <label htmlFor="file-upload" className="sr-only">
              Choose file
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              // onClick={handleImport} // Need to implement import logic
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload & Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Re-using the Modal and StatsCard components as they are
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div
        className={`p-3 rounded-lg ${color
          .replace("text-", "bg-")
          .replace("-600", "-100")}`}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default CustomerManagementApp;
