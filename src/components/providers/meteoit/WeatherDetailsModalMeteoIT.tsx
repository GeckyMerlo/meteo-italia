"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye, CloudSnow, Zap } from 'lucide-react';

interface HourlyWeatherMeteoIT {
  time: string;
  condition: string;
  temperature: string;
  precipitation: string;
  wind: string;
  humidity: string;
  feelsLike: string;
  icon: string;
}

interface WeatherDetailsModalMeteoITProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  city: string;
  day: string;
}

const WeatherDetailsModalMeteoIT: React.FC<WeatherDetailsModalMeteoITProps> = ({
  isOpen,
  onClose,
  provider,
  city,
  day
}) => {
  const [hourlyData, setHourlyData] = useState<HourlyWeatherMeteoIT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHourlyData();
    }
  }, [isOpen, provider, city, day]);

  const loadHourlyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/MeteoIT/orari?city=${encodeURIComponent(city)}&day=${day}`);
      const data = await response.json();
      
      if (response.ok && data.hourlyData) {
        setHourlyData(data.hourlyData);
      } else {
        throw new Error(data.error || 'Errore nel caricamento dei dati orari');
      }
    } catch (err) {
      console.error('Errore caricamento dati orari Meteo.it:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

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

  const getDayLabel = () => {
    switch (day) {
      case '0':
        return 'Oggi';
      case '1':
        return 'Domani';
      default:
        return `Giorno ${day}`;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('soleggiato') || conditionLower.includes('sereno')) {
      return '☀️';
    } else if (conditionLower.includes('nuvoloso')) {
      return '☁️';
    } else if (conditionLower.includes('pioggia')) {
      return '🌧️';
    } else if (conditionLower.includes('temporale')) {
      return '⛈️';
    } else if (conditionLower.includes('neve')) {
      return '❄️';
    }
    return '🌤️';
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                📊
              </div>
              <div>
                <h2 className="text-xl font-bold">Meteo.it - Previsioni Orarie</h2>
                <div className="flex items-center space-x-4 text-purple-100 text-sm">
                  <span>📍 {city}</span>
                  <span>📅 {getDayLabel()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <span className="ml-4 text-gray-600 dark:text-gray-400">
                Caricamento previsioni orarie...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Errore nel caricamento
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && hourlyData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Previsioni orarie non disponibili
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Meteo.it non fornisce previsioni orarie dettagliate per questa località.
              </p>
            </div>
          )}

          {!loading && hourlyData.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Previsioni per {getDayLabel()}
              </h3>
              <div className="grid gap-3">
                {hourlyData.map((hour, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                      {/* Ora */}
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {hour.time}
                        </span>
                      </div>

                      {/* Condizione */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getWeatherIcon(hour.condition)}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                          {hour.condition}
                        </span>
                      </div>

                      {/* Temperatura */}
                      <div className="flex items-center space-x-1">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {hour.temperature}
                        </span>
                      </div>

                      {/* Vento */}
                      <div className="flex items-center space-x-1">
                        <Wind className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {hour.wind}
                        </span>
                      </div>

                      {/* Umidità */}
                      <div className="flex items-center space-x-1">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {hour.humidity}
                        </span>
                      </div>

                      {/* Precipitazioni */}
                      <div className="flex items-center space-x-1">
                        <CloudRain className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {hour.precipitation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Dati forniti da Meteo.it</span>
            <span>📊 Provider meteo specializzato</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render using portal
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default WeatherDetailsModalMeteoIT;
