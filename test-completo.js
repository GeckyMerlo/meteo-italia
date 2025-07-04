const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testCompleto() {
  console.log('🧪 Test completo delle API ilMeteo');
  
  console.log('\n=== TEST 1: Vista mensile ===');
  try {
    const response = await axios.get(`${API_BASE}/ilMeteo?city=roma`);
    console.log('✅ Vista mensile Roma:', response.data.days.length, 'giorni');
    console.log('   Primi 3 giorni:', response.data.days.slice(0, 3).map(d => `${d.day}: ${d.min}°-${d.max}°`));
  } catch (error) {
    console.log('❌ Errore vista mensile:', error.message);
  }
  
  console.log('\n=== TEST 2: Giorno specifico ===');
  try {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const response = await axios.get(`${API_BASE}/ilMeteo?city=roma&day=${dayOfMonth}`);
    console.log('✅ Giorno specifico Roma oggi:');
    console.log('  🌡️  Temperature:', response.data.min + '°-' + response.data.max + '°C');
    console.log('  🌪️  Vento:', response.data.wind);
    console.log('  💧 Umidità:', response.data.humidity);
  } catch (error) {
    console.log('❌ Errore giorno specifico:', error.message);
  }
  
  console.log('\n=== TEST 3: Previsioni orarie ===');
  try {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const response = await axios.get(`${API_BASE}/ilMeteo/orari?city=roma&day=${dayOfMonth}`);
    console.log('✅ Previsioni orarie Roma oggi:', response.data.hourlyData.length, 'ore');
    console.log('   Prime 3 ore:', response.data.hourlyData.slice(0, 3).map(h => `${h.time}: ${h.temperature}`));
  } catch (error) {
    console.log('❌ Errore previsioni orarie:', error.message);
  }
  
  console.log('\n=== TEST 4: Confronto con 3bMeteo ===');
  try {
    const ilMeteoResponse = await axios.get(`${API_BASE}/ilMeteo?city=roma`);
    const tbMeteoResponse = await axios.get(`${API_BASE}/3bMeteo?city=roma`);
    
    console.log('✅ Confronto provider:');
    console.log('  ilMeteo giorni:', ilMeteoResponse.data.days.length);
    console.log('  3bMeteo giorni:', tbMeteoResponse.data.days.length);
  } catch (error) {
    console.log('❌ Errore confronto:', error.message);
  }
  
  console.log('\n🎉 Test completati!');
}

testCompleto();
