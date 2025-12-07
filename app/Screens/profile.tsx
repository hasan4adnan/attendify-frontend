'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import AnimatedText from '../components/AnimatedText';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, token, updateUser, updateAvatar } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalAvatar, setOriginalAvatar] = useState<string | undefined>(undefined);
  
  // UI state
  const [focused, setFocused] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
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
      setAvatarPreview(user.avatar || null);
      setOriginalAvatar(user.avatar);
    }
  }, [user]);

  // Validation
  const validateForm = () => {
    if (!firstName.trim()) {
      setNotification({ show: true, message: t.profile.firstNameRequired, type: 'error' });
      return false;
    }
    if (!lastName.trim()) {
      setNotification({ show: true, message: t.profile.lastNameRequired, type: 'error' });
      return false;
    }
    if (!email.trim()) {
      setNotification({ show: true, message: t.profile.emailRequired, type: 'error' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotification({ show: true, message: t.profile.invalidEmail, type: 'error' });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!currentPassword) {
      setNotification({ show: true, message: t.profile.currentPasswordRequired, type: 'error' });
      return false;
    }
    if (!newPassword) {
      setNotification({ show: true, message: t.profile.newPasswordRequired, type: 'error' });
      return false;
    }
    if (newPassword.length < 8) {
      setNotification({ show: true, message: t.profile.passwordTooShort, type: 'error' });
      return false;
    }
    if (newPassword !== confirmPassword) {
      setNotification({ show: true, message: t.profile.passwordMismatch, type: 'error' });
      return false;
    }
    return true;
  };

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setNotification({ show: true, message: 'Please select an image file', type: 'error' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({ show: true, message: 'Image size must be less than 5MB', type: 'error' });
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
    
    if (!validateForm()) {
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      return;
    }

    if (!token) {
      setNotification({ show: true, message: 'Authentication required. Please log in.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      return;
    }

    setSaving(true);

    try {
      // Build request body - only include fields that are being updated
      const requestBody: any = {};

      // Only send fields that have changed or are required
      if (firstName.trim() !== user?.firstName) {
        requestBody.name = firstName.trim();
      }
      if (lastName.trim() !== user?.lastName) {
        requestBody.surname = lastName.trim();
      }
      if (email.trim() !== user?.email) {
        requestBody.email = email.trim();
      }

      // Note: role, universityId, and avatar are not part of this endpoint
      // Avatar would need a separate endpoint if needed

      const response = await fetch('http://localhost:3001/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle different error status codes
      if (response.status === 401) {
        setNotification({ show: true, message: 'Authentication failed. Please log in again.', type: 'error' });
        setSaving(false);
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local user context with the response data
        if (data.data) {
          updateUser({
            firstName: data.data.name,
            lastName: data.data.surname,
            email: data.data.email,
            role: data.data.role,
            school: data.data.universityName,
          });
        }

        // Handle avatar update or removal (local only, not part of API)
        if (avatarPreview !== originalAvatar) {
          if (avatarPreview === null) {
            updateUser({ avatar: undefined });
          } else {
            updateUser({ avatar: avatarPreview });
          }
        }

        setNotification({ show: true, message: data.message || t.profile.profileUpdated, type: 'success' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      } else {
        // Handle specific error status codes
        let errorMessage = t.profile.errorUpdating;
        
        if (response.status === 400) {
          errorMessage = data.message || 'Validation error. Please check your input and try again.';
        } else if (response.status === 404) {
          errorMessage = 'User or university not found. Please refresh and try again.';
        } else if (response.status === 409) {
          errorMessage = data.message || 'This email is already registered. Please use a different email address.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setNotification({ show: true, message: errorMessage, type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setNotification({ show: true, message: 'Network error. Please try again.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Save password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      return;
    }

    if (!token) {
      setNotification({ show: true, message: 'Authentication required. Please log in.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      return;
    }

    setSaving(true);

    try {
      const requestBody = {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword,
      };

      const response = await fetch('http://localhost:3001/api/settings/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle different error status codes
      if (response.status === 401) {
        setNotification({ show: true, message: 'Authentication failed or current password is incorrect. Please try again.', type: 'error' });
        setSaving(false);
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
        return;
      }

      if (response.status === 404) {
        setNotification({ show: true, message: 'User not found. Please refresh and try again.', type: 'error' });
        setSaving(false);
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);

        setNotification({ show: true, message: data.message || t.profile.passwordUpdated, type: 'success' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      } else {
        // Handle validation errors (400)
        let errorMessage = t.profile.errorUpdating;
        
        if (response.status === 400) {
          errorMessage = data.message || 'Validation error. Please check that passwords match and new password is at least 8 characters.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setNotification({ show: true, message: errorMessage, type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      }
    } catch (error) {
      console.error('Update password error:', error);
      setNotification({ show: true, message: 'Network error. Please try again.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            <AnimatedText speed={40}>{t.profile.title}</AnimatedText>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <AnimatedText speed={40}>{t.profile.subtitle}</AnimatedText>
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`mb-6 p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar Section */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-2xl backdrop-blur-xl border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                <AnimatedText speed={40}>{t.profile.profilePhoto}</AnimatedText>
              </h2>

              {/* Avatar Display */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 shadow-lg"
                      style={{ borderColor: 'var(--border-secondary)' }}
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-full bg-gradient-to-r from-[#0046FF] to-[#001BB7] flex items-center justify-center text-white text-4xl font-bold shadow-lg"
                    >
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Avatar Actions */}
                <div className="flex flex-col gap-2 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {avatarPreview ? t.profile.changePhoto : t.profile.uploadPhoto}
                  </button>
                  {avatarPreview && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 text-red-400"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      {t.profile.removePhoto}
                    </button>
                  )}
                </div>
              </div>

              {/* Role Display */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-quaternary)' }}>
                  {t.profile.role}
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information Section */}
            <div
              className="p-6 rounded-2xl backdrop-blur-xl border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                <AnimatedText speed={40}>{t.profile.userInformation}</AnimatedText>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email - Read Only */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.profile.email}
                  </label>
                  <div
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {user.email}
                  </div>
                </div>

                {/* School / Institution - Read Only */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.profile.school}
                  </label>
                  <div
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {user.school || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <form onSubmit={handleSaveProfile}>
              <div
                className="p-6 rounded-2xl backdrop-blur-xl border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedText speed={40}>{t.profile.personalInformation}</AnimatedText>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* First Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.profile.firstName}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFocused('firstName')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: focused === 'firstName' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                        border: `1px solid ${focused === 'firstName' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                      placeholder={t.profile.firstName}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.profile.lastName}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocused('lastName')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: focused === 'lastName' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                        border: `1px solid ${focused === 'lastName' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                      placeholder={t.profile.lastName}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.profile.email}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: focused === 'email' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${focused === 'email' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                    placeholder={t.profile.email}
                  />
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30"
                >
                  {saving ? t.profile.saving : t.profile.saveChanges}
                </button>
              </div>
            </form>

            {/* Password Section */}
            <form onSubmit={handleSavePassword}>
              <div
                className="p-6 rounded-2xl backdrop-blur-xl border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <AnimatedText speed={40}>{t.profile.accountSettings}</AnimatedText>
                  </h2>
                  {!showPasswordSection && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(true)}
                      className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      {t.profile.changePassword}
                    </button>
                  )}
                </div>

                {showPasswordSection && (
                  <div className="space-y-6 animate-in slide-in-from-top-2">
                    {/* Current Password */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {t.profile.currentPassword}
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        onFocus={() => setFocused('currentPassword')}
                        onBlur={() => setFocused(null)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: focused === 'currentPassword' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                          border: `1px solid ${focused === 'currentPassword' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                        placeholder={t.profile.currentPassword}
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {t.profile.newPassword}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={() => setFocused('newPassword')}
                        onBlur={() => setFocused(null)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: focused === 'newPassword' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                          border: `1px solid ${focused === 'newPassword' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                        placeholder={t.profile.newPassword}
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {t.profile.confirmNewPassword}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocused('confirmPassword')}
                        onBlur={() => setFocused(null)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: focused === 'confirmPassword' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                          border: `1px solid ${focused === 'confirmPassword' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                        placeholder={t.profile.confirmNewPassword}
                      />
                    </div>

                    {/* Password Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30"
                      >
                        {saving ? t.profile.saving : t.profile.saveChanges}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        {t.profile.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

