import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { isDark } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    'how-to-use-pullquest': true
  });
  const [activeSection, setActiveSection] = useState('recruiter');

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['what-is-pullquest', 'about-repo-structure', 'basic', 'maintainer', 'contributor', 'recruiter', 'connect'];
      const scrollPosition = window.scrollY + 100; // Add offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    // Also listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setActiveSection(hash);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Hardcoded sidebar data
  const sidebarData = [
    {
      id: 'what-is-pullquest',
      title: 'What is PullQuest',
      expandable: false,
      items: []
    },
    {
      id: 'about-repo-structure',
      title: 'About Repo Structure',
      expandable: false,
      items: []
    },
    {
      id: 'how-to-use-pullquest',
      title: 'How to use PullQuest',
      expandable: true,
      items: [
        { id: 'basic', title: 'Basic' },
        { id: 'maintainer', title: 'Maintainer' },
        { id: 'contributor', title: 'Contributor' },
        { id: 'recruiter', title: 'Recruiter' }
      ]
    },
   {
      id: 'AI_AGENTS',
      title: 'AI Agents',
      expandable: false,
      items: []
    },
     {
      id: 'REPO_SETUP',
      title: 'How to setup complete repo',
      expandable: false,
      items: []
    },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className={`w-64 h-screen fixed left-0 top-16 overflow-y-auto border-r transition-colors ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarData.map((section) => (
            <div key={section.id} className="space-y-1">
              {section.expandable ? (
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDark 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.title}</span>
                  {expandedSections[section.id] ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <a
                  href={`#${section.id}`}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? isDark 
                        ? 'bg-blue-900/50 text-blue-400 border-l-4 border-blue-400' 
                        : 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : isDark 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </a>
              )}
              
              {(!section.expandable || expandedSections[section.id]) && (
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === item.id
                          ? isDark 
                            ? 'bg-blue-900/50 text-blue-400 border-l-4 border-blue-400' 
                            : 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                          : isDark
                            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
