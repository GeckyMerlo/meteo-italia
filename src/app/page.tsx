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

interface ApiDayData {
  day: number;
  icon: string;
  min: number | null;
  max: number | null;
}

interface ApiResponse {
  provider: string;
  city: string;
  day?: number;
  icon?: string;
  min?: number | null;
  max?: number | null;
  days?: ApiDayData[];
  error?: string;
  weatherDescription?: string;
  maxTemp?: string;
  minTemp?: string;
  wind?: string;
  humidity?: string;
}

const HomePage = () => {
  const [selectedCity, setSelectedCity] = useState('Roma');
  const [selectedDay, setSelectedDay] = useState('oggi');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Gestisci l'hydration per evitare flash
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch weather data when city or day changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Converti il giorno selezionato in numero per l'API
        let dayNumber: number;
        const today = new Date();
        
        if (selectedDay === 'oggi') {
          dayNumber = today.getDate();
        } else if (selectedDay === 'domani') {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          dayNumber = tomorrow.getDate();
        } else if (selectedDay.startsWith('+') && selectedDay.endsWith('giorni')) {
          // Estrai il numero da "+2giorni", "+3giorni", etc.
          const daysAhead = parseInt(selectedDay.replace('+', '').replace('giorni', ''));
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + daysAhead);
          dayNumber = targetDate.getDate();
        } else {
          dayNumber = parseInt(selectedDay);
        }
        
        // Trasforma i dati dell'API nel formato WeatherData
        const weatherData: WeatherData[] = [];
        
        // Chiama l'API reale per 3B Meteo
        try {
          const response = await fetch(`/api/3bMeteo?city=${encodeURIComponent(selectedCity.toLowerCase())}&day=${dayNumber}`);
          
          if (response.ok) {
            const data: ApiResponse = await response.json();
            
            // Controlla se abbiamo ricevuto dati per il giorno specifico
            if (data.provider === '3bmeteo' && data.day !== undefined) {
              weatherData.push({
                provider: '3B Meteo',
                providerLogo: '/images/3BMeteoLogo.png', // Updated to match actual filename
                city: selectedCity,
                day: selectedDay,
                maxTemp: data.maxTemp || data.max?.toString() || 'N/A',
                minTemp: data.minTemp || data.min?.toString() || 'N/A',
                weatherIconUrl: data.icon || '',
                weatherDescription: data.weatherDescription || 'Previsioni da 3B Meteo',
                wind: data.wind || 'N/A',
                humidity: data.humidity || 'N/A',
                reliability: 'alta',
                status: 'success',
                lastUpdated: new Date().toISOString()
              });
            } else if (data.days && Array.isArray(data.days)) {
              // Se abbiamo tutti i giorni del mese, trova quello richiesto
              const requestedDay = data.days.find((d: ApiDayData) => d.day === dayNumber);
              if (requestedDay) {
                weatherData.push({
                  provider: '3B Meteo',
                  providerLogo: '/images/3BMeteoLogo.png',
                  city: selectedCity,
                  day: selectedDay,
                  maxTemp: requestedDay.max?.toString() || 'N/A',
                  minTemp: requestedDay.min?.toString() || 'N/A',
                  weatherIconUrl: requestedDay.icon || '',
                  weatherDescription: 'Previsioni da 3B Meteo',
                  wind: 'N/A',
                  humidity: 'N/A',
                  reliability: 'alta',
                  status: 'success',
                  lastUpdated: new Date().toISOString()
                });
              } else {
                // Giorno non trovato nei dati disponibili
                weatherData.push({
                  provider: '3B Meteo',
                  providerLogo: '/images/3BMeteoLogo.png',
                  city: selectedCity,
                  day: selectedDay,
                  status: 'unavailable',
                  message: `Dati non disponibili per il giorno ${dayNumber}`,
                  lastUpdated: new Date().toISOString()
                });
              }
            } else {
              // Formato dati non riconosciuto
              weatherData.push({
                provider: '3B Meteo',
                providerLogo: '/images/3BMeteoLogo.png',
                city: selectedCity,
                day: selectedDay,
                status: 'error',
                message: 'Formato dati non riconosciuto',
                lastUpdated: new Date().toISOString()
              });
            }
          } else {
            // Errore HTTP
            const errorData = await response.json().catch(() => ({}));
            weatherData.push({
              provider: '3B Meteo',
              providerLogo: '/images/3BMeteoLogo.png',
              city: selectedCity,
              day: selectedDay,
              status: 'error',
              message: errorData.error || `Errore ${response.status}`,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (apiError) {
          // Errore nella chiamata API
          weatherData.push({
            provider: '3B Meteo',
            providerLogo: '/images/3BMeteoLogo.png',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore di connessione a 3B Meteo',
            lastUpdated: new Date().toISOString()
          });
        }
        
        // Chiama l'API reale per ilMeteo
        try {
          const ilMeteoResponse = await fetch(`/api/ilMeteo?city=${encodeURIComponent(selectedCity.toLowerCase())}&day=${dayNumber}`);
          
          if (ilMeteoResponse.ok) {
            const ilMeteoData: ApiResponse = await ilMeteoResponse.json();
            
            // Controlla se abbiamo ricevuto dati per il giorno specifico
            if (ilMeteoData.provider === 'ilmeteo' && ilMeteoData.day !== undefined) {
              weatherData.push({
                provider: 'Il Meteo',
                providerLogo: '🌦️',
                city: selectedCity,
                day: selectedDay,
                maxTemp: ilMeteoData.maxTemp || ilMeteoData.max?.toString() || 'N/A',
                minTemp: ilMeteoData.minTemp || ilMeteoData.min?.toString() || 'N/A',
                weatherIconUrl: ilMeteoData.icon || '',
                weatherDescription: ilMeteoData.weatherDescription || 'Previsioni da Il Meteo',
                wind: ilMeteoData.wind || 'N/A',
                humidity: ilMeteoData.humidity || 'N/A',
                reliability: 'alta',
                status: 'success',
                lastUpdated: new Date().toISOString()
              });
            } else if (ilMeteoData.days && Array.isArray(ilMeteoData.days)) {
              // Se abbiamo tutti i giorni del mese, trova quello richiesto
              const requestedDay = ilMeteoData.days.find((d: ApiDayData) => d.day === dayNumber);
              if (requestedDay) {
                weatherData.push({
                  provider: 'Il Meteo',
                  providerLogo: '🌦️',
                  city: selectedCity,
                  day: selectedDay,
                  maxTemp: requestedDay.max?.toString() || 'N/A',
                  minTemp: requestedDay.min?.toString() || 'N/A',
                  weatherIconUrl: requestedDay.icon || '',
                  weatherDescription: 'Previsioni da Il Meteo',
                  wind: 'N/A',
                  humidity: 'N/A',
                  reliability: 'alta',
                  status: 'success',
                  lastUpdated: new Date().toISOString()
                });
              } else {
                // Giorno non trovato nei dati disponibili
                weatherData.push({
                  provider: 'Il Meteo',
                  providerLogo: '🌦️',
                  city: selectedCity,
                  day: selectedDay,
                  status: 'unavailable',
                  message: `Dati non disponibili per il giorno ${dayNumber}`,
                  lastUpdated: new Date().toISOString()
                });
              }
            } else {
              // Formato dati non riconosciuto
              weatherData.push({
                provider: 'Il Meteo',
                providerLogo: '🌦️',
                city: selectedCity,
                day: selectedDay,
                status: 'error',
                message: 'Formato dati non riconosciuto',
                lastUpdated: new Date().toISOString()
              });
            }
          } else {
            // Errore HTTP
            const errorData = await ilMeteoResponse.json().catch(() => ({}));
            weatherData.push({
              provider: 'Il Meteo',
              providerLogo: '🌦️',
              city: selectedCity,
              day: selectedDay,
              status: 'error',
              message: errorData.error || `Errore ${ilMeteoResponse.status}`,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (apiError) {
          // Errore nella chiamata API
          weatherData.push({
            provider: 'Il Meteo',
            providerLogo: '🌦️',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore di connessione a Il Meteo',
            lastUpdated: new Date().toISOString()
          });
        }
        
        // Aggiungi altri provider con dati mock per ora
        const mockProviders = [
          { name: 'MeteoAM', logo: '⛅', color: 'orange' },
          { name: 'Meteo.it', logo: '☀️', color: 'purple' }
        ];
        
        mockProviders.forEach(provider => {
          weatherData.push({
            provider: provider.name,
            providerLogo: provider.logo,
            city: selectedCity,
            day: selectedDay,
            maxTemp: (15 + Math.floor(Math.random() * 15)).toString(),
            minTemp: (5 + Math.floor(Math.random() * 10)).toString(),
            weatherDescription: 'Dati non disponibili',
            wind: `${10 + Math.floor(Math.random() * 20)} km/h`,
            humidity: `${40 + Math.floor(Math.random() * 40)}%`,
            reliability: 'media',
            status: 'unavailable',
            message: 'Implementazione in corso',
            lastUpdated: new Date().toISOString()
          });
        });
        
        setWeatherData(weatherData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto nel caricamento dati');
        
        // Fallback con dati mock in caso di errore
        const mockData: WeatherData[] = [
          {
            provider: '3B Meteo',
            providerLogo: '🌤️',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore nel caricamento dati',
            lastUpdated: new Date().toISOString()
          },
          {
            provider: 'Il Meteo',
            providerLogo: '🌦️',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore nel caricamento dati',
            lastUpdated: new Date().toISOString()
          },
          {
            provider: 'MeteoAM',
            providerLogo: '⛅',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore nel caricamento dati',
            lastUpdated: new Date().toISOString()
          },
          {
            provider: 'Meteo.it',
            providerLogo: '☀️',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore nel caricamento dati',
            lastUpdated: new Date().toISOString()
          }
        ];
        setWeatherData(mockData);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent too many requests
    const timeoutId = setTimeout(fetchWeatherData, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCity, selectedDay]);

  return (
    <main className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500 ${isHydrated ? 'hydrated' : 'no-flash'}`}>
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="text-7xl mr-4">🌤️</div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 dark:from-blue-600 dark:to-purple-600 bg-clip-text text-transparent mb-2">
                Meteo Italia
              </h1>
              <p className="text-amber-800 dark:text-gray-300 text-lg md:text-xl font-medium">
                Confronta le previsioni dai principali provider italiani
              </p>
            </div>
          </div>
          
          <div className="theme-switcher-container">
            <ThemeSwitcher />
          </div>
          
          {/* Provider badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['3B Meteo', 'Il Meteo', 'MeteoAM', 'Meteo.it'].map((provider) => (
              <span 
                key={provider}
                className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-orange-100 dark:bg-gray-800/80 text-orange-800 dark:text-gray-300 backdrop-blur-sm border-2 border-orange-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {provider}
              </span>
            ))}
          </div>
        </header>
        
        <div className="space-y-8">
          <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-gray-700/50 p-8 hover:shadow-3xl transition-all duration-300">
            <SearchBar 
              selectedCity={selectedCity} 
              onCityChange={setSelectedCity} 
            />
          </div>
          
          <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-gray-700/50 p-8 hover:shadow-3xl transition-all duration-300">
            <DayTimeline 
              selectedDay={selectedDay} 
              onDayChange={setSelectedDay} 
            />
          </div>
          
          {/* Weather Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900 dark:text-white">
                Previsioni per {selectedCity} - {selectedDay}
              </h2>
              {loading && (
                <div className="flex items-center text-orange-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Caricamento...
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border-2 border-red-300 dark:border-red-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-red-500 text-4xl">⚠️</div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    Errore nel caricamento
                  </h3>
                  <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      // Trigger a re-fetch
                      const event = new CustomEvent('retry-fetch');
                      window.dispatchEvent(event);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                <div className="col-span-full text-center py-16">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-amber-800 dark:text-gray-300 mb-4">
                    Cerca una città per iniziare
                  </h3>
                  <p className="text-amber-600 dark:text-gray-400 text-lg">
                    Inserisci il nome di una città italiana per vedere le previsioni
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          
          {/* Footer */}
          <footer className="text-center py-16 text-amber-600 dark:text-gray-400">
            <div className="space-y-6">
              <div className="flex justify-center items-center space-x-3 text-base font-medium">
                <span className="text-2xl">🌟</span>
                <span>Dati a scopo dimostrativo. Non affiliato con i provider meteorologici ufficiali.</span>
              </div>
              <div className="flex justify-center items-center space-x-6 text-sm">
                <span className="flex items-center space-x-2 bg-orange-100 dark:bg-gray-800 px-3 py-2 rounded-full">
                  <span>⚡</span>
                  <span>Powered by Next.js 15</span>
                </span>
                <span className="flex items-center space-x-2 bg-orange-100 dark:bg-gray-800 px-3 py-2 rounded-full">
                  <span>🎨</span>
                  <span>Styled with Tailwind CSS</span>
                </span>
                <span className="flex items-center space-x-2 bg-orange-100 dark:bg-gray-800 px-3 py-2 rounded-full">
                  <span>🚀</span>
                  <span>Hosted on Vercel</span>
                </span>
              </div>
              <div className="pt-6 border-t-2 border-amber-300 dark:border-gray-700 max-w-md mx-auto">
                <p className="text-sm text-amber-500 dark:text-gray-500 font-medium">
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
