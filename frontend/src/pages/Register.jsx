import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";

function Signup() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const cleanedPhone = phone.replace(/\s|-/g, "");

    if (!cleanedPhone.startsWith("+254") || cleanedPhone.length !== 13) {
      setError("Phone number must start with +254 and be 13 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    toast.loading("Signing up...");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem("user_id", user.uid);

      await setDoc(doc(db, "users", user.uid), {
        email,
        phone: cleanedPhone,
        role: "farmer",
      });

      toast.dismiss();
      toast.success("Account created successfully! 🎉");

      const userObject = {
        uid: user.uid,
        email: user.email,
        role: "farmer",
      };
      localStorage.setItem("user", JSON.stringify(userObject));

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      toast.dismiss();

      const errorMessages = {
        "auth/email-already-in-use": "That email is already registered. Please log in instead.",
        "auth/invalid-email": "The email address is invalid. Please check and try again.",
        "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
        "auth/operation-not-allowed": "Email/password accounts are not enabled. Contact support.",
        "auth/network-request-failed": "Network error. Please check your internet connection.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };

      const friendlyMessage = errorMessages[err.code] || "An unexpected error occurred. Please try again.";
      toast.error(friendlyMessage);
      setError(friendlyMessage);

      console.error("Signup error:", err);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <motion.div
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Create an Account</h2>

        {error && (
          <motion.p
            className="text-red-600 text-center bg-red-100 p-3 rounded-md mb-4 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone (+2547xxxxxxxx)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full p-3 text-lg text-white bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
          >
            Sign Up
          </motion.button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline hover:text-blue-600 transition duration-200">
              Login
            </a>
          </p>
        </form>
      </motion.div>
      <Toaster />
    </div>
  );
}

export default Signup;
