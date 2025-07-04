// Test per scenari specifici
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSpecificScenarios() {
  console.log('🧪 Test Scenari Specifici\n');
  
  const scenarios = [
    {
      name: 'Giorno corrente (oggi)',
      url: `/api/meteo?city=roma&day=${new Date().getDate()}`,
      expected: 'Dati per oggi'
    },
    {
      name: 'Giorno futuro (domani)', 
      url: `/api/meteo?city=milano&day=${new Date().getDate() + 1}`,
      expected: 'Dati per domani'
    },
    {
      name: 'Città con caratteri speciali',
      url: '/api/meteo?city=reggio-emilia',
      expected: 'Gestione caratteri speciali'
    },
    {
      name: 'Città maiuscola',
      url: '/api/meteo?city=ROMA',
      expected: 'Conversione maiuscole/minuscole'
    },
    {
      name: 'Giorno non valido',
      url: '/api/meteo?city=roma&day=50',
      expected: 'Errore per giorno inesistente'
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`📋 Scenario: ${scenario.name}`);
    console.log(`   URL: ${scenario.url}`);
    console.log(`   Aspettato: ${scenario.expected}`);
    
    try {
      const response = await axios.get(`${BASE_URL}${scenario.url}`, { timeout: 10000 });
      console.log(`   ✅ Status: ${response.status}`);
      
      if (response.data.error) {
        console.log(`   ⚠️  Errore: ${response.data.error}`);
      } else if (response.data.day) {
        console.log(`   🌡️  Giorno ${response.data.day}: ${response.data.min}°-${response.data.max}°C`);
      } else if (response.data.days) {
        const validDays = response.data.days.filter(d => d.min !== null && d.max !== null);
        console.log(`   📅 Giorni con dati: ${validDays.length}/${response.data.days.length}`);
        if (validDays.length > 0) {
          console.log(`   🌡️  Primo giorno valido: ${validDays[0].day} (${validDays[0].min}°-${validDays[0].max}°C)`);
        }
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ HTTP ${error.response.status}: ${error.response.data?.error || 'Errore sconosciuto'}`);
      } else {
        console.log(`   ❌ Errore di rete: ${error.message}`);
      }
    }
    
    console.log('');
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  testSpecificScenarios().catch(console.error);
}

module.exports = { testSpecificScenarios };
