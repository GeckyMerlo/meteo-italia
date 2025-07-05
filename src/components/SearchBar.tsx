"use client";

import React, { useState, useEffect } from 'react';
import italyCities from '../../italy_cities.json';

interface SearchBarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ selectedCity, onCityChange }) => {
  const [inputValue, setInputValue] = useState(selectedCity);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Estrai i nomi dei comuni dal JSON
  const italianCities = (italyCities.Foglio1 || []).map((c: any) => c.comune);

  // Aggiorna il valore dell'input quando cambia selectedCity
  useEffect(() => {
    setInputValue(selectedCity);
  }, [selectedCity]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.length > 1) {
      const filtered = italianCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      onCityChange(inputValue.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city: string) => {
    setInputValue(city);
    onCityChange(city);
    setShowSuggestions(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <div className="text-amber-500 dark:text-gray-400 text-2xl">🔍</div>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
              placeholder="Cerca una città italiana (es. Roma, Milano...)"
              className="w-full pl-14 pr-6 py-5 text-lg border-2 border-orange-200 dark:border-gray-600 bg-white/95 dark:bg-gray-700 text-amber-900 dark:text-gray-100 rounded-2xl focus:outline-none focus:border-orange-400 dark:focus:border-blue-400 transition-all duration-300 placeholder-amber-600 dark:placeholder-gray-400 shadow-lg focus:shadow-xl font-medium"
              aria-label="Nome città"
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white/95 dark:bg-gray-700 border-2 border-orange-200 dark:border-gray-600 rounded-xl shadow-2xl backdrop-blur-sm">
                {suggestions.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(city)}
                    className="w-full text-left px-6 py-4 hover:bg-orange-50 dark:hover:bg-gray-600 text-amber-900 dark:text-gray-100 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl font-medium"
                  >
                    <span className="mr-3 text-lg">🏙️</span>
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-amber-300 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg transform hover:scale-105 disabled:transform-none"
          >
            Cerca
          </button>
        </div>
      </form>
      
      {/* Current city display */}
      <div className="mt-6 text-center">
        <span className="inline-flex items-center px-6 py-3 bg-amber-100 dark:bg-blue-900/30 text-amber-800 dark:text-blue-300 rounded-full text-base font-bold shadow-lg">
          <span className="mr-3 text-lg">📍</span>
          Città selezionata: {selectedCity}
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
