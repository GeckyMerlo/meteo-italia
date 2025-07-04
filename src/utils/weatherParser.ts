/**
 * Utility per il parsing dei dati meteo orari da 3B Meteo
 */

export interface HourlyWeatherData {
  hour: string;
  condition: string;
  temperature: number;
  precipitation: string;
  wind: string;
  humidity: number;
  feelsLike: number;
  icon: string;
}

/**
 * Estrae i dati orari da un blocco HTML di 3B Meteo
 */
export function parse3BMeteoHourlyData(htmlBlock: string): HourlyWeatherData | null {
  try {
    // Normalizza il testo HTML
    const cleanHtml = htmlBlock.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Estrai l'ora
    const hourMatch = cleanHtml.match(/(\d{1,2})<span class="small">:(\d{2})<\/span>/);
    const hour = hourMatch ? `${hourMatch[1]}:${hourMatch[2]}` : '';
    
    // Estrai la condizione meteo
    const conditionMatch = cleanHtml.match(/<div class="col-xs-2-4 zoom_prv">\s*([^<]+)\s*<\/div>/);
    const condition = conditionMatch ? conditionMatch[1].trim() : '';
    
    // Estrai l'URL dell'icona
    const iconMatch = cleanHtml.match(/src="([^"]+)"/);
    const icon = iconMatch ? iconMatch[1] : '';
    
    // Estrai la temperatura (versione Celsius attiva)
    const tempMatch = cleanHtml.match(/<span class="switchcelsius switch-te active">([^<]+)<\/span>/);
    const temperatureStr = tempMatch ? tempMatch[1].replace('°', '') : '0';
    const temperature = parseFloat(temperatureStr) || 0;
    
    // Estrai le precipitazioni
    const precipitationMatch = cleanHtml.match(/altriDati-precipitazioni[^>]*>[\s\S]*?<span[^>]*>\s*([^<]+)\s*<\/span>/);
    const precipitation = precipitationMatch ? precipitationMatch[1].trim() : 'N/A';
    
    // Estrai il vento (velocità + direzione)
    const windSpeedMatch = cleanHtml.match(/altriDati-venti[^>]*>[\s\S]*?<span class="switchkm switch-vi active">\s*(\d+)\s*<\/span>/);
    const windDirectionMatch = cleanHtml.match(/altriDati-venti[^>]*>[\s\S]*?&nbsp;([NSEW]+)/);
    const windSpeed = windSpeedMatch ? windSpeedMatch[1] : '0';
    const windDirection = windDirectionMatch ? windDirectionMatch[1] : '';
    const wind = `${windSpeed} km/h ${windDirection}`.trim();
    
    // Estrai l'umidità
    const humidityMatch = cleanHtml.match(/altriDati-umidita[^>]*>\s*(\d+)%/);
    const humidity = humidityMatch ? parseInt(humidityMatch[1]) : 0;
    
    // Estrai la temperatura percepita
    const feelsLikeMatch = cleanHtml.match(/altriDati-percepita[^>]*>[\s\S]*?<span class="switchcelsius switch-te active">([^<]+)<\/span>/);
    const feelsLikeStr = feelsLikeMatch ? feelsLikeMatch[1].replace('°', '') : '0';
    const feelsLike = parseFloat(feelsLikeStr) || 0;
    
    // Verifica che abbiamo almeno i dati essenziali
    if (!hour || !condition || temperature === 0) {
      console.warn('Dati essenziali mancanti nel parsing:', { hour, condition, temperature });
      return null;
    }
    
    return {
      hour,
      condition,
      temperature,
      precipitation,
      wind,
      humidity,
      feelsLike,
      icon
    };
    
  } catch (error) {
    console.error('Errore nel parsing dei dati orari:', error);
    return null;
  }
}

/**
 * Estrae tutti i dati orari da una pagina HTML completa di 3B Meteo
 */
export function parseAll3BMeteoHourlyData(htmlContent: string): HourlyWeatherData[] {
  const results: HourlyWeatherData[] = [];
  
  try {
    // Cerca tutti i blocchi che contengono dati orari
    // Pattern per identificare i blocchi row-table che contengono dati orari
    const hourlyBlockPattern = /<div class="row-table noPad">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    const blocks = htmlContent.match(hourlyBlockPattern);
    
    if (!blocks) {
      console.warn('Nessun blocco orario trovato nell\'HTML');
      return results;
    }
    
    console.log(`Trovati ${blocks.length} blocchi orari potenziali`);
    
    for (const block of blocks) {
      const parsed = parse3BMeteoHourlyData(block);
      if (parsed) {
        results.push(parsed);
      }
    }
    
    // Ordina per ora
    results.sort((a, b) => {
      const aHour = parseInt(a.hour.split(':')[0]);
      const bHour = parseInt(b.hour.split(':')[0]);
      return aHour - bHour;
    });
    
    console.log(`Estratti ${results.length} dati orari validi`);
    return results;
    
  } catch (error) {
    console.error('Errore nel parsing dell\'HTML completo:', error);
    return results;
  }
}

