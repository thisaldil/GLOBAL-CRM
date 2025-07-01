// src/components/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
          CRM Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg text-blue-300">Welcome, Admin!</span>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl font-semibold">
            AD {/* Initials */}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Customer Overview */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            Customer Overview
          </h2>
          <p className="text-gray-300">
            Total Customers:{" "}
            <span className="text-blue-300 text-xl font-semibold">1200</span>
          </p>
          <p className="text-gray-300">
            New Customers This Month:{" "}
            <span className="text-blue-300 text-xl font-semibold">45</span>
          </p>
          <button className="mt-5 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md hover:from-blue-600 hover:to-blue-800 transition duration-300">
            View All Customers
          </button>
        </div>

        {/* Card 2: Email Campaigns */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            Email Campaigns
          </h2>
          <p className="text-gray-300">
            Emails Sent Today:{" "}
            <span className="text-orange-300 text-xl font-semibold">5000</span>
          </p>
          <p className="text-gray-300">
            Pending Emails:{" "}
            <span className="text-orange-300 text-xl font-semibold">150</span>
          </p>
          <button className="mt-5 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-md hover:from-orange-600 hover:to-orange-800 transition duration-300">
            Manage Campaigns
          </button>
        </div>

        {/* Card 3: Quick Actions */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">
            Quick Actions
          </h2>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="flex items-center text-blue-300 hover:text-blue-500 transition duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Add New Customer
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-blue-300 hover:text-blue-500 transition duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                Create Email Template
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center text-blue-300 hover:text-blue-500 transition duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
                Edit Profile
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer (Optional) */}
      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} CRM Project. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
