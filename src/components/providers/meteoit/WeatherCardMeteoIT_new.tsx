"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Thermometer, Wind, Droplets, Sun, Cloud, CloudRain, AlertTriangle, Check, X } from 'lucide-react';
import WeatherDetailsModalMeteoIT from './WeatherDetailsModalMeteoIT';

interface WeatherData {
  provider: string;
  city: string;
  cityCode?: string;
  days?: Array<{
    day: number;
    temperature: string;
    condition: string;
    href: string;
  }>;
  // Legacy fields for backward compatibility
  providerLogo?: string;
  day?: string;
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
  weatherData?: WeatherData;
  data?: WeatherData;
  loading?: boolean;
}

const WeatherCardMeteoIT: React.FC<WeatherCardMeteoITProps> = ({ weatherData, data, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('0');

  // Support both prop names for backward compatibility
  const actualData = weatherData || data;

  if (!actualData) {
    return null;
  }

  const handleDetailsClick = (day: string) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    if (actualData.status === 'success') {
      setIsModalOpen(true);
    }
  };

  const formatCityName = (city: string) => {
    return city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');
  };

  const getWeatherIcon = (condition?: string) => {
    if (actualData.weatherIconUrl) {
      return (
        <img 
          src={actualData.weatherIconUrl} 
          alt={actualData.weatherDescription || 'Weather icon'} 
          className="w-12 h-12 object-contain"
        />
      );
    }
    
    const desc = (condition || actualData.weatherDescription || '').toLowerCase();
    if (desc.includes('sole') || desc.includes('sereno') || desc.includes('soleggiato') || desc.includes('clear')) {
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

  const getCurrentDayName = () => {
    const today = new Date();
    return today.toLocaleDateString('it-IT', { weekday: 'long' });
  };

  const getDayName = (dayOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toLocaleDateString('it-IT', { weekday: 'short' });
  };

  const getStatusIcon = () => {
    switch (actualData.status) {
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

  const getDayLabel = () => {
    switch (actualData.day) {
      case 'oggi':
        return 'Oggi';
      case 'domani':
        return 'Domani';
      default:
        return actualData.day;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // New format with days array
  if (actualData.days && actualData.days.length > 0) {
    return (
      <>
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                📊 Meteo.it
                <span className="text-sm font-normal opacity-90">
                  {formatCityName(actualData.city)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDetailsClick('0')}
                className="text-white hover:bg-purple-400/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Condizioni attuali */}
            <div className="text-center space-y-2">
              <div className="text-4xl">
                {getWeatherIcon(actualData.days[0].condition)}
              </div>
              <div className="text-2xl font-bold">
                {actualData.days[0].temperature}
                {actualData.days[0].temperature !== 'N/A' && '°C'}
              </div>
              <div className="text-sm opacity-90">
                {actualData.days[0].condition}
              </div>
              <div className="text-xs opacity-80">
                {getCurrentDayName()}
              </div>
            </div>

            {/* Previsioni prossimi giorni */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4" />
                Previsioni
              </div>
              <div className="grid grid-cols-3 gap-2">
                {actualData.days.slice(1, 4).map((day, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDetailsClick((index + 1).toString())}
                    className="flex flex-col items-center p-2 text-white hover:bg-purple-400/20 h-auto"
                  >
                    <div className="text-xs opacity-80">
                      {getDayName(index + 1)}
                    </div>
                    <div className="text-lg">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className="text-sm font-semibold">
                      {day.temperature}
                      {day.temperature !== 'N/A' && '°'}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Statistiche rapide */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-purple-400/30">
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Thermometer className="h-4 w-4 opacity-80" />
                </div>
                <div className="text-xs opacity-80">Temp</div>
                <div className="text-sm font-semibold">
                  {actualData.days[0].temperature}
                  {actualData.days[0].temperature !== 'N/A' && '°'}
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Wind className="h-4 w-4 opacity-80" />
                </div>
                <div className="text-xs opacity-80">Vento</div>
                <div className="text-sm font-semibold">N/A</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  <Droplets className="h-4 w-4 opacity-80" />
                </div>
                <div className="text-xs opacity-80">Umidità</div>
                <div className="text-sm font-semibold">N/A</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal per dettagli orari */}
        <WeatherDetailsModalMeteoIT
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          city={actualData.city}
          day={selectedDay}
        />
      </>
    );
  }

  // Legacy format fallback
  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 border-2 ${
          actualData.status === 'success' 
            ? 'border-transparent hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer hover:shadow-xl transform hover:scale-105' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onClick={handleCardClick}
      >
        {/* Header con provider e status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              📊
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {actualData.provider}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getDayLabel()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
          </div>
        </div>

        {/* Contenuto principale */}
        {actualData.status === 'success' ? (
          <div className="space-y-4">
            {/* Temperatura e icona */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-2">
                  {actualData.maxTemp && (
                    <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      {actualData.maxTemp}
                    </span>
                  )}
                  {actualData.minTemp && (
                    <span className="text-lg text-gray-500 dark:text-gray-400">
                      {actualData.minTemp}
                    </span>
                  )}
                </div>
                {actualData.weatherDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {actualData.weatherDescription}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {getWeatherIcon()}
              </div>
            </div>

            {/* Dettagli aggiuntivi */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vento</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {actualData.wind || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Umidità</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {actualData.humidity || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Aggiornato: {actualData.lastUpdated}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              {actualData.status === 'error' && (
                <X className="w-12 h-12 text-red-500 mx-auto" />
              )}
              {actualData.status === 'unavailable' && (
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
              )}
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {actualData.status === 'error' ? 'Errore' : 'Non disponibile'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {actualData.message || 'Dati non disponibili'}
            </p>
          </div>
        )}
      </div>

      {/* Modal per dettagli orari */}
      {isModalOpen && (
        <WeatherDetailsModalMeteoIT
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          city={actualData.city}
          day={actualData.day || '0'}
        />
      )}
    </>
  );
};

export default WeatherCardMeteoIT;
