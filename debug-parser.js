const { JSDOM } = require('jsdom');

async function debugParser() {
  try {
    const response = await fetch('https://www.3bmeteo.com/meteo/milano/2', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    console.log('✅ HTML fetched, length:', html.length);
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Trova tutte le righe con "row-table"
    const rowTables = document.querySelectorAll('[class*="row-table"]');
    console.log('\n🔍 Found row-table elements:', rowTables.length);
    
    rowTables.forEach((row, index) => {
      console.log(`\n📋 Row ${index + 1}:`);
      console.log('   Class:', row.className);
      console.log('   Text content:', row.textContent.trim().substring(0, 100) + '...');
      
      // Cerca elementi con pattern di ore
      const timeElements = row.querySelectorAll('*');
      timeElements.forEach(elem => {
        const text = elem.textContent.trim();
        const timeMatch = text.match(/^\d{1,2}:\d{2}$/);
        if (timeMatch) {
          console.log('   ⏰ Found time element:', text, 'in', elem.tagName, 'with class:', elem.className);
        }
      });
      
      // Cerca immagini meteo
      const images = row.querySelectorAll('img');
      images.forEach(img => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src');
        if (alt && alt.length > 0) {
          console.log('   🌤️  Found weather image:', alt, 'src:', src);
        }
      });
      
      // Cerca temperature
      const tempElements = row.querySelectorAll('[class*="switchcelsius"]');
      tempElements.forEach(temp => {
        console.log('   🌡️  Found temperature:', temp.textContent.trim(), 'class:', temp.className);
      });
    });
    
    // Cerca anche altri elementi che potrebbero contenere ore
    console.log('\n🔍 Searching for time patterns in all elements...');
    const allElements = document.querySelectorAll('*');
    let timeCount = 0;
    
    allElements.forEach(elem => {
      const text = elem.textContent.trim();
      const timeMatch = text.match(/^\d{1,2}:\d{2}$/);
      if (timeMatch && timeCount < 10) {
        console.log(`   ⏰ Time found: ${text} in ${elem.tagName} with class: ${elem.className}`);
        timeCount++;
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugParser();
