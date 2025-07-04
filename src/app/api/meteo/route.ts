// app/api/meteo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') || 'milano').toLowerCase();
  const day  = req.nextUrl.searchParams.get('day');           // facoltativo: 1-31
  const url  = `https://www.3bmeteo.com/meteo/${city}/mese`;

  try {
    const { data: html } = await axios.get(url, { timeout: 10_000 });
    const $ = cheerio.load(html);

    // Selettore: tutti i riquadri giorno attivi o correnti nel blocco <div id="mese">
    const boxSelector = '#mese .calend-day, #mese .calend-day-current, #mese .calend-day-next';

    const days = $(boxSelector).map((_, el) => {
      const $el       = $(el);
      const dayNum    = parseInt($el.find('.calend-day-title strong').text().trim(), 10);
      const iconPath  = $el.find('img').attr('src') || '';
      const spans     = $el.find('span');
      const minTemp   = spans.eq(0).text().replace('°C', '').trim(); // min
      const maxTemp   = spans.eq(1).text().replace('°C', '').trim(); // max

      return {
        day: dayNum,
        icon: iconPath.startsWith('http') ? iconPath : `https://www.3bmeteo.com${iconPath}`,
        min: minTemp ? Number(minTemp) : null,
        max: maxTemp ? Number(maxTemp) : null,
      };
    }).get();

    // Se l’utente ha chiesto un giorno specifico (?day=13) filtriamo
    if (day) {
      const d = days.find(o => o.day === Number(day));
      if (!d) {
        return NextResponse.json({ error: 'Giorno non trovato' }, { status: 404 });
      }
      return NextResponse.json({ provider: '3bmeteo', city, ...d });
    }

    return NextResponse.json({ provider: '3bmeteo', city, days });
  } catch (err) {
    return NextResponse.json(
      { error: 'Errore durante lo scraping' },
      { status: 500 },
    );
  }
}