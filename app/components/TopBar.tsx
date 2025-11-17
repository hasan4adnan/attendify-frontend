'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface TopBarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function TopBar({ mobileMenuOpen, setMobileMenuOpen }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

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

  // Fake notifications data
  const notifications = [
    { id: 1, title: 'New attendance record', message: '245 students marked present today', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Weekly report ready', message: 'Your weekly attendance report is available', time: '1 hour ago', unread: true },
    { id: 3, title: 'System update', message: 'New features have been added to the dashboard', time: '3 hours ago', unread: false },
    { id: 4, title: 'Reminder', message: 'Don\'t forget to review this week\'s attendance', time: '1 day ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
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
  );
}

