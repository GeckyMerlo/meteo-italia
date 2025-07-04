const axios = require('axios');

async function debugOrari() {
  console.log('🔍 Debug Orari per rimuovere duplicati');
  
  const today = new Date();
  const dayOfMonth = today.getDate();
  const currentHour = today.getHours();
  
  console.log('Data di oggi:', today.toLocaleDateString('it-IT'));
  console.log('Ora attuale:', currentHour + ':' + today.getMinutes().toString().padStart(2, '0'));
  console.log('Giorno del mese:', dayOfMonth);
  
  try {
    const response = await axios.get(`http://localhost:3000/api/ilMeteo/orari?city=roma&day=${dayOfMonth}`);
    
    console.log('\n=== TUTTI GLI ORARI ATTUALI ===');
    console.log('Ore totali:', response.data.hourlyData.length);
    
    response.data.hourlyData.forEach((hour, i) => {
      console.log(`${i.toString().padStart(2, '0')}. ${hour.time.padEnd(6)} - ${hour.temperature.padEnd(6)} - ${hour.condition || 'N/A'}`);
    });
    
    // Identifica duplicati per orario
    console.log('\n=== ANALISI DUPLICATI ===');
    const hourCounts = {};
    response.data.hourlyData.forEach(hour => {
      const timeKey = hour.time.split(':')[0]; // Solo l'ora senza minuti
      hourCounts[timeKey] = (hourCounts[timeKey] || 0) + 1;
    });
    
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > 1) {
        console.log(`Ora ${hour}: ${count} duplicati`);
      }
    });
    
    // Suggerisci filtro
    console.log('\n=== FILTRO SUGGERITO ===');
    const nextHour = (currentHour + 1) % 24;
    console.log(`Partire dall'ora: ${nextHour}:00`);
    console.log('Fermarsi alle: 23:00');
    
  } catch (error) {
    console.error('❌ Errore:', error.response?.data || error.message);
  }
}

debugOrari();
