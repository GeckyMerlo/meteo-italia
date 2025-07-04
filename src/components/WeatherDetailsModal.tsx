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
      // Converti il giorno selezionato nel formato corretto per l'API oraria
      let dayParam: string;
      const today = new Date();
      
      if (day === 'oggi') {
        dayParam = today.getDate().toString();
      } else if (day === 'domani') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dayParam = tomorrow.getDate().toString();
      } else if (day.startsWith('+') && day.endsWith('giorni')) {
        // Estrai il numero da "+2giorni", "+3giorni", etc.
        const daysAhead = parseInt(day.replace('+', '').replace('giorni', ''));
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysAhead);
        dayParam = targetDate.getDate().toString();
      } else {
        // Fallback: prova a usare il valore direttamente
        dayParam = day;
      }
      
      // Carica i dati orari reali dall'API in base al provider
      let apiEndpoint = '';
      if (provider.toLowerCase().includes('3b meteo')) {
        apiEndpoint = `/api/3bMeteo/orari?city=${encodeURIComponent(city)}&day=${dayParam}`;
      } else if (provider.toLowerCase().includes('il meteo')) {
        apiEndpoint = `/api/ilMeteo/orari?city=${encodeURIComponent(city)}&day=${dayParam}`;
      } else {
        // Provider non supportato, usa 3B Meteo come fallback
        apiEndpoint = `/api/3bMeteo/orari?city=${encodeURIComponent(city)}&day=${dayParam}`;
      }
      
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      
      if (response.ok) {
        // Gestisci diversi formati di risposta dalle API
        let hourlyEntries: HourlyWeather[] = [];
        
        if (Array.isArray(data)) {
          // Formato diretto (array di dati orari)
          hourlyEntries = data;
        } else if (data.hourlyData && Array.isArray(data.hourlyData)) {
          // Formato con wrapper (es. ilMeteo)
          hourlyEntries = data.hourlyData;
        } else {
          // Formato non riconosciuto
          throw new Error('Formato dati non riconosciuto');
        }
        
        if (hourlyEntries.length > 0) {
          // L'API restituisce dati reali
          setHourlyData(hourlyEntries);
          setError(null);
        } else {
          // L'API restituisce un array vuoto (nessun dato reale disponibile)
          setHourlyData([]);
          setError(`Nessun dato orario disponibile per questo giorno su ${provider}.`);
        }
      } else {
        // Errore nell'API
        setHourlyData([]);
        setError('Errore nel caricamento dei dati orari.');
      }
    } catch (err) {
      console.error('[Modal] Errore nel caricamento dati orari:', err);
      // Nessun fallback ai dati mock, mostra solo errore
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
                {hourlyData.length === 4 ? 'Previsioni per Fasce Orarie' : 
                 hourlyData.length === 24 ? 'Previsioni Orarie Complete' : 
                 'Previsioni Orarie'}
              </h3>
              <div className="flex items-center space-x-4">
                {loading && (
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    <span className="text-sm">Caricamento...</span>
                  </div>
                )}
                {/* Show info about data type */}
                {!loading && hourlyData.length > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {hourlyData.length === 4 ? 
                      '4 fasce orarie (Notte, Mattina, Pomeriggio, Sera)' :
                      `${hourlyData.length} ore disponibili`
                    }
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
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center">
                  <div className="text-orange-700 dark:text-orange-300 font-medium">
                    ⚠️ {error}
                  </div>
                </div>
              </div>
            )}
            
            {/* No Data Message */}
            {!loading && !error && hourlyData.length === 0 && (
              <div className="mb-6 p-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  📊 Nessun dato orario disponibile
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  I dati orari per questo giorno non sono disponibili su 3B Meteo
                </div>
              </div>
            )}
            
            {/* Desktop Table */}
            {!loading && !error && hourlyData.length > 0 && (
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
                        <div className="flex items-center space-x-2">
                          <span>{hour.time}</span>
                          {hourlyData.length === 4 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {hour.time === '03:00' && '(Notte)'}
                              {hour.time === '09:00' && '(Mattina)'}
                              {hour.time === '15:00' && '(Pomeriggio)'}
                              {hour.time === '21:00' && '(Sera)'}
                            </span>
                          )}
                        </div>
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
            )}

            {/* Tablet Grid View */}
            {!loading && !error && hourlyData.length > 0 && (
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
            )}

            {/* Mobile Cards */}
            {!loading && !error && hourlyData.length > 0 && (
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
            )}
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
