# Meteo Italia 🌤️ 

Un'applicazione Next.js per le previsioni del tempo in Italia con design responsive e supporto per tema scuro/chiaro.

## 🚀 Deploy su Vercel

### Metodo 1: Deploy Automatico con GitHub

1. **Fai il push del codice su GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TUO_USERNAME/meteo-italia.git
   git push -u origin main
   ```

2. **Vai su [vercel.com](https://vercel.com) e:**
   - Accedi con il tuo account GitHub
   - Clicca su "New Project"
   - Importa il repository `meteo-italia`
   - Vercel rileverà automaticamente che è un progetto Next.js
   - Clicca "Deploy"

### Metodo 2: Deploy con Vercel CLI

1. **Installa Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Accedi e deploya:**
   ```bash
   vercel login
   vercel --prod
   ```

## 🔧 Configurazione per il Deploy

Il progetto è già configurato per il deploy su Vercel con:

- ✅ **next.config.ts** ottimizzato per produzione
- ✅ **vercel.json** per configurazioni specifiche
- ✅ **API Route semplificata** (senza Puppeteer per compatibilità serverless)
- ✅ **Build ottimizzato** senza dipendenze problematiche

## 📝 Note Importanti

- L'API attualmente usa **dati mock** per la demo
- Per dati reali, considera l'uso di API meteorologiche pubbliche come:
  - OpenWeatherMap API
  - WeatherAPI
  - AccuWeather API

## 🛠️ Sviluppo Locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📦 Build di Produzione

```bash
npm run build
npm start
```

## 🎨 Caratteristiche

- ✨ Design responsive con Tailwind CSS
- 🌓 Supporto tema scuro/chiaro
- 📱 Interfaccia mobile-friendly
- ⚡ Performance ottimizzate per Vercel
- 🔍 Ricerca città italiana
- 📊 Timeline giornaliera

## 🔗 Link Utili

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://nextjs.org/docs/deployment)
- [Tailwind CSS](https://tailwindcss.com/docs)
