import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bg from "../../images/bg.png";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      navigate("/dashboard");
    }
  }, []);

  const handleSuccess = async (response) => {
    try {
      const token = response.credential;

      const verify = await fetch(
        "https://global-crm-1zi3.vercel.app/auth/google/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );
      // ... inside handleSuccess function
      if (!verify.ok) {
        const errorData = await verify.json(); // Get the JSON response
        // Use the message from the backend, or a default if not available
        toast.error(
          errorData.message || "Registration failed. Please try again."
        );
        return;
      }
      // ... rest of the code
      const data = await verify.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            picture: data.user.picture,
          })
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google Registration Error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="489842058415-t8qnn4bng8qkt6fi6ck92rmgal7aj40q.apps.googleusercontent.com">
      <div
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="relative flex h-screen w-full overflow-hidden bg-gray-100"
      >
        {/* Left Side (Branding) */}
        <div className="hidden md:block absolute left-0 top-0 h-full w-1/2 text-white z-0">
          <div className="flex flex-col justify-center items-center h-full px-12">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              src="/drklogo.png"
              alt="Logo"
              className="w-72 mb-6"
            />
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl leading-relaxed font-medium text-center max-w-lg text-gray-700"
            >
              Join GLOBAL CRM to manage your invoices with ease. Automate,
              track, and send invoices effortlessly.
            </motion.p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 z-10 flex justify-center items-center ml-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-10 rounded-lg shadow-xl text-center w-full max-w-sm"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Register</h1>
            <GoogleLogin onSuccess={handleSuccess} />
            <div className="mt-6 text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login here
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;
