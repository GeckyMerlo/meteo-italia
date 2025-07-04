"use client";

import { useState, useEffect } from "react";

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Legge il tema dal localStorage o usa preferenza sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let shouldBeDark = false;
    
    if (savedTheme === 'dark') {
      shouldBeDark = true;
    } else if (savedTheme === 'light') {
      shouldBeDark = false;
    } else if (systemPrefersDark) {
      shouldBeDark = true;
    }
    
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    setMounted(true);
  }, []);

  const applyTheme = (isDarkMode: boolean) => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Dispatch custom event per notificare altri componenti
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark: isDarkMode } 
    }));
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
  };

  // Mostra un placeholder durante il caricamento
  if (!mounted) {
    return (
      <div className="w-16 h-10 bg-orange-200 dark:bg-gray-700 rounded-full animate-pulse flex items-center justify-center shadow-lg">
        <span className="text-orange-600 dark:text-gray-400">⚡</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleTheme}
        className="relative w-16 h-10 rounded-full bg-orange-200 dark:bg-gray-700 hover:bg-orange-300 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        aria-label={`Cambia tema (attuale: ${isDark ? 'scuro' : 'chiaro'})`}
      >
        {/* Background gradient */}
        <div 
          className={`absolute inset-1 rounded-full transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
              : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500'
          }`} 
        />
        
        {/* Toggle ball */}
        <div 
          className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          <span className="text-sm">
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>
        
        {/* Track icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <span className={`text-xs transition-opacity duration-300 ${
            isDark ? 'opacity-60' : 'opacity-100'
          }`}>
            ☀️
          </span>
          <span className={`text-xs transition-opacity duration-300 ${
            isDark ? 'opacity-100' : 'opacity-60'
          }`}>
            🌙
          </span>
        </div>
      </button>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-center text-amber-600 dark:text-gray-400 bg-amber-50 dark:bg-gray-800 px-2 py-1 rounded border border-amber-200 dark:border-gray-700">
          Tema: {isDark ? 'scuro' : 'chiaro'}
        </div>
      )}
    </div>
  );
}
