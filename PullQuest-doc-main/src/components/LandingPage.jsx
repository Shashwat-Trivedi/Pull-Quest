import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTerminal } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { isDark } = useTheme();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Top Follow Button */}
        <div className="flex justify-center pt-16 pb-8">
          <a
            href="https://github.com/Shashwat-Trivedi/PullQuest"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <span className="text-yellow-500">🎉</span>
            <span>Follow along on Github</span>
            <FiArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8">
            <span className="italic font-black">Pull</span>Quest
          </h1>

          {/* Description */}
          <p className="max-w-4xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
            A custom-built collection of lightweight and efficient React hooks crafted to work seamlessly across all modern React frameworks 
            and build tools. Designed to simplify state management and common patterns in modern applications.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link 
              to="/documentation"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
            >
              <span>GET STARTED</span>
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#demo"
              className="text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 underline underline-offset-4"
            >
              Demo
            </a>
          </div>

          {/* Terminal/Code Section */}
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <FiTerminal className="h-4 w-4" />
                <span className="text-sm font-mono">made it simple</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
