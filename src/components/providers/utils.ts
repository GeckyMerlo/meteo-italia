import { 
  WeatherCard3BMeteo, 
  WeatherCardIlMeteo, 
  WeatherCardMeteoAM, 
  WeatherCardMeteoIT,
  WeatherDetailsModal3BMeteo,
  WeatherDetailsModalIlMeteo,
  WeatherDetailsModalMeteoAM,
  WeatherDetailsModalMeteoIT
} from './index';

// Utility per determinare quale componente Weather Card usare
export const getWeatherCardComponent = (provider: string) => {
  const providerName = provider.toLowerCase();
  
  if (providerName.includes('3b meteo')) {
    return WeatherCard3BMeteo;
  } else if (providerName.includes('il meteo')) {
    return WeatherCardIlMeteo;
  } else if (providerName.includes('meteoam')) {
    return WeatherCardMeteoAM;
  } else if (providerName.includes('meteo.it')) {
    return WeatherCardMeteoIT;
  }
  
  // Fallback al componente 3B Meteo
  return WeatherCard3BMeteo;
};

// Utility per determinare quale componente Modal usare
export const getWeatherModalComponent = (provider: string) => {
  const providerName = provider.toLowerCase();
  
  if (providerName.includes('3b meteo')) {
    return WeatherDetailsModal3BMeteo;
  } else if (providerName.includes('il meteo')) {
    return WeatherDetailsModalIlMeteo;
  } else if (providerName.includes('meteoam')) {
    return WeatherDetailsModalMeteoAM;
  } else if (providerName.includes('meteo.it')) {
    return WeatherDetailsModalMeteoIT;
  }
  
  // Fallback al componente 3B Meteo
  return WeatherDetailsModal3BMeteo;
};

// Utility per ottenere lo stile del provider
export const getProviderStyle = (provider: string) => {
  const providerName = provider.toLowerCase();
  
  if (providerName.includes('3b meteo')) {
    return {
      gradient: 'from-blue-500 to-blue-600',
      logoPath: '/images/3BMeteoLogo.png',
      accentColor: 'blue'
    };
  } else if (providerName.includes('il meteo')) {
    return {
      gradient: 'from-green-500 to-green-600',
      logoPath: '/images/ilMeteoLogo.png',
      accentColor: 'green'
    };
  } else if (providerName.includes('meteoam')) {
    return {
      gradient: 'from-red-500 to-red-600',
      logoPath: '/images/AMLogo.gif',
      accentColor: 'red'
    };
  } else if (providerName.includes('meteo.it')) {
    return {
      gradient: 'from-purple-500 to-purple-600',
      logoEmoji: '📊',
      accentColor: 'purple'
    };
  }
  
  // Fallback
  return {
    gradient: 'from-gray-500 to-gray-600',
    logoEmoji: '🌐',
    accentColor: 'gray'
  };
};
