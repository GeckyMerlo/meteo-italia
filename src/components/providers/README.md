# Componenti Provider-Specific per Servizi Meteo

Questa cartella contiene i componenti specializzati per ogni servizio meteorologico, permettendo di personalizzare l'interfaccia e la logica per ciascun provider.

## Struttura

```
src/components/providers/
├── 3bmeteo/
│   ├── WeatherCard3BMeteo.tsx          # Card specializzata per 3B Meteo
│   └── WeatherDetailsModal3BMeteo.tsx  # Modal orari per 3B Meteo
├── ilmeteo/
│   ├── WeatherCardIlMeteo.tsx          # Card specializzata per ilMeteo
│   └── WeatherDetailsModalIlMeteo.tsx  # Modal orari per ilMeteo
├── meteoam/
│   ├── WeatherCardMeteoAM.tsx          # Card specializzata per MeteoAM
│   └── WeatherDetailsModalMeteoAM.tsx  # Modal orari per MeteoAM
├── SmartWeatherCard.tsx                # Componente intelligente che seleziona automaticamente
├── utils.ts                            # Funzioni utility per i provider
└── index.ts                            # Esportazioni principali
```

## Caratteristiche per Provider

### 3B Meteo
- **Colore**: Blu (`from-blue-500 to-blue-600`)
- **Icona**: 🌤️
- **Specialità**: Gestione completa delle previsioni orarie con fallback per giorni senza dati
- **API**: `/api/3bMeteo/orari`

### ilMeteo
- **Colore**: Verde (`from-green-500 to-green-600`)
- **Icona**: 🌍
- **Specialità**: Gestione formato dati specifico di ilMeteo
- **API**: `/api/ilMeteo/orari`

### MeteoAM
- **Colore**: Rosso (`from-red-500 to-red-600`)
- **Icona**: 🇮🇹
- **Specialità**: Dati ufficiali Aeronautica Militare
- **API**: `/api/MeteoAM/orari`

## Componenti Principali

### SmartWeatherCard
Componente intelligente che seleziona automaticamente il componente giusto basandosi sul provider:

```tsx
import SmartWeatherCard from '@/components/providers/SmartWeatherCard';

<SmartWeatherCard 
  weatherData={weatherData} 
  loading={loading} 
/>
```

### Componenti Specifici
Per uso diretto di un componente specifico:

```tsx
import { WeatherCard3BMeteo } from '@/components/providers';

<WeatherCard3BMeteo 
  weatherData={weatherData} 
  loading={loading} 
/>
```

## Personalizzazione

### Aggiungere un Nuovo Provider
1. Creare una cartella `nuovoprovider/`
2. Creare `WeatherCardNuovoProvider.tsx` e `WeatherDetailsModalNuovoProvider.tsx`
3. Aggiungere gli export in `index.ts`
4. Aggiornare le utility in `utils.ts`
5. Aggiornare `SmartWeatherCard.tsx` se necessario

### Personalizzare l'UI
Ogni componente ha il suo stile specifico:
- Colori del gradiente
- Icone emoji
- Colori degli accenti
- Layout specifici per il tipo di dati

### Gestione delle API
Ogni modal ha la sua logica di conversione dei parametri:
- `day=0` per oggi
- `day=1` per domani
- `day=N` per N giorni nel futuro

## Vantaggi di questa Struttura

1. **Separazione delle responsabilità**: Ogni provider ha la sua logica
2. **Personalizzazione**: UI e UX specifiche per ogni servizio
3. **Manutenibilità**: Modifiche a un provider non influenzano gli altri
4. **Scalabilità**: Facile aggiungere nuovi provider
5. **Debugging**: Più facile isolare problemi specifici di un provider

## Uso nell'App

L'app principale usa `SmartWeatherCard` che seleziona automaticamente il componente corretto:

```tsx
// src/app/page.tsx
import SmartWeatherCard from '@/components/providers/SmartWeatherCard';

// Nell'render:
<SmartWeatherCard 
  weatherData={weatherData}
  loading={loading}
/>
```

Questo permette di mantenere l'interfaccia principale semplice mentre si hanno componenti specializzati per ogni servizio meteorologico.
