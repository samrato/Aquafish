import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    toast.loading("Logging in...");

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCred = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userObject = {
          uid: userCred.user.uid,
          email: userData.email,
          role: userData.role,
        };

        localStorage.setItem("user", JSON.stringify(userObject));

        toast.dismiss();
        toast.success("Login successful! 🎉");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast.dismiss();
        toast.error("User profile not found.");
        await auth.signOut();
      }
    } catch (error) {
      toast.dismiss();

      // Default message
      let message = "Something went wrong. Please try again.";

      // Map Firebase Auth error codes to friendly messages
      const errorMap = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many failed attempts. Try again later.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/network-request-failed": "Network error. Please check your internet.",
      };

      if (error.code && errorMap[error.code]) {
        message = errorMap[error.code];
      }

      toast.error(message);
      setError(message);
      console.error("Login error:", error); // Only log internally
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4 font-sans">
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Welcome Back!
        </h2>

        {error && (
          <motion.p
            className="text-red-600 text-center bg-red-100 p-3 rounded-md mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full p-3 text-lg text-white bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
          >
            Login
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <a
            href="/signUp"
            className="text-blue-500 hover:underline hover:text-blue-600 transition duration-200"
          >
            Sign Up
          </a>
        </p>
      </motion.div>
      <Toaster />
    </div>
  );
}

export default Login;
