// Global state
let selectedCity = 'Roma';
let selectedDay = 'oggi';
let italianCities = [];
let isDarkMode = false;
let currentWeatherData = []; // Store weather data with hourly forecasts

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Load cities data
    await loadCitiesData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize day timeline
    initializeDayTimeline();
    
    // Load initial weather data
    fetchWeatherData();
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleDarkMode();
    }
});

// Load cities data - using built-in Italian cities list
async function loadCitiesData() {
    // Lista delle principali città italiane
    italianCities = [
        'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 
        'Firenze', 'Bari', 'Catania', 'Venezia', 'Verona', 'Messina', 'Padova',
        'Trieste', 'Brescia', 'Parma', 'Prato', 'Modena', 'Reggio Calabria',
        'Reggio Emilia', 'Perugia', 'Livorno', 'Ravenna', 'Cagliari', 'Foggia',
        'Rimini', 'Salerno', 'Ferrara', 'Sassari', 'Latina', 'Giugliano in Campania',
        'Monza', 'Siracusa', 'Pescara', 'Bergamo', 'Forlì', 'Trento', 'Vicenza',
        'Terni', 'Bolzano', 'Novara', 'Piacenza', 'Ancona', 'Andria', 'Arezzo',
        'Udine', 'Cesena', 'Lecce', 'Pesaro', 'Barletta', 'Alessandria', 'La Spezia',
        'Pistoia', 'Pisa', 'Lucca', 'Brindisi', 'Como', 'Treviso', 'Varese'
    ];
}

// Setup event listeners
function setupEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const cityInput = document.getElementById('cityInput');
    const themeSwitcher = document.getElementById('themeSwitcher');
    const retryButton = document.getElementById('retryButton');
    
    searchForm.addEventListener('submit', handleSearchSubmit);
    cityInput.addEventListener('input', handleCityInput);
    cityInput.addEventListener('keydown', handleCityInputKeydown);
    cityInput.addEventListener('focus', () => {
        if (cityInput.value.length > 1) {
            showSuggestions(cityInput.value);
        }
    });
    
    themeSwitcher.addEventListener('click', toggleDarkMode);
    retryButton.addEventListener('click', fetchWeatherData);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-container')) {
            hideSuggestions();
        }
    });
}

// Handle search form submit
function handleSearchSubmit(e) {
    e.preventDefault();
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (city) {
        selectedCity = city;
        updateSelectedCityDisplay();
        hideSuggestions();
        fetchWeatherData();
    }
}

// Handle city input changes
function handleCityInput(e) {
    const value = e.target.value;
    
    if (value.length > 1) {
        showSuggestions(value);
    } else {
        hideSuggestions();
    }
}

// Handle keyboard navigation in city input
function handleCityInputKeydown(e) {
    if (e.key === 'Escape') {
        hideSuggestions();
    }
}

// Show city suggestions
function showSuggestions(query) {
    const suggestionsContainer = document.getElementById('suggestions');
    const filtered = italianCities
        .filter(city => city.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
    
    if (filtered.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestionsContainer.innerHTML = filtered
        .map(city => `
            <div class="suggestion-item" onclick="selectCity('${city}')">
                <span>🏙️</span> ${city}
            </div>
        `)
        .join('');
    
    suggestionsContainer.classList.remove('hidden');
}

// Hide suggestions
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.classList.add('hidden');
}

// Select a city from suggestions
function selectCity(city) {
    selectedCity = city;
    document.getElementById('cityInput').value = city;
    updateSelectedCityDisplay();
    hideSuggestions();
    fetchWeatherData();
}

// Update selected city display
function updateSelectedCityDisplay() {
    document.getElementById('selectedCityDisplay').textContent = selectedCity;
    document.getElementById('cityName').textContent = selectedCity;
}

// Initialize day timeline
function initializeDayTimeline() {
    const timeline = document.getElementById('dayTimeline');
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
            index: i
        });
    }
    
    timeline.innerHTML = days.map((day, index) => `
        <button class="day-button ${day.value === selectedDay ? 'active' : ''}" 
                onclick="selectDay('${day.value}', '${day.label}', '${day.date}')">
            <div class="day-label">${day.label}</div>
            <div class="day-icon">${getWeatherIcon(index)}</div>
            <div class="day-date">${day.date}</div>
        </button>
    `).join('');
    
    updateSelectedDayDisplay(days[0].label, days[0].date);
}

