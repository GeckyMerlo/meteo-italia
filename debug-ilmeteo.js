const axios = require('axios');
const cheerio = require('cheerio');

async function debugIlMeteo() {
  try {
    console.log('=== DEBUG ILMETEO DAILY PAGE ===');
    
    // Test per giorno 0 (oggi)
    const urls = [
      'https://www.ilmeteo.it/meteo/roma/0',
      'https://www.ilmeteo.it/meteo/roma/1', 
      'https://www.ilmeteo.it/meteo/roma/2'
    ];
    
    for (const url of urls) {
      console.log(`\n=== TESTING ${url} ===`);
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        },
        timeout: 10_000,
      });
      
      const $ = cheerio.load(data);
      
      // Cerca temperatura min/max nella pagina
      console.log('=== TEMPERATURE ===');
      $('*').each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes('°') && text.length < 10) {
          console.log('Temp found:', text, '- tag:', el.tagName, '- class:', $(el).attr('class'));
        }
      });
      
      // Cerca vento
      console.log('\n=== VENTO ===');
      $('*').each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes('km/h')) {
          console.log('Wind found:', text, '- tag:', el.tagName, '- class:', $(el).attr('class'));
        }
      });
      
      // Cerca umidità
      console.log('\n=== UMIDITÀ ===');
      $('*').each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes('%') && text.match(/\d+%/)) {
          console.log('Humidity found:', text, '- tag:', el.tagName, '- class:', $(el).attr('class'));
        }
      });
      
      // Cerca descrizione meteo
      console.log('\n=== DESCRIZIONE ===');
      const descriptions = [
        $('.forecast_main__weather__description'),
        $('.forecast_main__weather__title'),
        $('.weather_description'),
        $('h1, h2, h3').filter((_, el) => $(el).text().toLowerCase().includes('sereno') || $(el).text().toLowerCase().includes('nuvoloso'))
      ];
      
      descriptions.forEach((desc, i) => {
        if (desc.length > 0) {
          console.log(`Description ${i}:`, desc.text().trim());
        }
      });
      
      break; // Test solo il primo URL per ora
    }
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

debugIlMeteo();
