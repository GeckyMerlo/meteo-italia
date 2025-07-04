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

// Funzione per calcolare l'offset del giorno per ilMeteo
// ilMeteo usa: 0 = oggi, 1 = domani, 2 = dopodomani, etc.
function getDayOffset(requestedDay: number): number {
  const today = new Date();
  const todayDay = today.getDate();
  
  // Se il giorno richiesto è oggi, usa 0
  if (requestedDay === todayDay) {
    return 0;
  }
  
  // Se il giorno richiesto è domani, usa 1
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (requestedDay === tomorrow.getDate()) {
    return 1;
  }
  
  // Se il giorno richiesto è dopodomani, usa 2
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  if (requestedDay === dayAfterTomorrow.getDate()) {
    return 2;
  }
  
  // Per i giorni successivi, calcola l'offset
  // Supporta fino a 7 giorni nel futuro
  for (let i = 3; i <= 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    if (requestedDay === futureDate.getDate()) {
      return i;
    }
  }
  
  // Se non trova corrispondenza, restituisce -1
  return -1;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'milano';
    const day = searchParams.get('day') || '0';
    
    console.log(`Fetching hourly data for city: ${city}, day: ${day}`);
    
    // Converti sempre il giorno del mese in offset
    const dayOffset = getDayOffset(Number(day));
    if (dayOffset === -1) {
      return NextResponse.json({ error: 'Giorno non valido o non supportato' }, { status: 404 });
    }
    
    // Usa il pattern /meteo/citta/numerogiorno
    const url = `https://www.ilmeteo.it/meteo/${city}/${dayOffset}`;
    console.log(`Fetching URL: ${url}`);
    
    // Fetch della pagina
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
      },
      timeout: 10_000
    });
    
    const $ = cheerio.load(html);
    
    // Cerca le previsioni orarie nella tabella principale
    const hourlyData: HourlyWeather[] = [];
    
    // Trova la prima tabella (quella con i dettagli orari)
    const table = $('table').first();
    if (table.length > 0) {
      // Analizza le righe della tabella (salta header)
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
            
            // Trova l'icona nella cella della condizione
            const conditionCell = $(row).find('td').eq(1);
            const iconElement = conditionCell.find('img');
            const icon = iconElement.attr('src') || '';
            
            hourlyData.push({
              time: formattedTime,
              condition: condition || 'N/A',
              temperature: temperature || 'N/A',
              precipitation: precipitation || 'N/A',
              wind: wind || 'N/A',
              humidity: humidity ? `${humidity}%` : 'N/A',
              feelsLike: feelsLike || 'N/A',
              icon: icon.startsWith('http') ? icon : `https://www.ilmeteo.it${icon}`
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
      
      // Prima: filtra per ore valide (0-23) e aggiungi numero ora per ordinamento
      const validHours = hourlyData.filter(hour => {
        const hourMatch = hour.time.match(/^(\d{1,2}):?(\d{2})?$/);
        if (!hourMatch) return false;
        
        const hourNum = parseInt(hourMatch[1]);
        
        // Salta ore non valide (>= 24)
        if (hourNum >= 24) return false;
        
        // Per oggi, mostra solo dall'ora successiva alle 23:00
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
      
      console.log(`Valid hours (first 5): ${validHours.slice(0, 5).map(h => h.time).join(', ')}`);
      console.log(`Valid hours (last 5): ${validHours.slice(-5).map(h => h.time).join(', ')}`);
      
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
      
      console.log(`Filtered hourly data: ${hourlyData.length} -> ${finalData.length} entries`);
      console.log(`Final data (first 5): ${finalData.slice(0, 5).map(h => h.time).join(', ')}`);
      console.log(`Final data (last 5): ${finalData.slice(-5).map(h => h.time).join(', ')}`);
      
      // Sostituisci i dati originali con quelli filtrati
      hourlyData.length = 0;
      hourlyData.push(...finalData);
    }
    
    // Se non troviamo dati orari, restituiamo dati fittizi per fasce orarie
    if (hourlyData.length === 0) {
      console.log('No hourly data found, returning time periods');
      
      // Genera fasce orarie basiche
      const timePeriods = [
        { time: '06:00-12:00', label: 'Mattina' },
        { time: '12:00-18:00', label: 'Pomeriggio' },
        { time: '18:00-24:00', label: 'Sera' },
        { time: '00:00-06:00', label: 'Notte' }
      ];
      
      timePeriods.forEach(period => {
        hourlyData.push({
          time: period.time,
          condition: 'Previsioni generali',
          temperature: 'N/A',
          precipitation: 'N/A',
          wind: 'N/A',
          humidity: 'N/A',
          feelsLike: 'N/A',
          icon: ''
        });
      });
    }
    
    console.log(`Found ${hourlyData.length} hourly entries`);

    return NextResponse.json({
      provider: 'ilmeteo',
      city: city,
      day: parseInt(day),
      hourlyData: hourlyData,
      dataType: hourlyData.length > 0 && hourlyData[0].time.includes('-') ? 'fasce' : 'orarie'
    });
    
  } catch (error) {
    console.error('Error fetching hourly data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch hourly weather data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
