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
    
    // Determina se è il giorno corrente o un giorno futuro
    const isCurrentDay = day === '0' || day.toLowerCase() === 'oggi';
    // Usa ora italiana
    const now = new Date();
    const currentHour = parseInt(now.toLocaleString('it-IT', { hour: '2-digit', hour12: false, timeZone: 'Europe/Rome' }), 10);

    console.log(`Is current day: ${isCurrentDay}, current hour (Europe/Rome): ${currentHour}`);
    
    // Costruisci l'URL per 3B Meteo nel formato /città/numero
    const dayNumber = parseInt(day);
    let url = `https://www.3bmeteo.com/meteo/${city}`;
    
    // Aggiungi il numero del giorno: 0=oggi, 1=domani, 2=dopodomani, etc.
    if (!isNaN(dayNumber)) {
      url = `https://www.3bmeteo.com/meteo/${city}/${dayNumber}`;
    }
    
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
    
    // Prima prova il parsing orario dettagliato
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
    
    // Se non troviamo dati orari specifici, prova a cercare fasce orarie
    if (hourlyData.length === 0) {
      console.log('No hourly data found, trying to parse time periods...');
      
      // Cerca fasce orarie come "Notte H0-6", "Mattina H6-12", etc.
      const timePeriodsRows = document.querySelectorAll('.row-table-xs');
      
      console.log(`Found ${timePeriodsRows.length} time period rows`);
      
      timePeriodsRows.forEach((row: Element, index: number) => {
        try {
          const rowText = row.textContent?.trim() || '';
          
          // Cerca pattern per fasce orarie
          let timeRange = '';
          let displayTime = '';
          
          if (rowText.includes('Notte') && rowText.includes('H0-6')) {
            timeRange = 'H0-6';
            displayTime = '03:00'; // Ora rappresentativa per la notte
          } else if (rowText.includes('Mattina') && rowText.includes('H6-12')) {
            timeRange = 'H6-12';
            displayTime = '09:00'; // Ora rappresentativa per la mattina
          } else if (rowText.includes('Pomeriggio') && rowText.includes('H12-18')) {
            timeRange = 'H12-18';
            displayTime = '15:00'; // Ora rappresentativa per il pomeriggio
          } else if (rowText.includes('Sera') && rowText.includes('H18-24')) {
            timeRange = 'H18-24';
            displayTime = '21:00'; // Ora rappresentativa per la sera
          }
          
          if (timeRange && displayTime) {
            // Estrai la condizione dall'attributo alt dell'immagine
            const conditionImg = row.querySelector('img[alt]');
            let condition = conditionImg?.getAttribute('alt') || '';
            
            // Se non troviamo l'alt dell'immagine, prova a estrarre dal testo
            if (!condition || condition === 'N/A') {
              // Cerca pattern di condizioni nel testo
              const conditionPatterns = [
                'pioggia e schiarite',
                'nuvoloso',
                'possibili temporali',
                'temporale',
                'sereno',
                'poco nuvoloso',
                'molto nuvoloso',
                'coperto',
                'nebbia',
                'foschia',
                'piovoso',
                'neve',
                'grandine'
              ];
              
              for (const pattern of conditionPatterns) {
                if (rowText.toLowerCase().includes(pattern.toLowerCase())) {
                  condition = pattern;
                  break;
                }
              }
              
              // Se ancora non troviamo nulla, prova a estrarre dalla descrizione
              if (!condition || condition === 'N/A') {
                const lines = rowText.split('\n').map(line => line.trim()).filter(line => line);
                for (const line of lines) {
                  if (line.includes('Nubi') || line.includes('Molto nuvoloso') || line.includes('Nuvoloso') || 
                      line.includes('pioggia') || line.includes('temporali') || line.includes('sereno')) {
                    condition = line.substring(0, 50); // Prendi i primi 50 caratteri
                    break;
                  }
                }
              }
            }
            
            // Estrai l'icona dall'attributo src dell'immagine
            const iconImg = row.querySelector('img[src]');
            const icon = iconImg?.getAttribute('src') || '';
            
            // Estrai la temperatura - proviamo selettori multipli
            let tempElement = row.querySelector('.switchcelsius.switch-te.active');
            if (!tempElement) {
              tempElement = row.querySelector('.switchcelsius');
            }
            if (!tempElement) {
              tempElement = row.querySelector('[class*="switchcelsius"]');
            }
            const temperature = tempElement?.textContent?.trim() || '';
            
            // Per le fasce orarie, proviamo a estrarre alcuni dati dal testo
            let precipitation = 'N/A';
            let wind = 'N/A';
            let humidity = 'N/A';
            
            // Estrai precipitazioni dal testo
            const precipMatch = rowText.match(/prec\.\s*:\s*([^venti]+)/i);
            if (precipMatch) {
              precipitation = precipMatch[1].trim();
            }
            
            // Estrai vento dal testo
            const windMatch = rowText.match(/venti\s*:\s*([^umidità]+)/i);
            if (windMatch) {
              wind = windMatch[1].trim();
            }
            
            // Estrai umidità dal testo
            const humidityMatch = rowText.match(/umidità\s*:\s*(\d+%)/i);
            if (humidityMatch) {
              humidity = humidityMatch[1];
            }
            
            const feelsLike = temperature || 'N/A';
            
            if (condition || temperature) {
              hourlyData.push({
                time: displayTime,
                condition: condition || 'N/A',
                temperature: temperature || 'N/A',
                precipitation,
                wind,
                humidity,
                feelsLike,
                icon: icon || ''
              });
              
              console.log(`Time period ${index + 1}: ${displayTime} (${timeRange}) - ${condition} - ${temperature}`);
            }
          }
        } catch (error) {
          console.error(`Error parsing time period row ${index + 1}:`, error);
        }
      });
    }
    
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
    
    // DEBUG: stampa tutte le ore trovate e l'ora attuale italiana
    console.log('DEBUG - Tutte le ore trovate:', uniqueData.map(d => d.time));
    console.log('DEBUG - Ora attuale italiana (Europe/Rome):', currentHour);
    
    // Se abbiamo dati validi, processali in base al tipo di giorno
    if (sortedData.length > 0) {
      let finalData = sortedData;
      
      if (!isCurrentDay) {
        // Per i giorni futuri, mostra solo i dati reali disponibili (nessun completamento)
        console.log('Processing future day - showing only real data available');
        finalData = sortedData;
        console.log(`Future day: returning ${finalData.length} real hourly entries`);
      } else {
        // Per il giorno corrente, usa solo i dati disponibili dall'ora attuale in poi (inclusi minuti)
        // Calcola orario attuale in formato HH:mm
        const nowRome = new Date().toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Rome' });
        const [currentHourStr, currentMinuteStr] = nowRome.split(':');
        const currentHourMinute = parseInt(currentHourStr, 10) * 60 + parseInt(currentMinuteStr, 10);
        console.log(`Current day - showing hours from ${nowRome} onwards (minuti inclusi)`);
        finalData = sortedData.filter(item => {
          const [itemHourStr, itemMinuteStr] = item.time.split(':');
          const itemHour = parseInt(itemHourStr);
          const itemMinute = parseInt(itemMinuteStr);
          const nowMinute = parseInt(now.toLocaleString('it-IT', { minute: '2-digit', timeZone: 'Europe/Rome' }), 10);
          // DEBUG: logga ogni confronto
          const isAfter = itemHour > currentHour || (itemHour === currentHour && itemMinute >= nowMinute);
          console.log(`DEBUG - Ora card: ${item.time} (${itemHour}:${itemMinute}) >= ${currentHour}:${nowMinute} ?`, isAfter);
          return isAfter;
        });
        console.log(`Current day filtered to ${finalData.length} hours`);
      }
      
      console.log(`Returning ${finalData.length} real hourly entries`);
      return NextResponse.json(finalData);
    }
    
    console.warn('No hourly data found on the website');
    
    // Restituisci un array vuoto invece di dati mock
    return NextResponse.json([]);
    
  } catch (error) {
    console.error('Error in hourly weather API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
