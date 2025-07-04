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
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{template.name}</td>
                  <td className="px-4 py-3">{template.category || "-"}</td>
                  <td className="px-4 py-3">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/dashboard/email-templates/view/${template._id}`}
                      className="text-blue-600 hover:underline"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      to={`/dashboard/email-templates/edit/${template._id}`}
                      className="text-yellow-600 hover:underline"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="text-red-600 hover:underline"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
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
