'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // Check localStorage for saved theme preference on mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      setMounted(true);
      // Mark that initial mount is complete after a brief delay
      setTimeout(() => setIsInitialMount(false), 100);
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      if (!isInitialMount) {
        // Step 1: Add transition class
        document.documentElement.classList.add('theme-transition');
        
        // Step 2: Force synchronous reflow to apply the class
        // This ensures the browser recognizes the transition class before we change the theme
        document.documentElement.offsetHeight;
        
        // Step 3: Use setTimeout(0) to push theme change to next event loop tick
        // This ensures the transition class is fully applied before the theme attribute changes
        const themeChangeTimer = setTimeout(() => {
          document.documentElement.setAttribute('data-theme', theme);
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
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      }
    }
  }, [theme, mounted, isInitialMount]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Always provide the context, even before mounted
  // This ensures useTheme hook works immediately
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

