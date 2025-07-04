const axios = require('axios');

async function testDomani() {
  console.log('🔍 Test orari per domani');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  
  console.log('Domani:', tomorrow.toLocaleDateString('it-IT'));
  console.log('Giorno del mese domani:', tomorrowDay);
  
  try {
    const response = await axios.get(`http://localhost:3000/api/ilMeteo/orari?city=roma&day=${tomorrowDay}`);
    
    console.log('\n=== ORARI PER DOMANI ===');
    console.log('Ore totali:', response.data.hourlyData.length);
    
    response.data.hourlyData.slice(0, 10).forEach((hour, i) => {
      console.log(`${i.toString().padStart(2, '0')}. ${hour.time.padEnd(6)} - ${hour.temperature.padEnd(6)}`);
    });
    
    if (response.data.hourlyData.length > 10) {
      console.log('... (e altre ore)');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

testDomani();
