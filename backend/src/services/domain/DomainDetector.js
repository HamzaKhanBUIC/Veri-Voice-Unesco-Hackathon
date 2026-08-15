/**
 * Domain Detector Service.
 * Identifies the subject domain of user text:
 * HEALTH, EARTH_SPACE, WEATHER_CLIMATE, GEOLOGY, DISASTER, TECHNOLOGY, ECONOMICS,
 * LAW_POLICY, SCIENCE, EDUCATION, MEDIA_INFORMATION_LITERACY, AI_DISINFORMATION,
 * BIODIVERSITY, HISTORY, GENERAL.
 * Returns { domain, confidence, signals }.
 */

const DOMAINS = {
  HEALTH: 'HEALTH',
  EARTH_SPACE: 'EARTH_SPACE',
  WEATHER_CLIMATE: 'WEATHER_CLIMATE',
  GEOLOGY: 'GEOLOGY',
  DISASTER: 'DISASTER',
  TECHNOLOGY: 'TECHNOLOGY',
  ECONOMICS: 'ECONOMICS',
  LAW_POLICY: 'LAW_POLICY',
  SCIENCE: 'SCIENCE',
  EDUCATION: 'EDUCATION',
  MEDIA_INFORMATION_LITERACY: 'MEDIA_INFORMATION_LITERACY',
  AI_DISINFORMATION: 'AI_DISINFORMATION',
  BIODIVERSITY: 'BIODIVERSITY',
  HISTORY: 'HISTORY',
  GENERAL: 'GENERAL',
};

const DOMAIN_PATTERNS = {
  HEALTH: [
    /\b(health|vaccine|vaccines|disease|virus|covid|polio|dengue|infection|medicine|medical|doctor|hospital|garlic|cure|treatment|symptom|illness|fever|blood|cancer|mental health|anxiety|depression)\b/i,
    /(ورزش|صحت|ویکسین|بیماری|کورونا|پولیو|ڈینگی|علاج|ڈاکٹر|ہسپتال|دوائی|کینسر|بخار)/i,
    /(salud|vacuna|enfermedad|virus|medicina|síntoma|tratamiento)/i,
    /(vaksin|penyakit|obat|kesehatan|dokter|gejala)/i,
  ],
  AI_DISINFORMATION: [
    /\b(deepfake|deepfakes|disinformation|misinformation|malinformation|fake news|hallucination|generative ai|botnet|synthetic media|ai generated|propaganda|edmo|fact check)\b/i,
    /(جعلی خبر|پروپیگنڈا|ڈیپ فیک|جھوٹی خبر|مصنوعی میڈیا)/i,
    /(desinformación|noticias falsas|deepfake|inteligencia artificial falsa)/i,
    /(hoaks|disinformasi|misinformasi|deepfake|berita bohong)/i,
  ],
  MEDIA_INFORMATION_LITERACY: [
    /\b(media literacy|information literacy|mil|unesco|fact checking|source verification|critical thinking|cognitive pause|reverse image search)\b/i,
    /(میڈیا خواندگی|معلوماتی خواندگی|تصدیق|یونیسکو)/i,
    /(alfabetización mediática|verificación de fuentes|pensamiento crítico)/i,
    /(literasi media|literasi informasi|cek fakta|verifikasi sumber)/i,
  ],
  WEATHER_CLIMATE: [
    /\b(climate|climate change|temperature|heatwave|monsoon|rain|rainfall|weather|global warming|co2|emissions|meteorological|noaa|wmo|pmd|climate feedback)\b/i,
    /(موسم|بارش|گرمای شدید|ہیٹ ویو|آب و ہوا|مون سون|گرمی|موسمیاتی تبدیلی)/i,
    /(clima|cambio climático|temperatura|lluvia|calentamiento|meteorología)/i,
    /(cuaca|iklim|perubahan iklim|hujan|suhu|pemanasan global)/i,
  ],
  BIODIVERSITY: [
    /\b(biodiversity|species|wildlife|animal|plant|flora|fauna|inaturalist|extinction|endangered|ecosystem|habitat|forest|conservation)\b/i,
    /(حیاتیاتی تنوع|جنگلی حیات|جانور|پودے|ماحولیاتی نظام|جنگلات)/i,
    /(biodiversidad|especies|vida silvestre|animales|plantas|ecosistema)/i,
    /(keanekaragaman hayati|spesies|satwa liar|hewan|tumbuhan|ekosistem)/i,
  ],
  EARTH_SPACE: [
    /\b(earth|flat|sphere|spherical|round|planet|orbit|sun|moon|star|nasa|usgs|space|astronomy|solar|galaxy|gravity|cosmos)\b/i,
    /(زمین|سورج|چاند|سیارہ|خلا|ناسا|کائنات|گردش)/i,
    /(tierra|plana|esférica|planeta|espacio|nasa|órbita)/i,
    /(bumi|bulat|datar|planet|antariksa|orbit)/i,
  ],
  GEOLOGY: [
    /\b(earthquake|tectonic|faultline|seismic|volcano|tsunami|tremor|richter|geology)\b/i,
    /(زلزلہ|سونامی|آتش فشاں|زمین کی تھرتھراہٹ)/i,
    /(terremoto|sismo|tsunami|volcán|geología)/i,
    /(gempa|tsunami|gunung berapi|geologi)/i,
  ],
  DISASTER: [
    /\b(flood|disaster|emergency|evacuation|rescue|ndma|bnpb|relief|shelter|warning)\b/i,
    /(سیلاب|تباہی|ریلیف|ہنگامی|امدادی|این ڈی ایم اے)/i,
    /(inundación|desastre|emergencia|evacuación)/i,
    /(banjir|bencana|darurat|evakuasi)/i,
  ],
  TECHNOLOGY: [
    /\b(ai|artificial intelligence|software|hardware|internet|computer|cyber|algorithm|robot|technology)\b/i,
    /(ٹیکنالوجی|کمپیوٹر|انٹرنیٹ|مصنوعی ذہانت)/i,
  ],
  ECONOMICS: [
    /\b(inflation|gdp|economy|market|currency|stock|trade|bank|interest rate|tax|dollar)\b/i,
    /(معیشت|مہنگائی|ڈالر|بینک|تجارت|ٹیکس)/i,
  ],
  LAW_POLICY: [
    /\b(law|constitution|court|legal|policy|parliament|government|rights|regulation)\b/i,
    /(قانون|آئین|عدالت|حکومت|پالیسی)/i,
  ],
  SCIENCE: [
    /\b(science|physics|chemistry|biology|molecule|atom|boiling point|gravity|experiment|cell|genetics)\b/i,
    /(سائنس|طبیعیات|کیمیا|بیالوجی|ایٹم)/i,
  ],
  EDUCATION: [
    /\b(school|university|education|literacy|unesco|student|teacher|curriculum)\b/i,
    /(تعلیم|سکول|کالج|یونیورسٹی|طالب علم)/i,
  ],
  HISTORY: [
    /\b(history|discovered|discovery|invented|invention|historical|war|century|ancient)\b/i,
    /(تاریخ|دریافت|ایجاد|قدیم)/i,
  ],
};

