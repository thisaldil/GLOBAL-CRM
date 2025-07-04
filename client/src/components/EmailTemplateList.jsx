import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "https://global-crm-1zi3.vercel.app";

const EmailTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/email-templates`);
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async (templateId) => {
    try {
      const res = await fetch(`${API_BASE}/email/send-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send emails");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;

    try {
      const res = await fetch(`${API_BASE}/email-templates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      alert("Error deleting template.");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (loading) return <div className="p-6">Loading templates...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Email Templates</h1>
        <Link
          to="/dashboard/email-templates/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          + New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <p>No templates found.</p>
      ) : (
        <div className="bg-white shadow rounded-md overflow-hidden">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {template.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {template.category || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-2 flex-wrap">
                      <Link
                        to={`/dashboard/email-templates/view/${template._id}`}
                        title="Preview"
                        className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800 transition"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/dashboard/email-templates/edit/${template._id}`}
                        title="Edit"
                        className="inline-flex items-center px-2 py-1 text-sm text-yellow-600 hover:text-yellow-800 transition"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(template._id)}
                        title="Delete"
                        className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => sendBulkEmail(template._id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                      >
                        Send to All
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateList;
