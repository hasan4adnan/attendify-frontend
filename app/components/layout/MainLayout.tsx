'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle initial mount for smooth animations
  useEffect(() => {
    setMounted(true);
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  // Close mobile menu on resize and update desktop state
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update CSS variable for sidebar width
  useEffect(() => {
    const sidebarWidth = sidebarCollapsed ? '80px' : '288px';
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [sidebarCollapsed]);

  // Calculate sidebar width for padding
  const sidebarWidth = sidebarCollapsed ? 80 : 288;

  return (
    <div 
      className={`min-h-screen ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        transition: 'opacity 200ms ease-out',
        willChange: 'opacity'
      }}
    >
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area - with padding for fixed sidebar and topbar */}
      <div 
        className="flex flex-col min-h-screen"
        style={{
          paddingLeft: isDesktop ? `${sidebarWidth}px` : '0',
          transition: 'padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <TopBar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content - scrollable */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{
            paddingTop: '80px' // Topbar height
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

