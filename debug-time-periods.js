const { JSDOM } = require('jsdom');

async function debugTimePeriods() {
  try {
    const response = await fetch('https://www.3bmeteo.com/meteo/milano/2', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Cerca le fasce orarie
    const timePeriodsRows = document.querySelectorAll('.row-table-xs');
    console.log(`\n🔍 Found ${timePeriodsRows.length} time period rows`);
    
    timePeriodsRows.forEach((row, index) => {
      const rowText = row.textContent?.trim() || '';
      console.log(`\n📋 Row ${index + 1}:`);
      console.log('   Class:', row.className);
      console.log('   Text:', rowText.substring(0, 150) + '...');
      
      // Cerca immagini meteo
      const images = row.querySelectorAll('img');
      images.forEach(img => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src');
        if (alt && alt.length > 0 && !alt.includes('°')) {
          console.log('   🌤️  Weather image:', alt);
        }
      });
      
      // Cerca temperature
      const tempElements = row.querySelectorAll('[class*="switchcelsius"]');
      tempElements.forEach(temp => {
        const text = temp.textContent.trim();
        if (text && text.includes('°')) {
          console.log('   🌡️  Temperature:', text);
        }
      });
      
      // Identifica fascia oraria
      if (rowText.includes('Notte') && rowText.includes('H0-6')) {
        console.log('   ⏰ Time period: NOTTE (03:00)');
      } else if (rowText.includes('Mattina') && rowText.includes('H6-12')) {
        console.log('   ⏰ Time period: MATTINA (09:00)');
      } else if (rowText.includes('Pomeriggio') && rowText.includes('H12-18')) {
        console.log('   ⏰ Time period: POMERIGGIO (15:00)');
      } else if (rowText.includes('Sera') && rowText.includes('H18-24')) {
        console.log('   ⏰ Time period: SERA (21:00)');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTimePeriods();
