import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityName = searchParams.get("cityName");

  if (!cityName) {
    return NextResponse.json({ error: "cityName is required" }, { status: 400 });
  }

  try {
    // 1. Ottieni coordinate da Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
    
    const nominatimResponse = await fetch(nominatimUrl);
    const nominatimData = await nominatimResponse.json();
    
    if (!nominatimData || nominatimData.length === 0) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    
    const { lat, lon } = nominatimData[0];
    
    // 2. Ottieni dati MeteoAM
    const meteoamUrl = `https://api.meteoam.it/deda-ows/api/GetStationRadius/${lat}/${lon}`;
    
    const meteoamResponse = await fetch(meteoamUrl);
    const meteoamData = await meteoamResponse.json();
    
    if (!meteoamData || !meteoamData.pointlist || meteoamData.pointlist.length === 0) {
      return NextResponse.json({ error: "No weather stations found" }, { status: 404 });
    }
    
    // 3. Trova la stazione più vicina con dati validi
    const stationCoords = meteoamData.pointlist[0]; // [lat, lon] della prima stazione
    const stationIndex = 0;
    
    // Ottieni il nome della stazione dalle informazioni extra
    const stationName = meteoamData.extrainfo?.station_name?.[stationIndex] || "Stazione MeteoAM";
    const stationICAO = meteoamData.extrainfo?.station_icao?.[stationIndex] || "";
    
    // Estrai i dati meteorologici più recenti per la prima stazione
    const datasets = meteoamData.datasets?.[stationIndex];
    if (!datasets) {
      return NextResponse.json({ error: "No weather data available" }, { status: 404 });
    }
    
    // Parsa i dati essenziali per la weather card
    // Prendi il primo dato disponibile (più recente)
    const temperature = datasets[0]?.[0] || null; // 2t (temperatura a 2m)
    const humidity = datasets[1]?.[0] || null;    // r (umidità relativa)
    const pressure = datasets[2]?.[0] || null;    // pmsl (pressione al livello del mare)
    const windSpeed = datasets[5]?.[0] || null;   // wspd (velocità vento)
    const windDirection = datasets[3]?.[0] || null; // wdir (direzione vento)
    
    // Estrai i valori min/max dalle informazioni extra
    const minMaxData = meteoamData.extrainfo?.station_min_max?.[stationIndex]?.[0];
    let minTemp = null;
    let maxTemp = null;
    
    if (minMaxData && minMaxData.minCelsius !== "-" && minMaxData.maxCelsius !== "-") {
      minTemp = parseInt(minMaxData.minCelsius);
      maxTemp = parseInt(minMaxData.maxCelsius);
    }
    
    // Se non disponibili, usa valori approssimati
    if (temperature !== null && (minTemp === null || maxTemp === null)) {
      minTemp = minTemp || Math.round(temperature - 5);
      maxTemp = maxTemp || Math.round(temperature + 5);
    }
    
    // Calcola distanza approssimata
    const stationLat = stationCoords[0];
    const stationLon = stationCoords[1];
    const distance = Math.sqrt(
      Math.pow(parseFloat(lat) - stationLat, 2) + 
      Math.pow(parseFloat(lon) - stationLon, 2)
    ) * 111; // Conversione approssimata in km
    
    // Determina condizione meteo basica
    const getWeatherCondition = (temp: number | null, humidity: number | null, pressure: number | null) => {
      if (temp === null) return "Sconosciuto";
      if (humidity && humidity > 85) return "Umido";
      if (pressure && pressure < 1000) return "Instabile";
      if (temp > 25) return "Soleggiato";
      if (temp < 5) return "Freddo";
      return "Nuvoloso";
    };
    
    const condition = getWeatherCondition(temperature, humidity, pressure);
    
    // 4. Restituisci dati semplificati per la weather card
    return NextResponse.json({
      location: cityName,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      station: {
        name: `${stationName}${stationICAO ? ` (${stationICAO})` : ''}`,
        distance: Math.round(distance * 100) / 100
      },
      temperature: temperature ? Math.round(temperature) : null,
      condition: condition,
      humidity: humidity ? Math.round(humidity) : null,
      pressure: pressure ? Math.round(pressure) : null,
      windSpeed: windSpeed ? Math.round(windSpeed) : null,
      windDirection: windDirection && windDirection !== "VRB" ? Math.round(windDirection) : windDirection,
      minMax: {
        min: minTemp ? Math.round(minTemp) : null,
        max: maxTemp ? Math.round(maxTemp) : null
      },
      source: "MeteoAM",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error fetching MeteoAM weather card data:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
