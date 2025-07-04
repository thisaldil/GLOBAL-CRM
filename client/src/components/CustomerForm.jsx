// src/components/CustomerForm.jsx (create this new file)
import React, { useState, useEffect } from "react";

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: "", // Matches backend schema
    email: "",
    phone: "",
    company: "",
    status: "Active", // Matches enum in schema
    tags: "", // Will be converted to array on save
    // Custom fields that are part of the 'customFields' object on the backend
    customFields: {
      customerValue: "Medium", // Matches schema for customFields.customerValue
      jobTitle: "",
      location: "",
      notes: "",
    },
  });

  // Populate form data when 'customer' prop changes (for edit mode)
  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        status: customer.status || "Active",
        tags: customer.tags ? customer.tags.join(", ") : "", // Convert array to comma-separated string for input
        customFields: {
          customerValue: customer.customFields?.customerValue || "Medium",
          jobTitle: customer.customFields?.jobTitle || "",
          location: customer.customFields?.location || "",
          notes: customer.customFields?.notes || "",
        },
      });
    } else {
      // Reset form for adding new customer
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        status: "Active",
        tags: "",
        customFields: {
          customerValue: "Medium",
          jobTitle: "",
          location: "",
          notes: "",
        },
      });
    }
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data for API: convert tags string to array
    const dataToSave = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean), // Clean and filter empty tags
    };

    // Remove empty custom fields if not needed on backend or if they cause validation issues
    for (const key in dataToSave.customFields) {
      if (dataToSave.customFields[key] === "") {
        delete dataToSave.customFields[key];
      }
    }

    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
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
            {/* These should match your backend schema's enum for 'status' */}
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Trial">Trial</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
        {/* Custom fields are now nested under customFields in formData */}
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

export default CustomerForm;
