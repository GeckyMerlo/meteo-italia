# Problemi MeteoAM su Vercel - Soluzioni Implementate

## 🔴 Problema Originale
MeteoAM non funzionava correttamente quando deployato su Vercel, mentre funzionava in locale.

## 🔍 Cause Identificate

### 1. **Timeout di Vercel**
- Vercel ha timeout predefiniti di 10 secondi per le Serverless Functions
- L'API MeteoAM può essere lenta a rispondere
- **Soluzione**: Aumentato `maxDuration` a 30 secondi

### 2. **Mancanza di Headers HTTP**
- L'API MeteoAM potrebbe richiedere header specifici
- **Soluzione**: Aggiunti header User-Agent, Origin, Referer

### 3. **Instabilità delle API Esterne**
- Le API esterne (Nominatim + MeteoAM) possono essere instabili
- **Soluzione**: Implementato retry con backoff esponenziale

### 4. **Problemi CORS**
- Potrebbero esserci problemi di CORS tra frontend e API
- **Soluzione**: Aggiunti header CORS alle risposte

## 🛠️ Soluzioni Implementate

### 1. **Configurazione Runtime**
```typescript
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 secondi per Vercel Pro, 10 per free tier
```

### 2. **Headers HTTP Appropriati**
```typescript
headers: {
  'User-Agent': 'Meteo-Italia/1.0 (https://meteo-italia.vercel.app)',
  'Accept': 'application/json',
  'Origin': 'https://meteo-italia.vercel.app',
  'Referer': 'https://meteo-italia.vercel.app/',
}
```

### 3. **Retry con Backoff Esponenziale**
```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // Retry per errori temporanei (5xx, 408)
      if (i < maxRetries - 1 && (response.status >= 500 || response.status === 408)) {
        const delay = Math.min(1000 * Math.pow(2, i), 5000); // Max 5 secondi
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### 4. **Timeout Specifici**
- **Nominatim**: 10 secondi
- **MeteoAM**: 15 secondi
- **Totale**: Max 30 secondi con retry

### 5. **Gestione Errori Migliorata**
```typescript
// Gestione specifica degli errori
if (error instanceof TypeError && error.message.includes('AbortError')) {
  return NextResponse.json({ 
    error: "Request timeout - MeteoAM API non risponde",
    details: "Timeout della richiesta",
    location: cityName
  }, { status: 408 });
}

if (error instanceof Error && error.message.includes('API error')) {
  return NextResponse.json({ 
    error: "MeteoAM API temporaneamente non disponibile",
    details: error.message,
    location: cityName
  }, { status: 503 });
}
```

### 6. **Headers CORS**
```typescript
response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

## 🧪 Test Consigliati

### 1. **Test in Locale**
```bash
npm run dev
# Testa MeteoAM su http://localhost:3000
```

### 2. **Test su Vercel**
```bash
npm run build
vercel --prod
# Testa MeteoAM su dominio di produzione
```

### 3. **Monitoraggio Logs**
- Controlla i logs di Vercel per eventuali errori
- I logs mostrano dettagli su timeout, errori API, ecc.

## 📊 Metriche di Successo

- **Tempo di risposta**: < 15 secondi per richieste normali
- **Tasso di successo**: > 85% delle richieste
- **Gestione errori**: Messaggi utente chiari per ogni tipo di errore
- **Resilienza**: Automatico retry per errori temporanei

## 🎯 Prossimi Miglioramenti

1. **Caching**: Implementare cache per ridurre chiamate API
2. **Fallback**: Aggiungere provider alternativi per MeteoAM
3. **Monitoring**: Implementare monitoraggio proattivo
4. **Rate Limiting**: Gestire rate limits delle API esterne

## 🔗 API Utilizzate

- **Nominatim**: `https://nominatim.openstreetmap.org/search`
- **MeteoAM**: `https://api.meteoam.it/deda-ows/api/GetStationRadius`

## 📝 Note Importanti

- MeteoAM fornisce principalmente dati attuali, non previsioni
- I dati min/max sono spesso limitati o non disponibili per giorni futuri
- Le stazioni MeteoAM hanno copertura geografica limitata
- Tempo di risposta variabile (1-20 secondi)