// Get weather icon for timeline
function getWeatherIcon(index) {
    const icons = ['☀️', '⛅', '🌤️', '☁️', '🌦️', '🌧️', '⛈️'];
    return icons[index % icons.length];
}

// Select a day
function selectDay(dayValue, dayLabel, dayDate) {
    selectedDay = dayValue;
    
    // Update active state
    document.querySelectorAll('.day-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.day-button').classList.add('active');
    
    updateSelectedDayDisplay(dayLabel, dayDate);
    document.getElementById('dayName').textContent = dayValue;
    
    fetchWeatherData();
}

// Update selected day display
function updateSelectedDayDisplay(label, date) {
    document.getElementById('selectedDayLabel').textContent = label;
    document.getElementById('selectedDayDate').textContent = `(${date})`;
}

// Fetch weather data from all providers using public APIs
async function fetchWeatherData() {
    showLoading(true);
    hideError();
    
    const weatherCards = document.getElementById('weatherCards');
    
    // Show loading skeletons (modifica il numero in base a quanti provider hai aggiunto)
    const numberOfProviders = 3; // 3 API diverse
    weatherCards.innerHTML = Array.from({ length: numberOfProviders }, () => createSkeletonCard()).join('');
    
    try {
        // Calculate days ahead
        const today = new Date();
        let daysAhead = 0;
        
        if (selectedDay === 'domani') {
            daysAhead = 1;
        } else if (selectedDay.startsWith('+') && selectedDay.endsWith('giorni')) {
            daysAhead = parseInt(selectedDay.replace('+', '').replace('giorni', ''));
        }
        
        // Fetch from public APIs in parallel - API METEO GRATUITE
        const weatherPromises = [
            fetchOpenMeteoGFS(selectedCity, daysAhead),       // Open-Meteo GFS
            fetchOpenMeteoECMWF(selectedCity, daysAhead),     // Open-Meteo ECMWF
            fetchWttrIn(selectedCity, daysAhead),             // wttr.in
        ];
        
        const weatherData = await Promise.all(weatherPromises);
        
        // Store data globally for modal access
        currentWeatherData = weatherData;
        
        // Render weather cards
        weatherCards.innerHTML = weatherData.map((data, index) => 
            createWeatherCard(data, index)
        ).join('');
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Errore nel caricamento dei dati meteorologici. Riprova più tardi.');
    } finally {
        showLoading(false);
    }
}

// ═══════════════════════════════════════════════════════════════════
// API METEO GRATUITE - Nomi reali delle API
// ═══════════════════════════════════════════════════════════════════

