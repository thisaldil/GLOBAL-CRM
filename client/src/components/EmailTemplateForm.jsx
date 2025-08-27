import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

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
    type: "custom",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: formData.body,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        body: editor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      fetch(`${API_BASE}/email-templates/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
          editor?.commands.setContent(data.body || "");
        })
        .catch(() => setError("Failed to load template"))
        .finally(() => setLoading(false));
    } else {
      const defaultBody = `<p>Dear {{fullName}},</p><p>Change your text here.</p><p>Warm regards,<br/>The {{company}} Team</p>`;
      setFormData((prev) => ({ ...prev, body: defaultBody }));
      editor?.commands.setContent(defaultBody);
    }
  }, [id, editor]);

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

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-lg">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {isEditMode ? "Edit" : "Create"} Email Template
      </h1>

      {error && <p className="text-red-500 mb-4 dark:text-red-400">{error}</p>}

      {/* Placeholder buttons */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Insert placeholders:
        {["{{fullName}}", "{{email}}", "{{company}}"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() =>
              editor?.chain().focus().insertContent(`${tag} `).run()
            }
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            {tag}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Newsletter, Promo, Onboarding"
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="custom">Custom</option>
            <option value="inbuild">In-Build</option>
          </select>
        </div>

        {/* TipTap Editor */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Body *
          </label>
          <div className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
            {/* Toolbar */}
            <div className="flex gap-2 p-2 border-b border-gray-300 dark:border-gray-700 text-sm">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={
                  editor?.isActive("bold") ? "font-bold text-blue-600" : ""
                }
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={
                  editor?.isActive("italic") ? "italic text-blue-600" : ""
                }
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={
                  editor?.isActive("bulletList") ? "text-blue-600" : ""
                }
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => {
                  const previousUrl = editor?.getAttributes("link").href || "";
                  const url = window.prompt("Enter URL", previousUrl);
                  if (url === null) return; // cancelled
                  if (url === "") {
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                  } else {
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href: url })
                      .run();
                  }
                }}
                className={
                  editor?.isActive("link") ? "text-blue-600 underline" : ""
                }
              >
                Link
              </button>
            </div>

            <EditorContent
              editor={editor}
              className="px-3 py-2 min-h-[200px] text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/email-templates")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailTemplateForm;
