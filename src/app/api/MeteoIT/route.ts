import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const city = (req.nextUrl.searchParams.get('city') || 'roma').toLowerCase();
  const day = req.nextUrl.searchParams.get('day');
  
  try {
    // Mappa delle città principali con i loro codici
    const cityCodeMap: { [key: string]: string } = {
      'roma': '58091',
      'milano': '15146',
      'napoli': '63049',
      'torino': '1272',
      'genova': '10025',
      'bologna': '37006',
      'firenze': '48017',
      'palermo': '82053',
      'catania': '87015',
      'bari': '72006',
      'venezia': '27042',
      'verona': '23091',
      'padova': '28060',
      'trieste': '32006',
      'perugia': '54039',
      'ancona': '42002',
      'cagliari': '92009',
      'reggio-calabria': '80063',
      'messina': '83048',
      'parma': '34027',
      'modena': '36023',
      'brescia': '17030',
      'reggio-emilia': '35030',
      'ravenna': '39014',
      'foggia': '71043',
      'salerno': '65116',
      'ferrara': '38008',
      'sassari': '90047',
      'bergamo': '16024',
      'trento': '22205',
      'latina': '59011',
      'prato': '48048',
      'taranto': '74023',
      'novara': '3106',
      'piacenza': '33032',
      'cesena': '40007',
      'lecce': '75035',
      'pistoia': '47017',
      'pescara': '68028',
      'arezzo': '51002',
      'como': '13065',
      'vicenza': '24116',
      'livorno': '49009',
      'terni': '55032',
      'rimini': '39044',
      'la-spezia': '11015',
      'grosseto': '53011',
      'viterbo': '56059',
      'pisa': '50026',
      'siena': '52032',
      'udine': '30129',
      'pordenone': '30075',
      'gorizia': '31009',
      'imperia': '8027',
      'savona': '9058',
      'aosta': '7003',
      'asti': '5003',
      'cuneo': '4061',
      'alessandria': '6003',
      'biella': '96007',
      'verbania': '1442',
      'vercelli': '2132',
      'mantova': '20030',
      'cremona': '19076',
      'pavia': '18413',
      'sondrio': '14057',
      'varese': '12133',
      'lecco': '97035',
      'lodi': '98027',
      'belluno': '25005',
      'treviso': '26086',
      'rovigo': '29050',
      'bolzano': '21008',
      'cosenza': '78045',
      'catanzaro': '79023',
      'crotone': '101006',
      'vibo-valentia': '102052',
      'reggio-calabria': '80063',
      'trapani': '81027',
      'agrigento': '84003',
      'caltanissetta': '85007',
      'enna': '86007',
      'ragusa': '88009',
      'siracusa': '89017',
      'nuoro': '91015',
      'oristano': '95026',
      'carbonia': '107009',
      'olbia': '104023',
      'tempio-pausania': '90069',
      'iglesias': '107013',
      'lanusei': '105006',
      'sanluri': '106016',
      'villacidro': '106050',
      'macomer': '91013',
      'alghero': '90003',
      'porto-torres': '90044',
      'tortoli': '105022',
      'ozieri': '90029',
      'siniscola': '91058',
      'isili': '106008',
      'guspini': '106005',
      'ghilarza': '95007',
      'bosa': '95003',
      'santa-teresa-gallura': '104050',
      'la-maddalena': '104014',
      'porto-cervo': '104032',
      'arzachena': '104003',
      'san-teodoro': '104042',
      'budoni': '104008',
      'golfo-aranci': '104015',
      'cannigione': '104010',
      'palau': '104026',
      'santa-maria-coghinas': '104048',
      'valledoria': '104054',
      'castelsardo': '104011',
      'sorso': '104051',
      'stintino': '104052',
      'alghero': '90003',
      'bosa': '95003',
      'cuglieri': '95008',
      'oristano': '95026',
      'cabras': '95004',
      'san-vero-milis': '95027',
      'riola-sardo': '95030',
      'terralba': '95033',
      'marrubiu': '95017',
      'ales': '95001',
      'usellus': '95035',
      'ghilarza': '95007',
      'abbasanta': '95000',
      'paulilatino': '95028',
      'bauladu': '95002',
      'tramatza': '95034',
      'zeddiani': '95036',
      'narbolia': '95018',
      'milis': '95019',
      'san-vero-milis': '95027',
      'riola-sardo': '95030',
      'nurachi': '95024',
      'seneghe': '95031',
      'santu-lussurgiu': '95028',
      'cuglieri': '95008',
      'scano-di-montiferro': '95030',
      'suni': '95032',
      'tinnura': '95033',
      'flussio': '95005',
      'sagama': '95025',
      'modolo': '95020',
      'magomadas': '95016',
      'bosa': '95003',
      'montresta': '95021',
      'sennariolo': '95031',
      'sindia': '95032',
      'macomer': '91013',
      'bortigali': '91006',
      'dualchi': '91009',
      'noragugume': '91016',
      'birori': '91005',
      'borore': '91007',
      'silanus': '91045',
      'sedilo': '91044',
      'aidomaggiore': '91001',
      'neoneli': '91014',
      'ula-tirso': '91047',
      'fordongianus': '91011',
      'allai': '91002',
      'busachi': '91008',
      'ortueri': '91021',
      'nughedu-santa-vittoria': '91017',
      'samugheo': '91041',
      'asuni': '91003',
      'laconi': '91012',
      'genoni': '91010',
      'nureci': '91019',
      'senis': '91043',
      'ruinas': '91040',
      'Villa-sant-antonio': '91049',
      'albagiara': '91000',
      'assolo': '91004',
      'usellus': '91048',
      'simala': '91046',
      'mogorella': '91013',
      'gonnosnò': '91011',
      'pompu': '91031',
      'masullas': '91014',
      'morgongiori': '91015',
      'siris': '91047',
      'simaxis': '91046',
      'villaurbana': '91049',
      'baradili': '91004',
      'gonnoscodina': '91011',
      'gonnostramatza': '91012',
      'siapiccia': '91045',
      'palmas-arborea': '91026',
      'santa-giusta': '91041',
      'cabras': '91008',
      'riola-sardo': '91036',
      'san-vero-milis': '91041',
      'narbolia': '91018',
      'milis': '91016',
      'zeddiani': '91050',
      'tramatza': '91048',
      'bauladu': '91005',
      'nurachi': '91022',
      'seneghe': '91043',
      'santu-lussurgiu': '91042',
      'bonarcado': '91006',
      'cuglieri': '91009',
      'scano-di-montiferro': '91043',
      'suni': '91046',
      'tinnura': '91047',
      'flussio': '91010',
      'sagama': '91040',
      'modolo': '91017',
      'magomadas': '91014',
      'bosa': '91006',
      'montresta': '91018',
      'sennariolo': '91044',
      'sindia': '91045',
      'macomer': '91013',
      'bortigali': '91006',
      'dualchi': '91009',
      'noragugume': '91020',
      'birori': '91005',
      'borore': '91007',
      'silanus': '91045',
      'sedilo': '91044',
      'aidomaggiore': '91001',
      'neoneli': '91019',
      'ula-tirso': '91049',
      'fordongianus': '91011',
      'allai': '91002',
      'busachi': '91008',
      'ortueri': '91024',
      'nughedu-santa-vittoria': '91021',
      'samugheo': '91041',
      'asuni': '91003',
      'laconi': '91012',
      'genoni': '91011',
      'nureci': '91022',
      'senis': '91043',
      'ruinas': '91040',
      'villa-sant-antonio': '91049',
      'albagiara': '91000',
      'assolo': '91004',
      'usellus': '91048',
      'simala': '91046',
      'mogorella': '91017',
      'gonnosnò': '91011',
      'pompu': '91031',
      'masullas': '91014',
      'morgongiori': '91017',
      'siris': '91047',
      'simaxis': '91046',
      'villaurbana': '91049',
      'baradili': '91004',
      'gonnoscodina': '91011',
      'gonnostramatza': '91012',
      'siapiccia': '91045',
      'palmas-arborea': '91026',
      'santa-giusta': '91041',
      'cabras': '91008',
      'riola-sardo': '91036',
      'san-vero-milis': '91041',
      'narbolia': '91018',
      'milis': '91016',
      'zeddiani': '91050',
      'tramatza': '91048',
      'bauladu': '91005',
      'nurachi': '91022',
      'seneghe': '91043',
      'santu-lussurgiu': '91042',
      'bonarcado': '91006',
      'cuglieri': '91009',
      'scano-di-montiferro': '91043',
      'suni': '91046',
      'tinnura': '91047',
      'flussio': '91010',
      'sagama': '91040',
      'modolo': '91017',
      'magomadas': '91014',
      'bosa': '91006',
      'montresta': '91018',
      'sennariolo': '91044',
      'sindia': '91045'
    };
    
    const cityCode = cityCodeMap[city] || '58091'; // Default Roma
    
    // Funzione per calcolare l'offset del giorno per Meteo.it
    function getDayOffset(requestedDay: number): number {
      const today = new Date();
      const todayDay = today.getDate();
      
      // Se il giorno richiesto è oggi, usa 'oggi'
      if (requestedDay === todayDay) {
        return 0;
      }
      
      // Se il giorno richiesto è domani, usa 'domani'
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (requestedDay === tomorrow.getDate()) {
        return 1;
      }
      
      // Per i giorni successivi, calcola l'offset
      for (let i = 2; i <= 7; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        if (requestedDay === futureDate.getDate()) {
          return i;
        }
      }
      
      return -1;
    }
    
    // Se richiesto giorno specifico, prendi i dati dal giorno specifico
    if (day) {
      const dayOffset = getDayOffset(Number(day));
      if (dayOffset === -1) {
        return NextResponse.json({ error: 'Giorno non valido o non supportato' }, { status: 404 });
      }
      
      let dayUrl = '';
      if (dayOffset === 0) {
        dayUrl = `https://www.meteo.it/meteo/${city}-oggi-${cityCode}`;
      } else if (dayOffset === 1) {
        dayUrl = `https://www.meteo.it/meteo/${city}-domani-${cityCode}`;
      } else {
        dayUrl = `https://www.meteo.it/meteo/${city}-${dayOffset}-giorni-${cityCode}`;
      }
      
      const { data: dayHtml } = await axios.get(dayUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        },
        timeout: 10_000,
      });
      const $day = cheerio.load(dayHtml);
      
      // Estrai temperature dalle card o dalla lista dei giorni
      let minTemp = '';
      let maxTemp = '';
      let weatherDescription = 'Previsioni da Meteo.it';
      let wind = '';
      let humidity = '';
      
      // Cerca temperature nei span della pagina
      $day('.temperature, .temp, span:contains("°")').each((_, el) => {
        const text = $day(el).text().trim();
        const tempMatch = text.match(/(\d+)°/);
        if (tempMatch && !maxTemp) {
          maxTemp = tempMatch[1];
        }
      });
      
      // Cerca nelle righe dei giorni
      $day('.leDgvE .temperature').each((_, el) => {
        const text = $day(el).text().trim();
        const tempMatch = text.match(/(\d+)°/);
        if (tempMatch) {
          if (!minTemp) {
            minTemp = tempMatch[1];
          } else if (!maxTemp) {
            maxTemp = tempMatch[1];
          }
        }
      });
      
      // Fallback: cerca tutte le occorrenze di temperature
      if (!minTemp || !maxTemp) {
        const temperatures: number[] = [];
        $day('*').each((_, el) => {
          const text = $day(el).text();
          const matches = text.match(/(\d+)°/g);
          if (matches) {
            matches.forEach(match => {
              const temp = parseInt(match.replace('°', ''));
              if (temp >= 5 && temp <= 50) { // Range realistico per temperature
                temperatures.push(temp);
              }
            });
          }
        });
        
        if (temperatures.length > 0) {
          temperatures.sort((a, b) => a - b);
          minTemp = minTemp || temperatures[0].toString();
          maxTemp = maxTemp || temperatures[temperatures.length - 1].toString();
        }
      }
      
      // Cerca descrizione meteo
      $day('h1, .previsionDay, .weatherDescription').each((_, el) => {
        const text = $day(el).text().trim();
        if (text.length > 10 && text.length < 100 && text.includes(city)) {
          weatherDescription = text;
          return false;
        }
      });
      
      return NextResponse.json({
        provider: 'meteo.it',
        city,
        day: Number(day),
        weatherDescription,
        temperature: maxTemp || 'N/A',
        max: maxTemp || 'N/A',
        min: minTemp || 'N/A',
        wind: wind || 'N/A',
        humidity: humidity || 'N/A',
        hourly: [] // Meteo.it non fornisce dati orari dettagliati
      });
    }
    
    // Per la vista principale (previsioni giornaliere)
    const mainUrl = `https://www.meteo.it/meteo/${city}-${cityCode}`;
    const { data: mainHtml } = await axios.get(mainUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      timeout: 10_000,
    });
    const $ = cheerio.load(mainHtml);
    
    const days: any[] = [];
    
    // Estrai le previsioni dai link nella pagina principale
    $('a[href*="-giorni-"], a[href*="-oggi-"], a[href*="-domani-"]').each((index, element) => {
      const $el = $(element);
      const href = $el.attr('href') || '';
      const text = $el.text().trim();
      
      let dayNum = -1;
      if (href.includes('-oggi-')) {
        dayNum = new Date().getDate();
      } else if (href.includes('-domani-')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dayNum = tomorrow.getDate();
      } else {
        const dayMatch = href.match(/(\d+)-giorni/);
        if (dayMatch) {
          const today = new Date();
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + parseInt(dayMatch[1]));
          dayNum = futureDate.getDate();
        }
      }
      
      if (dayNum !== -1 && text.includes('°')) {
        const tempMatch = text.match(/(\d+)°/g);
        const temps = tempMatch?.map(t => parseInt(t.replace('°', ''))) || [];
        
        days.push({
          day: dayNum,
          temperature: temps.length > 0 ? Math.max(...temps).toString() : 'N/A',
          condition: 'Variabile',
          href: href.startsWith('http') ? href : `https://www.meteo.it${href}`
        });
      }
    });
    
    return NextResponse.json({ 
      provider: 'meteo.it', 
      city, 
      cityCode,
      days: days.slice(0, 7) // Limita a 7 giorni
    });
    
  } catch (err) {
    console.error('Error fetching Meteo.it data:', err);
    return NextResponse.json(
      { error: 'Errore durante lo scraping di Meteo.it' },
      { status: 500 },
    );
  }
}
