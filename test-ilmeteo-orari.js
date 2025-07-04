const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testIlMeteoOrari() {
  console.log('🧪 Test dell\'API ilMeteo Orari');
  
  const tests = [
    { 
      city: 'roma', 
      day: '0', 
      description: 'Roma - oggi (offset 0)'
    },
    { 
      city: 'milano', 
      day: '1', 
      description: 'Milano - domani (offset 1)'
    },
    { 
      city: 'napoli', 
      day: '2', 
      description: 'Napoli - dopodomani (offset 2)'
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📍 Test: ${test.description}`);
    
    try {
      const url = `${API_BASE}/ilMeteo/orari?city=${test.city}&day=${test.day}`;
      console.log(`   URL: ${url}`);
      
      const response = await axios.get(url);
      
      if (response.status === 200) {
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📅 Provider: ${response.data.provider}`);
        console.log(`   🕐 Previsioni orarie: ${response.data.hourlyData.length}`);
        
        if (response.data.hourlyData.length > 0) {
          console.log(`   🔍 Prime 3 previsioni:`);
          response.data.hourlyData.slice(0, 3).forEach((hour, i) => {
            console.log(`      ${i + 1}. ${hour.time}: ${hour.temperature} - ${hour.condition}`);
          });
        }
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

testIlMeteoOrari();
