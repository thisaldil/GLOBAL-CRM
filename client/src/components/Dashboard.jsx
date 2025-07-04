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
  Trash2, // Keeping Trash2 for consistency, though not used in dashboard table actions
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Assuming react-hot-toast is installed

const API_BASE = "https://global-crm-1zi3.vercel.app"; // Consistent API base URL

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [stats, setStats] = useState({}); // State for dashboard statistics
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const navigate = useNavigate();

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

    // Fetch email campaigns
    const fetchEmailCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        // Assuming a /campaigns endpoint exists for recent campaigns or all campaigns
        const res = await fetch(`${API_BASE}/campaigns`, {
          // Adjust if you have a /campaigns/recent
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load email campaigns");
        }
        const data = await res.json();
        // Assuming backend returns an array of campaigns, sort and take recent if no /recent endpoint
        const sortedRecentCampaigns = data
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.sentAt) -
              new Date(a.createdAt || a.sentAt)
          )
          .slice(0, 5);

        const formatted = sortedRecentCampaigns.map((campaign) => ({
          id: campaign._id,
          name: campaign.name,
          subject: campaign.subject,
          recipients: campaign.recipients?.length || 0, // Assuming recipients is an array
          openRate: campaign.analytics?.openRate || 0,
          clickRate: campaign.analytics?.clickRate || 0,
          status: campaign.status || "Draft",
          sentAt: campaign.sentAt
            ? new Date(campaign.sentAt).toLocaleDateString()
            : "Not sent",
        }));
        setEmailCampaigns(formatted);
      } catch (err) {
        toast.error("Failed to load email campaigns.");
        console.error("Failed to load email campaigns", err);
      } finally {
        setLoadingCampaigns(false);
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
        setStats(data);
      } catch (err) {
        toast.error("Failed to load dashboard statistics.");
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchRecentCustomers();
    fetchEmailCampaigns();
    fetchDashboardStats();
  }, [navigate]); // navigate is stable, so no infinite loop

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
          to="/dashboard/addcustomer" // Link to main customer management page
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Manage Customers</h3>
              <p className="text-sm text-white text-opacity-90">
                View, add, edit, and delete customer profiles
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/email-templates/create" // Assuming this route exists
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <Mail className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Create Email Campaign</h3>
              <p className="text-sm text-white text-opacity-90">
                Send targeted email campaigns
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/analytics" // Assuming this route exists
          className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">View Analytics</h3>
              <p className="text-sm text-white text-opacity-90">
                Track performance and insights
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
            label="Total Email Campaigns"
            value={stats.totalEmailCampaigns?.toLocaleString() || "0"}
            change={
              stats.campaignGrowthPercentage
                ? `+${stats.campaignGrowthPercentage}%`
                : "N/A"
            }
            icon={Mail}
            color="purple"
          />
          <StatCard
            label="Avg. Open Rate"
            value={`${stats.avgOpenRate?.toFixed(1) || "0.0"}%`}
            change={
              stats.openRateChange
                ? `${
                    stats.openRateChange > 0 ? "+" : ""
                  }${stats.openRateChange.toFixed(1)}%`
                : "N/A"
            }
            icon={TrendingUp}
            color="orange"
          />
        </div>
      )}

      {/* Recent Customers */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Recent Customers
          </h2>
          <Link
            to="/dashboard/customers"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All Customers
          </Link>
        </div>
        {loadingCustomers ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : recentCustomers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recent customers found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {recentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {customer.fullName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {customer.company}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {customer.lastContactDate}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/dashboard/customers/${customer.id}`} // Link to view customer details
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                        title="View Customer"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/dashboard/customers/edit/${customer.id}`} // Link to edit customer
                        className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mr-2"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {/* You might consider a dedicated "Send Email" action here */}
                      <button
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
                        title="Send Email"
                        onClick={() =>
                          toast.success(
                            `Simulating email to ${customer.fullName}`
                          )
                        }
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Email Campaigns */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Recent Email Campaigns
          </h2>
          <Link
            to="/dashboard/campaigns"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All Campaigns
          </Link>
        </div>
        {loadingCampaigns ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : emailCampaigns.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recent email campaigns found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {emailCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {campaign.subject}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {campaign.recipients}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {campaign.openRate}%
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === "Sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : campaign.status === "Draft"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/dashboard/campaigns/${campaign.id}`} // Link to view campaign details
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                        title="View Campaign"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/dashboard/campaigns/edit/${campaign.id}`} // Link to edit campaign
                        className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Campaign"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
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
