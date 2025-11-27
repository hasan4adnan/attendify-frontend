'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark' | 'light'; // The actual theme being used (resolved from system if needed)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Get system preference
  const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  // Resolve actual theme from theme preference
  const resolveTheme = (themePref: Theme): 'dark' | 'light' => {
    if (themePref === 'system') {
      return getSystemTheme();
    }
    return themePref;
  };

  useEffect(() => {
    // Check localStorage for saved theme preference on mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system')) {
        setThemeState(savedTheme);
        const resolved = resolveTheme(savedTheme);
        setActualTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        setActualTheme('dark');
      }
      setMounted(true);
      // Mark that initial mount is complete after a brief delay
      setTimeout(() => setIsInitialMount(false), 100);
    }
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setActualTheme(newTheme);
        if (mounted && !isInitialMount) {
          document.documentElement.setAttribute('data-theme', newTheme);
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, mounted, isInitialMount]);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      const resolved = resolveTheme(theme);
      setActualTheme(resolved);
      
      if (!isInitialMount) {
        // Step 1: Add transition class
        document.documentElement.classList.add('theme-transition');
        
        // Step 2: Force synchronous reflow to apply the class
        document.documentElement.offsetHeight;
        
        // Step 3: Use setTimeout(0) to push theme change to next event loop tick
        const themeChangeTimer = setTimeout(() => {
          document.documentElement.setAttribute('data-theme', resolved);
          localStorage.setItem('theme', theme);
        }, 0);
        
        // Step 4: Remove transition class after animation completes
        const cleanupTimer = setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 700);
        
        return () => {
          clearTimeout(themeChangeTimer);
          clearTimeout(cleanupTimer);
        };
      } else {
        // For initial mount, just set the theme without transition
        document.documentElement.setAttribute('data-theme', resolved);
        localStorage.setItem('theme', theme);
      }
    }
  }, [theme, mounted, isInitialMount]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      if (prevTheme === 'system') return 'dark';
      return prevTheme === 'dark' ? 'light' : 'dark';
    });
  };

  // Always provide the context, even before mounted
  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

