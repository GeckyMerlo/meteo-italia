const axios = require('axios');

async function debugOrariDomani() {
  console.log('🔍 Debug completo orari domani');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDay = tomorrow.getDate();
  
  console.log('Domani:', tomorrow.toLocaleDateString('it-IT'));
  console.log('Giorno del mese domani:', tomorrowDay);
  
  try {
    const response = await axios.get(`http://localhost:3000/api/ilMeteo/orari?city=roma&day=${tomorrowDay}`);
    
    console.log('\n=== TUTTI GLI ORARI PER DOMANI ===');
    console.log('Ore totali:', response.data.hourlyData.length);
    
    response.data.hourlyData.forEach((hour, i) => {
      const hourNum = parseInt(hour.time.split(':')[0]);
      console.log(`${i.toString().padStart(2, '0')}. ${hour.time.padEnd(6)} (${hourNum.toString().padStart(2, '0')}) - ${hour.temperature.padEnd(6)}`);
    });
    
    // Verifica ordine
    console.log('\n=== VERIFICA ORDINE ===');
    let isOrdered = true;
    let prevHour = -1;
    
    for (let i = 0; i < response.data.hourlyData.length; i++) {
      const currentHour = parseInt(response.data.hourlyData[i].time.split(':')[0]);
      if (currentHour <= prevHour) {
        console.log(`❌ Disordine: ${prevHour} -> ${currentHour} alla posizione ${i}`);
        isOrdered = false;
      }
      prevHour = currentHour;
    }
    
    if (isOrdered) {
      console.log('✅ Orari in ordine corretto');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

debugOrariDomani();
