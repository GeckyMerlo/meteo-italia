const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

async function testGiorniSpecifici() {
  console.log('🧪 Test giorni specifici per ilMeteo');
  
  const tests = [
    { 
      city: 'roma', 
      day: '0', 
      description: 'Roma - oggi'
    },
    { 
      city: 'milano', 
      day: '1', 
      description: 'Milano - domani'
    },
    { 
      city: 'napoli', 
      day: '2', 
      description: 'Napoli - dopodomani'
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📍 Test: ${test.description}`);
    
    try {
      const url = `${API_BASE}/ilMeteo?city=${test.city}&day=${test.day}`;
      console.log(`   URL: ${url}`);
      
      const response = await axios.get(url);
      
      if (response.status === 200) {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📅 Giorno: ${response.data.day}`);
        console.log(`   🌡️  Temperature: ${response.data.min}°-${response.data.max}°C`);
        console.log(`   🌪️  Vento: ${response.data.wind}`);
        console.log(`   💧 Umidità: ${response.data.humidity}`);
        console.log(`   📝 Descrizione: ${response.data.weatherDescription}`);
      } else {
        console.log(`   ❌ Status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Errore HTTP: ${error.response.status}`);
        console.log(`   📝 Messaggio:`, error.response.data);
      } else {
        console.log(`   ❌ Errore:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Test completati!');
}

testGiorniSpecifici();
