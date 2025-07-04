const axios = require('axios');

async function debugChiamataAPI() {
  console.log('🔍 Debug chiamata API dal frontend');
  
  const selectedCity = 'roma';
  const selectedDay = 'oggi';
  
  // Simula la logica del frontend
  const today = new Date();
  let dayNumber;
  
  if (selectedDay === 'oggi') {
    dayNumber = today.getDate();
  } else if (selectedDay === 'domani') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    dayNumber = tomorrow.getDate();
  }
  
  console.log('Data di oggi:', today.toLocaleDateString('it-IT'));
  console.log('Giorno selezionato:', selectedDay);
  console.log('Numero giorno calcolato:', dayNumber);
  
  try {
    // Chiamata come farebbe il frontend
    const response = await axios.get(`http://localhost:3000/api/ilMeteo?city=${selectedCity}&day=${dayNumber}`);
    console.log('Risposta API:', response.data);
    
    // Verifica se dovremmo chiamare con offset invece
    console.log('\n--- Confronto con offset ---');
    const offsetResponse = await axios.get(`http://localhost:3000/api/ilMeteo?city=${selectedCity}&day=0`);
    console.log('Risposta con offset 0:', offsetResponse.data);
    
  } catch (error) {
    console.error('Errore:', error.message);
  }
}

debugChiamataAPI();