/**
 * Converte i dati di 3B Meteo nel formato dell'interfaccia del modal
 */
export function convertTo3BMeteoModalFormat(data: HourlyWeatherData[]): Array<{
  hour: string;
  condition: string;
  temperature: number;
  precipitation: number;
  wind: string;
  humidity: number;
  feelsLike: number;
  icon: string;
}> {
  return data.map(item => ({
    hour: item.hour,
    condition: item.condition,
    temperature: item.temperature,
    precipitation: item.precipitation === 'assenti' ? 0 : 
                  item.precipitation.includes('%') ? parseInt(item.precipitation.replace('%', '')) : 0,
    wind: item.wind,
    humidity: item.humidity,
    feelsLike: item.feelsLike,
    icon: item.icon
  }));
}

/**
 * Funzione di test per verificare il parsing con l'esempio fornito
 */
export function testParseExample(): void {
  const exampleHtml = `<div class="row-table noPad"> <div class="col-xs-2-3 col-sm-2-5"> <div class="row-table special_campaign"> <div class="col-xs-1-4 big zoom_prv"> 11<span class="small">:00</span> <a href="/allerte_meteo/milano" title="Allerte meteo presenti"> <span class="badge-triangle icon-allerta"></span> </a> </div> <div class="col-xs-1-4 text-center no-padding zoom_prv"> <img src="https://www.3bmeteo.com/images/set_icone/10/80-80/1.png" alt="sereno" loading="lazy" width="40" height="40"> </div> <div class="col-xs-2-4 zoom_prv"> sereno </div> </div> </div> <div class="col-xs-1-3 col-sm-3-5 table-striped-inverse-h text-center"> <div class="row-table "> <div class="col-xs-1-2 col-sm-1-5 big orario-allerta"> <span class="switchcelsius switch-te active">32.2°</span> <span class="switchfahrenheit switch-te">90.0°</span> </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDatiD-active altriDati-precipitazioni altriDatiM-active"> <span class="gray" aria-disabled="true"> assenti </span> </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDatiD-active altriDati-venti"> <span class="switchkm switch-vi active"> 3 </span> <span class="switchnodi switch-vi"> 2 </span> &nbsp;S </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDatiD-active altriDati-umidita"> 45% </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDatiD-active altriDati-percepita"> <span class="switchcelsius switch-te active">33.6°</span> <span class="switchfahrenheit switch-te">92.4°</span> </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDati-QN"> 3900 m <br> 4171 m </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDati-pressione"> 1017.4 </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDati-raggiuv"> Molto elevata (8) </div> <div class="col-xs-1-2 col-sm-1-5 altriDati altriDati-windchill"> <span class="switchcelsius switch-te active">32.2°</span> <span class="switchfahrenheit switch-te">90.0°</span> </div> </div> </div> </div>`;
  
  console.log('=== TEST PARSING 3B METEO ===');
  const result = parse3BMeteoHourlyData(exampleHtml);
  
  if (result) {
    console.log('✅ Parsing riuscito:', result);
  } else {
    console.log('❌ Parsing fallito');
  }
}

/**
 * Scansiona l'HTML completo di 3B Meteo per estrarre tutti i dati orari
 */
export function parseAllHourlyWeatherData(fullHtml: string): HourlyWeatherData[] {
  const hourlyData: HourlyWeatherData[] = [];
  
  try {
    // Cerca tutti i blocchi orari nell'HTML
    // I blocchi orari sono contenuti in elementi con class "row-table noPad"
    const hourlyBlockPattern = /<div class="row-table noPad">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    const matches = fullHtml.match(hourlyBlockPattern);
    
    if (!matches) {
      console.warn('[Parser] Nessun blocco orario trovato nell\'HTML');
      return [];
    }
    
    console.log(`[Parser] Trovati ${matches.length} blocchi orari`);
    
    // Processa ogni blocco orario
    matches.forEach((blockHtml, index) => {
      const hourlyItem = parse3BMeteoHourlyData(blockHtml);
      if (hourlyItem) {
        hourlyData.push(hourlyItem);
        console.log(`[Parser] Blocco ${index + 1}: ${hourlyItem.hour} - ${hourlyItem.temperature}°C`);
      } else {
        console.warn(`[Parser] Blocco ${index + 1} non processato correttamente`);
      }
    });
    
    console.log(`[Parser] Estratti ${hourlyData.length} dati orari`);
    return hourlyData;
    
  } catch (error) {
    console.error('[Parser] Errore durante il parsing dell\'HTML completo:', error);
    return [];
  }
}
