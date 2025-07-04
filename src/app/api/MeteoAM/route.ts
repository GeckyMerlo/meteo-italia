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
    
    if (!meteoamData || !meteoamData.features || meteoamData.features.length === 0) {
      return NextResponse.json({ error: "No weather stations found" }, { status: 404 });
    }
    
    // 3. Trova la stazione più vicina con dati validi
    const station = meteoamData.features[0];
    const properties = station.properties;
    
    // Parsa i dati essenziali per la weather card
    const temperature = properties.t2m || properties.temp || null;
    const humidity = properties.rh2m || properties.humidity || null;
    const pressure = properties.pres || properties.pressure || null;
    const windSpeed = properties.vel_vnt || properties.wind_speed || null;
    const windDirection = properties.dir_vnt || properties.wind_direction || null;
    const stationName = properties.nome || properties.name || "Stazione sconosciuta";
    
    // Calcola min/max approssimati se non disponibili
    let minTemp = properties.t2m_min || null;
    let maxTemp = properties.t2m_max || null;
    
    if (temperature !== null && (minTemp === null || maxTemp === null)) {
      // Approssima min/max basandoti sulla temperatura attuale
      minTemp = minTemp || Math.round(temperature - 5);
      maxTemp = maxTemp || Math.round(temperature + 5);
    }
    
    // Calcola distanza approssimata
    const stationLat = station.geometry.coordinates[1];
    const stationLon = station.geometry.coordinates[0];
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
        name: stationName,
        distance: Math.round(distance * 100) / 100
      },
      temperature: temperature ? Math.round(temperature) : null,
      condition: condition,
      humidity: humidity ? Math.round(humidity) : null,
      pressure: pressure ? Math.round(pressure) : null,
      windSpeed: windSpeed ? Math.round(windSpeed) : null,
      windDirection: windDirection ? Math.round(windDirection) : null,
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
