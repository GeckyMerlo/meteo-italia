"use client";

import React from 'react';
import { WeatherData } from './index';
import { getWeatherCardComponent } from './utils';

interface SmartWeatherCardProps {
  weatherData: WeatherData;
  loading?: boolean;
}

const SmartWeatherCard: React.FC<SmartWeatherCardProps> = ({ weatherData, loading }) => {
  const WeatherCardComponent = getWeatherCardComponent(weatherData.provider);
  
  return (
    <WeatherCardComponent 
      weatherData={weatherData} 
      loading={loading} 
    />
  );
};

export default SmartWeatherCard;
