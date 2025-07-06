import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityName = searchParams.get("cityName");
  const day = searchParams.get("day") || "oggi";

  if (!cityName) {
    return NextResponse.json({ error: "cityName is required" }, { status: 400 });
  }

  console.log(`[MeteoAM] Fetching weather data for city: ${cityName}, day: ${day}`);

  try {
    // 1. Ottieni coordinate da Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
    
    const nominatimResponse = await fetch(nominatimUrl);
    const nominatimData = await nominatimResponse.json();
    
    if (!nominatimData || nominatimData.length === 0) {
      console.log(`[MeteoAM] City not found: ${cityName}`);
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    
    const { lat, lon } = nominatimData[0];
    console.log(`[MeteoAM] Found coordinates: lat=${lat}, lon=${lon}`);
    
    // 2. Ottieni dati MeteoAM
    const meteoamUrl = `https://api.meteoam.it/deda-ows/api/GetStationRadius/${lat}/${lon}`;
    
    const meteoamResponse = await fetch(meteoamUrl);
    const meteoamData = await meteoamResponse.json();
    
    if (!meteoamData || !meteoamData.pointlist || meteoamData.pointlist.length === 0) {
      console.log(`[MeteoAM] No weather stations found for coordinates: lat=${lat}, lon=${lon}`);
      return NextResponse.json({ error: "No weather stations found" }, { status: 404 });
    }
    
    // 3. Trova la stazione più vicina con dati validi
    const stationCoords = meteoamData.pointlist[0]; // [lat, lon] della prima stazione
    const stationIndex = 0;
    
    // Ottieni il nome della stazione dalle informazioni extra
    const stationName = meteoamData.extrainfo?.station_name?.[stationIndex] || "Stazione MeteoAM";
    const stationICAO = meteoamData.extrainfo?.station_icao?.[stationIndex] || "";
    
    console.log(`[MeteoAM] Using station: ${stationName} (${stationICAO})`);
    
    // Estrai i dati meteorologici più recenti per la prima stazione
    const datasets = meteoamData.datasets?.[stationIndex];
    if (!datasets) {
      console.log(`[MeteoAM] No weather data available for station: ${stationName}`);
      return NextResponse.json({ error: "No weather data available" }, { status: 404 });
    }
    
    // Parsa i dati essenziali per la weather card
    // Prendi il primo dato disponibile (più recente)
    const temperature = datasets[0]?.[0] || null; // 2t (temperatura a 2m)
    const humidity = datasets[1]?.[0] || null;    // r (umidità relativa)
    const pressure = datasets[2]?.[0] || null;    // pmsl (pressione al livello del mare)
    const windSpeed = datasets[5]?.[0] || null;   // wspd (velocità vento)
    const windDirection = datasets[3]?.[0] || null; // wdir (direzione vento)
    
    console.log(`[MeteoAM] Raw data: temp=${temperature}, humidity=${humidity}, pressure=${pressure}, windSpeed=${windSpeed}`);
    
    // Estrai i valori min/max dalle informazioni extra
    const minMaxData = meteoamData.extrainfo?.station_min_max?.[stationIndex]?.[0];
    let minTemp = null;
    let maxTemp = null;
    let hasRealMinMax = false;
    
    if (minMaxData && minMaxData.minCelsius !== "-" && minMaxData.maxCelsius !== "-") {
      minTemp = parseInt(minMaxData.minCelsius);
      maxTemp = parseInt(minMaxData.maxCelsius);
      hasRealMinMax = true;
      console.log(`[MeteoAM] Min/Max from API: min=${minTemp}, max=${maxTemp}`);
    }
    
    // Se non disponibili e non è un giorno previsionale, usa valori approssimati
    if (temperature !== null && (minTemp === null || maxTemp === null)) {
      if (day === "oggi") {
        // Solo per il giorno attuale, calcola approssimazioni
        minTemp = minTemp || Math.round(temperature - 5);
        maxTemp = maxTemp || Math.round(temperature + 5);
        console.log(`[MeteoAM] Calculated Min/Max for today: min=${minTemp}, max=${maxTemp}`);
      } else {
        // Per i giorni previsionali, lascia null se non disponibili
        console.log(`[MeteoAM] No real Min/Max available for forecast day, keeping null`);
      }
    }
    
    // Calcola distanza approssimata
    const stationLat = stationCoords[0];
    const stationLon = stationCoords[1];
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - stationLat, 2) + 
      Math.pow(parseFloat(lon) - stationLon, 2)
    ) * 111; // Conversione approssimata in km
    
    // Determina condizione meteo migliorata
    const getWeatherCondition = (temp: number | null, humidity: number | null, pressure: number | null, windSpeed: number | null) => {
      if (temp === null) return "Dati non disponibili";
      
      // Condizioni più accurate basate su tutti i parametri
      if (humidity && humidity > 85 && pressure && pressure < 1005) {
        return "Pioggia probabile";
      } else if (humidity && humidity > 80) {
        return "Umido";
      } else if (pressure && pressure < 1000) {
        return "Instabile";
      } else if (windSpeed && windSpeed > 25) {
        return "Ventoso";
      } else if (temp > 30) {
        return "Molto caldo";
      } else if (temp > 25) {
        return "Soleggiato";
      } else if (temp < 0) {
        return "Molto freddo";
      } else if (temp < 5) {
        return "Freddo";
      } else if (temp < 15) {
        return "Fresco";
      } else {
        return "Mite";
      }
    };
    
    const condition = getWeatherCondition(temperature, humidity, pressure, windSpeed);
    
    // Gestione del parametro day (nota: MeteoAM fornisce principalmente dati attuali)
    let dayMessage = "";
    const isForecastDay = day !== "oggi";
    if (isForecastDay) {
      dayMessage = " (dati attuali - MeteoAM non fornisce previsioni)";
    }
    
    console.log(`[MeteoAM] Final condition: ${condition}, distance: ${distance.toFixed(2)}km, isForecast: ${isForecastDay}`);
    
    // 4. Restituisci dati semplificati per la weather card
    return NextResponse.json({
      location: cityName,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      station: {
        name: `${stationName}${stationICAO ? ` (${stationICAO})` : ''}`,
        distance: Math.round(distance * 100) / 100
      },
      temperature: temperature ? Math.round(temperature) : null,
      condition: condition + dayMessage,
      humidity: humidity ? Math.round(humidity) : null,
      pressure: pressure ? Math.round(pressure) : null,
      windSpeed: windSpeed ? Math.round(windSpeed) : null,
      windDirection: windDirection && windDirection !== "VRB" ? Math.round(windDirection) : windDirection,
      minMax: {
        min: minTemp ? Math.round(minTemp) : null,
        max: maxTemp ? Math.round(maxTemp) : null,
        hasRealData: hasRealMinMax
      },
      source: "MeteoAM",
      day: day,
      isForecastDay: isForecastDay,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`[MeteoAM] Error fetching weather card data for ${cityName}:`, error);
    return NextResponse.json({ 
      error: "Failed to fetch weather data",
      details: error instanceof Error ? error.message : 'Unknown error',
      location: cityName
    }, { status: 500 });
  }
}
