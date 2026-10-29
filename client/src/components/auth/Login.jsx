import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import bg from "../../images/bg.png";
import toast from "react-hot-toast";

const API_BASE = process.env.REACT_APP_API_URL || "https://global-crm.vercel.app";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve(fetch(`${API_BASE}/auth/me`, { credentials: "include" }))
      .then((response) => {
        if (response.ok) navigate("/dashboard");
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid username or password.");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }} className="relative flex min-h-screen w-full overflow-hidden bg-gray-100">
      <div className="hidden md:flex absolute left-0 top-0 h-full w-1/2 items-center justify-center px-12">
        <div className="text-center">
          <img src="/logo.png" alt="GLOBAL CRM" className="mx-auto w-72 mb-6" />
          <p className="text-xl leading-relaxed font-medium max-w-lg text-gray-700">Manage your invoices, customers, and email workflows in one secure CRM.</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 z-10 flex justify-center items-center ml-auto p-6">
        <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-6">Sign in to your CRM account.</p>
          {error && <p role="alert" className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="w-full rounded border px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500" />
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
          <div className="relative mb-6">
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full rounded border px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500" />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-2 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
          <p className="mt-6 text-center text-sm text-gray-600">Don&apos;t have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link></p>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
