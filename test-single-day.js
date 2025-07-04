fetch('http://localhost:3001/api/3bMeteo/orari?city=milano&day=2')
  .then(r => r.json())
  .then(data => {
    console.log('Milano giorno 2:');
    data.forEach(entry => {
      console.log(`  ${entry.time}: ${entry.condition} - ${entry.temperature}`);
      console.log(`    prec: ${entry.precipitation} - vento: ${entry.wind}`);
    });
  })
  .catch(console.error);
