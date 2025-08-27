import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Building2, PencilLine, Save } from "lucide-react";

const API_BASE = "https://global-crm-1zi3.vercel.app";

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
  });

  const themeOptions = [
    { label: "System", value: "system", icon: <Monitor className="w-6 h-6" /> },
    { label: "Light", value: "light", icon: <Sun className="w-6 h-6" /> },
    { label: "Dark", value: "dark", icon: <Moon className="w-6 h-6" /> },
  ];

  useEffect(() => {
    const html = document.documentElement;
    const applyTheme = (mode) => {
      if (mode === "dark") html.classList.add("dark");
      else if (mode === "light") html.classList.remove("dark");
      else
        html.classList.toggle(
          "dark",
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${API_BASE}/company`);
        const data = await res.json();
        const firstCompany = Array.isArray(data) ? data[0] : data;
        setCompany(firstCompany);
        setFormData({
          name: firstCompany?.name || "",
          email: firstCompany?.email || "",
          phone: firstCompany?.phone || "",
          industry: firstCompany?.industry || "",
        });
      } catch (err) {
        console.error("Failed to load company:", err);
      }
    };
    fetchCompany();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateCompany = async () => {
    try {
      const res = await fetch(`${API_BASE}/company/${company._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      setCompany(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Profile Card */}
        {user && (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-6">
            <img
              src={
                user.picture
                  ?.replace("=s96-c", "")
                  .replace("http://", "https://") ||
                "https://via.placeholder.com/150"
              }
              alt={user.name}
              className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-700 shadow-md"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">he/him</p>
            </div>
          </div>
        )}

        {/* Company Details Section */}
        {company && (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                name="name"
                placeholder="Company Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="px-3 py-2 rounded-lg w-full text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              />
              <input
                name="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="px-3 py-2 rounded-lg w-full text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="px-3 py-2 rounded-lg w-full text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="px-3 py-2 rounded-lg w-full text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateCompany}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: company.name || "",
                        email: company.email || "",
                        phone: company.phone || "",
                        industry: company.industry || "",
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <PencilLine className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          </div>
        )}

        {/* Theme Settings */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Theme Settings</h2>
          <div className="flex justify-center space-x-4">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`p-3 rounded-full border-2 transition-all ${
                  theme === option.value
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title={option.label}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
