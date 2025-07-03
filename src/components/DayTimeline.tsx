"use client";

import React from 'react';

interface DayTimelineProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
}

const DayTimeline: React.FC<DayTimelineProps> = ({ selectedDay, onDayChange }) => {
  
  const getDayData = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let dayLabel = '';
      let dayValue = '';
      
      if (i === 0) {
        dayLabel = 'Oggi';
        dayValue = 'oggi';
      } else if (i === 1) {
        dayLabel = 'Domani';
        dayValue = 'domani';
      } else {
        dayLabel = date.toLocaleDateString('it-IT', { weekday: 'short' });
        dayValue = `+${i}giorni`;
      }
      
      const dateStr = date.toLocaleDateString('it-IT', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      days.push({
        label: dayLabel,
        value: dayValue,
        date: dateStr,
        fullDate: date,
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    
    return days;
  };

  const dayData = getDayData();

  const getWeatherIcon = (index: number) => {
    const icons = ['☀️', '⛅', '🌤️', '☁️', '🌦️', '🌧️', '⛈️'];
    return icons[index % icons.length];
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
        Seleziona il giorno
      </h2>
      
      <div className="relative">
        {/* Horizontal scrollable timeline */}
        <div className="flex gap-3 overflow-x-auto pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
          {dayData.map((day, index) => (
            <button
              key={day.value}
              onClick={() => onDayChange(day.value)}
              className={`flex-shrink-0 group relative transition-all duration-300 transform ${
                selectedDay === day.value 
                  ? 'scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              <div className={`
                relative p-4 rounded-2xl min-w-[100px] text-center border-2 transition-all duration-300
                ${selectedDay === day.value
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
                }
              `}>
                {/* Day label */}
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  selectedDay === day.value ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {day.label}
                </div>
                
                {/* Weather icon preview */}
                <div className="text-2xl mb-2">
                  {getWeatherIcon(index)}
                </div>
                
                {/* Date */}
                <div className={`text-sm font-medium ${
                  selectedDay === day.value ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {day.date}
                </div>
                
                {/* Selected indicator */}
                {selectedDay === day.value && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
                )}
                
                {/* Special badges */}
                {day.isToday && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    •
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Navigation gradient hints */}
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-blue-50 to-transparent dark:from-gray-800 pointer-events-none rounded-r-lg"></div>
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-blue-50 to-transparent dark:from-gray-800 pointer-events-none rounded-l-lg"></div>
      </div>
      
      {/* Current selection info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Previsioni per:</span>{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {dayData.find(d => d.value === selectedDay)?.label || selectedDay}
          </span>
          {dayData.find(d => d.value === selectedDay)?.date && (
            <span className="ml-1 text-gray-500">
              ({dayData.find(d => d.value === selectedDay)?.date})
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default DayTimeline;
