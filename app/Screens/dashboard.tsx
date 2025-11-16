'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';
import AnimatedText from '../components/AnimatedText';

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  // Handle initial mount for smooth animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (notificationsOpen && !target.closest('[data-notifications]')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const menuItems = [
    { key: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
    { key: 'students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { key: 'attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { key: 'reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { key: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { key: 'logout', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' },
  ];

  const summaryCards = [
    { title: t.dashboard.todayAttendance, value: '245', change: '+12%', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-[#0046FF] to-[#001BB7]' },
    { title: t.dashboard.totalStudents, value: '1,234', change: '+5%', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', gradient: 'from-[#FF8040] to-[#FF6B35]' },
    { title: t.dashboard.activeSessions, value: '18', change: '+3', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', gradient: 'from-[#001BB7] to-[#0046FF]' },
    { title: t.dashboard.attendanceRate, value: '94.2%', change: '+2.1%', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', gradient: 'from-[#0046FF] via-[#FF8040] to-[#FF6B35]' },
  ];

  // Fake notifications data
  const notifications = [
    { id: 1, title: 'New attendance record', message: '245 students marked present today', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Weekly report ready', message: 'Your weekly attendance report is available', time: '1 hour ago', unread: true },
    { id: 3, title: 'System update', message: 'New features have been added to the dashboard', time: '3 hours ago', unread: false },
    { id: 4, title: 'Reminder', message: 'Don\'t forget to review this week\'s attendance', time: '1 day ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div 
      className={`min-h-screen flex relative overflow-hidden ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        transition: 'opacity 200ms ease-out',
        willChange: 'opacity'
      }}
    >

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ease-out"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col
          backdrop-blur-2xl border-r shadow-2xl
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width, transform'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
            style={{ 
              transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease-in-out',
              willChange: 'width, opacity'
            }}
          >
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-[#001BB7] via-[#0046FF] to-[#FF8040] bg-clip-text text-transparent whitespace-nowrap"
            >
              Attendify
            </h1>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative overflow-hidden flex-shrink-0"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)'
            }}
            aria-label="Toggle sidebar"
          >
            <div className="relative z-10">
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </div>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#0046FF] to-[#001BB7] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"
            />
          </button>
        </div>

        {/* Menu Items - No scroll, all visible */}
        <nav className="flex-1 p-4 space-y-2 flex flex-col justify-between min-h-0">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onMouseEnter={() => setHoveredMenuItem(item.key)}
                onMouseLeave={() => setHoveredMenuItem(null)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-300 relative overflow-hidden group
                  ${item.active 
                    ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30' 
                    : 'hover:scale-[1.02]'
                  }
                `}
                style={!item.active ? {
                  backgroundColor: hoveredMenuItem === item.key ? 'var(--bg-tertiary)' : 'transparent',
                  color: 'var(--text-primary)',
                  border: hoveredMenuItem === item.key ? '1px solid var(--border-secondary)' : '1px solid transparent'
                } : {}}
                onClick={() => {
                  if (item.key === 'logout') {
                    router.push('/');
                  } else if (item.key === 'students') {
                    router.push('/students');
                  }
                  if (window.innerWidth < 1024) {
                    setMobileMenuOpen(false);
                  }
                }}
              >
                {/* Active indicator bar */}
                {item.active && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF8040] to-[#FF6B35] rounded-r-full" />
                )}
                
                {/* Hover gradient effect */}
                {!item.active && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#001BB7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  />
                )}

                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <svg
                    className={`w-5 h-5 transition-all duration-300 ${
                      item.active 
                        ? 'scale-110' 
                        : hoveredMenuItem === item.key 
                          ? 'scale-110 text-[#0046FF]' 
                          : 'scale-100'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>

                {/* Label */}
                <span 
                  className={`font-medium transition-all duration-300 relative z-10 ${
                    sidebarCollapsed 
                      ? 'w-0 opacity-0 overflow-hidden' 
                      : 'w-auto opacity-100'
                  }`}
                  style={{ 
                    transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease-in-out',
                    whiteSpace: 'nowrap',
                    willChange: 'width, opacity'
                  }}
                >
                  <AnimatedText speed={40}>
                    {t.dashboard.menu[item.key as keyof typeof t.dashboard.menu]}
                  </AnimatedText>
                </span>

                {/* Hover arrow indicator */}
                {!item.active && hoveredMenuItem === item.key && !sidebarCollapsed && (
                  <svg
                    className="w-4 h-4 ml-auto text-[#0046FF] animate-in slide-in-from-right-2 duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Sidebar Footer - User Info (when expanded) */}
          {!sidebarCollapsed && (
            <div 
              className="p-3 border-t mt-auto"
              style={{ 
                borderColor: 'var(--border-primary)',
                transition: 'opacity 250ms ease-in-out'
              }}
            >
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0046FF] to-[#001BB7] flex items-center justify-center text-white font-semibold shadow-lg shadow-[#0046FF]/25 flex-shrink-0">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    John Doe
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-quaternary)' }}>
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <header 
          className="sticky top-0 z-30 backdrop-blur-2xl border-b shadow-lg"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between p-4 lg:p-6 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
              aria-label="Toggle menu"
            >
              <div className="relative z-10">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#0046FF] to-[#001BB7] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"
              />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <input
                  type="text"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full px-4 py-3 pl-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: searchFocused ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder={t.dashboard.searchPlaceholder}
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300"
                  style={{ color: searchFocused ? '#0046FF' : 'var(--text-quaternary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchFocused && (
                  <div 
                    className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle - Compact */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                className="px-3 py-2 backdrop-blur-md rounded-xl border shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label="Toggle language"
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#FF8040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                />
                <span 
                  className="text-sm font-semibold transition-all duration-300 relative z-10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {language === 'en' ? 'EN' : 'TR'}
                </span>
                <div className="flex gap-1 relative z-10">
                  <div 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      language === 'en' ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
                    }`}
                    style={{
                      backgroundColor: language === 'en' ? '#0046FF' : 'var(--text-quaternary)'
                    }}
                  />
                  <div 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      language === 'tr' ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
                    }`}
                    style={{
                      backgroundColor: language === 'tr' ? '#FF8040' : 'var(--text-quaternary)'
                    }}
                  />
                </div>
              </button>

              {/* Theme Toggle - Compact */}
              <button
                onClick={toggleTheme}
                className="p-3 backdrop-blur-md rounded-xl border shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label="Toggle theme"
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#FF8040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                />
                <div className="relative w-5 h-5 z-10">
                  {/* Sun Icon (Light Mode) */}
                  <svg
                    className={`absolute inset-0 w-5 h-5 text-[#FF8040] transition-all duration-500 ${
                      theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>

                  {/* Moon Icon (Dark Mode) */}
                  <svg
                    className={`absolute inset-0 w-5 h-5 text-[#0046FF] transition-all duration-500 ${
                      theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </div>
              </button>

              {/* Notifications */}
              <div className="relative" data-notifications>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-3 rounded-xl hover:scale-110 active:scale-95 transition-all duration-300 relative group"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)'
                  }}
                  aria-label="Notifications"
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#FF8040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  />
                  <svg
                    className="w-5 h-5 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span 
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse"
                      style={{ backgroundColor: '#FF8040' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-80 backdrop-blur-2xl rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)'
                    }}
                  >
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span 
                            className="px-2 py-1 rounded-lg text-xs font-semibold"
                            style={{
                              backgroundColor: 'rgba(255, 128, 64, 0.15)',
                              color: '#FF8040'
                            }}
                          >
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b transition-all duration-200 hover:bg-opacity-50 cursor-pointer ${
                            notification.unread ? 'bg-opacity-30' : ''
                          }`}
                          style={{
                            borderColor: 'var(--border-primary)',
                            backgroundColor: notification.unread ? 'var(--bg-tertiary)' : 'transparent'
                          }}
                          onClick={() => {
                            // Mark as read logic here
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.unread ? 'bg-[#0046FF]' : 'bg-transparent'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                                {notification.title}
                              </p>
                              <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                {notification.message}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-quaternary)' }}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border-primary)' }}>
                      <button
                        className="text-sm font-medium text-[#0046FF] hover:text-[#FF8040] transition-colors duration-200"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
              
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
            {/* Page Title */}
            <div className="space-y-2">
              <h2 
                className="text-3xl lg:text-4xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.dashboard.title}
                </AnimatedText>
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {summaryCards.map((card, index) => (
                <div
                  key={index}
                  className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#0046FF]/20 group relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                  />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div 
                      className={`p-3.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-[#0046FF]/25 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                      </svg>
                    </div>
                    <span 
                      className="text-sm font-semibold px-3 py-1 rounded-lg backdrop-blur-sm"
                      style={{
                        backgroundColor: 'rgba(0, 70, 255, 0.15)',
                        color: '#0046FF',
                        border: '1px solid rgba(0, 70, 255, 0.2)'
                      }}
                    >
                      {card.change}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p 
                      className="text-sm mb-2 font-medium"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <AnimatedText speed={50}>
                        {card.title}
                      </AnimatedText>
                    </p>
                    <p 
                      className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#001BB7] via-[#0046FF] to-[#FF8040] bg-clip-text text-transparent"
                    >
                      {card.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Attendance Overview Chart */}
              <div 
                className="lg:col-span-2 backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 
                      className="text-xl font-bold mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <AnimatedText speed={40}>
                        {t.dashboard.attendanceOverview}
                      </AnimatedText>
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--text-quaternary)' }}
                    >
                      Last 7 days
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-[#0046FF] to-[#001BB7] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
                    />
                    <span className="relative z-10">View All</span>
                  </button>
                </div>
                {/* Chart Placeholder */}
                <div 
                  className="h-64 lg:h-80 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '2px dashed var(--border-primary)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0046FF]/5 to-[#001BB7]/5" />
                  <div className="text-center space-y-3 relative z-10">
                    <svg
                      className="w-20 h-20 mx-auto"
                      style={{ color: 'var(--text-quaternary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-quaternary)' }}
                    >
                      Chart Placeholder
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Distribution Chart */}
              <div 
                className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="mb-6">
                  <h3 
                    className="text-xl font-bold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <AnimatedText speed={40}>
                      {t.dashboard.attendanceDistribution}
                    </AnimatedText>
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--text-quaternary)' }}
                  >
                    This month
                  </p>
                </div>
                {/* Pie Chart Placeholder */}
                <div 
                  className="h-64 lg:h-80 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '2px dashed var(--border-primary)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF8040]/5 to-[#FF6B35]/5" />
                  <div className="text-center space-y-3 relative z-10">
                    <svg
                      className="w-20 h-20 mx-auto"
                      style={{ color: 'var(--text-quaternary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-quaternary)' }}
                    >
                      Pie Chart Placeholder
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Report Button */}
            <div className="flex justify-end pt-2">
              <button
                className="px-8 py-4 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group hover:from-[#0055FF] hover:to-[#0025CC] flex items-center gap-3"
              >
                <span className="relative z-10">
                  <AnimatedText speed={40}>
                    {t.dashboard.generateReport}
                  </AnimatedText>
                </span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
