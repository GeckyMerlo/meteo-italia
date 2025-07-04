// test-ilmeteo.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

const tests = [
  {
    name: 'Roma - tutti i giorni',
    url: `${BASE_URL}/api/ilMeteo?city=roma`,
  },
  {
    name: 'Milano - tutti i giorni',
    url: `${BASE_URL}/api/ilMeteo?city=milano`,
  },
  {
    name: 'Napoli - giorno 4',
    url: `${BASE_URL}/api/ilMeteo?city=napoli&day=4`,
  },
  {
    name: 'Torino - giorno 15',
    url: `${BASE_URL}/api/ilMeteo?city=torino&day=15`,
  },
  {
    name: 'Roma - previsioni orarie oggi',
    url: `${BASE_URL}/api/ilMeteo/orari?city=roma&day=0`,
  },
  {
    name: 'Milano - previsioni orarie domani',
    url: `${BASE_URL}/api/ilMeteo/orari?city=milano&day=1`,
  },
  {
    name: 'Città inesistente (test errore)',
    url: `${BASE_URL}/api/ilMeteo?city=città-inesistente`,
  },
];

async function testIlMeteoApi() {
  console.log('🧪 Test dell\'API ilMeteo');
  
  for (const test of tests) {
    console.log(`📍 Test: ${test.name}`);
    console.log(`   URL: ${test.url.replace(BASE_URL, '')}`);
    
    try {
      const response = await axios.get(test.url, { timeout: 15000 });
      console.log(`   ✅ Status: ${response.status}`);
      
      const data = response.data;
      
      if (data.hourlyData && Array.isArray(data.hourlyData)) {
        console.log(`   ⏰ Previsioni ${data.dataType}: ${data.hourlyData.length} ore disponibili`);
        if (data.hourlyData.length > 0) {
          const first = data.hourlyData[0];
          const last = data.hourlyData[data.hourlyData.length - 1];
          console.log(`      • Prima ora: ${first.time} - ${first.condition} - ${first.temperature}`);
          console.log(`      • Ultima ora: ${last.time} - ${last.condition} - ${last.temperature}`);
        }
      } else if (data.days && Array.isArray(data.days)) {
        console.log(`   📅 Giorni disponibili: ${data.days.length}`);
        data.days.slice(0, 3).forEach(day => {
          console.log(`      • Giorno ${day.day}: ${day.min}°-${day.max}°C`);
        });
      } else if (data.day) {
        console.log(`   🌡️  Giorno ${data.day}: ${data.min}°-${data.max}°C`);
      } else {
        console.log(`   📊 Dati ricevuti:`, JSON.stringify(data, null, 2));
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Errore HTTP: ${error.response.status}`);
        console.log(`   📝 Messaggio:`, error.response.data);
      } else if (error.request) {
        console.log(`   ❌ Errore di rete: Server non raggiungibile`);
      } else {
        console.log(`   ❌ Errore: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Test completati!');
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  testIlMeteoApi().catch(console.error);
}

module.exports = { testIlMeteoApi };
