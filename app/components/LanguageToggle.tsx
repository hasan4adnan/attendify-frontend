'use client';

import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  compact?: boolean;
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  if (compact) {
    return (
      <button
        onClick={toggleLanguage}
        className="w-full p-3 rounded-xl border shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group relative overflow-hidden flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-primary)',
          transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 1,
        }}
        aria-label="Toggle language"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#FF8040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        />
        <span 
          className="text-sm font-semibold transition-all duration-300 relative z-10"
          style={{ 
            color: 'var(--text-primary)',
            opacity: 1,
          }}
        >
          {language === 'en' ? 'EN' : 'TR'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="w-full px-4 py-3 rounded-xl border shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group relative overflow-hidden flex items-center gap-2"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        borderColor: 'var(--border-primary)',
        transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 1,
      }}
      aria-label="Toggle language"
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#0046FF]/10 to-[#FF8040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
      />
      <span 
        className="text-sm font-semibold transition-all duration-300 relative z-10"
        style={{ 
          color: 'var(--text-primary)',
          opacity: 1,
        }}
      >
        {language === 'en' ? 'EN' : 'TR'}
      </span>
      
      {/* Language indicator dots */}
      <div className="flex gap-1 relative z-10">
        <div 
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            language === 'en' ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
          }`}
          style={{
            backgroundColor: language === 'en' ? '#0046FF' : 'var(--text-quaternary)',
            opacity: language === 'en' ? 1 : 0.5,
          }}
        />
        <div 
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            language === 'tr' ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
          }`}
          style={{
            backgroundColor: language === 'tr' ? '#FF8040' : 'var(--text-quaternary)',
            opacity: language === 'tr' ? 1 : 0.5,
          }}
        />
      </div>
    </button>
  );
}

