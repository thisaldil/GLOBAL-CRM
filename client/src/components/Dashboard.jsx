import React, { useEffect, useState } from "react";
import { Users, Mail, Send, UserPlus, Eye, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://global-crm-1zi3.vercel.app"; // Consistent API base URL

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [templateCount, setTemplateCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentTemplates = async () => {
      try {
        const res = await axios.get(`${API_BASE}/email-templates?limit=3`);
        setTemplates(res.data);
      } catch (error) {
        console.error("Error fetching recent templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchRecentTemplates();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(`${API_BASE}/api/customers/stats`);
      const data = await res.json();
      console.log("Total:", data.total, "Active:", data.active);
    };

    fetchStats();
  }, []);

  // Helper function for status colors (can be reused from CustomerManagementApp)
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Inactive":
      case "Lost": // Mapping "Lost" from backend schema to a red status
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Trial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Fetch user data and authenticate
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    // Fetch recent customers
    const fetchRecentCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await fetch(`${API_BASE}/customers`, {
          // Fetch all customers
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load recent customers");
        }
        const data = await res.json();
        // Sort by createdAt and take the first 5 for "recent"
        const sortedRecent = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const formatted = sortedRecent.map((customer) => ({
          id: customer._id,
          fullName: customer.fullName || "N/A", // Use fullName from schema
          email: customer.email || "N/A",
          company: customer.company || "N/A",
          phone: customer.phone || "N/A",
          status: customer.status || "Active", // Use status from schema
          lastContactDate: customer.lastContactDate // Use lastContactDate from schema
            ? new Date(customer.lastContactDate).toLocaleDateString()
            : "Never",
          createdAt: customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString()
            : "N/A",
        }));
        setRecentCustomers(formatted);
      } catch (err) {
        toast.error("Failed to load recent customers.");
        console.error("Failed to load recent customers", err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch(`${API_BASE}/customers/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load dashboard statistics");
        }
        const data = await res.json();

        setStats({
          totalCustomers: data.total,
          activeCustomers: data.active,
        });
      } catch (err) {
        toast.error("Failed to load dashboard statistics.");
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchRecentCustomers();
    fetchDashboardStats();
  }, [navigate]);

  useEffect(() => {
    const loadCount = async () => {
      const count = await fetchEmailTemplateCount();
      setTemplateCount(count);
    };
    loadCount();
  }, []);

  const fetchEmailTemplateCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/email-templates/count`);
      if (!res.ok) throw new Error("Failed to fetch count");
      const data = await res.json();
      return data.count;
    } catch (err) {
      console.error("Error fetching template count:", err);
      return 0;
    }
  };

  // Component for displaying statistics cards
  const StatCard = ({ label, value, change, icon: Icon, color }) => {
    const changeColorClass = change?.startsWith("+")
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
    const bgColorClass = `bg-${color}-100 dark:bg-${color}-900`;
    const textColorClass = `text-${color}-600 dark:text-${color}-400`;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${bgColorClass}`}>
            <Icon className={`w-5 h-5 ${textColorClass}`} />
          </div>
          {change && (
            <span className={`text-sm font-medium ${changeColorClass}`}>
              {change}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          {value}
        </h3>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-8 lg:p-10 font-inter">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          CRM Dashboard
        </h1>
        {user && (
          <div className="flex items-center space-x-3">
            <span className="hidden md:block text-gray-700 font-medium dark:text-white">
              {user.name}
            </span>
            <img
              src={
                user.picture
                  ?.replace("=s96-c", "")
                  ?.replace("http://", "https://") ||
                "https://placehold.co/40x40/cccccc/ffffff?text=U"
              }
              alt={user.name || "User Avatar"}
              className="w-10 h-10 object-cover rounded-full border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          to="/dashboard/addcustomer"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="flex items-start gap-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Manage Customers</h3>
              <p className="text-sm text-white text-opacity-90">
                View, add, edit, and delete customer profiles
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/email-templates/create"
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="flex items-start gap-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Create Email Campaign</h3>
              <p className="text-sm text-white text-opacity-90">
                Send targeted email campaigns
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics Cards - Dynamically loaded from API */}
      {loadingStats ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers?.toLocaleString() || "0"}
            change={
              stats.customerGrowthPercentage
                ? `+${stats.customerGrowthPercentage}%`
                : "N/A"
            }
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Active Customers"
            value={stats.activeCustomers?.toLocaleString() || "0"}
            change={
              stats.activeCustomerPercentage
                ? `+${stats.activeCustomerPercentage}%`
                : "N/A"
            }
            icon={UserPlus} // Using UserPlus for active customers
            color="green"
          />
          <StatCard
            label="Total Email Templates"
            value={stats.totalTemplateCount?.toLocaleString() || "0"}
            change={
              stats.templateGrowthPercentage
                ? `+${stats.templateGrowthPercentage}%`
                : "N/A"
            }
            icon={Mail}
            color="indigo"
          />
        </div>
      )}

      {/* 🔹 Recent Customers */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Customers</h2>
          <Link
            to="/dashboard/addcustomer"
            className="text-sm font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All Customers
          </Link>
        </div>

        {loadingCustomers ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : recentCustomers.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            No recent customers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Customer
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Company
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Last Contact
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Status
                  </th>
                  {/* <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="font-medium text-gray-800 dark:text-white">
                        {customer.fullName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                      {customer.company}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                      {customer.lastContactDate}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    {/* <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
                      <Link
                        to={`/dashboard/customers/${customer.id}`}
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                      </Link>
                      <Link
                        to={`/dashboard/customers/edit/${customer.id}`}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-green-500 hover:text-green-700" />
                      </Link>
                      <button
                        title="Send Email"
                        onClick={() =>
                          toast.success(
                            `Simulating email to ${customer.fullName}`
                          )
                        }
                      >
                        <Send className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔹 Recent Email Templates */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Email Templates</h2>
          <Link
            to="/dashboard/email-templates"
            className="text-sm font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All Templates
          </Link>
        </div>

        {loadingTemplates ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            No recent email templates found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Subject
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Category
                  </th>
                  {/* <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300 uppercase text-xs">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {templates.map((template) => (
                  <tr
                    key={template._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-3 py-2 font-medium text-gray-800 dark:text-white">
                      {template.name}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                      {template.subject}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                      {template.category || "—"}
                    </td>
                    {/* <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
                      <Link
                        to={`/dashboard/templates/${template._id}`}
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                      </Link>
                      <Link
                        to={`/dashboard/templates/edit/${template._id}`}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-green-500 hover:text-green-700" />
                      </Link>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
