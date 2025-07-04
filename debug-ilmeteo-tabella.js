const axios = require('axios');
const cheerio = require('cheerio');

async function debugIlMeteoTabella() {
  try {
    console.log('=== DEBUG TABELLA ILMETEO ===');
    
    const url = 'https://www.ilmeteo.it/meteo/milano/0';
    console.log('URL:', url);
    
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      timeout: 10_000,
    });
    
    const $ = cheerio.load(data);
    
    // Trova la prima tabella (quella con i dettagli orari)
    const table = $('table').first();
    if (table.length === 0) {
      console.log('Nessuna tabella trovata');
      return;
    }
    
    console.log('=== HEADER TABELLA ===');
    const headers = table.find('tr').first().find('th, td').map((i, el) => $(el).text().trim()).get();
    console.log('Headers:', headers);
    
    console.log('\n=== RIGHE DATI (prime 10) ===');
    table.find('tr').slice(2, 12).each((i, row) => {
      const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
      
      if (cells.length >= 10) {
        console.log(`\nRiga ${i}:`);
        console.log('  Ora:', cells[0]);
        console.log('  Condizione:', cells[1]);
        console.log('  Temperatura:', cells[2]);
        console.log('  Precipitazioni:', cells[3]);
        console.log('  Vento:', cells[5]);
        console.log('  UV:', cells[6]);
        console.log('  Temperatura percepita:', cells[7]);
        console.log('  Pressione:', cells[8]);
        console.log('  Umidità:', cells[9]);
        console.log('  Visibilità:', cells[10]);
      }
    });
    
    // Cerca pattern di ore per identificare i dati orari
    console.log('\n=== PATTERN ORE ===');
    const hourPattern = /^\d{1,2}:\d{2}$/;
    table.find('tr').slice(2).each((i, row) => {
      const firstCell = $(row).find('td, th').first().text().trim();
      if (hourPattern.test(firstCell)) {
        console.log(`Riga ${i}: ${firstCell} - ${$(row).find('td, th').slice(1, 4).map((_, cell) => $(cell).text().trim()).get().join(' | ')}`);
      }
    });
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

debugIlMeteoTabella();
