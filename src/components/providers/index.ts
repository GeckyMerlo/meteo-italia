// Esporta tutti i componenti provider-specific
export { default as WeatherCard3BMeteo } from './3bmeteo/WeatherCard3BMeteo';
export { default as WeatherDetailsModal3BMeteo } from './3bmeteo/WeatherDetailsModal3BMeteo';

export { default as WeatherCardIlMeteo } from './ilmeteo/WeatherCardIlMeteo';
export { default as WeatherDetailsModalIlMeteo } from './ilmeteo/WeatherDetailsModalIlMeteo';

export { default as WeatherCardMeteoAM } from './meteoam/WeatherCardMeteoAM';
export { default as WeatherDetailsModalMeteoAM } from './meteoam/WeatherDetailsModalMeteoAM';

// Componente smart che seleziona automaticamente il componente giusto
export { default as SmartWeatherCard } from './SmartWeatherCard';

// Tipi condivisi
export interface WeatherData {
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

export interface HourlyWeatherData {
  time: string;
  condition: string;
  temperature: string;
  precipitation: string;
  wind: string;
  humidity: string;
  feelsLike: string;
  icon: string;
}
