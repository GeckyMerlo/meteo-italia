// app/api/3bMeteo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') || 'milano').toLowerCase();
  const day  = req.nextUrl.searchParams.get('day');           // facoltativo: 1-31
  
  try {
    // Se richiesto giorno specifico, combina dati da vista mensile + giornaliera
    if (day) {
      // Prima ottieni temperature dalla vista mensile
      const monthUrl = `https://www.3bmeteo.com/meteo/${city}/mese`;
      const { data: monthHtml } = await axios.get(monthUrl, { timeout: 10_000 });
      const $month = cheerio.load(monthHtml);
      
      // Estrai temperature dalla vista mensile
      const boxSelector = '.calend-day-current, .calend-day-next';
      const requestedDayData = $month(boxSelector).map((_, el) => {
        const $el = $month(el);
        const dayNum = parseInt($el.find('.calend-day-title strong').text().trim(), 10);
        if (dayNum === Number(day)) {
          const iconPath = $el.find('img').attr('src') || '';
          
          // Le temperature sono negli span diretti
          const spans = $el.find('span');
          let minTemp = null;
          let maxTemp = null;
          
          // Primo span: temperatura minima (senza classe)
          // Secondo span: temperatura massima (con classe "arancio")
          spans.each((i, span) => {
            const $span = $month(span);
            const tempText = $span.text().replace('°C', '').trim();
            const temp = parseFloat(tempText);
            
            if (!isNaN(temp)) {
              if ($span.hasClass('arancio')) {
                maxTemp = temp; // Temperatura massima
              } else {
                minTemp = temp; // Temperatura minima
              }
            }
          });
          
          return {
            day: dayNum,
            minTemp: minTemp,
            maxTemp: maxTemp,
            icon: iconPath.startsWith('http') ? iconPath : `https://www.3bmeteo.com${iconPath}`,
          };
        }
        return null;
      }).get().filter(Boolean)[0];

      if (!requestedDayData) {
        return NextResponse.json({ error: 'Giorno non trovato' }, { status: 404 });
      }

      // Poi ottieni vento, umidità e descrizione dalla pagina giornaliera
      const dayUrl = `https://www.3bmeteo.com/meteo/${city}/${day}`;
      const { data: dayHtml } = await axios.get(dayUrl, { timeout: 10_000 });
      const $day = cheerio.load(dayHtml);
      
      // Estrai descrizione meteo
      const weatherDescription = $day('.zoom_prv').last().text().trim();
      
      // Estrai vento e umidità dalle righe orarie
      let wind = '';
      let humidity = '';
      
      // Cerchiamo nei dati delle righe orarie per vento e umidità
      $day('.altriDati-venti').each((_, el) => {
        const windText = $day(el).text().trim();
        const windMatch = windText.match(/(\d+)\s*([A-Z]+)?/);
        if (windMatch && !wind) {
          wind = windMatch[2] ? `${windMatch[1]} km/h ${windMatch[2]}` : `${windMatch[1]} km/h`;
        }
      });
      
      $day('.altriDati-umidita').each((_, el) => {
        const humidityText = $day(el).text().trim();
        const humidityMatch = humidityText.match(/(\d+)%/);
        if (humidityMatch && !humidity) {
          humidity = `${humidityMatch[1]}%`;
        }
      });

      // Fallback: cerca vento nella stringa più specifica
      if (!wind) {
        $day('div:contains("km/h"), span:contains("km/h")').each((_, el) => {
          const text = $day(el).text().trim();
          const windMatch = text.match(/(\d+)\s*km\/h\s*([A-Z]+)?/);
          if (windMatch && !wind) {
            wind = windMatch[2] ? `${windMatch[1]} km/h ${windMatch[2]}` : `${windMatch[1]} km/h`;
          }
        });
      }

      // Fallback: cerca umidità
      if (!humidity) {
        $day('div:contains("%"), span:contains("%")').each((_, el) => {
          const text = $day(el).text().trim();
          const humidityMatch = text.match(/(\d+)%/);
          if (humidityMatch && !humidity && parseInt(humidityMatch[1]) <= 100) {
            humidity = `${humidityMatch[1]}%`;
          }
        });
      }

      return NextResponse.json({
        provider: '3bmeteo',
        city,
        day: Number(day),
        weatherDescription: weatherDescription || 'N/A',
        max: requestedDayData.maxTemp || 'N/A',
        min: requestedDayData.minTemp || 'N/A',
        wind: wind || 'N/A',
        humidity: humidity || 'N/A'
      });
    }

    // Per la vista mensile (tutti i giorni)
    const monthUrl = `https://www.3bmeteo.com/meteo/${city}/mese`;
    const { data: monthHtml } = await axios.get(monthUrl, { timeout: 10_000 });
    const $month = cheerio.load(monthHtml);
    
    // Cerca solo i giorni con dati (corrente e futuri)
    const boxSelector = '.calend-day-current, .calend-day-next';

    const days = $month(boxSelector).map((_, el) => {
      const $el = $month(el);
      const dayNum = parseInt($el.find('.calend-day-title strong').text().trim(), 10);
      const iconPath = $el.find('img').attr('src') || '';
      
      // Le temperature sono negli span diretti
      const spans = $el.find('span');
      let minTemp = null;
      let maxTemp = null;
      
      // Primo span: temperatura minima (senza classe)
      // Secondo span: temperatura massima (con classe "arancio")
      spans.each((i, span) => {
        const $span = $month(span);
        const tempText = $span.text().replace('°C', '').trim();
        const temp = parseFloat(tempText);
        
        if (!isNaN(temp)) {
          if ($span.hasClass('arancio')) {
            maxTemp = temp; // Temperatura massima
          } else {
            minTemp = temp; // Temperatura minima
          }
        }
      });

      return {
        day: dayNum,
        icon: iconPath.startsWith('http') ? iconPath : `https://www.3bmeteo.com${iconPath}`,
        min: minTemp,
        max: maxTemp,
      };
    }).get();

    return NextResponse.json({ provider: '3bmeteo', city, days });
  } catch (err) {
    return NextResponse.json(
      { error: 'Errore durante lo scraping' },
      { status: 500 },
    );
  }
}
