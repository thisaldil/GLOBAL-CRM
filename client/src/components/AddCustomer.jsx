// Updated CustomerManagementApp.jsx to use real API
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

const API_BASE = "https://global-crm-1zi3.vercel.app";

const CustomerManagementApp = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers`);
      const data = await res.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error("Failed to fetch stats");
    }
  };

  const createCustomer = async (customer) => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error("Failed to create customer");
      toast.success("Customer created");
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateCustomer = async (id, customer) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      toast.success("Customer updated");
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCustomer = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirm) return;
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    let filtered = customers;
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter
      );
    }
    setFilteredCustomers(filtered);
  }, [searchTerm, statusFilter, customers]);

  // Keep your existing UI structure, reusing createCustomer, updateCustomer, deleteCustomer handlers
  // Pass them to your existing modals/forms as needed

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Unsubscribed">Unsubscribed</option>
            <option value="Bounced">Bounced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Value
          </label>
          <select
            value={formData.customFields.customerValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                customFields: {
                  ...formData.customFields,
                  customerValue: e.target.value,
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={formData.customFields.jobTitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                customFields: {
                  ...formData.customFields,
                  jobTitle: e.target.value,
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.customFields.location}
            onChange={(e) =>
              setFormData({
                ...formData,
                customFields: {
                  ...formData.customFields,
                  location: e.target.value,
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="VIP, Enterprise, Designer"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.customFields.notes}
          onChange={(e) =>
            setFormData({
              ...formData,
              customFields: {
                ...formData.customFields,
                notes: e.target.value,
              },
            })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {customer ? "Update" : "Create"} Customer
        </button>
      </div>
    </form>
  );
};

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
              value={stats.totalCustomers}
              icon={Users}
              color="text-blue-600"
            />
            <StatsCard
              title="Active Customers"
              value={stats.activeCustomers}
              icon={UserCheck}
              color="text-green-600"
              subtitle={`${Math.round(
                (stats.activeCustomers / stats.totalCustomers) * 100
              )}% of total`}
            />
            <StatsCard
              title="Avg Open Rate"
              value={`${stats.avgOpenRate}%`}
              icon={Mail}
              color="text-purple-600"
            />
            <StatsCard
              title="Avg Click Rate"
              value={`${stats.avgClickRate}%`}
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
                    {stats.activeCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="text-sm font-medium text-gray-600">
                    {stats.inactiveCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unsubscribed</span>
                  <span className="text-sm font-medium text-red-600">
                    {stats.unsubscribedCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bounced</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {stats.bouncedCustomers}
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
                    {stats.totalEmailsSent}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Opened</span>
                  <span className="text-sm font-medium">
                    {stats.totalEmailsOpened}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Clicked</span>
                  <span className="text-sm font-medium">
                    {stats.totalEmailsClicked}
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
                    placeholder="Search customers..."
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Unsubscribed">Unsubscribed</option>
                  <option value="Bounced">Bounced</option>
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
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
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
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name}
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
                              <div>
                                Open: {customer.emailEngagement?.openRate}%
                              </div>
                              <div>
                                Click: {customer.emailEngagement?.clickRate}%
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
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowViewModal(true); // View modal
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setShowEditModal(true); // Edit modal
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete customer ${customer.name}?`
                                  )
                                ) {
                                  deleteCustomer(customer._id); // ✅ Calls real DELETE API
                                }
                              }}
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
          createCustomer(data); // ✅ Calls real POST API
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
          updateCustomer(selectedCustomer._id, updatedData); // ✅ Calls real PUT API
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
        <div className="space-y-4 text-sm">
          <p>
            <strong>Name:</strong> {selectedCustomer.name}
          </p>
          <p>
            <strong>Email:</strong> {selectedCustomer.email}
          </p>
          <p>
            <strong>Phone:</strong> {selectedCustomer.phone}
          </p>
          <p>
            <strong>Company:</strong> {selectedCustomer.company}
          </p>
          <p>
            <strong>Status:</strong> {selectedCustomer.status}
          </p>
          <p>
            <strong>Customer Value:</strong>{" "}
            {selectedCustomer.customFields?.customerValue}
          </p>
          <p>
            <strong>Job Title:</strong>{" "}
            {selectedCustomer.customFields?.jobTitle}
          </p>
          <p>
            <strong>Location:</strong> {selectedCustomer.customFields?.location}
          </p>
          <p>
            <strong>Tags:</strong> {selectedCustomer.tags?.join(", ")}
          </p>
          <p>
            <strong>Notes:</strong> {selectedCustomer.customFields?.notes}
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
          This is a placeholder for the customer import functionality. You could
          drag and drop a CSV or connect an integration here.
        </p>
      </div>
    </Modal>
  </div>
);

export default CustomerManagementApp;
