// Debug completo per identificare bug grafici
console.log('🐛 Debug Bug Grafici');

function debugColors() {
  const isDark = document.documentElement.classList.contains('dark');
  console.log(`\n🎨 Tema attuale: ${isDark ? 'scuro' : 'chiaro'}`);
  
  // Elementi da controllare
  const elements = [
    { name: 'Main Background', selector: 'main' },
    { name: 'Header Title', selector: 'h1' },
    { name: 'Header Subtitle', selector: 'header p' },
    { name: 'Provider Badges', selector: '[class*="bg-orange-100"]' },
    { name: 'Search Bar', selector: 'input[type="text"]' },
    { name: 'Cards', selector: '[class*="bg-white/95"]' },
    { name: 'ThemeSwitcher', selector: '[aria-label*="Cambia tema"]' }
  ];
  
  elements.forEach(el => {
    const element = document.querySelector(el.selector);
    if (element) {
      const styles = window.getComputedStyle(element);
      console.log(`\n${el.name}:`);
      console.log(`  Background: ${styles.backgroundColor}`);
      console.log(`  Color: ${styles.color}`);
      console.log(`  Border: ${styles.borderColor}`);
    } else {
      console.log(`\n❌ ${el.name}: Not found`);
    }
  });
}

function checkClassConsistency() {
  console.log('\n🔍 Verifica coerenza classi CSS:');
  
  // Cerca elementi con palette blu (dovrebbero essere arancioni in tema chiaro)
  const blueElements = document.querySelectorAll('[class*="blue-"], [class*="bg-blue"], [class*="text-blue"], [class*="border-blue"]');
  
  if (blueElements.length > 0) {
    console.log(`⚠️  Trovati ${blueElements.length} elementi con classi blu:`);
    blueElements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.tagName.toLowerCase()}: ${el.className}`);
    });
  } else {
    console.log('✅ Nessun elemento con classi blu trovato');
  }
  
  // Cerca elementi con gradienti problematici
  const gradientElements = document.querySelectorAll('[class*="gradient"]');
  console.log(`\n📐 Elementi con gradienti: ${gradientElements.length}`);
  gradientElements.forEach((el, i) => {
    console.log(`  ${i + 1}. ${el.tagName.toLowerCase()}: ${el.className}`);
  });
}

function checkLayoutIssues() {
  console.log('\n🏗️  Verifica problemi di layout:');
  
  // Verifica overflow
  const body = document.body;
  const bodyRect = body.getBoundingClientRect();
  console.log(`Body dimensions: ${bodyRect.width}x${bodyRect.height}`);
  
  // Verifica elementi che escono dal viewport
  const allElements = document.querySelectorAll('*');
  let overflowCount = 0;
  
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
      overflowCount++;
    }
  });
  
  console.log(`Elementi che escono dal viewport: ${overflowCount}`);
  
  // Verifica z-index
  const highZIndex = document.querySelectorAll('[style*="z-index"], [class*="z-"]');
  console.log(`Elementi con z-index: ${highZIndex.length}`);
}

// Esegui tutti i controlli
setTimeout(() => {
  debugColors();
  checkClassConsistency();
  checkLayoutIssues();
  
  console.log('\n🔧 Soluzioni suggerite:');
  console.log('1. Sostituire classi blu con arancioni nel tema chiaro');
  console.log('2. Verificare responsiveness su schermi piccoli');
  console.log('3. Controllare contrasto testi');
  console.log('4. Verificare animazioni e transizioni');
}, 1000);
