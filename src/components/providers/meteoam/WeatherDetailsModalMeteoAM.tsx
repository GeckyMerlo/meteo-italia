"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye, CloudSnow, Zap } from 'lucide-react';

interface HourlyWeatherMeteoAM {
  hour: string;
  timestamp: string;
  temperature: number | null;
  condition: string;
  humidity: number | null;
  wind: number | null;
  windDirection: number | string | null;
  pressure: number | null;
  icon: string;
  precipitationProbability: number;
}

interface WeatherDetailsModalMeteoAMProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  city: string;
  day: string;
}

const WeatherDetailsModalMeteoAM: React.FC<WeatherDetailsModalMeteoAMProps> = ({
  isOpen,
  onClose,
  provider,
  city,
  day
}) => {
  const [hourlyData, setHourlyData] = useState<HourlyWeatherMeteoAM[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDataWarning, setHasDataWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHourlyData();
    }
  }, [isOpen, provider, city, day]);

  const loadHourlyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Converti il giorno selezionato nel formato corretto per MeteoAM API
      let dayParam: string;
      
      if (day === 'oggi') {
        dayParam = 'oggi';
      } else if (day === 'domani') {
        dayParam = 'domani';
      } else if (day === 'dopodomani') {
        dayParam = 'dopodomani';
      } else if (day.startsWith('+') && day.endsWith('giorni')) {
        // Estrai il numero da "+2giorni", "+3giorni", etc.
        const daysAhead = parseInt(day.replace('+', '').replace('giorni', ''));
        if (daysAhead === 2) {
          dayParam = 'dopodomani';
        } else {
          dayParam = day;
        }
      } else {
        // Fallback: prova a usare il valore direttamente
        dayParam = day;
      }
      
      const apiEndpoint = `/api/MeteoAM/orari?city=${encodeURIComponent(city)}&day=${dayParam}`;
      
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      
      if (response.ok) {
        // Gestisci la risposta specifica dell'API MeteoAM
        if (data.hourlyData && Array.isArray(data.hourlyData)) {
          // I dati sono già nel formato corretto dall'API MeteoAM
          setHourlyData(data.hourlyData);
          setHasDataWarning(data.hasDataWarning || false);
          setWarningMessage(data.warningMessage || null);
          setError(null);
        } else if (Array.isArray(data)) {
          // Fallback se i dati sono direttamente in un array
          setHourlyData(data);
          setHasDataWarning(false);
          setWarningMessage(null);
          setError(null);
        } else {
          setHourlyData([]);
          setHasDataWarning(data.hasDataWarning || false);
          setWarningMessage(data.warningMessage || null);
          setError(data.hasDataWarning ? null : 'Nessun dato orario disponibile per questo giorno su MeteoAM.');
        }
      } else {
        setHourlyData([]);
        setHasDataWarning(false);
        setWarningMessage(null);
        setError(data.error || 'Errore nel caricamento dei dati orari da MeteoAM.');
      }
    } catch (err) {
      console.error('[MeteoAM Modal] Errore nel caricamento dati orari:', err);
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

  // Weather icon mapping function specific to MeteoAM
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
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center p-1">
              <img 
                src="/images/AMLogo.gif" 
                alt="MeteoAM"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">MeteoAM</h2>
              <p className="text-red-100">Aeronautica Militare - Previsioni ufficiali</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-red-100">
            <span>📍 {city}</span>
            <span>📅 {getDayLabel()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Caricamento dati orari...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <CloudRain className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Ops! Qualcosa è andato storto
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={loadHourlyData}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Riprova
              </button>
            </div>
          )}

          {/* Warning per assenza dati previsionali */}
          {!loading && !error && hasDataWarning && (
            <div className="text-center py-12">
              <div className="text-orange-500 mb-4">
                <Eye className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Dati previsionali non disponibili
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {warningMessage || "MeteoAM fornisce solo dati meteorologici attuali, non previsioni per i giorni futuri."}
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  💡 <strong>Suggerimento:</strong> Prova a visualizzare i dati per "oggi" per vedere le condizioni meteorologiche attuali.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && hourlyData.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hourlyData.map((hour, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {/* Time and condition */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {hour.hour}
                      </span>
                      {getWeatherIcon(hour.condition)}
                    </div>

                    {/* Condition */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center capitalize">
                      {hour.condition}
                    </div>

                    {/* Temperature */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {hour.temperature !== null ? `${hour.temperature}°C` : 'N/A'}
                      </span>
                    </div>

                    {/* Weather details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CloudRain className="w-4 h-4 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-300">Precipitazioni</span>
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                          {hour.precipitationProbability}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-4 h-4 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-300">Vento</span>
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                          {hour.wind !== null ? `${hour.wind} km/h` : 'N/A'}
                          {hour.windDirection && hour.windDirection !== 'VRB' && (
                            <span className="text-xs text-gray-500 ml-1">
                              {typeof hour.windDirection === 'number' ? `${hour.windDirection}°` : hour.windDirection}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-red-500" />
                          <span className="text-gray-600 dark:text-gray-300">Umidità</span>
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                          {hour.humidity !== null ? `${hour.humidity}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info footer */}
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-red-700 dark:text-red-300">
                  <Eye className="w-4 h-4" />
                  <span>
                    Dati ufficiali dell'Aeronautica Militare - Aggiornato in tempo reale
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WeatherDetailsModalMeteoAM;
