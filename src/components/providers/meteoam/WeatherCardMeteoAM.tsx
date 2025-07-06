"use client";

import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, TrendingUp, AlertTriangle, Check, X, MousePointer, Info } from 'lucide-react';
import WeatherDetailsModalMeteoAM from './WeatherDetailsModalMeteoAM';

interface WeatherData {
  provider: string;
  providerLogo?: string;
  city: string;
  day: string;
  maxTemp?: string;
  minTemp?: string;
  weatherIconUrl?: string;
  weatherDescription?: string;
  wind?: string;
  humidity?: string;
  reliability?: string;
  status: 'success' | 'error' | 'unavailable';
  message?: string;
  lastUpdated: string;
  hasDataWarning?: boolean; // Nuovo campo per il warning
}

interface WeatherCardMeteoAMProps {
  weatherData: WeatherData;
  loading?: boolean;
}

const WeatherCardMeteoAM: React.FC<WeatherCardMeteoAMProps> = ({ weatherData, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    provider,
    providerLogo,
    city,
    day,
    maxTemp,
    minTemp,
    weatherDescription,
    wind,
    humidity,
    reliability,
    status,
    message,
    lastUpdated,
    weatherIconUrl,
    hasDataWarning
  } = weatherData;

  const handleCardClick = () => {
    if (status === 'success') {
      setIsModalOpen(true);
    }
  };

  const getProviderStyle = () => {
    return {
      gradient: 'from-red-500 to-red-600',
      logoPath: '/images/AMLogo.gif',
      accentColor: 'red'
    };
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'unavailable':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getWeatherIcon = () => {
    if (weatherIconUrl) {
      return (
        <img 
          src={weatherIconUrl} 
          alt={weatherDescription || 'Weather icon'} 
          className="w-12 h-12 object-contain"
        />
      );
    }
    
    // Fallback icon based on description
    const desc = weatherDescription?.toLowerCase() || '';
    if (desc.includes('sole') || desc.includes('sereno') || desc.includes('clear')) {
      return <Sun className="w-12 h-12 text-yellow-500" />;
    }
    if (desc.includes('nuvol') || desc.includes('coperto') || desc.includes('cloud')) {
      return <Cloud className="w-12 h-12 text-gray-500" />;
    }
    if (desc.includes('pioggia') || desc.includes('piovoso') || desc.includes('rain')) {
      return <CloudRain className="w-12 h-12 text-blue-500" />;
    }
    return <Sun className="w-12 h-12 text-yellow-500" />;
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

  const providerStyle = getProviderStyle();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 border-2 ${
          status === 'success' 
            ? 'border-transparent hover:border-red-300 dark:hover:border-red-500 cursor-pointer hover:shadow-xl transform hover:scale-105' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onClick={handleCardClick}
      >
        {/* Header con provider e status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${providerStyle.gradient} flex items-center justify-center p-1`}>
              <img 
                src={providerStyle.logoPath} 
                alt={provider}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {provider}
                {weatherDescription && weatherDescription.includes('(dati attuali') && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    <Info className="w-2.5 h-2.5" />
                    Attuali
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getDayLabel()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            {status === 'success' && (
              <MousePointer className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Contenuto principale */}
        {status === 'success' ? (
          <div className="space-y-4">
            {/* Temperatura e icona */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-2">
                  {maxTemp && (
                    <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      {maxTemp}
                    </span>
                  )}
                  {minTemp && (
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      {minTemp}
                    </span>
                  )}
                </div>
                {weatherDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {weatherDescription}
                    {weatherDescription.includes('(dati attuali') && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
                        <Info className="w-3 h-3" />
                        MeteoAM fornisce solo dati attuali, non previsioni
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {getWeatherIcon()}
              </div>
            </div>

            {/* Dettagli aggiuntivi */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {wind && (
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-300">{wind}</span>
                </div>
              )}
              {humidity && (
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-300">{humidity}</span>
                </div>
              )}
              {reliability && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">{reliability}</span>
                </div>
              )}
            </div>

            {/* Warning per assenza di dati previsionali */}
            {hasDataWarning && (
              <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    Dati previsionali non disponibili
                  </span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  MeteoAM fornisce solo dati meteorologici attuali, non previsioni per i giorni futuri.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Aggiornato: {new Date(lastUpdated).toLocaleString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              {status === 'error' && (
                <X className="w-12 h-12 text-red-500 mx-auto" />
              )}
              {status === 'unavailable' && (
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
              )}
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {status === 'error' ? 'Errore' : 'Non disponibile'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message || 'Dati non disponibili'}
            </p>
          </div>
        )}
      </div>

      {/* Modal per dettagli orari */}
      {isModalOpen && (
        <WeatherDetailsModalMeteoAM
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          provider={provider}
          city={city}
          day={day}
        />
      )}
    </>
  );
};

export default WeatherCardMeteoAM;
