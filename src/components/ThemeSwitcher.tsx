"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    );
  }

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Passa a modalità chiara" : "Passa a modalità scura"}
      type="button"
      className="relative inline-flex items-center w-16 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
      onClick={toggleTheme}
    >
      {/* Track */}
      <div className={`
        absolute inset-1 rounded-full transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        }
      `}>
        {/* Toggle Ball */}
        <div className={`
          absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
          ${isDark ? 'translate-x-7' : 'translate-x-0.5'}
        `}>
          {isDark ? (
            <Moon className="w-3 h-3 text-indigo-600" />
          ) : (
            <Sun className="w-3 h-3 text-orange-500" />
          )}
        </div>
      </div>
      
      {/* Icons on track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={`w-4 h-4 transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-white'
        }`} />
        <Moon className={`w-4 h-4 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-gray-400'
        }`} />
      </div>
    </button>
  );
};

export default ThemeSwitcher;
