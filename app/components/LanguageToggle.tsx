'use client';

import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 left-6 z-50 px-4 py-3 backdrop-blur-md rounded-full border shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-2"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      aria-label="Toggle language"
    >
      <span 
        className="text-sm font-semibold transition-all duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        {language === 'en' ? 'EN' : 'TR'}
      </span>
      
      {/* Language indicator dots */}
      <div className="flex gap-1">
        <div 
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            language === 'en' ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
          }`}
          style={{
            backgroundColor: language === 'en' ? '#0046FF' : 'var(--text-quaternary)'
          }}
        />
        <div 
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            language === 'tr' ? 'scale-100 opacity-100' : 'scale-75 opacity-50'
          }`}
          style={{
            backgroundColor: language === 'tr' ? '#FF8040' : 'var(--text-quaternary)'
          }}
        />
      </div>

      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-md opacity-30 transition-all duration-500 -z-10"
        style={{
          backgroundColor: language === 'en' 
            ? 'rgba(0, 70, 255, 0.3)' 
            : 'rgba(255, 128, 64, 0.3)'
        }}
      />
    </button>
  );
}

