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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'roma';
    const day = searchParams.get('day') || '0';
    
    console.log(`Fetching hourly data for city: ${city}, day: ${day}`);
    
    // Mappa delle città principali con i loro codici
    const cityCodeMap: { [key: string]: string } = {
      'roma': '58091',
      'milano': '15146',
      'napoli': '63049',
      'torino': '1272',
      'genova': '10025',
      'bologna': '37006',
      'firenze': '48017',
      'palermo': '82053',
      'catania': '87015',
      'bari': '72006',
      'venezia': '27042',
      'verona': '23091',
      'padova': '28060',
      'trieste': '32006',
      'perugia': '54039',
      'ancona': '42002',
      'cagliari': '92009'
    };
    
    const cityCode = cityCodeMap[city.toLowerCase()] || '58091'; // Default Roma
    
    // Determina se è il giorno corrente
    const isCurrentDay = day === '0' || day.toLowerCase() === 'oggi';
    
    // Costruisci l'URL per Meteo.it
    let url = `https://www.meteo.it/meteo/${city}-${cityCode}`;
    
    // Se è il giorno corrente, usa la pagina "oggi"
    if (isCurrentDay) {
      url = `https://www.meteo.it/meteo/${city}-oggi-${cityCode}`;
    } else {
      // Per i giorni futuri, usa il formato specifico
      const dayNumber = parseInt(day);
      if (!isNaN(dayNumber) && dayNumber > 0) {
        url = `https://www.meteo.it/meteo/${city}-${dayNumber}-giorni-${cityCode}`;
      }
    }
    
    console.log(`Fetching URL: ${url}`);
    
    // Fetch della pagina
    const { data: html } = await axios.get(url, { 
      timeout: 10_000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(html);
    const hourlyData: HourlyWeather[] = [];
    
    // Usa ora italiana per determinare l'ora corrente
    const now = new Date();
    const currentHour = parseInt(now.toLocaleString('it-IT', { hour: '2-digit', hour12: false, timeZone: 'Europe/Rome' }), 10);
    
    console.log(`Current hour (Europe/Rome): ${currentHour}`);
    
    // Cerca le previsioni orarie nella pagina
    // Meteo.it usa vari selettori per le ore
    const hourElements = $('[class*="ore"], .hour-forecast, .hourly-forecast, .time-forecast');
    
    // Se troviamo elementi orari specifici
    if (hourElements.length > 0) {
      hourElements.each((index, element) => {
        const $el = $(element);
        const timeText = $el.find('.time, .hour, .ora').text().trim();
        const temperature = $el.find('.temperature, .temp').text().trim();
        const condition = $el.find('.condition, .weather-condition').text().trim();
        const wind = $el.find('.wind, .vento').text().trim();
        const humidity = $el.find('.humidity, .umidita').text().trim();
        const icon = $el.find('img').attr('src') || '';
        
        if (timeText) {
          const hourMatch = timeText.match(/(\d{1,2})/);
          if (hourMatch) {
            const hour = parseInt(hourMatch[1], 10);
            
            // Se è il giorno corrente, mostra solo ore future
            if (!isCurrentDay || hour >= currentHour) {
              hourlyData.push({
                time: timeText,
                condition: condition || 'N/A',
                temperature: temperature || 'N/A',
                precipitation: 'N/A',
                wind: wind || 'N/A',
                humidity: humidity || 'N/A',
                feelsLike: 'N/A',
                icon: icon.startsWith('http') ? icon : `https://www.meteo.it${icon}`
              });
            }
          }
        }
      });
    }
    
    // Se non troviamo dati orari specifici, proviamo con un parsing più generale
    if (hourlyData.length === 0) {
      // Cerca nelle righe che contengono informazioni orarie
      const rows = $('tr, .row, .forecast-row');
      
      rows.each((index, row) => {
        const $row = $(row);
        const rowText = $row.text();
        
        // Cerca pattern che indicano ore (es: "17", "18", "19")
        const hourMatch = rowText.match(/\b(\d{1,2})\b/);
        if (hourMatch) {
          const hour = parseInt(hourMatch[1], 10);
          
          // Verifica che sia un'ora valida (0-23)
          if (hour >= 0 && hour <= 23) {
            // Se è il giorno corrente, mostra solo ore future
            if (!isCurrentDay || hour >= currentHour) {
              const temperature = $row.find('[class*="temp"]').text().trim() || 
                                rowText.match(/(\d+)°/)?.[1] + '°' || 'N/A';
              
              const conditionEl = $row.find('img');
              const condition = conditionEl.attr('alt') || conditionEl.attr('title') || 'N/A';
              
              const windText = $row.find('[class*="wind"], [class*="vento"]').text().trim() || 
                              rowText.match(/(\d+)\s*km\/h/)?.[0] || 'N/A';
              
              const humidityText = $row.find('[class*="humidity"], [class*="umidita"]').text().trim() || 
                                  rowText.match(/(\d+)%/)?.[0] || 'N/A';
              
              const iconSrc = conditionEl.attr('src') || '';
              
              hourlyData.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                condition: condition,
                temperature: temperature,
                precipitation: 'N/A',
                wind: windText,
                humidity: humidityText,
                feelsLike: 'N/A',
                icon: iconSrc.startsWith('http') ? iconSrc : `https://www.meteo.it${iconSrc}`
              });
            }
          }
        }
      });
    }
    
    // Se ancora non abbiamo dati, generiamo dati di esempio per le prossime ore
    if (hourlyData.length === 0) {
      console.log('No hourly data found, generating sample data');
      
      const startHour = isCurrentDay ? currentHour : 0;
      const endHour = isCurrentDay ? Math.min(currentHour + 12, 23) : 23;
      
      for (let hour = startHour; hour <= endHour; hour += 3) {
        hourlyData.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          condition: 'Dati non disponibili',
          temperature: 'N/A',
          precipitation: 'N/A',
          wind: 'N/A',
          humidity: 'N/A',
          feelsLike: 'N/A',
          icon: ''
        });
      }
    }
    
    console.log(`Found ${hourlyData.length} hourly forecasts`);
    
    return NextResponse.json({
      provider: 'meteo.it',
      city,
      day,
      hourlyData
    });
    
  } catch (error) {
    console.error('Error fetching Meteo.it hourly data:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero dei dati orari da Meteo.it' },
      { status: 500 }
    );
  }
}
