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
      // Per ora Meteo.it non ha un'API oraria implementata
      // Mostriamo un messaggio informativo
      setHourlyData([]);
      setError('Le previsioni orarie per Meteo.it non sono ancora disponibili. Stiamo lavorando per implementarle presto!');
    } catch (err) {
      console.error('[Meteo.it Modal] Errore nel caricamento dati orari:', err);
      setHourlyData([]);
      setError(`Errore di rete: ${err instanceof Error ? err.message : 'Errore sconosciuto'}.`);
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
      case 'oggi':
        return 'Oggi';
      case 'domani':
        return 'Domani';
      default:
        return day;
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              📊
            </div>
            <div>
              <h2 className="text-2xl font-bold">Meteo.it</h2>
              <p className="text-purple-100">Previsioni orarie dettagliate</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-purple-100">
            <span>📍 {city}</span>
            <span>📅 {getDayLabel()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Caricamento dati orari...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-purple-500 mb-4">
                <Cloud className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Funzionalità in arrivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                      Sviluppo in corso
                    </h4>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Le previsioni orarie di Meteo.it saranno presto disponibili. Nel frattempo, 
                      puoi utilizzare le previsioni giornaliere o provare gli altri servizi meteo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && hourlyData.length > 0 && (
            <div className="space-y-4">
              {/* Questo blocco sarà implementato quando avremo l'API */}
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300">
                  Dati orari non ancora disponibili
                </p>
              </div>
            </div>
          )}

          {/* Info footer */}
          <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-purple-700 dark:text-purple-300">
              <Eye className="w-4 h-4" />
              <span>
                Meteo.it - Previsioni in fase di sviluppo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WeatherDetailsModalMeteoIT;
