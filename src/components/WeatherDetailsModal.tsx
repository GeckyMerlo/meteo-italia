"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye, CloudSnow, Zap } from 'lucide-react';

interface HourlyWeather {
  time: string;
  condition: string;
  temperature: string;
  precipitation: string;
  wind: string;
  humidity: string;
  feelsLike: string;
  icon: string;
}

interface WeatherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  city: string;
  day: string;
  hourlyData?: HourlyWeather[]; // Reso opzionale
}

const WeatherDetailsModal: React.FC<WeatherDetailsModalProps> = ({
  isOpen,
  onClose,
  provider,
  city,
  day,
  hourlyData: propHourlyData
}) => {
  const [hourlyData, setHourlyData] = useState<HourlyWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock hourly data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadHourlyData();
    }
  }, [isOpen, provider, city, day]);

  const loadHourlyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carica i dati orari reali dall'API
      const response = await fetch(`/api/meteo/orari?city=${encodeURIComponent(city)}&day=${day}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data) && data.length > 0) {
        // L'API restituisce già i dati nel formato corretto
        setHourlyData(data);
        setError(null);
      } else {
        // Fallback ai dati mock se non ci sono dati orari
        generateMockHourlyData();
        setError('Dati orari non disponibili, showing mock data.');
      }
    } catch (err) {
      console.error('[Modal] Errore nel caricamento dati orari:', err);
      // Fallback ai dati mock in caso di errore di rete
      generateMockHourlyData();
      setError(`Errore di rete: ${err instanceof Error ? err.message : 'Errore sconosciuto'}. Showing mock data.`);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHourlyData = () => {
    const mockData: HourlyWeather[] = [];
    for (let i = 0; i < 24; i += 3) {
      const baseTemp = 15 + Math.floor(Math.random() * 15);
      
      // Simula variazione temperatura durante il giorno
      let tempVariation = 0;
      if (i >= 6 && i <= 18) { // Giorno
        tempVariation = Math.floor(Math.random() * 8);
      } else { // Notte
        tempVariation = -Math.floor(Math.random() * 5);
      }
      
      const temperature = baseTemp + tempVariation;
      
      mockData.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        condition: ['sereno', 'poco nuvoloso', 'nuvoloso', 'coperto', 'piovoso'][Math.floor(Math.random() * 5)],
        temperature: `${temperature}°`,
        precipitation: `${Math.floor(Math.random() * 30)}%`,
        wind: `${5 + Math.floor(Math.random() * 20)} km/h`,
        humidity: `${40 + Math.floor(Math.random() * 40)}%`,
        feelsLike: `${temperature + Math.floor(Math.random() * 6) - 3}°`,
        icon: ''
      });
    }
    
    setHourlyData(mockData);
  };
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Weather icon mapping function
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sole') || cond.includes('sereno') || cond.includes('clear')) {
      return <Sun className="w-5 h-5 text-yellow-500" />;
    }
    if (cond.includes('nuvol') || cond.includes('coperto') || cond.includes('cloud')) {
      return <Cloud className="w-5 h-5 text-gray-500" />;
    }
    if (cond.includes('pioggia') || cond.includes('piovoso') || cond.includes('rain')) {
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    }
    if (cond.includes('neve') || cond.includes('snow')) {
      return <CloudSnow className="w-5 h-5 text-blue-300" />;
    }
    if (cond.includes('temporale') || cond.includes('storm')) {
      return <Zap className="w-5 h-5 text-purple-500" />;
    }
    return <Sun className="w-5 h-5 text-yellow-500" />;
  };

  // Provider styling
  const getProviderStyle = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case '3b meteo':
        return { gradient: 'from-blue-500 to-blue-600', logoEmoji: '🌤️' };
      case 'il meteo':
        return { gradient: 'from-green-500 to-green-600', logoEmoji: '🌍' };
      case 'meteoam':
        return { gradient: 'from-red-500 to-red-600', logoEmoji: '🇮🇹' };
      case 'meteo.it':
        return { gradient: 'from-purple-500 to-purple-600', logoEmoji: '📊' };
      default:
        return { gradient: 'from-gray-500 to-gray-600', logoEmoji: '🌐' };
    }
  };

  const providerStyle = getProviderStyle(provider);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Modal content
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      {/* Modal Content - Full Screen with responsive margins */}
      <div 
        className="absolute inset-2 md:inset-6 lg:inset-8 bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-2xl transform transition-transform duration-300 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Right Close Button - Always Visible */}
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-30 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl group"
          aria-label="Chiudi finestra"
          type="button"
        >
          <X className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
        
        {/* Header - Fixed */}
        <div className={`bg-gradient-to-r ${providerStyle.gradient} text-white p-4 md:p-6 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl md:text-3xl">{providerStyle.logoEmoji}</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">{provider}</h2>
                <p className="text-white text-opacity-90 text-sm md:text-lg">{city} - {day}</p>
              </div>
            </div>
            <button
              onClick={handleCloseClick}
              className="bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-3 md:p-4 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl group"
              aria-label="Chiudi"
              type="button"
            >
              <X className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-none">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                Previsioni Orarie Simulate
              </h3>
              <div className="flex items-center space-x-4">
                {loading && (
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    <span className="text-sm">Caricamento...</span>
                  </div>
                )}
                <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                  Premi <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ESC</kbd> per chiudere
                </div>
              </div>
            </div>
            
            {loading && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <div className="text-blue-700 dark:text-blue-300 font-medium">Caricamento dati orari...</div>
                </div>
              </div>
            )}
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Ora del Giorno
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Condizione
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Temperatura
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Precipitazioni
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Vento
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Umidità
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Temperatura Percepita
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hourlyData.map((hour, index) => (
                    <tr 
                      key={index} 
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {hour.time}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          {getWeatherIcon(hour.condition)}
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {hour.condition}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-lg font-semibold text-red-500 dark:text-red-400">
                          {hour.temperature}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {hour.precipitation}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Wind className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {hour.wind}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Eye className="w-4 h-4 text-cyan-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {hour.humidity}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {hour.feelsLike}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet Grid View */}
            <div className="hidden md:grid lg:hidden grid-cols-1 gap-4">
              {hourlyData.map((hour, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                >
                  <div className="grid grid-cols-7 gap-4 items-center text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {hour.time}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {getWeatherIcon(hour.condition)}
                      <span className="text-xs text-gray-700 dark:text-gray-300 capitalize hidden xl:block">
                        {hour.condition}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-red-500 dark:text-red-400">
                      {hour.temperature}
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.precipitation}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.wind}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.humidity}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.feelsLike}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {hourlyData.map((hour, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {hour.time}
                    </span>
                    <span className="text-xl font-bold text-red-500 dark:text-red-400">
                      {hour.temperature}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-3">
                    {getWeatherIcon(hour.condition)}
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {hour.condition}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.precipitation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.wind}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.humidity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.feelsLike}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal outside of the card's DOM hierarchy
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default WeatherDetailsModal;
