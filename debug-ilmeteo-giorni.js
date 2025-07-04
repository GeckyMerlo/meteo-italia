const axios = require('axios');
const cheerio = require('cheerio');

async function testIlMeteoGiorni() {
  try {
    console.log('=== TEST ILMETEO GIORNI SPECIFICI ===');
    
    const citta = 'milano';
    const giorni = [0, 1, 2]; // Oggi, domani, dopodomani
    
    for (const giorno of giorni) {
      const url = `https://www.ilmeteo.it/meteo/${citta}/${giorno}`;
      console.log(`\n=== GIORNO ${giorno} ===`);
      console.log('URL:', url);
      
      try {
        const { data } = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          },
          timeout: 10_000,
        });
        
        const $ = cheerio.load(data);
        
        // Cerca il titolo/data del giorno
        const titleSelector = '.forecast_day_selector__list__item__link--active';
        const title = $(titleSelector).text().trim();
        console.log('Titolo attivo:', title);
        
        // Cerca le temperature principali
        const tempSelectors = [
          '.forecast_day_selector__list__item__link__values__lower',
          '.forecast_day_selector__list__item__link__values__higher'
        ];
        
        tempSelectors.forEach(sel => {
          const temp = $(sel).text().trim();
          console.log(`${sel}:`, temp);
        });
        
        // Cerca le previsioni orarie
        const orariSelectors = [
          '.forecast_hourly_container',
          '.forecast_hourly',
          '.orari_container',
          '.orari'
        ];
        
        orariSelectors.forEach(sel => {
          const found = $(sel);
          console.log(`${sel}: ${found.length} elementi`);
        });
        
        // Cerca eventuali tabelle orarie
        $('table').each((i, table) => {
          const $table = $(table);
          const className = $table.attr('class') || '';
          if (className.includes('orari') || className.includes('hourly')) {
            console.log(`Tabella oraria ${i}:`, className);
          }
        });
        
        // Cerca pattern di ore (00, 06, 12, 18, etc.)
        const hourPattern = /\b(0[0-9]|1[0-9]|2[0-3])\b/g;
        const pageText = $.text();
        const hours = pageText.match(hourPattern);
        if (hours) {
          console.log('Ore trovate:', [...new Set(hours)].slice(0, 10));
        }
        
        console.log('✓ Giorno caricato con successo');
        
      } catch (err) {
        console.error(`✗ Errore per giorno ${giorno}:`, err.message);
      }
    }
    
  } catch (err) {
    console.error('Errore generale:', err.message);
  }
}

testIlMeteoGiorni();
