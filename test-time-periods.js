const cities = ['milano', 'roma'];
const days = [2, 3];

async function testTimePeriods() {
  for (const city of cities) {
    console.log(`\n🌆 ${city.toUpperCase()}:`);
    for (const day of days) {
      try {
        const response = await fetch(`http://localhost:3000/api/3bMeteo/orari?city=${city}&day=${day}`);
        const data = await response.json();
        
        console.log(`  Day ${day}: ${data.length} entries`);
        if (data.length === 4) {
          console.log('    ✅ Time periods successfully extracted');
          data.forEach(entry => {
            console.log(`    ${entry.time}: ${entry.condition} - ${entry.temperature}`);
          });
        } else if (data.length === 24) {
          console.log('    ✅ Full hourly data available');
        } else {
          console.log('    ❌ No data available');
        }
      } catch (error) {
        console.error(`  Day ${day}: Error - ${error.message}`);
      }
    }
  }
}

testTimePeriods();
