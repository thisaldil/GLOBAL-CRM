import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import {
  Users,
  Mail,
  Send,
  TrendingUp,
  UserPlus,
  BarChart3,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
=======
import { FileTextIcon, FileUpIcon, SendIcon, BoxIcon } from "lucide-react";
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

<<<<<<< HEAD
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
=======
  const [recentInvoices, setRecentInvoices] = useState([]);
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

<<<<<<< HEAD
    // Fetch recent customers
    fetch("https://your-crm-server.vercel.app/customers/recent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((customer) => ({
          id: customer._id,
          name: customer.name || "N/A",
          email: customer.email || "N/A",
          company: customer.company || "N/A",
          phone: customer.phone || "N/A",
          status: customer.status || "Active",
          lastContact: customer.lastContact
            ? new Date(customer.lastContact).toLocaleDateString()
            : "Never",
          createdAt: customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString()
            : "N/A",
        }));
        setRecentCustomers(formatted);
      })
      .catch((err) => {
        console.error("Failed to load recent customers", err);
      });

    // Fetch email campaigns
    fetch("https://your-crm-server.vercel.app/campaigns/recent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((campaign) => ({
          id: campaign._id,
          name: campaign.name,
          subject: campaign.subject,
          recipients: campaign.recipients?.length || 0,
          openRate: campaign.analytics?.openRate || 0,
          clickRate: campaign.analytics?.clickRate || 0,
          status: campaign.status || "Draft",
          sentAt: campaign.sentAt
            ? new Date(campaign.sentAt).toLocaleDateString()
            : "Not sent",
        }));
        setEmailCampaigns(formatted);
      })
      .catch((err) => {
        console.error("Failed to load email campaigns", err);
=======
    // Fetch recent invoices
    fetch("https://air-invoice-server.vercel.app/invoice/recent")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((inv) => ({
          id: inv._id,
          customer: inv.invoiceDetails?.passengerName || "N/A",
          passport: inv.invoiceDetails?.passportNumber || "N/A",
          nationality: inv.invoiceDetails?.nationality || "N/A",
          amount: inv.priceDetails?.totalAmount
            ? `$${inv.priceDetails.totalAmount}`
            : "N/A",
          date: inv.createdAt
            ? new Date(inv.createdAt).toLocaleDateString()
            : "N/A",
          status: "Sent",
        }));
        setRecentInvoices(formatted);
      })
      .catch((err) => {
        console.error("Failed to load recent invoices", err);
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
      });
  }, []);

  return (
    <div>
<<<<<<< HEAD
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          CRM Dashboard
        </h1>
        {user && (
          <div className="flex items-center space-x-3">
=======
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        {user && (
          <div className="flex items-center space-x-3 ">
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
            <span className="hidden md:block text-gray-700 font-medium dark:text-white">
              {user.name}
            </span>
            <img
<<<<<<< HEAD
              src={
                user.picture
                  ?.replace("=s96-c", "")
                  ?.replace("http://", "https://") || "/default-avatar.png"
              }
              alt={user.name}
              className="w-10 h-10 object-cover rounded-full border border-gray-300"
=======
              src={user.picture
                .replace("=s96-c", "")
                .replace("http://", "https://")}
              alt={user.name}
              className="w-10 h-10 object-cover rounded-full border border-gray-300 "
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
            />
          </div>
        )}
      </div>
<<<<<<< HEAD

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          to="/dashboard/addcustomer"
          className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Add New Customer</h3>
              <p className="text-sm text-white text-opacity-90">
                Create and manage customer profiles
=======
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link
          to={`/dashboard/upload`}
          className='bg-blue-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <FileUpIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Upload New Invoice</h3>
              <p className="text-sm text-white text-opacity-90">
                Create a new invoice from airline ticket
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
              </p>
            </div>
          </div>
        </Link>
<<<<<<< HEAD

        <Link
          to="/dashboard/campaigns/create"
          className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
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
          to="/dashboard/analytics"
          className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">View Analytics</h3>
              <p className="text-sm text-white text-opacity-90">
                Track performance and insights
=======
        <Link
          to={`/dashboard/templates`}
          className='bg-purple-500 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'
        >
          <div className="flex items-center">
            <div className="bg-white bg-opacity-30 p-3 rounded-full">
              <BoxIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-xl font-semibold">Manage Templates</h3>
              <p className="text-sm text-white text-opacity-90">
                Create a new invoice from airline ticket
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
              </p>
            </div>
          </div>
        </Link>
      </div>
<<<<<<< HEAD

      {/* Recent Customers */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-700 dark:text-white">
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
=======
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-700 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Recent Invoices
          </h2>
          <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            View All
          </button>
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Customer
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
<<<<<<< HEAD
                  Company
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Last Contact
=======
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Amount
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Status
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {recentCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {customer.company}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {customer.lastContact}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : customer.status === "Inactive"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-2">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400">
                      <Send className="w-4 h-4" />
=======
              {recentInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-4 text-sm text-gray-800 dark:text-white">
                    {invoice.customer}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {invoice.date}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800 font-medium dark:text-white">
                    {invoice.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${invoice.status === "Sent"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                      <FileTextIcon className="w-4 h-4" />
                    </button>
                    <button className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                      <SendIcon className="w-4 h-4" />
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
      {/* Recent Email Campaigns */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-700 dark:text-white">
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
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Campaign
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Recipients
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Open Rate
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                  Status
                </th>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {emailCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {campaign.subject}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {campaign.recipients}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {campaign.openRate}%
                  </td>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4 text-right">
                    <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-2">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Customers",
            value: "1,247",
            change: "+15%",
            icon: Users,
            color: "blue",
          },
          {
            label: "Email Campaigns",
            value: "38",
            change: "+8%",
            icon: Mail,
            color: "green",
          },
          {
            label: "Avg. Open Rate",
            value: "24.5%",
            change: "+3.2%",
            icon: TrendingUp,
            color: "purple",
          },
          {
            label: "Active Customers",
            value: "892",
            change: "+12%",
            icon: Users,
            color: "orange",
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}
                >
                  <IconComponent
                    className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {stat.value}
              </h3>
            </div>
          );
        })}
=======
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Invoices This Month",
            value: "24",
            change: "+12%",
          },
          {
            label: "Total Revenue",
            value: "$12,450",
            change: "+8%",
          },
          {
            label: "Pending Invoices",
            value: "3",
            change: "-2",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {stat.label}
            </p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {stat.value}
              </h3>
              <span
                className={`text-sm ${stat.change.startsWith("+")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
                  }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
      </div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> parent of ae8c7ee (Update Dashboard.jsx)
export default Dashboard;
