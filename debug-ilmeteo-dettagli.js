const axios = require('axios');
const cheerio = require('cheerio');

async function debugIlMeteoDettagli() {
  try {
    console.log('=== DEBUG DETTAGLI ILMETEO GIORNO 0 ===');
    
    const url = 'https://www.ilmeteo.it/meteo/milano/0';
    console.log('URL:', url);
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      timeout: 10_000,
    });
    
    const $ = cheerio.load(data);
    
    // 1. Cerca il giorno attivo
    const attivo = $('.forecast_day_selector__list__item__link--active');
    console.log('\n=== GIORNO ATTIVO ===');
    console.log('Testo:', attivo.text().trim());
    
    // 2. Cerca le temperature del giorno attivo
    const minTemp = attivo.find('.forecast_day_selector__list__item__link__values__lower').text().trim();
    const maxTemp = attivo.find('.forecast_day_selector__list__item__link__values__higher').text().trim();
    console.log('Min temp:', minTemp);
    console.log('Max temp:', maxTemp);
    
    // 3. Cerca tutte le sezioni/container che potrebbero contenere dettagli
    console.log('\n=== SEZIONI DETTAGLI ===');
    
    // Cerca contenitori comuni
    const containers = [
      '.forecast_today',
      '.forecast_detail',
      '.forecast_content',
      '.weather_detail',
      '.meteo_detail',
      '.today_detail',
      '.hourly_detail'
    ];
    
    containers.forEach(selector => {
      const found = $(selector);
      if (found.length > 0) {
        console.log(`${selector}: ${found.length} elementi`);
        found.each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 0 && text.length < 200) {
            console.log(`  [${i}]: ${text.substring(0, 100)}...`);
          }
        });
      }
    });
    
    // 4. Cerca pattern di dettagli meteo (vento, umidità, etc.)
    console.log('\n=== PATTERN DETTAGLI ===');
    
    const patterns = [
      /vento[:\s]*\d+/gi,
      /umidità[:\s]*\d+/gi,
      /pressione[:\s]*\d+/gi,
      /km\/h/gi,
      /m\/s/gi,
      /%/gi
    ];
    
    const pageText = $.text();
    patterns.forEach(pattern => {
      const matches = pageText.match(pattern);
      if (matches) {
        console.log(`Pattern ${pattern}: ${matches.slice(0, 5).join(', ')}`);
      }
    });
    
    // 5. Cerca tabelle con dati strutturati
    console.log('\n=== TABELLE ===');
    $('table').each((i, table) => {
      const $table = $(table);
      const rows = $table.find('tr').length;
      const cols = $table.find('td, th').length;
      console.log(`Tabella ${i}: ${rows} righe, ${cols} celle`);
      
      // Prendi le prime righe per vedere la struttura
      $table.find('tr').slice(0, 3).each((rowIndex, row) => {
        const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
        console.log(`  Riga ${rowIndex}: [${cells.join(' | ')}]`);
      });
    });
    
    // 6. Cerca elementi con attributi data-* che potrebbero contenere info strutturate
    console.log('\n=== ELEMENTI DATA-* ===');
    $('[data-temperature], [data-wind], [data-humidity], [data-pressure]').each((i, el) => {
      const $el = $(el);
      const attrs = {};
      Object.keys(el.attribs).forEach(attr => {
        if (attr.startsWith('data-')) {
          attrs[attr] = el.attribs[attr];
        }
      });
      console.log(`Elemento ${i}:`, attrs);
    });
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

debugIlMeteoDettagli();
