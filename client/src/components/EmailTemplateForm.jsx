import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://global-crm-1zi3.vercel.app";

const EmailTemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      fetch(`${API_BASE}/email-templates/${id}`)
        .then((res) => res.json())
        .then((data) => setFormData(data))
        .catch(() => setError("Failed to load template"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/email-templates${isEditMode ? `/${id}` : ""}`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error("Request failed");
      navigate("/dashboard/email-templates");
    } catch (err) {
      setError("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const getEmailPreview = () => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const year = new Date().getFullYear();

    const headerHtml = `
      <div style="background:#e63946;padding:20px;color:white;text-align:center;">
        <h1>Sample Company</h1>
        <p>${today}</p>
      </div>
    `;

    const footerHtml = `
      <div style="background:#f1f1f1;padding:20px;text-align:center;font-size:12px;color:#777;">
        &copy; ${year} Sample Company. All rights reserved.
      </div>
    `;

    const bodyWithPlaceholders = formData.body
      .replace(/{{fullName}}/g, "John Doe")
      .replace(/{{company}}/g, "Sample Company")
      .replace(/{{date}}/g, today)
      .replace(/{{year}}/g, year);

    return `
      <div style="font-family:sans-serif;background:#f4f4f4;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
          ${headerHtml}
          <div style="padding:30px;">
            ${bodyWithPlaceholders}
          </div>
          ${footerHtml}
        </div>
      </div>
    `;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {isEditMode ? "Edit" : "Create"} Email Template
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 rounded-md ${
            !showPreview ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Edit Template
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 rounded-md ${
            showPreview ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Preview Email
        </button>
      </div>

      {showPreview ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Email Subject:</h3>
            <p className="text-gray-800">{formData.subject || "No subject"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Email Content Preview:</h3>
            <p className="text-sm text-gray-600 mb-3">
              * Header and footer are automatically added when sending emails
            </p>
            <div
              className="border rounded-md bg-white"
              dangerouslySetInnerHTML={{ __html: getEmailPreview() }}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Newsletter, Promo, Onboarding"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body *</label>
            <p className="text-sm text-gray-600 mb-2">
              ✨ Header and footer will be automatically added when sending
              emails
            </p>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={10}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Write your email content here… Use {{fullName}}, {{company}}, {{date}}, {{year}}"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">
              Available Placeholders:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <div>
                <code>{"{{ fullName }}"}</code> - Customer's full name
              </div>
              <div>
                <code>{"{{ company }}"}</code> - Customer's company
              </div>
              <div>
                <code>{"{{ date }}"}</code> - Current date
              </div>
              <div>
                <code>{"{{ year }}"}</code> - Current year
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/email-templates")}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailTemplateForm;
