const axios = require('axios');
const cheerio = require('cheerio');

async function verificaDatiReali() {
  console.log('🔍 Verifica dati reali vs API');
  console.log('Data odierna:', new Date().toLocaleDateString('it-IT'));
  
  try {
    // 1. Verifica vista mensile diretta
    console.log('\n=== VERIFICA VISTA MENSILE DIRETTA ===');
    const monthUrl = 'https://www.ilmeteo.it/meteo/roma?lungo_termine=15_giorni';
    const { data: monthHtml } = await axios.get(monthUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      timeout: 10_000,
    });
    
    const $month = cheerio.load(monthHtml);
    const linkSelector = '.forecast_day_selector__list__item__link';
    
    console.log('Giorni trovati nella vista mensile:');
    $month(linkSelector).each((i, el) => {
      const $el = $month(el);
      const daySpan = $el.find('.forecast_day_selector__list__item__link__date span');
      
      if (daySpan.length > 0) {
        const dayNum = daySpan.first().text().trim();
        const minTemp = $el.find('.forecast_day_selector__list__item__link__values__lower').text().trim();
        const maxTemp = $el.find('.forecast_day_selector__list__item__link__values__higher').text().trim();
        
        console.log(`  ${i}: Giorno ${dayNum} - ${minTemp}/${maxTemp}`);
      }
    });
    
    // 2. Verifica giorno oggi diretto
    console.log('\n=== VERIFICA GIORNO OGGI DIRETTO ===');
    const todayUrl = 'https://www.ilmeteo.it/meteo/roma/0';
    const { data: todayHtml } = await axios.get(todayUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      timeout: 10_000,
    });
    
    const $today = cheerio.load(todayHtml);
    const activeDay = $today('.forecast_day_selector__list__item__link--active');
    
    console.log('Giorno attivo (oggi):');
    console.log('  Testo completo:', activeDay.text().trim());
    console.log('  Min temp:', activeDay.find('.forecast_day_selector__list__item__link__values__lower').text().trim());
    console.log('  Max temp:', activeDay.find('.forecast_day_selector__list__item__link__values__higher').text().trim());
    
    // 3. Verifica API
    console.log('\n=== VERIFICA API ===');
    const apiResponse = await axios.get('http://localhost:3000/api/ilMeteo?city=roma');
    console.log('API vista mensile:');
    console.log('  Giorni:', apiResponse.data.days.length);
    console.log('  Primi 3:', apiResponse.data.days.slice(0, 3).map(d => `${d.day}: ${d.min}°-${d.max}°`));
    
    const apiTodayResponse = await axios.get('http://localhost:3000/api/ilMeteo?city=roma&day=0');
    console.log('API giorno oggi:');
    console.log('  Temperature:', apiTodayResponse.data.min + '°-' + apiTodayResponse.data.max + '°');
    
  } catch (error) {
    console.error('Errore:', error.message);
  }
}

verificaDatiReali();