// Open-Meteo GFS - Modello GFS (Global Forecast System)
async function fetchOpenMeteoGFS(city, daysAhead) {
    try {
        // Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it&format=json`;
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) throw new Error('Geocoding non disponibile');
        
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Città non trovata');
        }
        
        const { latitude, longitude } = geoData.results[0];
        
        // Weather data con modello GFS - includi dati ORARI
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weathercode,windspeed_10m,winddirection_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,relative_humidity_2m_max,precipitation_probability_max,precipitation_sum&timezone=Europe/Rome&forecast_days=7`;
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) throw new Error('Dati meteo non disponibili');
        
        const weatherData = await weatherResponse.json();
        const daily = weatherData.daily;
        const hourly = weatherData.hourly;
        
        const maxTemp = daily.temperature_2m_max[daysAhead];
        const minTemp = daily.temperature_2m_min[daysAhead];
        const weatherCode = daily.weathercode[daysAhead];
        const windSpeed = daily.windspeed_10m_max[daysAhead];
        const humidity = daily.relative_humidity_2m_max[daysAhead];
        const precipProb = daily.precipitation_probability_max?.[daysAhead] || 0;
        const precipSum = daily.precipitation_sum?.[daysAhead] || 0;
        
        // Estrai dati orari per il giorno selezionato
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        const hourlyForecast = [];
        for (let i = 0; i < hourly.time.length; i++) {
            if (hourly.time[i].startsWith(targetDateStr)) {
                const hour = new Date(hourly.time[i]).getHours();
                hourlyForecast.push({
                    hour: `${hour}:00`,
                    temp: Math.round(hourly.temperature_2m[i]),
                    humidity: hourly.relative_humidity_2m[i],
                    precipProb: hourly.precipitation_probability[i] || 0,
                    precip: hourly.precipitation[i] || 0,
                    weatherCode: hourly.weathercode[i],
                    windSpeed: Math.round(hourly.windspeed_10m[i]),
                    windDir: hourly.winddirection_10m[i]
                });
            }
        }
        
        const weatherDescription = getWeatherDescription(weatherCode);
        let fullDescription = weatherDescription;
        if (precipSum > 0) {
            fullDescription += ` • Pioggia: ${precipSum.toFixed(1)}mm`;
        }
        if (precipProb > 30) {
            fullDescription += ` • Prob: ${precipProb}%`;
        }
        
        return {
            provider: 'Open-Meteo GFS',
            providerLogo: '',
            logoClass: 'gradient-blue',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${Math.round(maxTemp)}°C`,
            minTemp: `${Math.round(minTemp)}°C`,
            weatherDescription: fullDescription,
            wind: `${Math.round(windSpeed)} km/h`,
            humidity: `${humidity}%`,
            reliability: 'alta',
            status: 'success',
            hourlyForecast: hourlyForecast  // AGGIUNTO: dati orari
        };
    } catch (error) {
        console.error('Open-Meteo GFS error:', error);
        return createErrorCard('Open-Meteo GFS', error.message || 'Servizio temporaneamente non disponibile');
    }
}

