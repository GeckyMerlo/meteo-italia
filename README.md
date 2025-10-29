# 🌤️ Meteo Italia - Confronto Previsioni

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://geckymerlo.github.io/meteo-italia/)
[![Version](https://img.shields.io/badge/version-2.1-blue)](https://github.com/GeckyMerlo/meteo-italia)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Confronta previsioni meteo da 3 API diverse con sistema di consenso intelligente!**

## 🚀 Demo Live

👉 **[Prova subito il sito!](https://geckymerlo.github.io/meteo-italia/)** 👈

## ✨ Caratteristiche

- 🌐 **3 API meteorologiche gratuite** (nessuna API key richiesta)
- 📊 **Dati REALI e aggiornati** in tempo reale
- 📅 **Previsioni giornaliere** fino a 7 giorni
- ⏰ **Previsioni ORARIE dettagliate** (24 ore al giorno)
- 🧠 **Icone intelligenti con consenso API** - Sistema unico che confronta le 3 API
- 🏙️ **Tutte le città italiane** supportate
- 🌓 **Dark mode / Light mode** con salvataggio preferenze
- 📱 **Responsive design** - funziona su desktop, tablet e mobile
- ⚡ **100% gratuito** - nessun limite, nessuna registrazione

## 🌐 API Utilizzate

| API | Modello | Frequenza Dati | Caratteristiche |
|-----|---------|----------------|-----------------|
| 🔵 **Open-Meteo GFS** | NOAA GFS | Orarie (24h/giorno) | Precipitazioni dettagliate |
| 🟢 **Open-Meteo ECMWF** | ECMWF europeo | Orarie (24h/giorno) | Più accurato per l'Europa |
| 🟣 **wttr.in** | Multi-source | Ogni 3 ore | Descrizioni in italiano |

## 🧠 Sistema di Consenso Intelligente

Le icone nella timeline dei 7 giorni utilizzano un **algoritmo di consenso** che:

1. ✅ Interroga tutte e 3 le API contemporaneamente
2. 🔍 Analizza e categorizza le previsioni
3. ⚖️ Trova la condizione più probabile/grave
4. 💬 Mostra tooltip con livello di accordo (es. "2/3 API concordano")
5. 🛡️ Priorità al maltempo per maggior sicurezza

**Passa il mouse sulle icone per vedere i dettagli del consenso!**

## 📸 Screenshot

### Vista Desktop
![Desktop View](https://via.placeholder.com/800x400/f97316/ffffff?text=Meteo+Italia+-+Desktop+View)

### Previsioni Orarie
![Hourly Forecast](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Previsioni+Orarie+Modal)

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x400/1e3a8a/ffffff?text=Dark+Mode)

## 🚀 Avvio Rapido

### Online
Visita semplicemente: **https://geckymerlo.github.io/meteo-italia/**

### Locale
```bash
# Clone del repository
git clone https://github.com/GeckyMerlo/meteo-italia.git

# Entra nella directory
cd meteo-italia

# Apri index.html nel browser
# Windows
start index.html
# Mac
open index.html
# Linux
xdg-open index.html
```

**Non serve installare nulla!** Il sito è statico e funziona aprendo semplicemente `index.html`.

## 💡 Come Usare

### 1️⃣ Cerca una città
Digita il nome di una città italiana nella barra di ricerca.

### 2️⃣ Seleziona il giorno
Clicca su uno dei 7 giorni nella timeline in alto.

### 3️⃣ Confronta le previsioni
Vedi le previsioni delle 3 API fianco a fianco.

### 4️⃣ Visualizza dettagli orari
Clicca su una card per aprire il modal con le previsioni ora per ora.

### 5️⃣ Scopri il consenso
Passa il mouse sulle icone dei giorni per vedere quante API concordano.

## 🕐 Previsioni Orarie

Ogni card è cliccabile e mostra:

- 🌡️ Temperatura ora per ora
- 💧 Umidità relativa (%)
- 💨 Velocità vento (km/h)
- ☔ Probabilità pioggia (%)
- 🌧️ Precipitazioni previste (mm)
- 🌦️ Condizioni meteo con icone

## 🎨 Tecnologie

- **HTML5** - Struttura semantica
- **CSS3** - Animazioni e gradients
- **Vanilla JavaScript** - Nessun framework, performance ottimali
- **Fetch API** - Chiamate HTTP asincrone
- **LocalStorage** - Salvataggio preferenze tema
- **CSS Grid/Flexbox** - Layout responsive

## 📁 Struttura Progetto

```
meteo-italia/
├── index.html              # Pagina principale
├── app.js                  # Logica applicazione e API calls
├── styles.css              # Stili e animazioni
├── README.md               # Questo file
├── README.txt              # Guida utente testuale
├── PREVISIONI-ORARIE.txt   # Documentazione previsioni orarie
├── ICONE-CONSENSO.txt      # Documentazione sistema consenso
└── .nojekyll               # Configurazione GitHub Pages
```

## 🔧 Configurazione GitHub Pages

Questo progetto è configurato per GitHub Pages:

1. Branch: `Silvio` (o qualsiasi branch tu scelga)
2. Source: root directory (`/`)
3. File `.nojekyll` presente per evitare Jekyll

**Per abilitare GitHub Pages:**
1. Vai su Settings → Pages
2. Source: Deploy from a branch
3. Branch: `Silvio` → `/` (root)
4. Salva

Il sito sarà disponibile su: `https://[username].github.io/meteo-italia/`

## 🌟 Caratteristiche Avanzate

### Sistema di Consenso API
- Algoritmo intelligente che confronta le previsioni
- Priorità alle condizioni meteo più gravi
- Tooltip interattivi con statistiche di accordo
- Aggiornamento automatico al cambio città

### Gestione Errori
- Fallback graceful se un'API non risponde
- Messaggi di errore user-friendly
- Skeleton loading durante il caricamento

### Performance
- Caricamento parallelo delle API
- Caching dati in memoria
- Ottimizzazione rendering

## 📊 Confronto API

| Caratteristica | GFS | ECMWF | wttr.in |
|---------------|-----|-------|---------|
| Accuratezza Europa | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Dettagli precipitazioni | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Dati orari | ✅ 24h | ✅ 24h | ✅ 8 slot/giorno |
| Giorni disponibili | 7 | 7 | 3 |
| Lingua italiana | ❌ | ❌ | ✅ |

## ❓ FAQ

**Q: Serve una connessione internet?**  
A: Sì, per scaricare i dati dalle API meteorologiche.

**Q: I dati sono reali?**  
A: Sì! Provengono da modelli professionali (NOAA GFS, ECMWF).

**Q: Perché le 3 API mostrano temperature diverse?**  
A: Usano modelli meteo diversi. Le differenze sono normali e utili per il confronto.

**Q: Devo installare Node.js?**  
A: No! Il sito è 100% statico, basta aprire `index.html`.

**Q: Posso aggiungere altre città?**  
A: Il sito supporta automaticamente TUTTE le città italiane.

**Q: Come funziona il consenso delle icone?**  
A: Leggi `ICONE-CONSENSO.txt` per dettagli tecnici completi.

## 🤝 Contribuire

Contributi benvenuti! Apri una issue o una pull request.

## 📝 Changelog

### v2.1 (29 ottobre 2025)
- ✨ Aggiunto sistema di consenso intelligente per icone timeline
- 💬 Tooltip informativi con livello di accordo tra API
- 🔄 Aggiornamento automatico icone al cambio città
- 📚 Documentazione completa in ICONE-CONSENSO.txt

### v2.0
- ⏰ Aggiunte previsioni orarie complete
- 🎨 Modal interattivo per dettagli orari
- 📱 Migliorato responsive design

### v1.0
- 🚀 Rilascio iniziale
- 🌐 3 API meteo integrate
- 🎨 Dark mode
- 📍 Supporto città italiane

## 📄 Licenza

MIT License - Progetto dimostrativo per confronto previsioni meteo.

Non affiliato con i servizi meteorologici ufficiali.

## 🔗 Link Utili

- 📖 [Open-Meteo Documentation](https://open-meteo.com/en/docs)
- 🌐 [wttr.in GitHub](https://github.com/chubin/wttr.in)
- 🚀 [Demo Live](https://geckymerlo.github.io/meteo-italia/)

## 👨‍💻 Autore

**GeckyMerlo**
- GitHub: [@GeckyMerlo](https://github.com/GeckyMerlo)

---

⭐ **Se ti piace il progetto, lascia una stella!** ⭐

🌤️ **Buone previsioni!** 🌦️
