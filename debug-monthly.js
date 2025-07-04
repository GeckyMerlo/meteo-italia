const axios = require('axios');
const cheerio = require('cheerio');

async function debugMonthlyView() {
  try {
    const { data } = await axios.get('https://www.3bmeteo.com/meteo/roma/mese');
    const $ = cheerio.load(data);
    
    // Debug dei selettori
    console.log('=== DEBUG SELETTORI ===');
    console.log('Elementi .calend-day:', $('.calend-day').length);
    console.log('Elementi .calend-day-current:', $('.calend-day-current').length);
    console.log('Elementi .calend-day-next:', $('.calend-day-next').length);
    
    // Guarda i primi 3 elementi
    console.log('\n=== PRIMI 3 GIORNI ===');
    const selector = '.calend-day, .calend-day-current, .calend-day-next';
    $(selector).slice(0, 3).each((i, el) => {
      const $el = $(el);
      console.log(`Giorno ${i + 1}:`);
      console.log('  HTML completo:', $el.html());
      console.log('  Numero giorno:', $el.find('.calend-day-title strong').text().trim());
      console.log('  Tutti i figli:', $el.children().map((_, child) => $(child).get(0).tagName).get());
      console.log('  Immagini:', $el.find('img').map((_, img) => $(img).attr('src')).get());
      console.log('  ---');
    });
    
    // Cerca direttamente i box giornalieri
    console.log('\n=== RICERCA DIRETTA BOX GIORNALIERI ===');
    
    // Selettori alternativi
    const selectors = [
      '.calend-day',
      '.calend-day-current', 
      '.calend-day-next',
      '[class*="calend"]',
      '[class*="day"]',
      '.day-box',
      '.weather-day'
    ];
    
    selectors.forEach(sel => {
      const found = $(sel);
      if (found.length > 0) {
        console.log(`\nSelettore ${sel}: ${found.length} elementi`);
        
        // Prendi i primi 3 elementi
        found.slice(0, 3).each((i, el) => {
          const $el = $(el);
          console.log(`  Elemento ${i}:`);
          console.log('    Testo:', $el.text().trim());
          console.log('    HTML:', $el.html());
          console.log('    Parent HTML:', $el.parent().html());
        });
      }
    });
    
    // Cerca l'elemento padre che contiene i box
    console.log('\n=== PARENT DEI BOX ===');
    const firstBox = $('.calend-day').first();
    if (firstBox.length > 0) {
      console.log('Parent del primo box:', firstBox.parent().html());
    }
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

debugMonthlyView();
