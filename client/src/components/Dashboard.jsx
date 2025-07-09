import React, { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Send,
  TrendingUp,
  UserPlus,
  BarChart3,
  Eye,
  Edit,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Configuration
const API_BASE = "https://global-crm-1zi3.vercel.app";

// Utility Functions
const getStatusColor = (status) => {
  const statusColors = {
    Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Trial:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };
  return (
    statusColors[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
};

const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString() : "Never";
};

const formatCustomerData = (customers) => {
  return customers.map((customer) => ({
    id: customer._id,
    fullName: customer.fullName || "N/A",
    email: customer.email || "N/A",
    company: customer.company || "N/A",
    phone: customer.phone || "N/A",
    status: customer.status || "Active",
    lastContactDate: formatDate(customer.lastContactDate),
    createdAt: formatDate(customer.createdAt),
  }));
};

// Components
const StatCard = ({ label, value, change, icon: Icon, color }) => {
  const changeColorClass = change?.startsWith("+")
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900`}>
          <Icon
            className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`}
          />
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

const LoadingSpinner = ({ size = "h-6 w-6" }) => (
  <div className="flex justify-center items-center h-20">
    <div
      className={`animate-spin ${size} border-2 border-blue-600 border-t-transparent rounded-full`}
    />
  </div>
);

const QuickActionCard = ({ to, bgColor, icon: Icon, title, description }) => (
  <Link
    to={to}
    className={`${bgColor} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105`}
  >
    <div className="flex items-center">
      <div className="bg-white bg-opacity-20 p-3 rounded-full">
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4 text-left">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-white text-opacity-90">{description}</p>
      </div>
    </div>
  </Link>
);

const TableSection = ({
  title,
  viewAllLink,
  loading,
  data,
  renderRow,
  emptyMessage,
}) => (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-6 dark:bg-gray-800 dark:text-white">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link
        to={viewAllLink}
        className="text-sm font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        View All
      </Link>
    </div>

    {loading ? (
      <LoadingSpinner />
    ) : data.length === 0 ? (
      <p className="text-center text-gray-500 dark:text-gray-400 py-6">
        {emptyMessage}
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
          {renderRow(data)}
        </table>
      </div>
    )}
  </div>
);

// Custom Hooks
const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, [navigate]);

  return { user, token: localStorage.getItem("token") };
};

const useApiData = (endpoint, formatter = (data) => data) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(formatter(response.data));
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        toast.error(`Failed to load data from ${endpoint}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, token, formatter]);

  return { data, loading };
};

// Main Dashboard Component
function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch recent customers
  const { data: recentCustomers, loading: loadingCustomers } = useApiData(
    "/customers",
    (customers) => {
      const sorted = customers.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return formatCustomerData(sorted.slice(0, 5));
    }
  );

  // Fetch recent templates
  const { data: templates, loading: loadingTemplates } = useApiData(
    "/email-templates?limit=3"
  );

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE}/customers/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleSendEmail = (customerName) => {
    toast.success(`Simulating email to ${customerName}`);
  };

  const renderCustomerRow = (customers) => (
    <>
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          {["Customer", "Company", "Last Contact", "Status", "Actions"].map(
            (header) => (
              <th
                key={header}
                className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs"
              >
                {header}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {customers.map((customer) => (
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
            <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
              <Link to={`/dashboard/customers/${customer.id}`} title="View">
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
                onClick={() => handleSendEmail(customer.fullName)}
              >
                <Send className="w-4 h-4 text-blue-600 hover:text-blue-800" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );

  const renderTemplateRow = (templates) => (
    <>
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          {["Name", "Subject", "Category", "Actions"].map((header) => (
            <th
              key={header}
              className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 uppercase text-xs"
            >
              {header}
            </th>
          ))}
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
            <td className="px-3 py-2 text-right flex items-center justify-end gap-2">
              <Link to={`/dashboard/templates/${template._id}`} title="View">
                <Eye className="w-4 h-4 text-blue-500 hover:text-blue-700" />
              </Link>
              <Link
                to={`/dashboard/templates/edit/${template._id}`}
                title="Edit"
              >
                <Edit className="w-4 h-4 text-green-500 hover:text-green-700" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );

  const quickActions = [
    {
      to: "/dashboard/addcustomer",
      bgColor: "bg-blue-600",
      icon: UserPlus,
      title: "Manage Customers",
      description: "View, add, edit, and delete customer profiles",
    },
    {
      to: "/dashboard/email-templates/create",
      bgColor: "bg-green-600",
      icon: Mail,
      title: "Create Email Campaign",
      description: "Send targeted email campaigns",
    },
    {
      to: "/dashboard/analytics",
      bgColor: "bg-purple-600",
      icon: BarChart3,
      title: "View Analytics",
      description: "Track performance and insights",
    },
  ];

  const statisticsCards = [
    {
      label: "Total Customers",
      value: stats.totalCustomers?.toLocaleString() || "0",
      change: stats.customerGrowthPercentage
        ? `+${stats.customerGrowthPercentage}%`
        : "N/A",
      icon: Users,
      color: "blue",
    },
    {
      label: "Active Customers",
      value: stats.activeCustomers?.toLocaleString() || "0",
      change: stats.activeCustomerPercentage
        ? `+${stats.activeCustomerPercentage}%`
        : "N/A",
      icon: UserPlus,
      color: "green",
    },
    {
      label: "Total Email Campaigns",
      value: stats.totalEmailCampaigns?.toLocaleString() || "0",
      change: stats.campaignGrowthPercentage
        ? `+${stats.campaignGrowthPercentage}%`
        : "N/A",
      icon: Mail,
      color: "purple",
    },
    {
      label: "Avg. Open Rate",
      value: `${stats.avgOpenRate?.toFixed(1) || "0.0"}%`,
      change: stats.openRateChange
        ? `${stats.openRateChange > 0 ? "+" : ""}${stats.openRateChange.toFixed(
            1
          )}%`
        : "N/A",
      icon: TrendingUp,
      color: "orange",
    },
  ];

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
        {quickActions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>

      {/* Statistics Cards */}
      {loadingStats ? (
        <LoadingSpinner size="h-12 w-12" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statisticsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}

      {/* Recent Customers */}
      <TableSection
        title="Recent Customers"
        viewAllLink="/dashboard/customers"
        loading={loadingCustomers}
        data={recentCustomers}
        renderRow={renderCustomerRow}
        emptyMessage="No recent customers found."
      />

      {/* Recent Email Templates */}
      <TableSection
        title="Recent Email Templates"
        viewAllLink="/dashboard/templates"
        loading={loadingTemplates}
        data={templates}
        renderRow={renderTemplateRow}
        emptyMessage="No recent email templates found."
      />
    </div>
  );
}

export default Dashboard;