class DomainDetector {
  /**
   * Detects domain from input text.
   * @param {string} text 
   * @param {string} [requestedDomain] - User requested domain hint
   * @returns {{ domain: string, confidence: string, signals: string[] }}
   */
  static detect(text, requestedDomain = null) {
    if (requestedDomain && DOMAINS[requestedDomain.toUpperCase()]) {
      return {
        domain: requestedDomain.toUpperCase(),
        confidence: 'HIGH',
        signals: [`Explicit requestedDomain hint: ${requestedDomain}`],
      };
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return { domain: DOMAINS.GENERAL, confidence: 'LOW', signals: ['Empty input'] };
    }

    const matchedSignals = [];
    const domainScores = {};

    for (const [dom, patterns] of Object.entries(DOMAIN_PATTERNS)) {
      domainScores[dom] = 0;
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          domainScores[dom] += matches.length;
          matchedSignals.push(`${dom}:${matches[0]}`);
        }
      }
    }

    let topDomain = DOMAINS.GENERAL;
    let maxScore = 0;

    for (const [dom, score] of Object.entries(domainScores)) {
      if (score > maxScore) {
        maxScore = score;
        topDomain = dom;
      }
    }

    let confidence = 'LOW';
    if (maxScore >= 2) {
      confidence = 'HIGH';
    } else if (maxScore === 1) {
      confidence = 'MEDIUM';
    }

    return {
      domain: topDomain,
      confidence,
      signals: matchedSignals,
    };
  }
}

module.exports = {
  DOMAINS,
  DomainDetector,
};
