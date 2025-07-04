const axios = require('axios');

async function testApiOrari() {
  try {
    // Test per domani
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDate();
    
    console.log(`Testing API orari per domani (giorno ${tomorrowDay})`);
    
    const response = await axios.get(`http://localhost:3000/api/ilMeteo/orari?city=milano&day=${tomorrowDay}`, {
      timeout: 30000
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Provider: ${response.data.provider}`);
    console.log(`City: ${response.data.city}`);
    console.log(`Day: ${response.data.day}`);
    console.log(`Data Type: ${response.data.dataType}`);
    console.log(`Hourly Data Count: ${response.data.hourlyData.length}`);
    
    console.log('\nPrimi 10 orari:');
    response.data.hourlyData.slice(0, 10).forEach((hour, index) => {
      console.log(`${index + 1}. ${hour.time} - ${hour.temperature}°C - ${hour.condition}`);
    });
    
    console.log('\nUltimi 10 orari:');
    response.data.hourlyData.slice(-10).forEach((hour, index) => {
      console.log(`${response.data.hourlyData.length - 10 + index + 1}. ${hour.time} - ${hour.temperature}°C - ${hour.condition}`);
    });
    
    // Verifica ordinamento
    const hours = response.data.hourlyData.map(h => parseInt(h.time.split(':')[0]));
    const isOrdered = hours.every((hour, index) => {
      if (index === 0) return true;
      return hour >= hours[index - 1];
    });
    
    console.log(`\nOrdinamento corretto: ${isOrdered}`);
    if (!isOrdered) {
      console.log('Ore non ordinate:', hours.join(', '));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApiOrari();
