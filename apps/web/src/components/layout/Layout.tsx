import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuthStore } from '../../store';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main 
          className="flex-1 p-6 lg:p-8 pb-20 md:pb-0 transition-all duration-200"
          role="main"
          id="main-content"
        >
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded"
          >
            Skip to main content
          </a>
          <Outlet />
        </main>
      </div>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