// Open-Meteo ECMWF - Modello ECMWF (European Centre)
async function fetchOpenMeteoECMWF(city, daysAhead) {
    try {
        // Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it&format=json`;
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) throw new Error('Geocoding non disponibile');
        
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Città non trovata');
        }
        
        const { latitude, longitude } = geoData.results[0];
        
        // Usa modello ECMWF con dati ORARI
        const weatherUrl = `https://api.open-meteo.com/v1/ecmwf?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=Europe/Rome&forecast_days=7`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            // Fallback a modello standard se ECMWF non disponibile
            return fetchOpenMeteoGFS(city, daysAhead);
        }
        
        const weatherData = await weatherResponse.json();
        const daily = weatherData.daily;
        const hourly = weatherData.hourly;
        
        const maxTemp = daily.temperature_2m_max[daysAhead];
        const minTemp = daily.temperature_2m_min[daysAhead];
        const weatherCode = daily.weathercode[daysAhead];
        const windSpeed = daily.windspeed_10m_max[daysAhead];
        
        // Estrai dati orari per il giorno selezionato
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        const hourlyForecast = [];
        for (let i = 0; i < hourly.time.length; i++) {
            if (hourly.time[i].startsWith(targetDateStr)) {
                const hour = new Date(hourly.time[i]).getHours();
                hourlyForecast.push({
                    hour: `${hour}:00`,
                    temp: Math.round(hourly.temperature_2m[i]),
                    weatherCode: hourly.weathercode[i],
                    windSpeed: Math.round(hourly.windspeed_10m[i])
                });
            }
        }
        
        return {
            provider: 'Open-Meteo ECMWF',
            providerLogo: '',
            logoClass: 'gradient-green',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${Math.round(maxTemp)}°C`,
            minTemp: `${Math.round(minTemp)}°C`,
            weatherDescription: getWeatherDescription(weatherCode) + ' • Modello ECMWF',
            wind: `${Math.round(windSpeed)} km/h`,
            humidity: 'N/A',
            reliability: 'molto alta',
            status: 'success',
            hourlyForecast: hourlyForecast  // AGGIUNTO: dati orari
        };
    } catch (error) {
        console.error('Open-Meteo ECMWF error:', error);
        return createErrorCard('Open-Meteo ECMWF', error.message || 'Servizio temporaneamente non disponibile');
    }
}

// wttr.in - Servizio meteo open source
async function fetchWttrIn(city, daysAhead) {
    try {
        // wttr.in fornisce dati meteo gratuiti in formato JSON
        const url = `https://wttr.in/${encodeURIComponent(city)},Italy?format=j1&lang=it`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Servizio wttr.in non disponibile');
        
        const data = await response.json();
        
        // wttr.in fornisce previsioni per 3 giorni
        if (daysAhead > 2) {
            // Fallback a Open-Meteo per giorni oltre il 3°
            const result = await fetchOpenMeteoGFS(city, daysAhead);
            result.provider = 'wttr.in (fallback)';
            result.logoClass = 'gradient-purple';
            return result;
        }
        
        const forecast = data.weather[daysAhead];
        
        // wttr.in fornisce dati orari (ogni 3 ore)
        const hourlyForecast = [];
        for (let i = 0; i < forecast.hourly.length; i++) {
            const hourData = forecast.hourly[i];
            const hour = Math.floor(i * 3); // wttr.in da dati ogni 3 ore
            hourlyForecast.push({
                hour: `${hour}:00`,
                temp: Math.round(parseFloat(hourData.tempC)),
                humidity: parseInt(hourData.humidity),
                precipProb: parseInt(hourData.chanceofrain),
                precip: parseFloat(hourData.precipMM || 0),
                weatherCode: parseInt(hourData.weatherCode),
                windSpeed: Math.round(parseInt(hourData.windspeedKmph)),
                windDir: hourData.winddir16Point,
                description: hourData.lang_it?.[0]?.value || hourData.weatherDesc?.[0]?.value
            });
        }
        
        // Converti descrizione in italiano
        const weatherDesc = forecast.hourly[4].lang_it?.[0]?.value || 
                           forecast.hourly[4].weatherDesc?.[0]?.value || 
                           'Condizioni variabili';
        
        return {
            provider: 'wttr.in',
            providerLogo: '',
            logoClass: 'gradient-purple',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${forecast.maxtempC}°C`,
            minTemp: `${forecast.mintempC}°C`,
            weatherDescription: weatherDesc,
            wind: `${forecast.hourly[4].windspeedKmph} km/h`,
            humidity: `${forecast.hourly[4].humidity}%`,
            reliability: 'alta',
            status: 'success',
            hourlyForecast: hourlyForecast  // AGGIUNTO: dati orari
        };
    } catch (error) {
        console.error('wttr.in error:', error);
        return createErrorCard('wttr.in', error.message || 'Servizio temporaneamente non disponibile');
    }
}

// ═══════════════════════════════════════════════════════════════════
// FINE API METEO GRATUITE
// ═══════════════════════════════════════════════════════════════════

// Fetch from OpenWeatherMap API (free tier)
async function fetchOpenWeatherMap(city, daysAhead) {
    try {
        // Using free tier - no API key needed for basic current weather
        // For forecast, you'd need an API key
        const apiKey = 'YOUR_API_KEY'; // Get free key from openweathermap.org
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},IT&units=metric&appid=${apiKey}&lang=it`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('API non disponibile');
        }
        
        const data = await response.json();
        
        // Get forecast for target day (each forecast is 3 hours apart)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        targetDate.setHours(12, 0, 0, 0);
        
        // Find forecast closest to noon of target day
        let closestForecast = data.list[0];
        let minDiff = Math.abs(new Date(data.list[0].dt * 1000) - targetDate);
        
        for (const forecast of data.list) {
            const forecastDate = new Date(forecast.dt * 1000);
            const diff = Math.abs(forecastDate - targetDate);
            if (diff < minDiff) {
                minDiff = diff;
                closestForecast = forecast;
            }
        }
        
        // Get min/max for the day
        const dayForecasts = data.list.filter(f => {
            const fDate = new Date(f.dt * 1000);
            return fDate.getDate() === targetDate.getDate();
        });
        
        const temps = dayForecasts.map(f => f.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        
        return {
            provider: 'OpenWeather',
            providerLogo: 'https://openweathermap.org/themes/openweathermap/assets/img/logo_white_cropped.png',
            logoClass: 'gradient-blue',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${Math.round(maxTemp)}°C`,
            minTemp: `${Math.round(minTemp)}°C`,
            weatherDescription: closestForecast.weather[0].description,
            weatherIconUrl: `https://openweathermap.org/img/wn/${closestForecast.weather[0].icon}@2x.png`,
            wind: `${Math.round(closestForecast.wind.speed * 3.6)} km/h`,
            humidity: `${closestForecast.main.humidity}%`,
            reliability: 'alta',
            status: 'success'
        };
        
    } catch (error) {
        console.error('OpenWeatherMap error:', error);
        return createErrorCard('OpenWeather', 'Servizio temporaneamente non disponibile. Richiede API key gratuita da openweathermap.org');
    }
}

