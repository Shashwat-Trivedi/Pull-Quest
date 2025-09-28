import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiGithub, FiSun, FiMoon, FiStar } from "react-icons/fi";
import Logo from "../assets/Logo.png";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        isDark
          ? "bg-gray-900/95 border-gray-800 backdrop-blur-sm"
          : "bg-white/95 border-gray-200 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src={Logo} alt="PullQuest" className="h-8 w-8 rounded-full" />
              <span
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                PullQuest
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/documentation"
                className={`text-m font-medium transition-colors hover:text-blue-600 ${
                  isDark ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                }`}
              >
                Documentation
              </Link>
              <a
                href="#demo"
                className={`text-m font-medium transition-colors hover:text-blue-600 ${
                  isDark ? "text-gray-300 hover:text-blue-400" : "text-gray-700"
                }`}
              >
                Demo
              </a>
            </div>
          </div>

          {/* Right Section - Search, GitHub, Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* GitHub Star Button */}
            <a
              href="https://github.com/Shashwat-Trivedi/PullQuest"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg border transition-all hover:scale-105 ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiStar className="h-4 w-4" />
              <span>STAR US</span>
            </a>

            {/* Search Bar */}
            <div className="hidden sm:flex relative">
              <div className="relative">
                <FiSearch
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <div
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-1.5 py-0.5 rounded border ${
                    isDark
                      ? "text-gray-400 border-gray-600"
                      : "text-gray-500 border-gray-300"
                  }`}
                >
                  Ctrl K
                </div>
              </div>
            </div>

            {/* GitHub Icon (Mobile) */}
            <a
              href="https://github.com/Shashwat-Trivedi/PullQuest"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FiGithub className="h-5 w-5" />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="h-5 w-5" />
              ) : (
                <FiMoon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
