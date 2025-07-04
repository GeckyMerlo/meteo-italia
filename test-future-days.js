const testDays = [2, 3, 4, 5, 6, 7];
const cities = ['milano', 'roma', 'napoli'];

async function test() {
  for (const city of cities) {
    console.log(`\n🌆 Testing ${city.toUpperCase()}:`);
    for (const day of testDays) {
      try {
        const response = await fetch(`http://localhost:3001/api/3bMeteo/orari?city=${city}&day=${day}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          console.log(`   Day ${day}: ${data.length} hours available`);
          if (data.length > 0 && data.length < 10) {
            console.log(`   ⚠️  Only ${data.length} hours found - might be partial data`);
            console.log(`   ⏰ Hours: ${data.map(h => h.time).join(', ')}`);
            console.log(`   📊 Sample data: ${data[0]?.time} - ${data[0]?.condition} - ${data[0]?.temperature}`);
          }
        } else {
          console.log(`   Day ${day}: ERROR - ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   Day ${day}: FETCH ERROR - ${error.message}`);
      }
    }
  }
}

test().catch(console.error);