// Fetch from WeatherAPI.com (free tier)
async function fetchWeatherAPI(city, daysAhead) {
    try {
        const apiKey = 'YOUR_API_KEY'; // Get free key from weatherapi.com
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)},Italy&days=${daysAhead + 1}&lang=it`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('API non disponibile');
        }
        
        const data = await response.json();
        const forecast = data.forecast.forecastday[daysAhead];
        
        return {
            provider: 'WeatherAPI',
            providerLogo: '',
            logoClass: 'gradient-green',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${Math.round(forecast.day.maxtemp_c)}°C`,
            minTemp: `${Math.round(forecast.day.mintemp_c)}°C`,
            weatherDescription: forecast.day.condition.text,
            weatherIconUrl: `https:${forecast.day.condition.icon}`,
            wind: `${Math.round(forecast.day.maxwind_kph)} km/h`,
            humidity: `${forecast.day.avghumidity}%`,
            reliability: 'alta',
            status: 'success'
        };
        
    } catch (error) {
        console.error('WeatherAPI error:', error);
        return createErrorCard('WeatherAPI', 'Servizio temporaneamente non disponibile. Richiede API key gratuita da weatherapi.com');
    }
}

// Fetch from Open-Meteo (completely free, no API key required!)
async function fetchOpenMeteo(city, daysAhead, providerName = 'Open-Meteo', logoClass = 'gradient-purple') {
    try {
        // First, geocode the city using Open-Meteo's geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it&format=json`;
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
            throw new Error('Geocoding non disponibile');
        }
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Città non trovata');
        }
        
        const { latitude, longitude } = geoData.results[0];
        
        // Now fetch weather data with more parameters
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,relative_humidity_2m_max,precipitation_probability_max&timezone=Europe/Rome&forecast_days=${daysAhead + 1}`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error('Dati meteo non disponibili');
        }
        
        const weatherData = await weatherResponse.json();
        const daily = weatherData.daily;
        
        // Get data for the target day
        const maxTemp = daily.temperature_2m_max[daysAhead];
        const minTemp = daily.temperature_2m_min[daysAhead];
        const weatherCode = daily.weathercode[daysAhead];
        const windSpeed = daily.windspeed_10m_max[daysAhead];
        const humidity = daily.relative_humidity_2m_max[daysAhead];
        const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[daysAhead] : 0;
        
        // Convert WMO weather code to description
        const weatherDescription = getWeatherDescription(weatherCode);
        
        // Add precipitation probability to description if significant
        let fullDescription = weatherDescription;
        if (precipProb > 30) {
            fullDescription += ` • Probabilità pioggia: ${precipProb}%`;
        }
        
        return {
            provider: providerName,
            providerLogo: '',
            logoClass: logoClass,
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${Math.round(maxTemp)}°C`,
            minTemp: `${Math.round(minTemp)}°C`,
            weatherDescription: fullDescription,
            wind: `${Math.round(windSpeed)} km/h`,
            humidity: `${humidity}%`,
            reliability: 'alta',
            status: 'success'
        };
        
    } catch (error) {
        console.error('Open-Meteo error:', error);
        return createErrorCard(providerName, error.message || 'Servizio temporaneamente non disponibile');
    }
}

