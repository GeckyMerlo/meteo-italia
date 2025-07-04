#!/usr/bin/env node

/**
 * Fix Visual Bugs Node.js - Meteo Italia
 * Script automatico per identificare e correggere bug grafici comuni
 */

const fs = require('fs');
const path = require('path');

class VisualBugFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    switch (type) {
      case 'error':
        this.errors.push(logEntry);
        console.error(`❌ ${message}`);
        break;
      case 'warning':
        this.warnings.push(logEntry);
        console.warn(`⚠️  ${message}`);
        break;
      case 'fix':
        this.fixes.push(logEntry);
        console.log(`✅ ${message}`);
        break;
      default:
        console.log(`ℹ️  ${message}`);
    }
  }

  // Controlla se un file esiste
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  // Leggi il contenuto di un file
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.log(`Errore lettura file ${filePath}: ${error.message}`, 'error');
      return null;
    }
  }

  // Scrivi il contenuto in un file
  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      this.log(`Errore scrittura file ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  // Fix 1: Migliora contrasti colori
  fixColorContrast() {
    this.log('Controllo contrasti colori...');
    
    const globalsPath = path.join(__dirname, 'src/app/globals.css');
    let content = this.readFile(globalsPath);
    
    if (!content) return;

    let modified = false;

    // Fix contrasto testo su sfondo chiaro - più scuro
    if (content.includes('--foreground: #92400e;')) {
      content = content.replace(
        '--foreground: #92400e;',
        '--foreground: #78350f;'
      );
      modified = true;
      this.log('Migliorato contrasto testo tema chiaro', 'fix');
    }

    // Fix contrasto root tema chiaro
    if (content.includes('--background: #fffbeb;')) {
      content = content.replace(
        '--background: #fffbeb;',
        '--background: #fef3c7;'
      );
      modified = true;
      this.log('Migliorato contrasto sfondo tema chiaro', 'fix');
    }

    if (modified) {
      this.writeFile(globalsPath, content);
    }
  }

  // Fix 2: Stabilizza layout responsive
  fixResponsiveLayout() {
    this.log('Controllo layout responsive...');
    
    const globalsPath = path.join(__dirname, 'src/app/globals.css');
    let content = this.readFile(globalsPath);
    
    if (!content) return;

    let modified = false;

    // Aggiungi media queries per dispositivi piccoli
    const mobileCSS = `
/* Mobile optimization enhanced */
@media (max-width: 480px) {
  .container {
    padding: 0.75rem !important;
    margin: 0 auto;
  }
  
  .text-4xl {
    font-size: 2rem !important;
    line-height: 1.2;
  }
  
  .text-3xl {
    font-size: 1.5rem !important;
    line-height: 1.3;
  }
  
  .p-6 {
    padding: 1rem !important;
  }
  
  .p-8 {
    padding: 1.5rem !important;
  }
  
  .space-y-6 > * + * {
    margin-top: 1rem !important;
  }
  
  /* Fix overflow su mobile */
  .overflow-x-auto {
    padding-bottom: 0.5rem;
  }
}

/* Tablet optimization enhanced */
@media (min-width: 481px) and (max-width: 768px) {
  .container {
    padding: 1rem !important;
  }
  
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
  }
}
`;

    if (!content.includes('Mobile optimization enhanced')) {
      content += mobileCSS;
      modified = true;
      this.log('Aggiunto CSS responsive migliorato', 'fix');
    }

    if (modified) {
      this.writeFile(globalsPath, content);
    }
  }

  // Fix 3: Migliora transizioni temi
  fixThemeTransitions() {
    this.log('Controllo transizioni tema...');
    
    const globalsPath = path.join(__dirname, 'src/app/globals.css');
    let content = this.readFile(globalsPath);
    
    if (!content) return;

    let modified = false;

    // Fix transizioni più fluide e meno aggressive
    if (content.includes('transition-duration: 200ms;')) {
      content = content.replace(
        'transition-duration: 200ms;',
        'transition-duration: 250ms;'
      );
      modified = true;
      this.log('Migliorato timing transizioni tema', 'fix');
    }

    // Aggiungi transizioni per elementi specifici
    const betterTransitions = `
/* Enhanced theme transitions improved */
.bg-gradient-to-br,
.bg-gradient-to-r,
.bg-gradient-to-l {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shadow-xl,
.shadow-2xl,
.shadow-3xl {
  transition: box-shadow 0.3s ease;
}

.border,
.border-2 {
  transition: border-color 0.3s ease;
}

/* Fix per evitare transizioni aggressive */
.theme-switcher button {
  transition: all 0.2s ease !important;
}

.weather-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}
`;

    if (!content.includes('Enhanced theme transitions improved')) {
      content += betterTransitions;
      modified = true;
      this.log('Aggiunte transizioni migliorate per tema', 'fix');
    }

    if (modified) {
      this.writeFile(globalsPath, content);
    }
  }

  // Fix 4: Migliora performance animazioni
  fixAnimationPerformance() {
    this.log('Controllo performance animazioni...');
    
    const globalsPath = path.join(__dirname, 'src/app/globals.css');
    let content = this.readFile(globalsPath);
    
    if (!content) return;

    let modified = false;

    const performanceFixes = `
