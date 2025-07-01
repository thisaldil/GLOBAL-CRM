import React, { useState } from "react";

// Notification component (copied from main App for standalone functionality)
const Notification = ({ message, type }) => {
  if (!message) return null;
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}
    >
      {message}
    </div>
  );
};

// Customer Form Component (reused for Add and Edit, but here only for Add)
const CustomerFormPage = ({
  customer,
  onSubmit,
  onCancel,
  showNotification,
}) => {
  const [formData, setFormData] = useState(
    customer || {
      name: "",
      email: "",
      phone: "",
      company: "",
      dob: "",
      joinDate: new Date().toISOString().split("T")[0], // Default to today's date
      status: "Active",
      notes: "",
    }
  );
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.joinDate) newErrors.joinDate = "Join Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      showNotification("Please correct the errors in the form.", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {customer ? "Edit Customer" : "Add New Customer"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.dob ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500`}
            />
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="joinDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Join Date
            </label>
            <input
              type="date"
              id="joinDate"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.joinDate ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring-2 focus:ring-blue-500`}
            />
            {errors.joinDate && (
              <p className="text-red-500 text-xs mt-1">{errors.joinDate}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes/Preferences
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition duration-200 ease-in-out transform hover:scale-105"
          >
            {customer ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Add Customer Page component
const App = () => {
  // Renamed to App for default export, but functions as AddCustomerPage
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Function to show a temporary notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000); // Notification disappears after 3 seconds
    return () => clearTimeout(timer);
  };

  const handleAddCustomerSubmit = (newCustomerData) => {
    console.log("New customer data submitted:", newCustomerData);
    // In a real application, you would send this data to your backend API
    showNotification("Customer data logged to console!", "success");
  };

  const handleCancel = () => {
    console.log("Add Customer operation cancelled.");
    // In a real application, you might navigate back to the customer list
    showNotification("Operation cancelled.", "info");
  };

  return (
    <div className="font-sans antialiased bg-gray-100 text-gray-900 p-4">
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Inter font for better typography */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto py-8">
        <CustomerFormPage
          onSubmit={handleAddCustomerSubmit}
          onCancel={handleCancel}
          showNotification={showNotification} // Pass showNotification to the form
        />
      </div>
      <Notification message={notification.message} type={notification.type} />
    </div>
  );
};

export default App;
