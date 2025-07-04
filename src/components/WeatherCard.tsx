"use client";

import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, TrendingUp, AlertTriangle, Check, X, MousePointer } from 'lucide-react';
import WeatherDetailsModal from './WeatherDetailsModal';

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

interface WeatherCardProps {
  weatherData: WeatherData;
  loading?: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, loading }) => {
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
    lastUpdated
  } = weatherData;

  const handleCardClick = () => {
    if (status === 'success') {
      setIsModalOpen(true);
    }
  };

  // Provider-specific styling
  const getProviderStyle = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case '3b meteo':
        return {
          gradient: 'from-blue-500 to-blue-600',
          logoEmoji: '🌤️',
          accent: 'blue',
          border: 'border-blue-200 dark:border-blue-800'
        };
      case 'il meteo':
        return {
          gradient: 'from-green-500 to-green-600',
          logoEmoji: '🌦️',
          accent: 'green',
          border: 'border-green-200 dark:border-green-800'
        };
      case 'meteoam':
        return {
          gradient: 'from-orange-500 to-orange-600',
          logoEmoji: '⛅',
          accent: 'orange',
          border: 'border-orange-200 dark:border-orange-800'
        };
      case 'meteo.it':
        return {
          gradient: 'from-purple-500 to-purple-600',
          logoEmoji: '☀️',
          accent: 'purple',
          border: 'border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          logoEmoji: '🌥️',
          accent: 'gray',
          border: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const providerStyle = getProviderStyle(provider);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error or unavailable state
  if (status === 'error' || status === 'unavailable') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border ${providerStyle.border} relative overflow-hidden`}>
        {/* Provider header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{provider}</h3>
          <div className="text-2xl">{providerStyle.logoEmoji}</div>
        </div>
        
        {/* Error content */}
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            {status === 'error' ? 'Errore nel caricamento' : 'Dati non disponibili'}
          </p>
          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Ultimo aggiornamento: {new Date(lastUpdated).toLocaleString('it-IT')}
          </p>
        </div>

        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${providerStyle.gradient} opacity-5 pointer-events-none`}></div>
      </div>
    );
  }

  // Weather icon mapping
  const getWeatherIcon = (description: string = '') => {
    const desc = description.toLowerCase();
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

  // Reliability badge
  const getReliabilityBadge = (reliability: string = '') => {
    const rel = reliability.toLowerCase();
    if (rel.includes('alta') || rel.includes('buona') || rel.includes('high')) {
      return { 
        icon: <Check className="w-4 h-4" />, 
        color: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
        text: 'Alta'
      };
    }
    if (rel.includes('media') || rel.includes('moderata') || rel.includes('medium')) {
      return { 
        icon: <TrendingUp className="w-4 h-4" />, 
        color: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
        text: 'Media'
      };
    }
    if (rel.includes('bassa') || rel.includes('low')) {
      return { 
        icon: <X className="w-4 h-4" />, 
        color: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300',
        text: 'Bassa'
      };
    }
    return { 
      icon: <TrendingUp className="w-4 h-4" />, 
      color: 'text-gray-700 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300',
      text: 'N/A'
    };
  };

  const reliabilityBadge = getReliabilityBadge(reliability);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border ${providerStyle.border} group relative overflow-hidden ${status === 'success' ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header with provider name and reliability */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{provider}</h3>
          {reliability && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reliabilityBadge.color}`}>
              {reliabilityBadge.icon}
              <span className="ml-1">{reliabilityBadge.text}</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {providerLogo && providerLogo.startsWith('/images/') ? (
            <img src={providerLogo} alt={provider} className="h-8 w-8 object-contain" />
          ) : (
            <div className="text-3xl">{providerLogo || providerStyle.logoEmoji}</div>
          )}
          {status === 'success' && (
            <MousePointer className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
          )}
        </div>
      </div>

      {/* Main weather info */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          {getWeatherIcon(weatherDescription)}
        </div>
        
        {/* Temperature */}
        <div className="flex items-center justify-center space-x-2 mb-3">
          {maxTemp && (
            <span className="text-3xl font-bold text-red-500 dark:text-red-400">
              {maxTemp}°
            </span>
          )}
          {minTemp && (
            <span className="text-xl text-gray-500 dark:text-gray-400">
              / {minTemp}°
            </span>
          )}
        </div>
        
        {/* Weather description */}
        {weatherDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium capitalize leading-relaxed">
            {weatherDescription}
          </p>
        )}
      </div>

      {/* Additional info */}
      <div className="space-y-3">
        {wind && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center">
              <Wind className="w-4 h-4 mr-2" />
              Vento
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{wind}</span>
          </div>
        )}
        
        {humidity && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center">
              <Droplets className="w-4 h-4 mr-2" />
              Umidità
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{humidity}</span>
          </div>
        )}
      </div>

      {/* Click indicator for successful cards */}
      {status === 'success' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-200">
            Clicca per previsioni orarie dettagliate
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Aggiornato: {new Date(lastUpdated).toLocaleTimeString('it-IT')}
        </p>
      </div>

      {/* Hover effect gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${providerStyle.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
      
      {/* Weather Details Modal */}
      <WeatherDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={provider}
        city={city}
        day={day}
      />
    </div>
  );
};

export default WeatherCard;