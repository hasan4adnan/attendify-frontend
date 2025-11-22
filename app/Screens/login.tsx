'use client';

import { useState } from 'react';
import TermsPrivacyModal from '../components/TermsPrivacyModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';
import AnimatedText from '../components/AnimatedText';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const { actualTheme } = useTheme();
  const { t, isTransitioning } = useLanguage();
  const router = useRouter();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');

    const openModal = (type: 'terms' | 'privacy') => {
      setModalType(type);
      setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempted:', { email, password });
  };

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-md space-y-8" style={{ color: 'var(--text-primary)' }}>
          <div className="space-y-4">
            <h1 
              className="text-6xl font-bold tracking-tight bg-gradient-to-r from-[#001BB7] via-[#0046FF] to-[#FF8040] bg-clip-text text-transparent"
            >
              Attendify
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
          </div>
          <p 
            className="text-xl leading-relaxed"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <AnimatedText speed={40}>
              {t.branding.tagline}
            </AnimatedText>
          </p>
          <div className="flex gap-4 pt-4">
            <div 
              className="flex-1 p-4 backdrop-blur-md rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                99.9%
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--text-quaternary)' }}
              >
                <AnimatedText speed={50}>
                  {t.branding.uptime}
                </AnimatedText>
              </div>
            </div>
            <div 
              className="flex-1 p-4 backdrop-blur-md rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                10K+
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--text-quaternary)' }}
              >
                <AnimatedText speed={50}>
                  {t.branding.users}
                </AnimatedText>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#001BB7] via-[#0046FF] to-[#FF8040] bg-clip-text text-transparent"
            >
              Attendify
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full mx-auto" />
          </div>

          {/* Login Card */}
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 lg:p-10 space-y-8"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="space-y-2">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.login.title}
                </AnimatedText>
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.login.subtitle}
                </AnimatedText>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.login.emailLabel}
                  </AnimatedText>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    required
                    className="w-full px-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'email' ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder={t.login.emailPlaceholder}
                  />
                  {focused === 'email' && (
                    <div 
                      className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.login.passwordLabel}
                    </AnimatedText>
                  </label>
                  <a
                    href="#"
                    className="text-sm text-[#0046FF] hover:text-[#FF8040] font-medium transition-colors duration-200"
                  >
                    <AnimatedText speed={50}>
                      {t.login.forgotPassword}
                    </AnimatedText>
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    required
                    className="w-full px-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'password' ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder={t.login.passwordPlaceholder}
                  />
                  {focused === 'password' && (
                    <div 
                      className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group hover:from-[#0055FF] hover:to-[#0025CC]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AnimatedText speed={40}>
                    {t.login.signIn}
                  </AnimatedText>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="w-full border-t"
                  style={{ borderColor: 'var(--border-primary)' }}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <span 
                  className="px-4 bg-transparent"
                  style={{ 
                    backgroundColor: actualTheme === 'dark' ? 'transparent' : 'var(--bg-secondary)',
                    color: 'var(--text-quaternary)' 
                  }}
                >
                  <AnimatedText speed={40}>
                    {t.login.newToAttendify}
                  </AnimatedText>
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <button 
              onClick={() => router.push('/signup')}
              className="w-full py-4 px-6 border font-semibold rounded-xl hover:border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            >
              <AnimatedText speed={40}>
                {t.login.createAccount}
              </AnimatedText>
            </button>
          </div>

          {/* Footer */}
          <div
            className="text-center text-sm mt-6"
            style={{ color: 'var(--text-quaternary)' }}
          >
            <span>
              <AnimatedText speed={35}>
                {t.login.termsAndPrivacy}
              </AnimatedText>
            </span>
            <button
              type="button"
              className="text-[#0046FF] hover:text-[#FF8040] transition-colors underline font-semibold tracking-wide mx-1"
              style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '1.05em', letterSpacing: '0.01em' }}
              onClick={() => openModal('terms')}
            >
              <AnimatedText speed={40}>
                {t.login.termsOfService}
              </AnimatedText>
            </button>
            <span>
              <AnimatedText speed={35}>
                {t.login.and}
              </AnimatedText>
            </span>
            <button
              type="button"
              className="text-[#0046FF] hover:text-[#FF8040] transition-colors underline font-semibold tracking-wide mx-1"
              style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '1.05em', letterSpacing: '0.01em' }}
              onClick={() => openModal('privacy')}
            >
              <AnimatedText speed={40}>
                {t.login.privacyPolicy}
              </AnimatedText>
            </button>
            {t.login.agreeToTerms && (
              <span>
                <AnimatedText speed={35}>
                  {t.login.agreeToTerms}
                </AnimatedText>
              </span>
            )}
            <TermsPrivacyModal open={modalOpen} onClose={closeModal} type={modalType} />
          </div>
        </div>
      </div>
    </div>
  );
}
