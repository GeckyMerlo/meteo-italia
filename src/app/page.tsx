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
                providerLogo: '🌤️',
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
                  providerLogo: '🌤️',
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
                  providerLogo: '🌤️',
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
                providerLogo: '🌤️',
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
              providerLogo: '🌤️',
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
            providerLogo: '🌤️',
            city: selectedCity,
            day: selectedDay,
            status: 'error',
            message: 'Errore di connessione a 3B Meteo',
            lastUpdated: new Date().toISOString()
          });
        }
        
        // Aggiungi altri provider con dati mock per ora
        const mockProviders = [
          { name: 'Il Meteo', logo: '🌦️', color: 'green' },
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
                <div className="col-span-full space-y-4">
                  <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded">
                    Debug: Loading={loading.toString()}, Error={error || 'none'}, Data count={weatherData.length}
                  </div>
                  
                  {/* API Test Panel */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        🔧 Debug API
                      </h3>
                      <button
                        onClick={async () => {
                          const dayNumber = selectedDay === 'oggi' ? new Date().getDate() : 
                                           selectedDay === 'domani' ? new Date().getDate() + 1 : 
                                           parseInt(selectedDay);
                          
                          const testUrl = `/api/meteo?city=${encodeURIComponent(selectedCity.toLowerCase())}&day=${dayNumber}`;
                          console.log('🧪 Testing API:', testUrl);
                          
                          try {
                            const response = await fetch(testUrl);
                            const data = await response.json();
                            console.log('✅ API Response:', data);
                            alert('Check console for API response');
                          } catch (err) {
                            console.error('❌ API Error:', err);
                            alert('API Error - check console');
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Test API
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div><strong>City:</strong> {selectedCity}</div>
                      <div><strong>Day:</strong> {selectedDay}</div>
                      <div><strong>API URL:</strong> /api/meteo?city={selectedCity.toLowerCase()}&day={
                        selectedDay === 'oggi' ? new Date().getDate() : 
                        selectedDay === 'domani' ? new Date().getDate() + 1 : 
                        parseInt(selectedDay)
                      }</div>
                    </div>
                  </div>
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
