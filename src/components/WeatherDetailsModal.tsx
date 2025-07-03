"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye, CloudSnow, Zap } from 'lucide-react';

interface HourlyWeather {
  hour: string;
  condition: string;
  temperature: number;
  precipitation: number;
  wind: string;
  humidity: number;
  feelsLike: number;
  icon: string;
}

interface WeatherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  city: string;
  day: string;
  hourlyData: HourlyWeather[];
}

const WeatherDetailsModal: React.FC<WeatherDetailsModalProps> = ({
  isOpen,
  onClose,
  provider,
  city,
  day,
  hourlyData
}) => {
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
                Previsioni Orarie Dettagliate
              </h3>
              <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                Premi <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">ESC</kbd> per chiudere
              </div>
            </div>
            
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
                        {hour.hour}
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
                          {hour.temperature}°C
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {hour.precipitation}%
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
                            {hour.humidity}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {hour.feelsLike}°C
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
                      {hour.hour}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {getWeatherIcon(hour.condition)}
                      <span className="text-xs text-gray-700 dark:text-gray-300 capitalize hidden xl:block">
                        {hour.condition}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-red-500 dark:text-red-400">
                      {hour.temperature}°C
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.precipitation}%</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.wind}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{hour.feelsLike}°C</span>
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
                      {hour.hour}
                    </span>
                    <span className="text-xl font-bold text-red-500 dark:text-red-400">
                      {hour.temperature}°C
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
                      <span className="text-gray-700 dark:text-gray-300">{hour.precipitation}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.wind}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.humidity}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">{hour.feelsLike}°C</span>
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
