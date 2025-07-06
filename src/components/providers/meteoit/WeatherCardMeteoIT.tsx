"use client";

import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, TrendingUp, AlertTriangle, Check, X, MousePointer } from 'lucide-react';
import WeatherDetailsModalMeteoIT from './WeatherDetailsModalMeteoIT';

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
}

interface WeatherCardMeteoITProps {
  weatherData: WeatherData;
  loading?: boolean;
}

const WeatherCardMeteoIT: React.FC<WeatherCardMeteoITProps> = ({ weatherData, loading }) => {
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
    weatherIconUrl
  } = weatherData;

  const handleCardClick = () => {
    if (status === 'success') {
      setIsModalOpen(true);
    }
  };

  const getProviderStyle = () => {
    return {
      gradient: 'from-purple-500 to-purple-600',
      logoEmoji: '📊', // Mantengo emoji per ora, da sostituire quando avremo il logo
      accentColor: 'purple'
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
            ? 'border-transparent hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer hover:shadow-xl transform hover:scale-105' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onClick={handleCardClick}
      >
        {/* Header con provider e status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${providerStyle.gradient} flex items-center justify-center text-white font-bold text-sm`}>
              {providerStyle.logoEmoji}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {provider}
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
                  <Wind className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 dark:text-gray-300">{wind}</span>
                </div>
              )}
              {humidity && (
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-purple-500" />
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

            {/* Footer */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Aggiornato: {lastUpdated}
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
        <WeatherDetailsModalMeteoIT
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

export default WeatherCardMeteoIT;
