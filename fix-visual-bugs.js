// Fix automatico per i principali bug grafici
console.log('🔧 Applicando fix per bug grafici...');

// Fix 1: Rimuovi transizioni eccessive durante il caricamento
function fixTransitions() {
  const style = document.createElement('style');
  style.textContent = `
    /* Fix transizioni aggressive */
    *, *::before, *::after {
      transition-duration: 0.2s !important;
    }
    
    /* Fix per elementi che tremolano */
    .no-flash * {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
    
    /* Fix hover effects troppo marcati */
    .hover\\:scale-\\[1\\.02\\]:hover {
      transform: scale(1.01) !important;
    }
    
    .hover\\:scale-105:hover {
      transform: scale(1.02) !important;
    }
    
    /* Fix shadow eccessive */
    .shadow-3xl {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Fixed excessive transitions');
}

// Fix 2: Correggi contrasti problematici
function fixContrasts() {
  const style = document.createElement('style');
  style.textContent = `
    /* Fix contrasti del tema chiaro */
    .text-amber-600 {
      color: rgb(217 119 6) !important;
    }
    
    .text-amber-700 {
      color: rgb(180 83 9) !important;
    }
    
    .text-amber-800 {
      color: rgb(146 64 14) !important;
    }
    
    /* Fix bordi troppo sottili */
    .border-orange-200 {
      border-color: rgb(254 215 170) !important;
      border-width: 1px !important;
    }
    
    /* Fix background troppo trasparenti */
    .bg-white\\/95 {
      background-color: rgba(255, 255, 255, 0.98) !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Fixed contrast issues');
}

// Fix 3: Responsive breakpoints
function fixResponsive() {
  const style = document.createElement('style');
  style.textContent = `
    /* Fix responsive layout */
    @media (max-width: 640px) {
      .text-7xl {
        font-size: 3rem !important;
      }
      
      .text-4xl {
        font-size: 1.875rem !important;
      }
      
      .text-6xl {
        font-size: 2.25rem !important;
      }
      
      .px-8 {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      
      .py-5 {
        padding-top: 0.75rem !important;
        padding-bottom: 0.75rem !important;
      }
    }
    
    /* Fix overflow issues */
    body {
      overflow-x: hidden !important;
    }
    
    .container {
      max-width: 100% !important;
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Fixed responsive issues');
}

// Fix 4: Performance optimizations
function fixPerformance() {
  const style = document.createElement('style');
  style.textContent = `
    /* Fix performance issues */
    .backdrop-blur-sm {
      backdrop-filter: blur(4px) !important;
    }
    
    /* Riduci complessità animazioni */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Fix per scroll lag */
    .scrollbar-thin {
      scrollbar-width: thin !important;
    }
    
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Fixed performance issues');
}

// Fix 5: Layout stabilization
function fixLayout() {
  const style = document.createElement('style');
  style.textContent = `
    /* Fix layout shift */
    .theme-switcher-container {
      min-height: 3rem !important;
      min-width: 4rem !important;
    }
    
    /* Fix per elementi che saltano */
    img, svg {
      max-width: 100% !important;
      height: auto !important;
    }
    
    /* Fix grid responsivo */
    .grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-4 {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
    }
    
    /* Fix spacing consistente */
    .space-y-8 > * + * {
      margin-top: 1.5rem !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Fixed layout issues');
}

// Applica tutti i fix
function applyAllFixes() {
  console.log('🚀 Applying all visual fixes...');
  
  fixTransitions();
  fixContrasts();
  fixResponsive();
  fixPerformance();
  fixLayout();
  
  console.log('✅ All visual fixes applied!');
  
  // Test finale
  setTimeout(() => {
    console.log('🧪 Running post-fix validation...');
    
    // Verifica che gli elementi principali esistano
    const checks = [
      { name: 'Main element', selector: 'main' },
      { name: 'Header', selector: 'header' },
      { name: 'Theme switcher', selector: '[aria-label*="Cambia tema"]' },
      { name: 'Search bar', selector: 'input[type="text"]' },
      { name: 'Day timeline', selector: '.scrollbar-thin' }
    ];
    
    checks.forEach(check => {
      const element = document.querySelector(check.selector);
      if (element) {
        console.log(`✅ ${check.name}: OK`);
      } else {
        console.log(`❌ ${check.name}: Not found`);
      }
    });
    
    console.log('🏁 Validation complete');
  }, 1000);
}

// Esegui i fix quando la pagina è caricata
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllFixes);
} else {
  applyAllFixes();
}