// Convert WMO weather code to Italian description
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Sereno',
        1: 'Prevalentemente sereno',
        2: 'Parzialmente nuvoloso',
        3: 'Nuvoloso',
        45: 'Nebbia',
        48: 'Nebbia con brina',
        51: 'Pioviggine leggera',
        53: 'Pioviggine moderata',
        55: 'Pioviggine intensa',
        61: 'Pioggia leggera',
        63: 'Pioggia moderata',
        65: 'Pioggia forte',
        71: 'Neve leggera',
        73: 'Neve moderata',
        75: 'Neve forte',
        77: 'Neve a grani',
        80: 'Rovesci leggeri',
        81: 'Rovesci moderati',
        82: 'Rovesci violenti',
        85: 'Rovesci di neve leggeri',
        86: 'Rovesci di neve forti',
        95: 'Temporale',
        96: 'Temporale con grandine leggera',
        99: 'Temporale con grandine forte'
    };
    
    return descriptions[code] || 'Condizioni variabili';
}

// ═══════════════════════════════════════════════════════════════════
// SEZIONE: ALTRI PROVIDER METEO GRATUITI
// Decommenta e configura questi per aggiungere più provider!
// ═══════════════════════════════════════════════════════════════════

// OpenWeatherMap - GRATUITO (1000 chiamate/giorno)
// Registrati su: https://openweathermap.org/api
async function fetchOpenWeatherMapFree(city, daysAhead) {
    try {
        const apiKey = 'YOUR_OPENWEATHER_KEY'; // Sostituisci con la tua chiave
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},IT&units=metric&appid=${apiKey}&lang=it`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API non disponibile');
        
        const data = await response.json();
        
        // Calcola data target
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
        targetDate.setHours(12, 0, 0, 0);
        
        // Trova previsione più vicina a mezzogiorno
        let closestForecast = data.list[0];
        let minDiff = Math.abs(new Date(data.list[0].dt * 1000) - targetDate);
        
        for (const forecast of data.list) {
            const forecastDate = new Date(forecast.dt * 1000);
            const diff = Math.abs(forecastDate - targetDate);
            if (diff < minDiff) {
                minDiff = diff;
                closestForecast = forecast;
            }
        }
        
        // Calcola min/max del giorno
        const dayForecasts = data.list.filter(f => {
            const fDate = new Date(f.dt * 1000);
            return fDate.getDate() === targetDate.getDate();
        });
        
        const temps = dayForecasts.map(f => f.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        
        return {
            provider: 'OpenWeatherMap',
            providerLogo: '',
            logoClass: 'gradient-pink',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${Math.round(maxTemp)}°C`,
            minTemp: `${Math.round(minTemp)}°C`,
            weatherDescription: closestForecast.weather[0].description,
            weatherIconUrl: `https://openweathermap.org/img/wn/${closestForecast.weather[0].icon}@2x.png`,
            wind: `${Math.round(closestForecast.wind.speed * 3.6)} km/h`,
            humidity: `${closestForecast.main.humidity}%`,
            reliability: 'alta',
            status: 'success'
        };
    } catch (error) {
        return createErrorCard('OpenWeatherMap', 'Configura API key in app.js (gratuita su openweathermap.org)');
    }
}

