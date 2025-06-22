'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-light">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Mobile Toggle Button - Moved to top-right */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-3 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto w-full">
        {/* Add top margin on mobile to account for toggle button */}
        <div className="lg:hidden h-16"></div>
        {children}
      </main>
    </div>
  );
};