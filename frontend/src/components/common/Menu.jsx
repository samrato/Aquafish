import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    closed: { opacity: 0, x: "-100%", transition: { duration: 0.3 } },
  };

  return (
    <nav className="bg-white shadow-lg md:shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
        {/* Logo */}
        <h1 className="text-2xl font-extrabold text-teal-600">AquaSafe</h1>

        {/* Desktop Menu Items */}
        <ul className="hidden md:flex md:items-center md:space-x-8">
          <li className="text-gray-600 hover:text-teal-600 font-semibold transition duration-200">
            <a href="/dashboard">Dashboard</a>
          </li>
          <li className="text-gray-600 hover:text-teal-600 font-semibold transition duration-200">
            <a href="/profile">Profile</a>
          </li>
          {user && (
            <motion.li
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={logout}
                className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold shadow-md hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </motion.li>
          )}
        </ul>

        {/* Hamburger/Close Button for Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 text-2xl md:hidden focus:outline-none"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="absolute top-16 left-0 w-full bg-white shadow-xl md:hidden"
            >
              <ul className="flex flex-col p-4 space-y-2">
                <li className="text-gray-700 hover:bg-gray-100 p-2 rounded transition duration-200">
                  <a href="/dashboard">Dashboard</a>
                </li>
                <li className="text-gray-700 hover:bg-gray-100 p-2 rounded transition duration-200">
                  <a href="/profile">Profile</a>
                </li>
                {user && (
                  <li className="mt-2">
                    <button
                      onClick={logout}
                      className="w-full text-left bg-red-500 text-white px-4 py-2 rounded-md font-semibold shadow-sm hover:bg-red-600 transition duration-200"
                    >
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