/* Animation performance optimizations */
.animated-gradient {
  will-change: background-position;
  backface-visibility: hidden;
  perspective: 1000px;
}

.float,
.gentle-bounce,
.scale-hover {
  will-change: transform;
  backface-visibility: hidden;
}

.fade-in-up {
  will-change: opacity, transform;
  backface-visibility: hidden;
}

/* GPU acceleration for smooth animations */
.theme-switcher,
.weather-card,
.timeline-day {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

    if (!content.includes('Animation performance optimizations')) {
      content += performanceFixes;
      modified = true;
      this.log('Aggiunte ottimizzazioni performance animazioni', 'fix');
    }

    if (modified) {
      this.writeFile(globalsPath, content);
    }
  }

  // Fix 5: Migliora accessibilità
  fixAccessibility() {
    this.log('Controllo accessibilità...');
    
    const globalsPath = path.join(__dirname, 'src/app/globals.css');
    let content = this.readFile(globalsPath);
    
    if (!content) return;

    let modified = false;

    const accessibilityFixes = `
/* Accessibility improvements enhanced */
.focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 2px solid #f97316 !important;
  outline-offset: 2px;
}

.dark .focus-visible,
.dark button:focus-visible,
.dark input:focus-visible {
  outline: 2px solid #60a5fa !important;
}

.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white {
    background-color: white !important;
  }
  
  .text-gray-600 {
    color: black !important;
  }
  
  .border-gray-200 {
    border-color: black !important;
  }
  
  .bg-amber-100 {
    background-color: #fcd34d !important;
  }
  
  .text-amber-800 {
    color: #78350f !important;
  }
}
`;

    if (!content.includes('Accessibility improvements enhanced')) {
      content += accessibilityFixes;
      modified = true;
      this.log('Aggiunti miglioramenti accessibilità', 'fix');
    }

    if (modified) {
      this.writeFile(globalsPath, content);
    }
  }

  // Fix 6: Corregge problemi di layout
  fixLayoutIssues() {
    this.log('Controllo problemi layout...');
    
    const globalsPath = path.join(__dirname, 'src/app/globals.css');
    let content = this.readFile(globalsPath);
    
    if (!content) return;

    let modified = false;

    const layoutFixes = `
/* Layout stability fixes */
.container {
  overflow-x: hidden;
  min-height: 100vh;
}

.timeline-container {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.card-container {
  overflow: hidden;
  border-radius: 0.75rem;
}

.text-container {
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

/* Fix per evitare layout shift */
.theme-switcher-container {
  min-height: 3rem;
  min-width: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fix per scrollbar personalizzata */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(251 146 60 / 0.6) rgb(254 243 199);
}

.dark .scrollbar-thin {
  scrollbar-color: rgb(59 130 246 / 0.6) rgb(31 41 55);
}
`;

    if (!content.includes('Layout stability fixes')) {
      content += layoutFixes;
      modified = true;
      this.log('Aggiunti fix stabilità layout', 'fix');
    }

    if (modified) {
      this.writeFile(globalsPath, content);
    }
  }

  // Esegui tutti i fix
  async runAllFixes() {
    this.log('🚀 Avvio correzione bug grafici automatica...');
    
    this.fixColorContrast();
    this.fixResponsiveLayout();
    this.fixThemeTransitions();
    this.fixAnimationPerformance();
    this.fixAccessibility();
    this.fixLayoutIssues();
    
    this.log('🏁 Correzione completata!');
    this.printSummary();
  }

  // Stampa riassunto
  printSummary() {
    console.log('\n📊 RIASSUNTO CORREZIONI:');
    console.log(`✅ Fix applicati: ${this.fixes.length}`);
    console.log(`⚠️  Warning: ${this.warnings.length}`);
    console.log(`❌ Errori: ${this.errors.length}`);
    
    if (this.fixes.length > 0) {
      console.log('\n🔧 Fix applicati:');
      this.fixes.forEach((fix, index) => {
        console.log(`  ${index + 1}. ${fix.split('] ')[1]}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warning:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.split('] ')[1]}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errori:');
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.split('] ')[1]}`);
      });
    }
    
    console.log('\n💡 Passi successivi:');
    console.log('1. Riavvia il server di sviluppo (npm run dev)');
    console.log('2. Testa i temi chiaro/scuro');
    console.log('3. Verifica responsive su dispositivi mobili');
    console.log('4. Controlla contrasti e accessibilità');
  }
}

// Esegui lo script
const fixer = new VisualBugFixer();
fixer.runAllFixes().catch(console.error);
