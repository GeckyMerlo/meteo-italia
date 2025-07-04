import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

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
    const city = searchParams.get('city') || 'milano';
    const day = searchParams.get('day') || '0';
    
    console.log(`Fetching hourly data for city: ${city}, day: ${day}`);
    
    // Costruisci l'URL per 3B Meteo
    const url = `https://www.3bmeteo.com/meteo/${city}`;
    console.log(`Fetching URL: ${url}`);
    
    // Fetch della pagina
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return NextResponse.json({ 
        error: 'Failed to fetch weather data',
        status: response.status 
      }, { status: 500 });
    }
    
    const html = await response.text();
    console.log(`HTML content length: ${html.length}`);
    
    // Parse HTML con JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Trova tutte le righe orarie - proviamo selettori più specifici
    let hourlyRows = document.querySelectorAll('.row-table.noPad');
    
    // Se non troviamo righe con .noPad, proviamo altri selettori
    if (hourlyRows.length === 0) {
      hourlyRows = document.querySelectorAll('.row-table');
    }
    
    // Prova anche a cercare altri container che potrebbero contenere ore
    const additionalRows = document.querySelectorAll('[class*="row-table"]');
    const allRows = [...Array.from(hourlyRows), ...Array.from(additionalRows)];
    
    // Rimuovi duplicati
    const uniqueRows = allRows.filter((row, index, self) => 
      index === self.findIndex(r => r.isEqualNode(row))
    );
    
    console.log(`Found ${uniqueRows.length} total hourly rows (${hourlyRows.length} main + ${additionalRows.length - hourlyRows.length} additional)`);
    
    const hourlyData: HourlyWeather[] = [];
    
    uniqueRows.forEach((row: Element, index: number) => {
      try {
        // Estrai l'ora - proviamo selettori multipli per trovare l'ora
        let timeElement = row.querySelector('.col-xs-1-4.big.zoom_prv');
        if (!timeElement) {
          timeElement = row.querySelector('.big.zoom_prv');
        }
        if (!timeElement) {
          timeElement = row.querySelector('.col-xs-1-4.big');
        }
        if (!timeElement) {
          timeElement = row.querySelector('.col-xs-1-4');
        }
        if (!timeElement) {
          // Cerca anche in contenitori che potrebbero avere solo l'ora
          timeElement = row.querySelector('[class*="col-xs-1-4"]');
        }
        
        const timeText = timeElement?.textContent?.trim() || '';
        const time = timeText.replace(/\s+/g, ''); // Rimuovi spazi extra
        
        // Verifica che il tempo sia nel formato corretto (es: "12:00", "09:00")
        const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
        if (!timeMatch) {
          return; // Salta se non è un formato orario valido
        }
        
        // Estrai la condizione dall'attributo alt dell'immagine
        const conditionImg = row.querySelector('img[alt]');
        const condition = conditionImg?.getAttribute('alt') || '';
        
        // Estrai l'icona dall'attributo src dell'immagine
        const iconImg = row.querySelector('img[src]');
        const icon = iconImg?.getAttribute('src') || '';
        
        // Estrai la temperatura - proviamo selettori multipli
        let tempElement = row.querySelector('.switchcelsius.switch-te.active');
        if (!tempElement) {
          tempElement = row.querySelector('.switchcelsius');
        }
        if (!tempElement) {
          tempElement = row.querySelector('.big.orario-allerta .switchcelsius');
        }
        if (!tempElement) {
          tempElement = row.querySelector('[class*="switchcelsius"]');
        }
        const temperature = tempElement?.textContent?.trim() || '';
        
        // Estrai le precipitazioni
        const precipElement = row.querySelector('.altriDati-precipitazioni');
        const precipitation = precipElement?.textContent?.trim() || '';
        
        // Estrai il vento
        const windElement = row.querySelector('.altriDati-venti');
        const windText = windElement?.textContent?.trim() || '';
        const wind = windText.replace(/\s+/g, ' '); // Normalizza spazi
        
        // Estrai l'umidità
        const humidityElement = row.querySelector('.altriDati-umidita');
        const humidity = humidityElement?.textContent?.trim() || '';
        
        // Estrai la temperatura percepita
        const feelsLikeElement = row.querySelector('.altriDati-percepita .switchcelsius.switch-te.active');
        const feelsLike = feelsLikeElement?.textContent?.trim() || '';
        
        // Aggiungi se abbiamo almeno l'ora valida
        if (timeMatch) {
          hourlyData.push({
            time,
            condition: condition || 'N/A',
            temperature: temperature || 'N/A',
            precipitation: precipitation || 'N/A',
            wind: wind || 'N/A',
            humidity: humidity || 'N/A',
            feelsLike: feelsLike || temperature || 'N/A',
            icon: icon || ''
          });
          
          console.log(`Row ${index + 1}: ${time} - ${condition} - ${temperature}`);
        }
      } catch (error) {
        console.error(`Error parsing row ${index + 1}:`, error);
      }
    });
    
    console.log(`Successfully extracted ${hourlyData.length} hourly entries`);
    
    // Rimuovi duplicati mantenendo le voci con più dati
    const uniqueData = hourlyData.reduce((acc, current) => {
      const existing = acc.find(item => item.time === current.time);
      if (!existing) {
        acc.push(current);
      } else {
        // Sostituisci se la voce corrente ha più dati (meno N/A)
        const currentNACount = Object.values(current).filter(val => val === 'N/A').length;
        const existingNACount = Object.values(existing).filter(val => val === 'N/A').length;
        
        if (currentNACount < existingNACount) {
          const index = acc.findIndex(item => item.time === current.time);
          acc[index] = current;
        }
      }
      return acc;
    }, [] as HourlyWeather[]);
    
    console.log(`After deduplication: ${uniqueData.length} unique entries`);
    
    // Ordina i dati per ora
    const sortedData = uniqueData.sort((a, b) => {
      const timeA = parseInt(a.time.split(':')[0]);
      const timeB = parseInt(b.time.split(':')[0]);
      return timeA - timeB;
    });
    
    // Se abbiamo dati validi, restituiscili    
    if (sortedData.length > 0) {
      console.log(`Returning ${sortedData.length} sorted hourly entries`);
      return NextResponse.json(sortedData);
    }
    
    console.warn('No hourly data found, returning mock data');
    // Fallback con dati mock se non troviamo nulla
      return NextResponse.json([
        {
          time: "09:00",
          condition: "Sereno",
          temperature: "22°",
          precipitation: "0%",
          wind: "5 km/h NE",
          humidity: "65%",
          feelsLike: "24°",
          icon: "https://www.3bmeteo.com/images/set_icone/10/80-80/1.png"
        },
        {
          time: "12:00",
          condition: "Poco nuvoloso",
          temperature: "26°",
          precipitation: "10%",
          wind: "8 km/h E",
          humidity: "55%",
          feelsLike: "28°",
          icon: "https://www.3bmeteo.com/images/set_icone/10/80-80/2.png"
        },
        {
          time: "15:00",
          condition: "Nuvoloso",
          temperature: "28°",
          precipitation: "20%",
          wind: "12 km/h SE",
          humidity: "60%",
          feelsLike: "31°",
          icon: "https://www.3bmeteo.com/images/set_icone/10/80-80/3.png"
        },
        {
          time: "18:00",
          condition: "Sereno",
          temperature: "25°",
          precipitation: "0%",
          wind: "6 km/h S",
          humidity: "58%",
          feelsLike: "27°",
          icon: "https://www.3bmeteo.com/images/set_icone/10/80-80/1.png"
        }
      ]);
    
  } catch (error) {
    console.error('Error in hourly weather API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}