'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import AnimatedText from './AnimatedText';
import LanguageToggle from './LanguageToggle';

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { t } = useLanguage();
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { key: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/dashboard' },
    { key: 'students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/students' },
    { key: 'courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', path: '/courses' },
    { key: 'attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/attendance' },
    { key: 'reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', path: '/reports' },
    { key: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', path: '/settings' },
    { key: 'logout', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', path: '/' },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return false; // logout is never active
    return pathname === itemPath || pathname?.startsWith(itemPath + '/');
  };

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.key === 'logout') {
      setShowLogoutModal(true);
    } else {
      router.push(item.path);
    }
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(false);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout(); // Clear user data and token
    router.push('/'); // Redirect to login page
  };

  return (
    <>
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
          fixed inset-y-0 left-0 z-50
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
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.key}
                  onMouseEnter={() => setHoveredMenuItem(item.key)}
                  onMouseLeave={() => setHoveredMenuItem(null)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-300 relative overflow-hidden group
                    ${active 
                      ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30' 
                      : 'hover:scale-[1.02]'
                    }
                  `}
                  style={!active ? {
                    backgroundColor: hoveredMenuItem === item.key ? 'var(--bg-tertiary)' : 'transparent',
                    color: 'var(--text-primary)',
                    border: hoveredMenuItem === item.key ? '1px solid var(--border-secondary)' : '1px solid transparent'
                  } : {}}
                  onClick={() => handleMenuItemClick(item)}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF8040] to-[#FF6B35] rounded-r-full" />
                  )}
                  
                  {/* Hover gradient effect */}
                  {!active && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#001BB7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <svg
                      className={`w-5 h-5 transition-all duration-300 ${
                        active 
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
                  {!active && hoveredMenuItem === item.key && !sidebarCollapsed && (
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
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="space-y-3 mt-auto">
            {/* Language Toggle */}
            <div className="px-3">
              <LanguageToggle compact={sidebarCollapsed} />
            </div>

            {/* User Info (when expanded) */}
            {!sidebarCollapsed && user && (
              <div 
                className="p-3 border-t"
                style={{ 
                  borderColor: 'var(--border-primary)',
                  transition: 'opacity 250ms ease-in-out'
                }}
              >
                <button
                  onMouseEnter={() => setHoveredProfile(true)}
                  onMouseLeave={() => setHoveredProfile(false)}
                  onClick={() => {
                    router.push('/profile');
                    if (window.innerWidth < 1024) {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl
                    transition-all duration-300 relative overflow-hidden group
                    ${pathname === '/profile' 
                      ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30' 
                      : 'hover:scale-[1.02]'
                    }
                  `}
                  style={pathname !== '/profile' ? {
                    backgroundColor: hoveredProfile ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: hoveredProfile ? '1px solid var(--border-secondary)' : '1px solid transparent'
                  } : {}}
                >
                  {/* Active indicator bar */}
                  {pathname === '/profile' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF8040] to-[#FF6B35] rounded-r-full" />
                  )}
                  
                  {/* Hover gradient effect */}
                  {pathname !== '/profile' && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#001BB7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                    />
                  )}

                  {/* Avatar */}
                  <div className="relative z-10 flex-shrink-0">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover shadow-lg shadow-[#0046FF]/25"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0046FF] to-[#001BB7] flex items-center justify-center text-white font-semibold shadow-lg shadow-[#0046FF]/25">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-sm font-semibold truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs truncate" style={{ 
                      color: pathname === '/profile' 
                        ? 'rgba(255, 255, 255, 0.8)' 
                        : 'var(--text-quaternary)' 
                    }}>
                      {user.role}
                    </p>
                  </div>

                  {/* Hover arrow indicator */}
                  {pathname !== '/profile' && hoveredProfile && (
                    <svg
                      className="w-4 h-4 text-[#0046FF] animate-in slide-in-from-right-2 duration-300 relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-3xl border shadow-2xl p-8 space-y-6 animate-in scale-in"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: '#FF8040/30',
            }}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#FF8040] to-[#FF4000] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {t.common.logoutConfirm}
              </h3>
              <p 
                className="text-base"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t.common.logoutWarning}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                {t.common.no}
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-6 py-3 bg-gradient-to-r from-[#FF8040] to-[#FF4000] text-white font-semibold rounded-xl shadow-lg shadow-[#FF8040]/25 hover:shadow-[#FF8040]/40 focus:outline-none focus:ring-2 focus:ring-[#FF8040] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                {t.common.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

