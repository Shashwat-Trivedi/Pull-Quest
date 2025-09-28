import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Copy, Check } from 'lucide-react';

const Repo_setup = () => {
  const { isDark } = useTheme();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      id: 'install',
      code: `# Using npm
npm install

# Or using yarn
yarn install`
    },
    {
      id: 'run',
      code: `# Using npm
npm run dev

# Or using yarn
yarn dev`
    },
    {
      id: 'env',
      code: `VITE_API_URL=http://localhost:8012
PORT=8012
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
HEDERA_ACCOUNT_ID=your_hedera_account_id
HEDERA_PRIVATE_KEY=your_hedera_private_key
CONTRACT_ADDRESS=your_contract_address`
    }
  ];

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Repository Setup
      </h1>
      <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        The PullQuest platform is comprised of two primary repositories: a React-based frontend for the user interface and a backend to handle our powerful AI agent workflows. This guide will walk you through setting up the frontend.
      </p>

      {/* --- Frontend Setup Section --- */}
      <div className="mt-12">
        <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Frontend Setup
        </h2>

        {/* --- Installation Steps --- */}
        <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🛠️ 1. Installation & Running the Server
        </h3>
        <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          First, you need to install the necessary dependencies using your preferred package manager.
        </p>
        
        {/* Code block with copy button */}
        <div className="relative mb-4">
          <pre className={`p-4 rounded-lg text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            <code>{codeSnippets[0].code}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(codeSnippets[0].code, 0)}
            className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
            }`}
            title="Copy to clipboard"
          >
            {copiedIndex === 0 ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Once the installation is complete, you can start the development server.
        </p>
        
        {/* Code block with copy button */}
        <div className="relative mb-8">
          <pre className={`p-4 rounded-lg text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            <code>{codeSnippets[1].code}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(codeSnippets[1].code, 1)}
            className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
            }`}
            title="Copy to clipboard"
          >
            {copiedIndex === 1 ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* --- Environment Variables Setup --- */}
        <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🔑 2. Environment Variables
        </h3>
        <p className={`text-base leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Next, create a file named <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>.env</code> in the root directory of the frontend project. Copy the following content into it and <strong>replace the placeholder values with your own keys and credentials</strong>.
        </p>
        
        {/* Code block with copy button */}
        <div className="relative mb-8">
          <pre className={`p-4 rounded-lg text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
            <code>{codeSnippets[2].code}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(codeSnippets[2].code, 2)}
            className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
            }`}
            title="Copy to clipboard"
          >
            {copiedIndex === 2 ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <p className={`text-base leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          The frontend application runs on port <strong>5173</strong> by default. It features three distinct dashboards, each tailored to a specific user role within the PullQuest ecosystem. Access to these dashboards is managed through an authentication context, making it simple to direct users to the correct view upon login.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Maintainer Dashboard Card */}
          <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-purple-600' 
              : 'bg-gray-50 border-gray-200 hover:border-purple-400'
          }`}>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              👑 Maintainer Dashboard
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tools for repository owners to manage token settings, view AI-prioritized pull requests, and reward high-quality contributions.
            </p>
          </div>

          {/* Contributor Dashboard Card */}
          <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-blue-600' 
              : 'bg-gray-50 border-gray-200 hover:border-blue-400'
          }`}>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              💻 Contributor Dashboard
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              The main hub for developers to manage their token balance, stake on new pull requests, and track the status of their contributions.
            </p>
          </div>

          {/* Recruiter Dashboard Card */}
          <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
            isDark 
              ? 'bg-gray-800 border-gray-700 hover:border-green-600' 
              : 'bg-gray-50 border-gray-200 hover:border-green-400'
          }`}>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🎯 Recruiter Dashboard
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              A view for recruiters to discover top talent by browsing verified, high-quality contributions across the open-source landscape.
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'}`}>
          <h4 className={`text-lg font-semibold mb-3 flex items-center ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
            💡 Pro Tip
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Make sure all environment variables are properly configured before starting the development server. 
            The application will not function correctly without valid API endpoints and authentication credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Repo_setup;