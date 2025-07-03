"use client";

import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ selectedCity, onCityChange }) => {
  const [inputValue, setInputValue] = useState(selectedCity);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Lista delle principali città italiane
  const italianCities = [
    'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 
    'Firenze', 'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova', 
    'Trieste', 'Brescia', 'Parma', 'Prato', 'Modena', 'Reggio Calabria',
    'Reggio Emilia', 'Perugia', 'Ravenna', 'Livorno', 'Cagliari', 'Foggia',
    'Rimini', 'Salerno', 'Ferrara', 'Sassari', 'Latina', 'Giugliano in Campania',
    'Monza', 'Syracusa', 'Pescara', 'Bergamo', 'Forlì', 'Trento', 'Vicenza',
    'Terni', 'Bolzano', 'Novara', 'Piacenza', 'Ancona', 'Andria', 'Arezzo',
    'Udine', 'Cesena', 'Lecce', 'Pesaro'
  ];

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
        <div className="flex items-center gap-3">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <div className="text-gray-400 text-xl">🔍</div>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
              placeholder="Cerca una città italiana (es. Roma, Milano...)"
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
              aria-label="Nome città"
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                {suggestions.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(city)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="mr-2">🏙️</span>
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            Cerca
          </button>
        </div>
      </form>
      
      {/* Current city display */}
      <div className="mt-4 text-center">
        <span className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          <span className="mr-2">📍</span>
          Città selezionata: {selectedCity}
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
