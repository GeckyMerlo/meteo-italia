// app/api/ilMeteo/orari/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface HourlyWeather {
  time: string;
  condition: string;
  temperature: string;
  precipitation: string;
  wind: string;
  humidity: string;
  feelsLike: string;
  icon: string;
}

// Funzione per dedurre le condizioni meteo dai dati di precipitazione
function getConditionFromPrecipitation(precipitation: string): string {
  if (!precipitation || precipitation.trim() === '') {
    return 'Condizione non disponibile';
  }
  
  const precip = precipitation.toLowerCase();
  
  // Nessuna precipitazione
  if (precip.includes('assenti') || precip.includes('0') || precip.includes('no')) {
    return 'Sereno';
  }
  
  // Precipitazioni leggere
  if (precip.includes('modeste') || precip.includes('deboli') || precip.includes('leggere')) {
    return 'Pioggia leggera';
  }
  
  // Precipitazioni moderate
  if (precip.includes('consistenti') || precip.includes('moderate')) {
    return 'Pioggia moderata';
  }
  
  // Precipitazioni forti
  if (precip.includes('abbondanti') || precip.includes('intense') || precip.includes('forti')) {
    return 'Pioggia intensa';
  }
  
  // Precipitazioni molto forti
  if (precip.includes('molto abbondanti') || precip.includes('violente')) {
    return 'Pioggia molto intensa';
  }
  
  // Neve
  if (precip.includes('neve') || precip.includes('nevicate')) {
    return 'Neve';
  }
  
  // Temporali
  if (precip.includes('temporali') || precip.includes('storm')) {
    return 'Temporale';
  }
  
  // Fallback: se contiene mm indica pioggia
  if (precip.includes('mm')) {
    return 'Pioggia';
  }
  
  return 'Variabile';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'milano';
    const day = searchParams.get('day') || '0';
    
    console.log(`[ilMeteo] Fetching hourly data for city: ${city}, day: ${day}`);
    
    // Il parametro day ora è un offset: 0=oggi, 1=domani, 2=dopodomani, etc.
    const dayOffset = parseInt(day);
    
    // Verifica che l'offset sia valido (0-7 giorni)
    if (isNaN(dayOffset) || dayOffset < 0 || dayOffset > 7) {
      return NextResponse.json({ error: 'Offset giorno non valido (0-7)' }, { status: 404 });
    }
    
    // Usa direttamente l'offset per l'URL di ilMeteo
    const url = `https://www.ilmeteo.it/meteo/${city}/${dayOffset}`;
    console.log(`[ilMeteo] Fetching URL: ${url}`);
    
    // Fetch della pagina
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
      },
      timeout: 10_000,
      responseType: 'text',
      responseEncoding: 'utf8'
    });
    
    const $ = cheerio.load(html);
    
    // Cerca le previsioni orarie nella tabella principale
    const hourlyData: HourlyWeather[] = [];
    
    // Trova la prima tabella (quella con i dettagli orari)
    const table = $('table').first();
    if (table.length > 0) {    // Analizza le righe della tabella (salta header)
    table.find('tr').slice(2).each((_, row) => {
      const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
      
      if (cells.length >= 10) {
        const time = cells[0]; // Colonna 0: Ora
        const condition = cells[1]; // Colonna 1: Condizione
        const temperature = cells[2]; // Colonna 2: Temperatura
        const precipitation = cells[3]; // Colonna 3: Precipitazioni
        const wind = cells[5]; // Colonna 5: Vento
        const feelsLike = cells[7]; // Colonna 7: Temperatura percepita
        const humidity = cells[9]; // Colonna 9: Umidità
        
        // Verifica se l'ora è valida (formato HH:MM o HH)
        const timeMatch = time.match(/^(\d{1,2}):?(\d{2})?$/);
        if (timeMatch) {
          const formattedTime = timeMatch[2] ? `${timeMatch[1]}:${timeMatch[2]}` : `${timeMatch[1]}:00`;
          
          // Trova l'icona e la condizione nella cella della condizione
          const conditionCell = $(row).find('td').eq(1);
          const iconElement = conditionCell.find('img');
          const icon = iconElement.attr('src') || '';
          
          // Migliora l'estrazione della condizione: usa l'attributo alt dell'icona o title
          let extractedCondition = condition;
          if (!extractedCondition || extractedCondition.trim() === '') {
            // Prova a estrarre dall'attributo alt dell'icona
            const altText = iconElement.attr('alt');
            if (altText && altText.trim() !== '') {
              extractedCondition = altText;
            } else {
              // Prova a estrarre dall'attributo title dell'icona
              const titleText = iconElement.attr('title');
              if (titleText && titleText.trim() !== '') {
                extractedCondition = titleText;
              } else {
                // Deduce la condizione dai dati di precipitazione
                extractedCondition = getConditionFromPrecipitation(precipitation);
              }
            }
          }
          
          // Pulisce e formatta la temperatura
          const cleanTemperature = temperature ? temperature.replace(/[^\d.-]/g, '') : '';
          const cleanFeelsLike = feelsLike ? feelsLike.replace(/[^\d.-]/g, '') : '';
          
          // Pulisce e formatta l'umidità
          const cleanHumidity = humidity ? humidity.replace(/[^\d]/g, '') : '';
          
          // Pulisce i dati da caratteri di codifica problematici
          const cleanWind = wind ? wind.replace(/[^\w\s\/\-àèéìòùÀÈÉÌÒÙ]/g, ' ').trim() : '';
          const cleanPrecipitation = precipitation ? precipitation.replace(/[^\w\s\-àèéìòùÀÈÉÌÒÙ]/g, ' ').trim() : '';
          
          // Migliora l'estrazione dell'icona
          const fullIconUrl = icon ? (icon.startsWith('http') ? icon : `https://www.ilmeteo.it${icon}`) : '';
          
          hourlyData.push({
            time: formattedTime,
            condition: extractedCondition || 'Condizione non disponibile',
            temperature: cleanTemperature !== '' ? `${cleanTemperature}°C` : 'N/A',
            precipitation: cleanPrecipitation || 'N/A',
            wind: cleanWind || 'N/A',
            humidity: cleanHumidity !== '' ? `${cleanHumidity}%` : 'N/A',
            feelsLike: cleanFeelsLike !== '' ? `${cleanFeelsLike}°C` : 'N/A',
            icon: fullIconUrl
          });
        }
      }
    });
    }
    
    // Filtra e pulisce i dati orari
    if (hourlyData.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const nextHour = (currentHour + 1) % 24;
      
      console.log(`[ilMeteo] Current hour: ${currentHour}, filtering for dayOffset: ${dayOffset}`);
      
      // Prima: filtra per ore valide (0-23) e aggiungi numero ora per ordinamento
      const validHours = hourlyData.filter(hour => {
        const hourMatch = hour.time.match(/^(\d{1,2}):?(\d{2})?$/);
        if (!hourMatch) return false;
        
        const hourNum = parseInt(hourMatch[1]);
        
        // Salta ore non valide (>= 24)
        if (hourNum >= 24) return false;
        
        // Per oggi (dayOffset = 0), mostra solo dall'ora successiva alle 23:00
        if (dayOffset === 0) {
          return hourNum >= nextHour && hourNum <= 23;
        } else {
          // Per i giorni futuri, mostra tutte le ore dalle 0:00 alle 23:00
          return hourNum >= 0 && hourNum <= 23;
        }
      }).map(hour => ({
        ...hour,
        hourNum: parseInt(hour.time.split(':')[0])
      }));
      
      // Seconda: ordina per ora
      validHours.sort((a, b) => a.hourNum - b.hourNum);
      
      console.log(`[ilMeteo] Valid hours (first 5): ${validHours.slice(0, 5).map(h => h.time).join(', ')}`);
      console.log(`[ilMeteo] Valid hours (last 5): ${validHours.slice(-5).map(h => h.time).join(', ')}`);
      
      // Terzo: rimuovi duplicati (mantenendo il primo di ogni ora)
      const seenHours = new Set();
      const finalData = validHours.filter(hour => {
        const hourKey = hour.hourNum.toString();
        
        if (seenHours.has(hourKey)) return false;
        seenHours.add(hourKey);
        
        return true;
      }).map(hour => {
        // Rimuovi la proprietà hourNum aggiunta per l'ordinamento
        const { hourNum, ...cleanHour } = hour;
        return cleanHour;
      });
      
      console.log(`[ilMeteo] Filtered hourly data: ${hourlyData.length} -> ${finalData.length} entries`);
      console.log(`[ilMeteo] Final data (first 5): ${finalData.slice(0, 5).map(h => h.time).join(', ')}`);
      console.log(`[ilMeteo] Final data (last 5): ${finalData.slice(-5).map(h => h.time).join(', ')}`);
      
      // Sostituisci i dati originali con quelli filtrati
      hourlyData.length = 0;
      hourlyData.push(...finalData);
    }
    
    // Se non troviamo dati orari, restituiamo un fallback con fasce orarie
    if (hourlyData.length === 0) {
      console.log('[ilMeteo] No hourly data found, returning fallback time periods');
      
      // Genera fasce orarie di fallback come 3bMeteo
      const fallbackPeriods = [
        {
          time: '03:00',
          condition: 'Previsioni non disponibili',
          temperature: 'N/A',
          precipitation: 'N/A',
          wind: 'N/A',
          humidity: 'N/A',
          feelsLike: 'N/A',
          icon: ''
        },
        {
          time: '09:00',
          condition: 'Previsioni non disponibili',
          temperature: 'N/A',
          precipitation: 'N/A',
          wind: 'N/A',
          humidity: 'N/A',
          feelsLike: 'N/A',
          icon: ''
        },
        {
          time: '15:00',
          condition: 'Previsioni non disponibili',
          temperature: 'N/A',
          precipitation: 'N/A',
          wind: 'N/A',
          humidity: 'N/A',
          feelsLike: 'N/A',
          icon: ''
        },
        {
          time: '21:00',
          condition: 'Previsioni non disponibili',
          temperature: 'N/A',
          precipitation: 'N/A',
          wind: 'N/A',
          humidity: 'N/A',
          feelsLike: 'N/A',
          icon: ''
        }
      ];
      
      hourlyData.push(...fallbackPeriods);
    }
    
    console.log(`[ilMeteo] Found ${hourlyData.length} hourly entries`);

    return NextResponse.json(hourlyData);
    
  } catch (error) {
    console.error('Error fetching hourly data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hourly weather data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
