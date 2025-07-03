'use client';
import SearchBar from '@/components/SearchBar';
import DayTimeline from '@/components/DayTimeline';
import WeatherCard from '@/components/WeatherCard';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useState, useEffect } from 'react';

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

interface WeatherResponse {
  city: string;
  day: string;
  forecasts: WeatherData[];
  cached: boolean;
  timestamp: string;
  disclaimer?: string;
}

const HomePage = () => {
  const [selectedCity, setSelectedCity] = useState('Roma');
  const [selectedDay, setSelectedDay] = useState('oggi');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data when city or day changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/meteo?city=${encodeURIComponent(selectedCity)}&day=${encodeURIComponent(selectedDay)}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Errore ${response.status}: ${errorText}`);
        }
        
        const data: WeatherResponse = await response.json();
        
        if (data.forecasts && Array.isArray(data.forecasts)) {
          setWeatherData(data.forecasts);
        } else {
          throw new Error('Formato dati non valido ricevuto dal server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto nel caricamento dati');
        setWeatherData([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent too many requests
    const timeoutId = setTimeout(fetchWeatherData, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCity, selectedDay]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="text-7xl mr-4 animate-bounce">🌤️</div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Meteo Italia
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl">
                Confronta le previsioni dai principali provider italiani
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mb-4">
            <ThemeSwitcher />
          </div>
          
          {/* Provider badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['3B Meteo', 'Il Meteo', 'MeteoAM', 'Meteo.it'].map((provider, index) => (
              <span 
                key={provider}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {provider}
              </span>
            ))}
          </div>
        </header>
        
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
            <SearchBar 
              selectedCity={selectedCity} 
              onCityChange={setSelectedCity} 
            />
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
            <DayTimeline 
              selectedDay={selectedDay} 
              onDayChange={setSelectedDay} 
            />
          </div>
          
          {/* Weather Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Previsioni per {selectedCity} - {selectedDay}
              </h2>
              {loading && (
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Caricamento...
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-red-500 text-4xl">⚠️</div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                    Errore nel caricamento
                  </h3>
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      // Trigger a re-fetch
                      const event = new CustomEvent('retry-fetch');
                      window.dispatchEvent(event);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Riprova
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <WeatherCard 
                    key={`skeleton-${index}`}
                    weatherData={{
                      provider: `Provider ${index + 1}`,
                      city: selectedCity,
                      day: selectedDay,
                      status: 'success',
                      lastUpdated: new Date().toISOString()
                    }}
                    loading={true}
                  />
                ))
              ) : weatherData.length > 0 ? (
                weatherData.map((data, index) => (
                  <div 
                    key={data.provider || index}
                    className="weather-card-enter"
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <WeatherCard 
                      weatherData={data}
                      loading={false}
                    />
                  </div>
                ))
              ) : !error && !loading ? (
                // Empty state when no data and no error
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Cerca una città per iniziare
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Inserisci il nome di una città italiana per vedere le previsioni
                  </p>
                </div>
              ) : null}
              
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="col-span-full text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  Debug: Loading={loading.toString()}, Error={error || 'none'}, Data count={weatherData.length}
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <footer className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-2 text-sm">
                <span>🌟</span>
                <span>Dati a scopo dimostrativo. Non affiliato con i provider meteorologici ufficiali.</span>
              </div>
              <div className="flex justify-center items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1">
                  <span>⚡</span>
                  <span>Powered by Next.js 15</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>🎨</span>
                  <span>Styled with Tailwind CSS</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>🚀</span>
                  <span>Hosted on Vercel</span>
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                <p className="text-xs text-gray-400">
                  © 2025 Meteo Italia - Un progetto dimostrativo per confrontare previsioni meteorologiche
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
