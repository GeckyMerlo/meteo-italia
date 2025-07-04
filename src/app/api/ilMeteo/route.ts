// app/api/ilMeteo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') || 'milano').toLowerCase();
  const day = req.nextUrl.searchParams.get('day'); // facoltativo: 1-31

  try {
    // Se richiesto giorno specifico, usa il pattern `/meteo/citta/numerogiorno`
    if (day) {
      // Converti sempre il giorno del mese in offset
      const dayOffset = getDayOffset(Number(day));
      if (dayOffset === -1) {
        return NextResponse.json({ error: 'Giorno non valido o non supportato' }, { status: 404 });
      }
      
      // Usa il pattern /meteo/citta/numerogiorno
      const dayUrl = `https://www.ilmeteo.it/meteo/${city}/${dayOffset}`;
      const { data: dayHtml } = await axios.get(dayUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        },
        timeout: 10_000,
      });
      const $day = cheerio.load(dayHtml);
      
      // Estrai temperature dal giorno attivo
      const activeDay = $day('.forecast_day_selector__list__item__link--active');
      const minTemp = activeDay.find('.forecast_day_selector__list__item__link__values__lower').text().replace('°', '').trim();
      const maxTemp = activeDay.find('.forecast_day_selector__list__item__link__values__higher').text().replace('°', '').trim();
      
      // Estrai descrizione meteo dalla tabella dettagliata
      const table = $day('table').first();
      let weatherDescription = 'Previsioni da ilMeteo';
      let wind = '';
      let humidity = '';        // Analizza la tabella per trovare dettagli meteo
        table.find('tr').slice(2, 5).each((_, row) => {
          const cells = $day(row).find('td, th').map((_, cell) => $day(cell).text().trim()).get();
          
          if (cells.length >= 10) {
            // Colonna 5: Vento (es: "SW 9/12debole")
            if (cells[5] && cells[5].includes('/') && !wind) {
              const windMatch = cells[5].match(/(\d+)\/\d+/);
              if (windMatch) {
                wind = `${windMatch[1]} km/h`;
              }
            }
            
            // Colonna 9: Umidità (es: "32") - deve essere <= 100
            if (cells[9] && /^\d+$/.test(cells[9]) && !humidity) {
              const humidityValue = parseInt(cells[9]);
              if (humidityValue <= 100) {
                humidity = `${humidityValue}%`;
              }
            }
          }
        });

      return NextResponse.json({
        provider: 'ilmeteo',
        city,
        day: Number(day),
        weatherDescription,
        max: maxTemp ? Number(maxTemp) : 'N/A',
        min: minTemp ? Number(minTemp) : 'N/A',
        wind: wind || 'N/A',
        humidity: humidity || 'N/A'
      });
    }

    // Per la vista mensile (tutti i giorni)
    // Invece di usare la vista mensile di ilMeteo, generiamo i giorni a partire da oggi
    const days = [];
    const today = new Date();
    
    // Genera i prossimi 7 giorni a partire da oggi
    for (let i = 0; i < 7; i++) {
      try {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dayOfMonth = currentDate.getDate();
        
        // Ottieni i dati dalla pagina specifica del giorno
        const dayUrl = `https://www.ilmeteo.it/meteo/${city}/${i}`;
        const { data: dayHtml } = await axios.get(dayUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          },
          timeout: 10_000,
        });
        
        const $day = cheerio.load(dayHtml);
        
        // Estrai temperature dal giorno attivo
        const activeDay = $day('.forecast_day_selector__list__item__link--active');
        const minTemp = activeDay.find('.forecast_day_selector__list__item__link__values__lower').text().replace('°', '').trim();
        const maxTemp = activeDay.find('.forecast_day_selector__list__item__link__values__higher').text().replace('°', '').trim();
        
        // Trova icona del tempo
        const iconSpan = activeDay.find('.ss-small');
        const iconClass = iconSpan.attr('class')?.split(' ').find(c => c.startsWith('ss-small')) || '';
        const iconCode = iconClass.replace('ss-small', '');
        
        days.push({
          day: dayOfMonth,
          icon: iconCode ? `https://www.ilmeteo.it/images/weather_sprite2.png#code=${iconCode}` : '',
          min: minTemp ? Number(minTemp) : null,
          max: maxTemp ? Number(maxTemp) : null,
        });
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
        console.error(`Errore per giorno ${i}:`, errorMessage);
        // Aggiungi un giorno placeholder se fallisce
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        days.push({
          day: currentDate.getDate(),
          icon: '',
          min: null,
          max: null,
        });
      }
    }

    return NextResponse.json({ provider: 'ilmeteo', city, days });
  } catch (err) {
    return NextResponse.json(
      { error: 'Errore durante lo scraping' },
      { status: 500 }
    );
  }
}
