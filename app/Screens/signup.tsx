'use client';

import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter } from 'next/navigation';
import AnimatedText from '../components/AnimatedText';

type Slide = 'intro' | 'university' | 'email' | 'name' | 'password' | 'verification';

const universities = [
  'Maltepe University',
  'Istanbul University',
  'Bogazici University',
  'Middle East Technical University',
  'Istanbul Technical University',
  'Ankara University',
  'Hacettepe University',
  'Ege University',
  'Gazi University',
  'Yildiz Technical University',
  'Koc University',
];


export default function SignUpPage() {
  const [currentSlide, setCurrentSlide] = useState<Slide>('intro');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const slides: Slide[] = ['intro', 'university', 'email', 'name', 'password', 'verification'];
  const currentIndex = slides.indexOf(currentSlide);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentSlide(slides[currentIndex + 1]);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentSlide(slides[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentSlide === 'password') {
      // Register user when password slide is submitted
      setIsLoading(true);
      try {
        // Build request body
        const requestBody: any = {
          name: firstName.trim(),
          surname: lastName.trim(),
          email: email.trim(),
          password: password,
          confirmPassword: confirmPassword,
          role: 'instructor', // Default role
        };

        // Note: universityId is optional and not included since we only have university name
        // If universityId mapping is needed, it would require an API call to get university IDs

        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        // Handle different error status codes
        if (response.status === 400) {
          setError(data.message || 'Validation error. Please check your input and try again.');
          setIsLoading(false);
          return;
        }

        if (response.status === 404) {
          setError('University not found. Please try again.');
          setIsLoading(false);
          return;
        }

        if (response.status === 409) {
          setError(data.message || 'This email is already registered. Please use a different email address or try logging in.');
          setIsLoading(false);
          return;
        }

        if (response.status === 201 && data.userId) {
          setUserId(data.userId);
          // Store verification code if provided (development only)
          if (data.verificationCode) {
            // Could store this for display or debugging in development
            console.log('Verification code:', data.verificationCode);
          }
          // Move to verification slide
          nextSlide();
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (currentSlide === 'verification') {
      // Verify email when verification slide is submitted
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            code: verificationCode,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Email verified successfully, redirect to login
          router.push('/');
        } else {
          setError(data.message || 'Verification failed. Please check your code and try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For other slides, just move to next
      nextSlide();
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage(null);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendMessage(data.message || 'Verification code has been sent to your email.');
        // Clear the message after 5 seconds
        setTimeout(() => setResendMessage(null), 5000);
      } else {
        setError(data.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const canProceed = () => {
    switch (currentSlide) {
      case 'intro':
        return true;
      case 'university':
        return university.length > 0;
      case 'email':
        return email.length > 0 && email.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      case 'name':
        return firstName.length > 0 && lastName.length > 0;
      case 'password':
        return password.length >= 8 && password === confirmPassword;
      case 'verification':
        return verificationCode.length === 6;
      default:
        return false;
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.signup.welcome}
                </AnimatedText>
              </h2>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.signup.introDescription}
                </AnimatedText>
              </p>
            </div>
            <div 
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="space-y-2">
                <div 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.signup.whatYouGet}
                  </AnimatedText>
                </div>
                <ul 
                  className="space-y-2 text-sm"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0046FF]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <AnimatedText speed={45}>
                      {t.signup.benefit1}
                    </AnimatedText>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0046FF]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <AnimatedText speed={45}>
                      {t.signup.benefit2}
                    </AnimatedText>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0046FF]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <AnimatedText speed={45}>
                      {t.signup.benefit3}
                    </AnimatedText>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'university':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.signup.universityTitle}
                </AnimatedText>
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.signup.universitySubtitle}
                </AnimatedText>
              </p>
            </div>
            <div className="space-y-2">
              <label 
                htmlFor="university" 
                className="block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <AnimatedText speed={50}>
                  {t.signup.universityLabel}
                </AnimatedText>
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="university"
                  onClick={() => setIsUniversityDropdownOpen(!isUniversityDropdownOpen)}
                  onFocus={() => setFocused('university')}
                  onBlur={(e) => {
                    // Don't close if clicking inside the dropdown
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setFocused(null);
                      setTimeout(() => setIsUniversityDropdownOpen(false), 200);
                    }
                  }}
                  className="w-full px-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50 text-left flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'university' || isUniversityDropdownOpen ? '#0046FF' : 'var(--border-primary)',
                    color: university ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  }}
                >
                  <span>{university || t.signup.universityPlaceholder}</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isUniversityDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {(focused === 'university' || isUniversityDropdownOpen) && (
                  <div 
                    className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                    }}
                  />
                )}
                {isUniversityDropdownOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-60 overflow-y-auto"
                    style={{
                      backgroundColor: '#1e1e2d',
                      borderColor: '#2A2A3B',
                      opacity: 1,
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {universities.map((uni) => (
                        <button
                          key={uni}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setUniversity(uni);
                            setIsUniversityDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            backgroundColor: university === uni ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                            color: '#E4E4E7',
                            border: university === uni ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (university !== uni) {
                              e.currentTarget.style.backgroundColor = '#2A2A3B';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (university !== uni) {
                              e.currentTarget.style.backgroundColor = '#1e1e2d';
                            }
                          }}
                        >
                          <div className="font-semibold">{uni}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.signup.emailTitle}
                </AnimatedText>
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.signup.emailSubtitle}
                </AnimatedText>
              </p>
            </div>
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
                    borderColor: focused === 'email'
                      ? '#0046FF'
                      : 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder={t.signup.emailPlaceholder}
                  autoFocus
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
          </div>
        );

      case 'name':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.signup.nameTitle}
                </AnimatedText>
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.signup.nameSubtitle}
                </AnimatedText>
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.signup.firstNameLabel}
                  </AnimatedText>
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={() => setFocused('firstName')}
                    onBlur={() => setFocused(null)}
                    required
                    className="w-full px-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'firstName' ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder={t.signup.firstNamePlaceholder}
                    autoFocus
                  />
                  {focused === 'firstName' && (
                    <div 
                      className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.signup.lastNameLabel}
                  </AnimatedText>
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={() => setFocused('lastName')}
                    onBlur={() => setFocused(null)}
                    required
                    className="w-full px-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'lastName' ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder={t.signup.lastNamePlaceholder}
                  />
                  {focused === 'lastName' && (
                    <div 
                      className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.signup.passwordTitle}
                </AnimatedText>
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.signup.passwordSubtitle}
                </AnimatedText>
              </p>
            </div>
            {error && (
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.signup.passwordLabel}
                  </AnimatedText>
                </label>
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
                    placeholder={t.signup.passwordPlaceholder}
                    autoFocus
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
                {password.length > 0 && password.length < 8 && (
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-quaternary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.signup.passwordMinLength}
                    </AnimatedText>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.signup.confirmPasswordLabel}
                  </AnimatedText>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused('confirmPassword')}
                    onBlur={() => setFocused(null)}
                    required
                    className="w-full px-4 py-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: focused === 'confirmPassword' 
                        ? (password === confirmPassword && confirmPassword.length > 0 ? '#0046FF' : '#FF8040')
                        : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder={t.signup.confirmPasswordPlaceholder}
                  />
                  {focused === 'confirmPassword' && (
                    <div 
                      className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                      }}
                    />
                  )}
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p 
                    className="text-xs"
                    style={{ color: '#FF8040' }}
                  >
                    <AnimatedText speed={50}>
                      {t.signup.passwordsDoNotMatch}
                    </AnimatedText>
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 
                className="text-3xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.signup.verificationTitle}
                </AnimatedText>
              </h2>
              <p 
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span>
                  <AnimatedText speed={40}>
                    {t.signup.verificationSubtitle}
                  </AnimatedText>
                  <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                  {' '}
                  <AnimatedText speed={40}>
                    {t.signup.verificationSubtitleEnd}
                  </AnimatedText>
                </span>
              </p>
            </div>
            {error && (
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label 
                htmlFor="verificationCode" 
                className="block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <AnimatedText speed={50}>
                  {t.signup.verificationCodeLabel}
                </AnimatedText>
              </label>
              <div className="relative">
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onFocus={() => setFocused('verificationCode')}
                  onBlur={() => setFocused(null)}
                  required
                  className="w-full px-4 py-4 rounded-xl border text-center text-2xl tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'verificationCode' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder={t.signup.verificationCodePlaceholder}
                  maxLength={6}
                  autoFocus
                />
                {focused === 'verificationCode' && (
                  <div 
                    className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                    }}
                  />
                )}
              </div>
              <p 
                className="text-xs text-center"
                style={{ color: 'var(--text-quaternary)' }}
              >
                <AnimatedText speed={40}>
                  {t.signup.didntReceiveCode}{' '}
                </AnimatedText>
                <button
                  type="button"
                  disabled={isResending}
                  className="text-[#0046FF] hover:text-[#FF8040] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResendVerification}
                >
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <AnimatedText speed={40}>
                        Sending...
                      </AnimatedText>
                    </span>
                  ) : (
                    <AnimatedText speed={40}>
                      {t.signup.resend}
                    </AnimatedText>
                  )}
                </button>
              </p>
              {resendMessage && (
                <p 
                  className="text-xs text-center flex items-center justify-center gap-2"
                  style={{ color: '#10b981' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <AnimatedText speed={50}>
                    {resendMessage}
                  </AnimatedText>
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
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
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div 
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              <AnimatedText speed={50}>
                {t.signup.step} {currentIndex + 1} {t.signup.of} {slides.length}
              </AnimatedText>
            </div>
            <div className="flex gap-2">
              {slides.map((slide, index) => (
                <div
                  key={slide}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={
                    index <= currentIndex
                      ? {
                          background: 'linear-gradient(to right, #0046FF, #001BB7)'
                        }
                      : {
                          backgroundColor: 'var(--border-primary)'
                        }
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
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
            {/* Mobile Progress Indicator */}
            <div className="mt-4 space-y-2">
              <div 
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <AnimatedText speed={50}>
                  {t.signup.step} {currentIndex + 1} {t.signup.of} {slides.length}
                </AnimatedText>
              </div>
              <div className="flex gap-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={
                      index <= currentIndex
                        ? {
                            background: 'linear-gradient(to right, #0046FF, #001BB7)'
                          }
                        : {
                            backgroundColor: 'var(--border-primary)'
                          }
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sign Up Card */}
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 lg:p-10 space-y-8"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Slide Content */}
              <div 
                key={currentSlide}
                className="slide-content"
              >
                {renderSlide()}
              </div>

              {/* Navigation Buttons */}
              <div className={`flex gap-3 pt-4 ${currentIndex === 0 ? 'justify-end' : ''}`}>
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="flex-1 py-4 px-6 border font-semibold rounded-xl hover:border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
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
                      {t.common.back}
                    </AnimatedText>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!canProceed() || isLoading}
                  className={`${currentIndex === 0 ? 'px-8' : 'flex-1'} py-4 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group hover:from-[#0055FF] hover:to-[#0025CC] ${
                    !canProceed() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>
                          {currentSlide === 'password' ? 'Registering...' : currentSlide === 'verification' ? 'Verifying...' : 'Loading...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <AnimatedText speed={40}>
                          {currentSlide === 'verification' ? t.signup.completeSignUp : t.common.next}
                        </AnimatedText>
                        {currentSlide !== 'verification' && (
                          <svg
                            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        )}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer */}
            <p 
              className="text-center text-sm"
              style={{ color: 'var(--text-quaternary)' }}
            >
              <AnimatedText speed={40}>
                {t.signup.alreadyHaveAccount}{' '}
              </AnimatedText>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-[#0046FF] hover:text-[#FF8040] transition-colors font-medium"
              >
                <AnimatedText speed={40}>
                  {t.signup.signIn}
                </AnimatedText>
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
