import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Quicklinks = () => {
  const { isDark } = useTheme();

  // Hardcoded quicklinks data
  const quicklinks = [
    { id: 'what-is-pullquest', title: 'What is PullQuest' },
    { id: 'about-repo-structure', title: 'About Repo Structure' },
    { id: 'basic', title: 'Basic Usage Guide' },
    { id: 'maintainer', title: 'Maintainer Guide' },
    { id: 'contributor', title: 'Contributor Guide' },
    { id: 'recruiter', title: 'Recruiter Guide' },
    { id: 'REPO_SETUP', title: 'How to setup' },
    { id: 'AI_AGENTS', title: 'Make your AI Agents' }
  ];

  return (
    <div className={`w-64 h-screen fixed right-0 top-16 overflow-y-auto border-l transition-colors ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <h3 className={`text-sm font-semibold mb-4 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          On this page
        </h3>
        
        <nav className="space-y-1">
          {quicklinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {link.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Quicklinks;