// 7Timer - COMPLETAMENTE GRATUITO (no API key)
// API cinese, dati da modelli numerici
async function fetch7Timer(city, daysAhead) {
    try {
        // Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=it&format=json`;
        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) throw new Error('Geocoding non disponibile');
        
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Città non trovata');
        }
        
        const { latitude, longitude } = geoData.results[0];
        
        // 7Timer API
        const weatherUrl = `https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civil&output=json`;
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) throw new Error('Dati meteo non disponibili');
        
        const weatherData = await weatherResponse.json();
        const forecast = weatherData.dataseries[daysAhead * 8]; // 8 slot da 3h = 24h
        
        // Conversione weather code 7timer
        const weatherDesc = {
            'clear': 'Sereno',
            'pcloudy': 'Parzialmente nuvoloso',
            'cloudy': 'Nuvoloso',
            'lightrain': 'Pioggia leggera',
            'rain': 'Pioggia',
            'snow': 'Neve',
            'tstorm': 'Temporale'
        };
        
        return {
            provider: '7Timer',
            providerLogo: '',
            logoClass: 'gradient-blue',
            city: selectedCity,
            day: selectedDay,
            maxTemp: `${forecast.temp2m || 'N/A'}°C`,
            minTemp: `${(forecast.temp2m - 5) || 'N/A'}°C`,
            weatherDescription: weatherDesc[forecast.weather] || forecast.weather,
            wind: `${forecast.wind10m?.speed || 'N/A'} km/h`,
            humidity: 'N/A',
            reliability: 'media',
            status: 'success'
        };
    } catch (error) {
        return createErrorCard('7Timer', 'Servizio temporaneamente non disponibile');
    }
}

// ═══════════════════════════════════════════════════════════════════
// FINE SEZIONE PROVIDER AGGIUNTIVI
// ═══════════════════════════════════════════════════════════════════



// Create error card data
function createErrorCard(provider, message) {
    return {
        provider: provider,
        providerLogo: '',
        status: 'error',
        message: message
    };
}

// Create skeleton card HTML
function createSkeletonCard() {
    return `
        <div class="weather-card skeleton">
            <div class="skeleton-header">
                <div class="skeleton-circle"></div>
                <div class="skeleton-line short"></div>
            </div>
            <div class="card-content">
                <div class="skeleton-temp"></div>
                <div class="skeleton-line long"></div>
            </div>
        </div>
    `;
}

