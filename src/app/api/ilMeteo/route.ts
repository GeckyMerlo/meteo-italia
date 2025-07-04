// app/api/meteo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') || 'milano').toLowerCase();

  /* facoltativo: ?day=5 per avere solo il 5 del mese */
  const dayFilter = req.nextUrl.searchParams.get('day');

  /* prima settimana + link “Fino al …” → 15 giorni             */
  const url = `https://www.ilmeteo.it/meteo/${city}?lungo_termine=15_giorni`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        /* user-agent reale per evitare blocchi anti-bot */
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      timeout: 10_000,
    });

    const $ = cheerio.load(html);

    /* tutti i <a> che contengono data + icona + valori */
    const linkSelector =
      '.forecast_day_selector__list__item__link, ' +
      '.forecast_day_selector__list__item__link--active';

    const days = $(linkSelector)
      .map((_, el) => {
        const $a = $(el);

        /* — giorno (numero) — */
        const dayNum = parseInt(
          $a.find(
            '.forecast_day_selector__list__item__link__date span'
          ).first().text(),
          10
        );

        /* — icona: classe “ss-small##” — */
        const iconSpan = $a.find('.ss-small');
        const iconClass =
          iconSpan.attr('class')?.split(' ').find(c => c.startsWith('ss-small')) ||
          '';
        const iconCode = iconClass.replace('ss-small', ''); // es. "23"

        /* se vuoi il PNG singolo: https://.../weather_sprite2.png#code=23
           (o usa direttamente la sprite sheet via CSS) */

        /* — temperature — */
        const min = $a
          .find('.forecast_day_selector__list__item__link__values__lower')
          .text()
          .replace('°', '')
          .trim();
        const max = $a
          .find('.forecast_day_selector__list__item__link__values__higher')
          .text()
          .replace('°', '')
          .trim();

        return {
          day: dayNum,
          iconCode,     // p.es. "23"
          min: min ? Number(min) : null,
          max: max ? Number(max) : null,
        };
      })
      .get();

    /* filtro opzionale: ?day=7 → solo quel giorno */
    if (dayFilter) {
      const d = days.find(o => o.day === Number(dayFilter));
      if (!d) {
        return NextResponse.json(
          { error: 'Giorno non trovato' },
          { status: 404 }
        );
      }
      return NextResponse.json({ provider: 'ilmeteo', city, ...d });
    }

    return NextResponse.json({ provider: 'ilmeteo', city, days });
  } catch (err) {
    return NextResponse.json(
      { error: 'Errore durante lo scraping' },
      { status: 500 }
    );
  }
}