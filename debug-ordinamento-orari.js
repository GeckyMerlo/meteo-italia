const axios = require('axios');
const cheerio = require('cheerio');

// Funzione per calcolare l'offset del giorno per ilMeteo
function getDayOffset(requestedDay) {
  const today = new Date();
  const todayDay = today.getDate();
  
  if (requestedDay === todayDay) {
    return 0;
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (requestedDay === tomorrow.getDate()) {
    return 1;
  }
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  if (requestedDay === dayAfterTomorrow.getDate()) {
    return 2;
  }
  
  for (let i = 3; i <= 7; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    if (requestedDay === futureDate.getDate()) {
      return i;
    }
  }
  
  return -1;
}

async function testOrdinamento() {
  try {
    const city = 'milano';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDate();
    
    console.log(`Testing ordinamento per domani (giorno ${tomorrowDay})`);
    
    const dayOffset = getDayOffset(tomorrowDay);
    const url = `https://www.ilmeteo.it/meteo/${city}/${dayOffset}`;
    
    console.log(`URL: ${url}`);
    
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
      },
      timeout: 10_000
    });
    
    const $ = cheerio.load(html);
    
    const hourlyData = [];
    const table = $('table').first();
    
    if (table.length > 0) {
      table.find('tr').slice(2).each((_, row) => {
        const cells = $(row).find('td, th').map((_, cell) => $(cell).text().trim()).get();
        
        if (cells.length >= 10) {
          const time = cells[0];
          const condition = cells[1];
          const temperature = cells[2];
          
          const timeMatch = time.match(/^(\d{1,2}):?(\d{2})?$/);
          if (timeMatch) {
            const formattedTime = timeMatch[2] ? `${timeMatch[1]}:${timeMatch[2]}` : `${timeMatch[1]}:00`;
            
            hourlyData.push({
              time: formattedTime,
              condition: condition || 'N/A',
              temperature: temperature || 'N/A',
              hour: parseInt(timeMatch[1])
            });
          }
        }
      });
    }
    
    console.log(`\nDati RAW (${hourlyData.length} entries):`);
    hourlyData.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.time} - ${entry.temperature} - ${entry.condition}`);
    });
    
    // Filtra per ore valide (0-23)
    const validHours = hourlyData.filter(hour => hour.hour >= 0 && hour.hour <= 23);
    console.log(`\nDopo filtro ore valide (${validHours.length} entries):`);
    validHours.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.time} - ${entry.temperature} - ${entry.condition}`);
    });
    
    // Ordina per ora
    validHours.sort((a, b) => a.hour - b.hour);
    console.log(`\nDopo ordinamento (${validHours.length} entries):`);
    validHours.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.time} - ${entry.temperature} - ${entry.condition}`);
    });
    
    // Rimuovi duplicati
    const seenHours = new Set();
    const uniqueHours = validHours.filter(hour => {
      const hourKey = hour.hour.toString();
      if (seenHours.has(hourKey)) return false;
      seenHours.add(hourKey);
      return true;
    });
    
    console.log(`\nDopo rimozione duplicati (${uniqueHours.length} entries):`);
    uniqueHours.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.time} - ${entry.temperature} - ${entry.condition}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testOrdinamento();
