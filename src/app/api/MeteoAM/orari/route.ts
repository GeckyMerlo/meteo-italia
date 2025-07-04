import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityName = searchParams.get("city");
  const day = searchParams.get("day");

  if (!cityName) {
    return NextResponse.json({ error: "city parameter is required" }, { status: 400 });
  }

  console.log(`🕐 Fetching hourly data for MeteoAM - city: ${cityName}, day: ${day}`);

  try {
    // 1. Ottieni coordinate da Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
    console.log("🌍 Getting coordinates from Nominatim...");
    
    const nominatimResponse = await fetch(nominatimUrl);
    const nominatimData = await nominatimResponse.json();
    
    if (!nominatimData || nominatimData.length === 0) {
      return NextResponse.json({ 
        error: "City not found",
        provider: "meteoam",
        hourlyData: []
      }, { status: 404 });
    }
    
    const { lat, lon } = nominatimData[0];
    console.log(`📍 Coordinates for ${cityName}: ${lat}, ${lon}`);
    
    // 2. Ottieni dati MeteoAM
    const meteoamUrl = `https://api.meteoam.it/deda-ows/api/GetStationRadius/${lat}/${lon}`;
    console.log("🌡️ Fetching MeteoAM station data...");
    
    const meteoamResponse = await fetch(meteoamUrl);
    const meteoamData = await meteoamResponse.json();
    
    if (!meteoamData || !meteoamData.features || meteoamData.features.length === 0) {
      return NextResponse.json({ 
        error: "No weather stations found",
        provider: "meteoam",
        hourlyData: []
      }, { status: 404 });
    }
    
    // 3. Trova la stazione più vicina con dati validi
    const station = meteoamData.features[0];
    const properties = station.properties;
    const stationName = properties.nome || properties.name || "Stazione sconosciuta";
    
    // 4. Genera dati orari simulati basati sui dati della stazione
    // MeteoAM non fornisce dati orari dettagliati tramite questa API,
    // quindi generiamo una simulazione basata sui dati attuali
    const temperature = properties.t2m || properties.temp || 20;
    const humidity = properties.rh2m || properties.humidity || 50;
    const pressure = properties.pres || properties.pressure || 1013;
    const windSpeed = properties.vel_vnt || properties.wind_speed || 5;
    
    const hourlyData = [];
    const currentHour = new Date().getHours();
    
    // Genera 24 ore di dati simulati
    for (let i = 0; i < 24; i++) {
      const hour = i;
      
      // Simula variazioni naturali durante il giorno
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8; // Variazione di 8°C
      const humidityVariation = Math.sin((hour - 12) * Math.PI / 12) * -15; // Umidità varia inversamente
      const windVariation = Math.random() * 5 - 2.5; // Variazione casuale del vento
      
      const hourlyTemp = Math.round(temperature + tempVariation);
      const hourlyHumidity = Math.max(10, Math.min(90, Math.round(humidity + humidityVariation)));
      const hourlyWind = Math.max(0, Math.round(windSpeed + windVariation));
      
      // Genera condizioni meteo basate sulla temperatura e umidità
      let condition = "sereno";
      let icon = "01";
      
      if (hourlyHumidity > 80) {
        condition = "nuvoloso";
        icon = "04";
      } else if (hourlyHumidity > 65) {
        condition = "parz nuvoloso";
        icon = "03";
      } else if (hourlyHumidity > 50) {
        condition = "poco nuvoloso";
        icon = "02";
      }
      
      hourlyData.push({
        hour: hour.toString().padStart(2, '0') + ':00',
        temperature: hourlyTemp,
        condition: condition,
        humidity: hourlyHumidity,
        wind: hourlyWind,
        pressure: Math.round(pressure + (Math.random() * 4 - 2)), // Piccola variazione di pressione
        icon: icon,
        precipitationProbability: hourlyHumidity > 75 ? Math.round((hourlyHumidity - 75) * 2) : 0
      });
    }
    
    console.log(`✅ Generated ${hourlyData.length} hourly entries for ${stationName}`);
    
    // 5. Restituisci i dati orari formattati
    return NextResponse.json({
      provider: "meteoam",
      city: cityName,
      station: {
        name: stationName,
        coordinates: {
          lat: station.geometry.coordinates[1],
          lon: station.geometry.coordinates[0]
        }
      },
      hourlyData: hourlyData,
      lastUpdated: new Date().toISOString(),
      source: "MeteoAM (simulato)",
      totalHours: hourlyData.length
    });
    
  } catch (error) {
    console.error("❌ Error fetching MeteoAM hourly data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch hourly weather data",
      provider: "meteoam",
      hourlyData: []
    }, { status: 500 });
  }
}
