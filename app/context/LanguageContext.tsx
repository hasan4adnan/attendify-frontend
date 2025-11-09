'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { translations as enTranslations } from '../translations/en';
import { translations as trTranslations } from '../translations/tr';

export type Language = 'en' | 'tr';

type Translations = typeof enTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isTransitioning: boolean;
  shouldAnimate: boolean;
  markAnimationComplete: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Check localStorage for saved language preference on mount
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language | null;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
        setLanguageState(savedLanguage);
        document.documentElement.setAttribute('lang', savedLanguage);
      } else {
        document.documentElement.setAttribute('lang', 'en');
      }
      setMounted(true);
      // Don't animate on initial mount
      setShouldAnimate(false);
    }
  }, []);

  const markAnimationComplete = useCallback(() => {
    // This is called by individual AnimatedText components when they finish
    // We don't need to do anything here since we use a global timeout
    // The timeout in setLanguage handles disabling animations after all complete
  }, []);

  const setLanguage = (lang: Language) => {
    if (lang !== language) {
      // Clear any pending animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Enable animations for this language change
      setShouldAnimate(true);
      setIsTransitioning(true);
      animationStartTimeRef.current = Date.now();
      
      // Small delay to allow animation to start
      setTimeout(() => {
        setLanguageState(lang);
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('language', lang);
      }, 50);

      // Automatically disable animation mode after enough time for all animations to complete
      // This ensures that after language change animations finish, subsequent navigations don't animate
      // Using 4 seconds to account for even the longest text animations
      animationTimeoutRef.current = setTimeout(() => {
        setShouldAnimate(false);
        setIsTransitioning(false);
        animationStartTimeRef.current = null;
      }, 4000);
    }
  };

  const translations: Translations = language === 'tr' ? trTranslations : enTranslations;

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t: translations, 
      isTransitioning,
      shouldAnimate,
      markAnimationComplete
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

