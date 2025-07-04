const axios = require('axios');

async function testModalOrario() {
  console.log('🧪 Test Modal Orario');
  
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  console.log('Data di oggi:', today.toLocaleDateString('it-IT'));
  console.log('Giorno del mese:', dayOfMonth);
  
  try {
    // Test API oraria ilMeteo con giorno del mese
    const response = await axios.get(`http://localhost:3000/api/ilMeteo/orari?city=roma&day=${dayOfMonth}`);
    
    console.log('✅ API oraria ilMeteo funziona');
    console.log('  Ore disponibili:', response.data.hourlyData.length);
    console.log('  Prime 3 ore:', response.data.hourlyData.slice(0, 3).map(h => `${h.time}: ${h.temperature}`));
    
    // Test anche domani
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowDay = tomorrow.getDate();
    
    const tomorrowResponse = await axios.get(`http://localhost:3000/api/ilMeteo/orari?city=roma&day=${tomorrowDay}`);
    console.log('✅ API oraria domani funziona');
    console.log('  Ore disponibili:', tomorrowResponse.data.hourlyData.length);
    
  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

testModalOrario();
