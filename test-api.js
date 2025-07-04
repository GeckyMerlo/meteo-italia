// Test script per l'API meteo
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testApi() {
  console.log('🧪 Test dell\'API Meteo Italia\n');
  
  const testCases = [
    { city: 'roma', day: null, description: 'Roma - tutti i giorni' },
    { city: 'milano', day: null, description: 'Milano - tutti i giorni' },
    { city: 'napoli', day: 4, description: 'Napoli - giorno 4' },
    { city: 'torino', day: 15, description: 'Torino - giorno 15' },
    { city: 'città-inesistente', day: null, description: 'Città inesistente (test errore)' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📍 Test: ${testCase.description}`);
    console.log(`   URL: /api/meteo?city=${testCase.city}${testCase.day ? `&day=${testCase.day}` : ''}`);
    
    try {
      const url = `${BASE_URL}/api/meteo?city=${testCase.city}${testCase.day ? `&day=${testCase.day}` : ''}`;
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Dati ricevuti:`, JSON.stringify(response.data, null, 2));
      
      if (response.data.days && Array.isArray(response.data.days)) {
        console.log(`   📅 Giorni disponibili: ${response.data.days.length}`);
        response.data.days.slice(0, 3).forEach(day => {
          console.log(`      • Giorno ${day.day}: ${day.min}°-${day.max}°C`);
        });
      } else if (response.data.day) {
        console.log(`   🌡️  Giorno ${response.data.day}: ${response.data.min}°-${response.data.max}°C`);
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
  testApi().catch(console.error);
}

module.exports = { testApi };
