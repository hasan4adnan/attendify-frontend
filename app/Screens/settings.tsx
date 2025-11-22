'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import AnimatedText from '../components/AnimatedText';

export default function SettingsPage() {
  const { t, language: currentLanguage, setLanguage: setLanguageContext } = useLanguage();
  const { theme: currentTheme, setTheme } = useTheme();
  const { user, updateUser, updateAvatar } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalAvatar, setOriginalAvatar] = useState<string | undefined>(undefined);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  // Preferences state
  const [language, setLanguage] = useState<'en' | 'tr'>(currentLanguage);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('dark');

  // Notification preferences
  const [notifications, setNotifications] = useState({
    attendanceUpdates: true,
    systemUpdates: true,
    newStudent: true,
    reportReady: false,
    weeklySummary: true,
  });

  // UI state
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setSchool('Maltepe University'); // This would come from user data
      setAvatarPreview(user.avatar || null);
      setOriginalAvatar(user.avatar);
    }
  }, [user]);

  // Initialize language and theme from contexts
  useEffect(() => {
    setLanguage(currentLanguage);
    setSelectedTheme(currentTheme);
  }, [currentLanguage, currentTheme]);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotificationToast({ show: true, message, type });
    setTimeout(() => {
      setNotificationToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      showToast(t.settings.profileNameRequired, 'error');
      return;
    }

    setSaving(true);

    try {
      const updates: Partial<typeof user> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };
      
      if (avatarPreview !== originalAvatar) {
        if (avatarPreview === null) {
          updates.avatar = undefined;
        } else {
          updates.avatar = avatarPreview;
        }
      }
      
      updateUser(updates);
      showToast(t.settings.profileUpdated);
    } catch (error) {
      showToast(t.settings.errorUpdating, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(t.settings.passwordFieldsRequired, 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showToast(t.settings.passwordTooShort, 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast(t.settings.passwordMismatch, 'error');
      return;
    }

    setUpdatingPassword(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(t.settings.passwordUpdated);
    } catch (error) {
      showToast(t.settings.errorUpdating, 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTwoFactorEnabled(!twoFactorEnabled);
      showToast(
        !twoFactorEnabled ? t.settings.twoFactorEnabled : t.settings.twoFactorDisabled
      );
    } catch (error) {
      showToast(t.settings.errorUpdating, 'error');
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    showToast(t.settings.themeUpdated);
  };

  // Handle language change
  const handleLanguageChange = (newLang: 'en' | 'tr') => {
    setLanguageContext(newLang);
    setLanguage(newLang);
    showToast(t.settings.languageUpdated);
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast(t.settings.passwordRequiredForDeletion, 'error');
      return;
    }

    setDeleting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real app, this would log out and redirect
      showToast(t.settings.accountDeleted);
      setShowDeleteModal(false);
    } catch (error) {
      showToast(t.settings.errorDeleting, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label 
  }: { 
    enabled: boolean; 
    onChange: () => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <span 
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent ${
          enabled ? 'bg-[#0046FF]' : 'bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="space-y-2">
          <h2 
            className="text-3xl lg:text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedText speed={35}>
              {t.settings.title}
            </AnimatedText>
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <AnimatedText speed={40}>
              {t.settings.subtitle}
            </AnimatedText>
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
        </div>

        {/* Toast Notification */}
        {notificationToast.show && (
          <div
            className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border animate-in slide-in-from-right ${
              notificationToast.type === 'success' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
            }`}
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div className="flex items-center gap-3">
              {notificationToast.type === 'success' ? (
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {notificationToast.message}
              </span>
            </div>
          </div>
        )}

        {/* Profile Settings Card */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7]"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.settings.profileSettings}
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Avatar Section */}
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div 
                      className="w-32 h-32 rounded-full border-4 overflow-hidden"
                      style={{
                        borderColor: 'var(--border-primary)',
                        backgroundColor: 'var(--bg-tertiary)',
                      }}
                    >
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-4xl font-bold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-br from-[#0046FF] to-[#001BB7] shadow-lg hover:scale-110 transition-transform duration-200"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      {t.settings.changePhoto}
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: '#FF8040',
                          border: '1px solid #FF8040/30',
                        }}
                      >
                        {t.settings.removePhoto}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label 
                      className="block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.settings.firstName}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFocused('firstName')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: focused === 'firstName' ? '#0046FF' : 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                      placeholder={t.settings.firstNamePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <label 
                      className="block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.settings.lastName}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocused('lastName')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: focused === 'lastName' ? '#0046FF' : 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                      placeholder={t.settings.lastNamePlaceholder}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.settings.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 opacity-60 cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label 
                      className="block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.settings.role}
                    </label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 opacity-60 cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label 
                      className="block text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.settings.school}
                    </label>
                    <input
                      type="text"
                      value={school}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 opacity-60 cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.settings.saving}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t.settings.saveChanges}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Security Settings Card */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7]"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.settings.securitySettings}
            </h3>
          </div>

          {/* Password Management */}
          <div className="space-y-4">
            <h4 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.settings.passwordManagement}
            </h4>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.settings.currentPassword}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onFocus={() => setFocused('currentPassword')}
                    onBlur={() => setFocused(null)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'currentPassword' ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.settings.newPassword}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setFocused('newPassword')}
                    onBlur={() => setFocused(null)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'newPassword' ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.settings.confirmNewPassword}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused('confirmPassword')}
                    onBlur={() => setFocused(null)}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'confirmPassword' 
                        ? (newPassword === confirmPassword && confirmPassword.length > 0 ? '#0046FF' : '#FF8040')
                        : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs flex items-center gap-2" style={{ color: '#FF8040' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {t.settings.passwordMismatch}
                </p>
              )}
              <button
                type="submit"
                disabled={updatingPassword}
                className="px-6 py-3 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updatingPassword ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.settings.updating}
                  </>
                ) : (
                  t.settings.updatePassword
                )}
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication */}
          <div className="pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 
                  className="text-lg font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.settings.twoFactorAuth}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.settings.twoFactorDescription}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    twoFactorEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                  }`}
                >
                  {twoFactorEnabled ? t.settings.enabled : t.settings.disabled}
                </span>
                <ToggleSwitch
                  enabled={twoFactorEnabled}
                  onChange={handleToggle2FA}
                  label=""
                />
              </div>
            </div>
            {twoFactorEnabled && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {showRecoveryCodes ? t.settings.hideRecoveryCodes : t.settings.showRecoveryCodes}
                </button>
                {showRecoveryCodes && (
                  <div 
                    className="mt-4 p-4 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <p 
                      className="text-sm mb-3"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {t.settings.recoveryCodesDescription}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['A1B2', 'C3D4', 'E5F6', 'G7H8', 'I9J0', 'K1L2', 'M3N4', 'O5P6'].map((code) => (
                        <div
                          key={code}
                          className="px-3 py-2 rounded-lg text-center font-mono text-sm"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Application Preferences Card */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7]"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.settings.applicationPreferences}
            </h3>
          </div>

          {/* Language Selection */}
          <div className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.settings.language}
              </label>
              <div className="flex gap-2">
                {(['en', 'tr'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      language === lang
                        ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/25'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[#0046FF]/50'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label 
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.settings.theme}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    type="button"
                    onClick={() => handleThemeChange(themeOption)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedTheme === themeOption
                        ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/25'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[#0046FF]/50'
                    }`}
                  >
                    {themeOption === 'light' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {themeOption === 'dark' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                    {themeOption === 'system' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    {t.settings[themeOption === 'system' ? 'systemDefault' : themeOption]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7]"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.settings.notificationPreferences}
            </h3>
          </div>

          <div className="space-y-1">
            <ToggleSwitch
              enabled={notifications.attendanceUpdates}
              onChange={() => setNotifications({ ...notifications, attendanceUpdates: !notifications.attendanceUpdates })}
              label={t.settings.attendanceSessionUpdates}
            />
            <ToggleSwitch
              enabled={notifications.systemUpdates}
              onChange={() => setNotifications({ ...notifications, systemUpdates: !notifications.systemUpdates })}
              label={t.settings.systemUpdates}
            />
            <ToggleSwitch
              enabled={notifications.newStudent}
              onChange={() => setNotifications({ ...notifications, newStudent: !notifications.newStudent })}
              label={t.settings.newStudentAdded}
            />
            <ToggleSwitch
              enabled={notifications.reportReady}
              onChange={() => setNotifications({ ...notifications, reportReady: !notifications.reportReady })}
              label={t.settings.reportReady}
            />
            <ToggleSwitch
              enabled={notifications.weeklySummary}
              onChange={() => setNotifications({ ...notifications, weeklySummary: !notifications.weeklySummary })}
              label={t.settings.weeklySummaryEmail}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: '#FF8040/30',
            borderWidth: '2px',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-[#FF8040] to-[#FF4000]"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 
              className="text-2xl font-bold"
              style={{ color: '#FF8040' }}
            >
              {t.settings.dangerZone}
            </h3>
          </div>

          <div className="space-y-4">
            <p 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {t.settings.dangerZoneDescription}
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.settings.deleteAccount}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-3xl border shadow-2xl p-8 space-y-6 animate-in scale-in"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: '#FF8040/30',
            }}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {t.settings.deleteAccountConfirm}
              </h3>
              <p 
                className="text-base"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t.settings.deleteAccountWarning}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.settings.enterPasswordToConfirm}
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onFocus={() => setFocused('deletePassword')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'deletePassword' ? '#FF8040' : 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.settings.deleting}
                  </>
                ) : (
                  t.settings.deleteAccount
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

