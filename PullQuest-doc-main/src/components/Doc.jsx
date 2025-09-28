import React from 'react';
import Sidebar from './Sidebar';
import Documentation from './Documentation';
import Quicklinks from './Quicklinks';
import { useTheme } from '../context/ThemeContext';

const Doc = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <Sidebar />
      <Documentation />
      <Quicklinks />
    </div>
  );
};

export default Doc;
