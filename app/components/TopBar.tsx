'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

interface TopBarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  sidebarCollapsed?: boolean;
}

// Fake notifications data
const notifications = [
  { 
    id: 1, 
    title: 'New attendance record', 
    message: '245 students marked present today', 
    timestamp: '2 minutes ago', 
    unread: true 
  },
  { 
    id: 2, 
    title: 'Weekly report ready', 
    message: 'Your weekly attendance report is available for download', 
    timestamp: '1 hour ago', 
    unread: true 
  },
  { 
    id: 3, 
    title: 'System update', 
    message: 'New features have been added to the dashboard', 
    timestamp: '3 hours ago', 
    unread: false 
  },
  { 
    id: 4, 
    title: 'Reminder', 
    message: 'Don\'t forget to review this week\'s attendance records', 
    timestamp: '1 day ago', 
    unread: false 
  },
];

export default function TopBar({ mobileMenuOpen, setMobileMenuOpen, sidebarCollapsed = false }: TopBarProps) {
  const { user } = useUser();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get user display data
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const userEmail = user?.email || '';
  const userRole = user?.role || '';
  const userSchool = user?.school || '';
  const userAvatar = user?.avatar || null;

  // Check if desktop on mount and resize
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (notificationsOpen && !target.closest('[data-notifications]')) {
        setNotificationsOpen(false);
      }
      if (adminDropdownOpen && !target.closest('[data-admin-profile]')) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen, adminDropdownOpen]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate left offset based on sidebar state
  const sidebarWidth = sidebarCollapsed ? 80 : 288;
  const leftOffset = isDesktop ? sidebarWidth : 0;

  return (
    <header 
      className="fixed top-0 z-30 backdrop-blur-2xl border-b shadow-lg"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        left: `${leftOffset}px`,
        right: '0',
        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)'
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
              placeholder="Search courses, students, or reports..."
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
          {/* Notifications */}
          <div className="relative" data-notifications>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setAdminDropdownOpen(false);
              }}
              className="relative p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
              style={{
                backgroundColor: notificationsOpen ? 'var(--bg-tertiary)' : 'transparent',
                color: 'var(--text-primary)',
              }}
              aria-label="Notifications"
            >
              {/* Hover background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#FF8040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
              />
              
              {/* Notification Icon */}
              <div className="relative z-10">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  style={{
                    color: notificationsOpen ? '#0046FF' : 'var(--text-primary)',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              
              {/* Badge */}
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg z-20"
                  style={{ 
                    backgroundColor: '#FF8040',
                    padding: '0 5px',
                    border: '2px solid var(--bg-secondary)',
                    boxShadow: '0 2px 8px rgba(255, 128, 64, 0.4)'
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              
              {/* Pulse animation for unread notifications */}
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full animate-ping"
                  style={{ 
                    backgroundColor: '#FF8040',
                    opacity: 0.3
                  }}
                />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: '#2A2A3B',
                  maxHeight: '420px',
                  opacity: 1,
                  backdropFilter: 'none',
                }}
              >
                {/* Header */}
                <div 
                  className="p-4 border-b" 
                  style={{ 
                    borderColor: '#2A2A3B',
                    backgroundColor: '#1e1e2d',
                    opacity: 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 
                      className="font-bold text-lg"
                      style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span 
                        className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{
                          backgroundColor: '#FF8040',
                          color: '#ffffff',
                          border: '1px solid #FF8040',
                          opacity: 1,
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div 
                  className="max-h-[320px] overflow-y-auto"
                  style={{
                    backgroundColor: '#1e1e2d',
                    opacity: 1,
                  }}
                >
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b transition-all duration-200 cursor-pointer"
                        style={{
                          borderColor: '#2A2A3B',
                          backgroundColor: notification.unread ? '#2A2A3B' : '#1e1e2d',
                          opacity: 1,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2A2A3B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = notification.unread ? '#2A2A3B' : '#1e1e2d';
                        }}
                        onClick={() => {
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notification.unread ? 'bg-[#0046FF]' : 'bg-transparent'
                            }`}
                            style={{ opacity: 1 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-semibold text-sm mb-1.5"
                              style={{ 
                                color: '#E4E4E7',
                                opacity: 1,
                              }}
                            >
                              {notification.title}
                            </p>
                            <p 
                              className="text-sm mb-2 leading-relaxed"
                              style={{ 
                                color: '#E4E4E7',
                                opacity: 1,
                              }}
                            >
                              {notification.message}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ 
                                color: '#E4E4E7',
                                opacity: 1,
                              }}
                            >
                              {notification.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {unreadCount > 0 && (
                  <div 
                    className="p-3 border-t text-center" 
                    style={{ 
                      borderColor: '#2A2A3B',
                      backgroundColor: '#1e1e2d',
                      opacity: 1,
                    }}
                  >
                    <button
                      className="text-sm font-medium transition-colors duration-200"
                      style={{ 
                        color: '#0046FF',
                        opacity: 1,
                      }}
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Profile Button */}
          <div className="relative" data-admin-profile>
            <button
              onClick={() => {
                setAdminDropdownOpen(!adminDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 hover:scale-110 active:scale-95 group relative overflow-hidden border-2"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: adminDropdownOpen ? '#0046FF' : 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
              aria-label="Admin profile"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[#0046FF] to-[#001BB7] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"
              />
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover relative z-10"
                />
              ) : (
                <span className="relative z-10">
                  {fullName ? getInitials(fullName) : 'U'}
                </span>
              )}
            </button>

            {/* Admin Dropdown */}
            {adminDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: '#2A2A3B',
                  opacity: 1,
                  backdropFilter: 'none',
                }}
              >
                {/* Profile Header */}
                <div 
                  className="p-5 border-b"
                  style={{ 
                    borderColor: '#2A2A3B',
                    backgroundColor: '#1e1e2d',
                    opacity: 1,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border-2 flex-shrink-0"
                      style={{
                        backgroundColor: '#2A2A3B',
                        borderColor: '#2A2A3B',
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt={fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        fullName ? getInitials(fullName) : 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-bold text-base mb-0.5 truncate"
                        style={{ 
                          color: '#E4E4E7',
                          opacity: 1,
                        }}
                      >
                        {fullName || 'User'}
                      </h4>
                      <p 
                        className="text-sm truncate"
                        style={{ 
                          color: '#E4E4E7',
                          opacity: 1,
                        }}
                      >
                        {userEmail || 'No email'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div 
                  className="p-4 space-y-3"
                  style={{
                    backgroundColor: '#1e1e2d',
                    opacity: 1,
                  }}
                >
                  <div>
                    <p 
                      className="text-xs mb-1.5 font-medium"
                      style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      Role
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      {userRole || '—'}
                    </p>
                  </div>
                  <div>
                    <p 
                      className="text-xs mb-1.5 font-medium"
                      style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      School
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      {userSchool || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

