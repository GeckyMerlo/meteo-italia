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
    
    // 2. Ottieni dati MeteoAM con la nuova struttura
    const meteoamUrl = `https://api.meteoam.it/deda-ows/api/GetStationRadius/${lat}/${lon}`;
    console.log("🌡️ Fetching MeteoAM station data...");
    
    const meteoamResponse = await fetch(meteoamUrl);
    const meteoamData = await meteoamResponse.json();
    
    if (!meteoamData || !meteoamData.pointlist || meteoamData.pointlist.length === 0) {
      return NextResponse.json({ 
        error: "No weather stations found",
        provider: "meteoam",
        hourlyData: []
      }, { status: 404 });
    }
    
    // 3. Trova la stazione più vicina con dati validi
    const stationCoords = meteoamData.pointlist[0]; // [lat, lon] della prima stazione
    const stationIndex = 0;
    
    // Ottieni il nome della stazione dalle informazioni extra
    const stationName = meteoamData.extrainfo?.station_name?.[stationIndex] || "Stazione MeteoAM";
    const stationICAO = meteoamData.extrainfo?.station_icao?.[stationIndex] || "";
    
    // Estrai i dati meteorologici per la stazione
    const datasets = meteoamData.datasets?.[stationIndex];
    if (!datasets) {
      return NextResponse.json({ 
        error: "No weather data available",
        provider: "meteoam",
        hourlyData: []
      }, { status: 404 });
    }
    
    // Estrai le serie temporali per la stazione
    const timeseries = meteoamData.timeseries?.[stationIndex] || [];
    console.log(`📊 Found ${timeseries.length} time points for station ${stationName}`);
    
    // Determina quale giorno filtrare basato sul parametro day
    let targetDate = new Date();
    const now = new Date();
    
    if (day === "domani") {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (day === "dopodomani") {
      targetDate.setDate(targetDate.getDate() + 2);
    }
    
    // 4. Genera dati orari basati sui dati reali disponibili
    const hourlyData = [];
    
    // Filtra i dati per il giorno richiesto con logic migliorata
    let filteredTimeseries = [];
    
    if (!day || day === "oggi") {
      // Per oggi: prendi le ore dall'ora corrente in poi (inclusa l'ora attuale)
      const currentHour = new Date(now);
      currentHour.setMinutes(0, 0, 0);
      
      filteredTimeseries = timeseries.filter((timestamp: string) => {
        const tsDate = new Date(timestamp);
        return tsDate >= currentHour && tsDate.toDateString() === now.toDateString();
      });
      
      // Se non ci sono dati dall'ora corrente, prendi i dati più recenti disponibili
      if (filteredTimeseries.length === 0) {
        // Prendi tutti i dati del giorno e ordina per orario
        const allDayData = timeseries.filter((timestamp: string) => {
          const tsDate = new Date(timestamp);
          return tsDate.toDateString() === now.toDateString();
        });
        
        // Prendi solo l'ultimo dato disponibile (più recente)
        if (allDayData.length > 0) {
          const sortedData = allDayData.sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
          filteredTimeseries = [sortedData[0]]; // Solo il dato più recente
        }
      }
      
      console.log(`🕐 Filtering from current hour: ${currentHour.getHours()}:00`);
    } else {
      // Per domani/dopodomani: prendi tutti i dati del giorno target
      filteredTimeseries = timeseries.filter((timestamp: string) => {
        const tsDate = new Date(timestamp);
        return tsDate.toDateString() === targetDate.toDateString();
      });
    }
    
    // Ordina i dati cronologicamente
    filteredTimeseries.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
    
    console.log(`🎯 Processing ${filteredTimeseries.length} data points for ${day || 'oggi'}`);
    
    // Se non ci sono dati per i giorni futuri, registra il warning
    if ((day === "domani" || day === "dopodomani") && filteredTimeseries.length === 0) {
      console.log(`⚠️ No data available for ${day} - MeteoAM only provides current data`);
    }
    
    for (let i = 0; i < Math.min(24, filteredTimeseries.length); i++) {
      const timestamp = filteredTimeseries[i];
      const date = new Date(timestamp);
      const hour = date.getHours();
      
      // Trova l'indice originale nel dataset
      const originalIndex = timeseries.indexOf(timestamp);
      if (originalIndex === -1) continue;
      
      // Estrai i dati meteorologici per questo momento
      const temperature = datasets[0]?.[originalIndex] || null; // 2t (temperatura a 2m)
      const humidity = datasets[1]?.[originalIndex] || null;    // r (umidità relativa)
      const pressure = datasets[2]?.[originalIndex] || null;    // pmsl (pressione al livello del mare)
      const windDirection = datasets[3]?.[originalIndex] || null; // wdir (direzione vento)
      const windSpeed = datasets[5]?.[originalIndex] || null;   // wspd (velocità vento)
      const iconCode = datasets[8]?.[originalIndex] || "01";    // icon code
      
      // Determina la condizione meteo basata sui codici icona e umidità
      let condition = "sereno";
      if (iconCode && iconCode !== "01" && iconCode !== "02") {
        if (iconCode.includes("03") || iconCode.includes("04")) condition = "nuvoloso";
        else if (iconCode.includes("09") || iconCode.includes("10")) condition = "pioggia";
        else if (iconCode.includes("11")) condition = "temporale";
        else if (iconCode.includes("13")) condition = "neve";
        else if (iconCode.includes("50")) condition = "nebbia";
        else if (iconCode.includes("02")) condition = "poco nuvoloso";
      } else if (humidity && humidity > 85) {
        condition = "nuvoloso";
      } else if (humidity && humidity > 70) {
        condition = "parz nuvoloso";
      } else if (humidity && humidity > 55) {
        condition = "poco nuvoloso";
      }
      
      // Calcola probabilità di precipitazioni basata sull'umidità e icona
      let precipitationProbability = 0;
      if (iconCode && (iconCode.includes("09") || iconCode.includes("10"))) {
        precipitationProbability = 80;
      } else if (iconCode && iconCode.includes("11")) {
        precipitationProbability = 90;
      } else if (humidity && humidity > 80) {
        precipitationProbability = Math.min(70, Math.round((humidity - 80) * 3.5));
      }
      
      hourlyData.push({
        hour: hour.toString().padStart(2, '0') + ':00',
        timestamp: timestamp,
        temperature: temperature ? Math.round(temperature) : null,
        condition: condition,
        humidity: humidity ? Math.round(humidity) : null,
        wind: windSpeed ? Math.round(windSpeed) : null,
        windDirection: windDirection && windDirection !== "VRB" ? windDirection : null,
        pressure: pressure ? Math.round(pressure) : null,
        icon: iconCode,
        precipitationProbability: precipitationProbability
      });
    }
    
    console.log(`✅ Generated ${hourlyData.length} hourly entries for ${stationName}`);
    
    // Ottieni i dati min/max per il giorno richiesto da extrainfo
    const minMaxData = meteoamData.extrainfo?.station_min_max?.[stationIndex];
    let dailyMinMax = null;
    
    if (minMaxData && minMaxData.length > 0) {
      // Determina quale giorno prendere (0=oggi+2, 1=oggi+1, 2=oggi)
      let dayIndex = 2; // default oggi
      if (day === "domani") dayIndex = 1;
      else if (day === "dopodomani") dayIndex = 0;
      
      const dayData = minMaxData[dayIndex];
      if (dayData && dayData.minCelsius !== "-" && dayData.maxCelsius !== "-") {
        dailyMinMax = {
          min: parseInt(dayData.minCelsius),
          max: parseInt(dayData.maxCelsius),
          date: dayData.localDate
        };
        console.log(`📊 Daily min/max for ${day || 'oggi'}: ${dailyMinMax.min}°/${dailyMinMax.max}°`);
      }
    }
    
    // 5. Restituisci i dati orari formattati
    const isTodayWithLimitedData = (!day || day === "oggi") && hourlyData.length <= 1;
    const hasDataWarning = (day === "domani" || day === "dopodomani") && hourlyData.length === 0;
    
    let warningMessage = undefined;
    if (hasDataWarning) {
      warningMessage = "MeteoAM fornisce solo dati meteorologici attuali, non previsioni per i giorni futuri.";
    } else if (isTodayWithLimitedData) {
      warningMessage = "MeteoAM fornisce solo dati meteorologici attuali. Non sono disponibili previsioni orarie per le ore successive.";
    }
    
    return NextResponse.json({
      provider: "meteoam",
      city: cityName,
      day: day || "oggi",
      station: {
        name: stationName,
        icao: stationICAO,
        coordinates: {
          lat: stationCoords[0],
          lon: stationCoords[1]
        }
      },
      dailyMinMax: dailyMinMax,
      hourlyData: hourlyData,
      hasDataWarning: hasDataWarning || isTodayWithLimitedData,
      warningMessage: warningMessage,
      lastUpdated: new Date().toISOString(),
      source: "MeteoAM (dati reali)",
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
