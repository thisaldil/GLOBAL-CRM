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
} from "lucide-react";
import toast from "react-hot-toast";
import CustomerForm from "./CustomerForm";

const API_BASE = "https://global-crm-1zi3.vercel.app";

const CustomerManagementApp = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Helper to determine status color based on backend enum
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Unsubscribed":
      case "Lost":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Trial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Bounced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Helper to determine customer value color
  const getValueColor = (value) => {
    switch (value) {
      case "High":
        return "text-green-600 dark:text-green-300";
      case "Medium":
        return "text-orange-600 dark:text-orange-300";
      case "Low":
        return "text-gray-500 dark:text-gray-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Build query string for search, status, and tag filters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (tagFilter) params.append("tag", tagFilter);

      const url = `${API_BASE}/customers?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
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
      fetchCustomers();
      fetchStats();
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
      fetchCustomers();
      fetchStats();
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
      fetchCustomers();
      fetchStats();
    } catch (error) {
      toast.error(error.message);
      console.error("Delete customer error:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [searchTerm, statusFilter, tagFilter]);

  // Client-side filtering and sorting logic
  useEffect(() => {
    let currentFiltered = [...customers];

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

      if (valA === undefined || valA === null) valA = "";
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
  }, [customers, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage your customer relationships
                </p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
            </div> */}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "customers"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
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
                color="text-blue-600 dark:text-blue-400"
              />
              <StatsCard
                title="Active Customers"
                value={stats.activeCustomers || 0}
                icon={UserCheck}
                color="text-green-600 dark:text-green-400"
                subtitle={
                  stats.totalCustomers > 0
                    ? `${Math.round(
                        (stats.activeCustomers / stats.totalCustomers) * 100
                      )}% of total`
                    : "0% of total"
                }
              />

              <StatsCard
                title="Avg Open Rate"
                value={`${stats.avgOpenRate || 0}%`}
                icon={Mail}
                color="text-purple-600 dark:text-purple-400"
              />
              <StatsCard
                title="Avg Click Rate"
                value={`${stats.avgClickRate || 0}%`}
                icon={TrendingUp}
                color="text-orange-600 dark:text-orange-400"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Customer Status Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Active
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {stats.activeCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Inactive
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stats.inactiveCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Unsubscribed (Lost)
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {stats.unsubscribedCustomers || stats.lostCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Trial
                    </span>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      {stats.trialCustomers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Bounced
                    </span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {stats.bouncedCustomers || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Email Engagement
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Total Sent
                    </span>
                    <span className="text-sm font-medium dark:text-white">
                      {stats.totalEmailsSent || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Total Opened
                    </span>
                    <span className="text-sm font-medium dark:text-white">
                      {stats.totalEmailsOpened || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Total Clicked
                    </span>
                    <span className="text-sm font-medium dark:text-white">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Engagement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tags
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg p-4">
            <p>
              <strong className="text-gray-900 dark:text-white">
                Full Name:
              </strong>{" "}
              {selectedCustomer.fullName}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Email:</strong>{" "}
              {selectedCustomer.email}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Phone:</strong>{" "}
              {selectedCustomer.phone || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Company:
              </strong>{" "}
              {selectedCustomer.company || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Status:</strong>{" "}
              {selectedCustomer.status}
            </p>
            {/* Displaying customFields directly */}
            <p>
              <strong className="text-gray-900 dark:text-white">
                Customer Value:
              </strong>{" "}
              {selectedCustomer.customFields?.customerValue || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Job Title:
              </strong>{" "}
              {selectedCustomer.customFields?.jobTitle || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Location:
              </strong>{" "}
              {selectedCustomer.customFields?.location || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Tags:</strong>{" "}
              {selectedCustomer.tags?.length > 0
                ? selectedCustomer.tags.join(", ")
                : "None"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Notes:</strong>{" "}
              {selectedCustomer.customFields?.notes || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Join Date:
              </strong>{" "}
              {new Date(selectedCustomer.joinDate).toLocaleDateString()}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Years With Company:
              </strong>{" "}
              {selectedCustomer.yearsWithCompany || 0}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Assigned Rep:
              </strong>{" "}
              {selectedCustomer.assignedRep || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Next Follow Up:
              </strong>{" "}
              {selectedCustomer.nextFollowUpDate
                ? new Date(
                    selectedCustomer.nextFollowUpDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Email Subscription:
              </strong>{" "}
              {selectedCustomer.isSubscribed ? "Subscribed" : "Unsubscribed"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Email Topics:
              </strong>{" "}
              {selectedCustomer.emailTopics?.length > 0
                ? selectedCustomer.emailTopics.join(", ")
                : "None"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Email Frequency:
              </strong>{" "}
              {selectedCustomer.emailFrequency || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Last Email Opened:
              </strong>{" "}
              {selectedCustomer.lastEmailOpenedDate
                ? new Date(
                    selectedCustomer.lastEmailOpenedDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Last Contact Date:
              </strong>{" "}
              {selectedCustomer.lastContactDate
                ? new Date(
                    selectedCustomer.lastContactDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Bounce Status:
              </strong>{" "}
              {selectedCustomer.bounceStatus ? "Bounced" : "No Bounce"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Lead Source:
              </strong>{" "}
              {selectedCustomer.leadSource || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Customer Value Score:
              </strong>{" "}
              {selectedCustomer.customerValueScore || "N/A"}
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Engagement Status:
              </strong>{" "}
              {selectedCustomer.engagementStatus || "N/A"}
            </p>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-200">Loading...</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </p>
        <p className={`${color}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-lg ${color
          .replace("text-", "bg-")
          .replace("-600", "-100")
          .replace("dark:text-", "dark:bg-")
          .replace("-400", "-900")}`}
      >
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default CustomerManagementApp;
