'use client';

import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const { theme } = useTheme();

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
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br rounded-full blur-[120px] animate-pulse"
          style={{
            background: `linear-gradient(to bottom right, var(--gradient-orb-1), var(--gradient-orb-2), transparent)`,
          }}
        />
        <div 
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl rounded-full blur-[120px] animate-pulse"
          style={{
            background: `linear-gradient(to top left, var(--gradient-orb-3), var(--gradient-orb-4), transparent)`,
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] animate-pulse"
          style={{
            backgroundColor: 'var(--gradient-orb-5)',
            animationDelay: '2s'
          }}
        />
      </div>

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
            Streamline your attendance management with our powerful, intuitive platform.
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
                Uptime
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
                Users
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
                Welcome back
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                Sign in to continue to Attendify
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
                  Email address
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
                    placeholder="name@company.com"
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
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm text-[#0046FF] hover:text-[#FF8040] font-medium transition-colors duration-200"
                  >
                    Forgot?
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
                    placeholder="••••••••"
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
                  Sign in
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
                    backgroundColor: theme === 'dark' ? 'transparent' : 'var(--bg-secondary)',
                    color: 'var(--text-quaternary)' 
                  }}
                >
                  New to Attendify?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <button 
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
              Create an account
            </button>
          </div>

          {/* Footer */}
          <p 
            className="text-center text-sm mt-6"
            style={{ color: 'var(--text-quaternary)' }}
          >
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#0046FF] hover:text-[#FF8040] transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#0046FF] hover:text-[#FF8040] transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