// Create weather card HTML
function createWeatherCard(data, index) {
    const animationDelay = `animation-delay: ${index * 150}ms;`;
    
    if (data.status === 'error' || data.status === 'unavailable') {
        return `
            <div class="weather-card ${data.status}" style="${animationDelay}">
                <div class="card-header">
                    <div class="provider-info">
                        <div class="provider-logo ${data.logoClass || ''}">
                            ${data.providerLogo ? `<img src="${data.providerLogo}" alt="${data.provider}">` : '⛅'}
                        </div>
                        <div class="provider-details">
                            <h3>${data.provider}</h3>
                            <p>${selectedDay}</p>
                        </div>
                    </div>
                    <div class="status-icons">
                        <span class="status-icon ${data.status === 'error' ? 'status-error' : 'status-warning'}">
                            ${data.status === 'error' ? '✕' : '⚠'}
                        </span>
                    </div>
                </div>
                <div class="card-error-content">
                    <div class="card-error-icon">
                        ${data.status === 'error' ? '✕' : '⚠️'}
                    </div>
                    <h4 class="card-error-title">
                        ${data.status === 'error' ? 'Errore' : 'Non disponibile'}
                    </h4>
                    <p class="card-error-message">${data.message}</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="weather-card clickable" style="${animationDelay}" onclick="openWeatherDetails(${index})">
            <div class="card-header">
                <div class="provider-info">
                    <div class="provider-logo ${data.logoClass}">
                        ${data.providerLogo ? `<img src="${data.providerLogo}" alt="${data.provider}">` : '⛅'}
                    </div>
                    <div class="provider-details">
                        <h3>${data.provider}</h3>
                        <p>${selectedDay}</p>
                    </div>
                </div>
                <div class="status-icons">
                    <span class="status-icon status-success">✓</span>
                    <span class="status-icon">👆</span>
                </div>
            </div>
            
            <div class="card-content">
                <div class="temp-section">
                    <div class="temp-values">
                        ${data.maxTemp ? `<span class="temp-max">${data.maxTemp}</span>` : ''}
                        ${data.minTemp ? `<span class="temp-min">${data.minTemp}</span>` : ''}
                    </div>
                    <div>
                        ${data.weatherIconUrl 
                            ? `<img src="${data.weatherIconUrl}" alt="Weather icon" class="weather-icon-img">` 
                            : `<div class="weather-icon-large">${getWeatherIconByDescription(data.weatherDescription)}</div>`
                        }
                    </div>
                </div>
                
                ${data.weatherDescription ? `
                    <p class="weather-description">${data.weatherDescription}</p>
                ` : ''}
                
                <div class="weather-details">
                    ${data.wind ? `
                        <div class="detail-item">
                            <span class="detail-icon">💨</span>
                            <span>${data.wind}</span>
                        </div>
                    ` : ''}
                    ${data.humidity ? `
                        <div class="detail-item">
                            <span class="detail-icon">💧</span>
                            <span>${data.humidity}</span>
                        </div>
                    ` : ''}
                    ${data.reliability ? `
                        <div class="detail-item">
                            <span class="detail-icon">📈</span>
                            <span>${data.reliability}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="card-footer">
                <p class="last-updated">Aggiornato: ${new Date().toLocaleString('it-IT')}</p>
            </div>
        </div>
    `;
}

// Get weather icon based on description
function getWeatherIconByDescription(description) {
    if (!description) return '☀️';
    
    const desc = description.toLowerCase();
    if (desc.includes('sole') || desc.includes('sereno') || desc.includes('clear')) {
        return '☀️';
    }
    if (desc.includes('nuvol') || desc.includes('coperto') || desc.includes('cloud')) {
        return '☁️';
    }
    if (desc.includes('pioggia') || desc.includes('piovoso') || desc.includes('rain')) {
        return '🌧️';
    }
    if (desc.includes('temporale') || desc.includes('storm')) {
        return '⛈️';
    }
    if (desc.includes('neve') || desc.includes('snow')) {
        return '❄️';
    }
    if (desc.includes('nebbia') || desc.includes('fog')) {
        return '🌫️';
    }
    return '⛅';
}

// Open weather details modal
function openWeatherDetails(dataIndex) {
    const data = currentWeatherData[dataIndex];
    if (!data) return;
    
    const modal = document.getElementById('weatherModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Previsioni Orarie: ${data.provider} - ${selectedCity} (${selectedDay})`;
    
    // Check if hourly data exists
    if (!data.hourlyForecast || data.hourlyForecast.length === 0) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--text-secondary);">
                    Dati orari non disponibili per questo provider.
                </p>
            </div>
        `;
        modal.classList.remove('hidden');
        return;
    }
    
    // Create hourly forecast HTML
    let hourlyHTML = '<div class="hourly-forecast-container">';
    
    data.hourlyForecast.forEach((hour, index) => {
        const weatherDesc = hour.description || getWeatherDescription(hour.weatherCode);
        const weatherIcon = getWeatherIconByDescription(weatherDesc);
        
        hourlyHTML += `
            <div class="hourly-item">
                <div class="hourly-time">${hour.hour}</div>
                <div class="hourly-icon">${weatherIcon}</div>
                <div class="hourly-temp">${hour.temp}°C</div>
                <div class="hourly-details">
                    ${hour.humidity !== undefined ? `<div>💧 ${hour.humidity}%</div>` : ''}
                    ${hour.windSpeed !== undefined ? `<div>💨 ${hour.windSpeed} km/h</div>` : ''}
                    ${hour.precipProb !== undefined && hour.precipProb > 0 ? `<div>☔ ${hour.precipProb}%</div>` : ''}
                    ${hour.precip !== undefined && hour.precip > 0 ? `<div>🌧️ ${hour.precip.toFixed(1)}mm</div>` : ''}
                </div>
            </div>
        `;
    });
    
    hourlyHTML += '</div>';
    
    modalBody.innerHTML = hourlyHTML;
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('weatherModal');
    modal.classList.add('hidden');
}

// Show loading indicator
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    const errorContainer = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorContainer.classList.remove('hidden');
}

// Hide error message
function hideError() {
    const errorContainer = document.getElementById('errorMessage');
    errorContainer.classList.add('hidden');
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    
    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}
