export type LanguageCode = 'en' | 'ur' | 'es' | 'id';

export interface TranslationSchema {
  nav: {
    overview: string;
    talk: string;
    chat: string;
    methodology: string;
    discordBot: string;
    selectLanguage: string;
  };
  hero: {
    tagline: string;
    headline: string;
    subheadline: string;
    startTalk: string;
    searchResearch: string;
    discordBot: string;
  };
  quickStart: {
    badge: string;
    title: string;
    step1Tag: string;
    step1Title: string;
    step1Desc: string;
    step1Btn: string;
    step2Tag: string;
    step2Title: string;
    step2Desc: string;
    step2Btn: string;
    step3Tag: string;
    step3Title: string;
    step3Desc: string;
    step3Btn: string;
  };
  samples: {
    title: string;
    tryClaim: string;
  };
  talk: {
    roomTitle: string;
    tapToSpeak: string;
    listening: string;
    verifying: string;
    speaking: string;
    ready: string;
    newClaim: string;
    openInChat: string;
    evidenceFound: string;
    groundedVerdict: string;
  };
  chat: {
    placeholder: string;
    send: string;
    analyzing: string;
    serverWarmup: string;
    viewEvidence: string;
    evidenceDrawer: string;
    noEvidence: string;
    sourceAuthority: string;
    confidence: string;
    domainAll: string;
    domainHealth: string;
    domainScience: string;
    domainClimate: string;
    domainDisaster: string;
  };
  serverNotice: {
    wakingTitle: string;
    wakingDesc: string;
    readyTitle: string;
    readyDesc: string;
    pleaseWait: string;
  };
  methodology: {
    title: string;
    subtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
  };
  footer: {
    copyright: string;
    methodology: string;
    discordBot: string;
  };
}

export const translations: Record<LanguageCode, TranslationSchema> = {
  en: {
    nav: {
      overview: 'Overview',
      talk: 'Talk (Voice)',
      chat: 'Chat & Evidence',
      methodology: 'Methodology',
      discordBot: 'Discord Bot',
      selectLanguage: 'Select Language',
    },
    hero: {
      tagline: 'Multilingual Voice & Evidence Verification',
      headline: 'Instant, Voice-First Evidence Verification.',
      subheadline:
        'Speak or type health rumors in Urdu, English, Spanish, or Indonesian. VeriVoice cross-references authoritative medical sources to deliver instant spoken verdicts and verified citations.',
      startTalk: 'Start Voice Talk',
      searchResearch: 'Search & Research',
      discordBot: 'Discord Bot',
    },
    quickStart: {
      badge: 'Quick Start',
      title: 'How to Use VeriVoice',
      step1Tag: '01 · Voice Room',
      step1Title: 'Talk Mode',
      step1Desc:
        'Tap the Acoustic Core and speak naturally in Urdu, English, Spanish, or Indonesian. Listen to concise neural audio responses with instant interruption.',
      step1Btn: 'Open Talk Mode',
      step2Tag: '02 · Deep Research',
      step2Title: 'Chat & Evidence Rail',
      step2Desc:
        'Type questions or paste complex claims to inspect primary citations from WHO, CDC, PubMed, and NIH with live source authority scoring.',
      step2Btn: 'Open Chat & Evidence',
      step3Tag: '03 · Community Bot',
      step3Title: 'Discord Bot',
      step3Desc:
        'Add @VeriVoice to your Discord server. Send voice notes or use /verify to verify rumors directly in community channels.',
      step3Btn: 'Add to Discord',
    },
    samples: {
      title: 'Try a Sample Claim (Click to Test)',
      tryClaim: 'Sample Claim',
    },
    talk: {
      roomTitle: 'Acoustic Core · Live Voice Room',
      tapToSpeak: 'Tap the core to speak, tap again when finished.',
      listening: 'Listening to your voice...',
      verifying: 'Searching evidence & verifying...',
      speaking: 'Speaking verdict (tap core to interrupt)...',
      ready: 'Ready for your voice note',
      newClaim: 'New Claim',
      openInChat: 'Open Full Evidence & Citations',
      evidenceFound: 'Sources Retrieved',
      groundedVerdict: 'Grounded Verdict',
    },
    chat: {
      placeholder: 'Speak or type any claim (e.g. "Do vaccines cause autism?")...',
      send: 'Send',
      analyzing: 'Analyzing claim & searching authoritative databases...',
      serverWarmup: '⚡ Server is warming up... Verifying citations & grounding verdict.',
      viewEvidence: 'View Citations & Evidence',
      evidenceDrawer: 'Primary Evidence & Citations',
      noEvidence: 'No evidence items retrieved for this inquiry.',
      sourceAuthority: 'Source Authority',
      confidence: 'Confidence Score',
      domainAll: 'All Domains',
      domainHealth: 'Health & Medicine',
      domainScience: 'Science & Astronomy',
      domainClimate: 'Climate & Weather',
      domainDisaster: 'Disaster Warnings',
    },
    serverNotice: {
      wakingTitle: 'Cloud Engine Waking Up',
      wakingDesc: 'Our cloud verification server is starting up from sleep mode (~15-30s). Please wait a moment before speaking or submitting inquiries.',
      readyTitle: 'Server Online & Ready',
      readyDesc: 'Cloud verification engine is active and ready for inquiries.',
      pleaseWait: 'Waiting for cloud server to wake up (~15-30s)...',
    },
    methodology: {
      title: 'Grounding & Evidence Methodology',
      subtitle:
        'How VeriVoice safeguards against hallucinations, assesses scientific authority, and prevents disinformation.',
      pillar1Title: 'Evidence Grounding First',
      pillar1Desc:
        'Verdicts are strictly constrained to peer-reviewed and authoritative scientific databases (WHO, CDC, PubMed, NIH). If evidence is absent, the model yields UNCERTAIN instead of guessing.',
      pillar2Title: 'Source Authority Scoring',
      pillar2Desc:
        'Retrieved sources undergo weighted authority scoring based on domain credibility, peer-review status, and clinical consensus.',
      pillar3Title: 'Universal Multilingual Voice',
      pillar3Desc:
        'Speech recognition and high-fidelity neural TTS enable low-literacy communities in Urdu, Spanish, and Indonesian to verify critical health rumors.',
    },
    footer: {
      copyright: 'VeriVoice © 2026 · UNESCO Infodemic Mitigation Initiative',
      methodology: 'Methodology',
      discordBot: 'Discord Bot',
    },
  },
  ur: {
    nav: {
      overview: 'جائزہ',
      talk: 'صوتی گفتگو',
      chat: 'چیٹ اور شواہد',
      methodology: 'طریقہ کار',
      discordBot: 'ڈسکارڈ بوٹ',
      selectLanguage: 'زبان منتخب کریں',
    },
    hero: {
      tagline: 'کثیر لسانی صوتی اور ثبوتی تصدیق',
      headline: 'صوتی بنیاد پر فوری اور مصدقہ ثبوتی تصدیق۔',
      subheadline:
        'اردو، انگریزی، ہسپانوی یا انڈونیشیائی زبان میں طبی افواہوں کی جانچ کریں۔ ویری وائس مستند عالمی طبی اور سائنسی ذرائع سے فوری فیصلہ اور حوالہ جات فراہم کرتا ہے۔',
      startTalk: 'صوتی گفتگو شروع کریں',
      searchResearch: 'تحقیق اور تلاش کریں',
      discordBot: 'ڈسکارڈ بوٹ',
    },
    quickStart: {
      badge: 'فوری رہنمائی',
      title: 'ویری وائس استعمال کرنے کا طریقہ',
      step1Tag: '01 · صوتی کمرہ',
      step1Title: 'صوتی ٹاک موڈ',
      step1Desc:
        'اکوسٹک کور پر کلک کریں اور روانی سے اردو میں بات کریں۔ جدید ترین نیورل صوتی آواز میں فوری اور مختصر جوابات سنیں۔',
      step1Btn: 'صوتی موڈ کھولیں',
      step2Tag: '02 · تفصیلی تحقیق',
      step2Title: 'چیٹ اور شواہد کی ریل',
      step2Desc:
        'کوئی بھی سوال یا طبی دعویٰ لکھیں اور ڈبلیو ایچ او، سی ڈی سی، اور پب میڈ سے براہ راست حوالہ جات اور مصدقہ شواہد دیکھیں۔',
      step2Btn: 'چیٹ اور شواہد کھولیں',
      step3Tag: '03 · کمیونٹی بوٹ',
      step3Title: 'ڈسکارڈ بوٹ',
      step3Desc:
        'اپنے ڈسکارڈ سرور میں @VeriVoice شامل کریں۔ وائس میسجز بھیجیں یا /verify کے ذریعے کسی بھی افواہ کی فوری جانچ کریں۔',
      step3Btn: 'ڈسکارڈ پر شامل کریں',
    },
    samples: {
      title: 'نمونہ دعویٰ پر کلک کریں',
      tryClaim: 'نمونہ دعویٰ',
    },
    talk: {
      roomTitle: 'اکوسٹک کور · لائیو وائس روم',
      tapToSpeak: 'بولنے کے لیے کور پر کلک کریں، مکمل ہونے پر دوبارہ کلک کریں۔',
      listening: 'آپ کی آواز سن رہا ہے...',
      verifying: 'شواہد تلاش کر کے تصدیق کی جا رہی ہے...',
      speaking: 'جواب سنایا جا رہا ہے (روکنے کے لیے کلک کریں)...',
      ready: 'آپ کے صوتی پیغام کا منتظر',
      newClaim: 'نیا دعویٰ',
      openInChat: 'مکمل شواہد اور حوالہ جات دیکھیں',
      evidenceFound: 'دستیاب شواہد',
      groundedVerdict: 'مصدقہ فیصلہ',
    },
    chat: {
      placeholder: 'کوئی بھی دعویٰ یا طبی سوال بولیں یا لکھیں (مثلاً: کیا پولیو کے قطرے محفوظ ہیں؟)...',
      send: 'ارسال',
      analyzing: 'شواہد تلاش کر کے تجزیہ کیا جا رہا ہے...',
      serverWarmup: '⚡ سرور شروع ہو رہا ہے... حوالہ جات اور شواہد کی جانچ جاری ہے۔',
      viewEvidence: 'شواہد اور حوالہ جات دیکھیں',
      evidenceDrawer: 'بنیادی شواہد اور معتبر حوالہ جات',
      noEvidence: 'اس سوال کے لیے کوئی شواہد موصول نہیں ہوئے۔',
      sourceAuthority: 'ذرائع کی معتبریت',
      confidence: 'اعتماد کا اسکور',
      domainAll: 'تمام شعبے',
      domainHealth: 'صحت اور ادویات',
      domainScience: 'سائنس اور کائنات',
      domainClimate: 'موسمیات و ماحولیات',
      domainDisaster: 'آفات کی انتباہ',
    },
    serverNotice: {
      wakingTitle: 'کلاؤڈ سرور شروع ہو رہا ہے',
      wakingDesc: 'ویری وائس کا کلاؤڈ انجن نیند کی حالت سے بیدار ہو رہا ہے (~15-30 سیکنڈ)۔ بولنے یا سوال پوچھنے سے قبل براہ کرم کچھ دیر انتظار فرمائیں۔',
      readyTitle: 'سرور تیار ہے',
      readyDesc: 'کلاؤڈ تصدیقی انجن مکمل طور پر فعال اور تیار ہے۔',
      pleaseWait: 'سرور کے بیدار ہونے کا انتظار فرمائیں (~15-30 سیکنڈ)...',
    },
    methodology: {
      title: 'شواہد اور تصدیق کا سائنسی طریقہ کار',
      subtitle:
        'ویری وائس کس طرح جھوٹی معلومات اور من گھڑت جوابات کو روک کر مستند سائنسی حقائق پیش کرتا ہے۔',
      pillar1Title: 'صرف مستند شواہد پر انحصار',
      pillar1Desc:
        'تمام فیصلے مستند عالمی ڈیٹا بیسز (WHO، CDC، PubMed، NIH) کے حوالہ جات کے پابند ہیں۔ اگر ثبوت ناکافی ہوں تو ماڈل قیاس آرائی کی بجائے غیر یقینی (UNCERTAIN) ظاہر کرتا ہے۔',
      pillar2Title: 'ذرائع کی معتبریت کی جانچ',
      pillar2Desc:
        'تمام شواہد کا پیئر ریویو اور کلینیکل اتفاق رائے کی بنیاد پر معتبر اسکور طے کیا جاتا ہے۔',
      pillar3Title: 'کثیر لسانی صوتی رسائی',
      pillar3Desc:
        'اردو، ہسپانوی اور انڈونیشیائی زبانوں میں صوتی گفتگو اور سننے کی صلاحیت سے ہر طبقے کو حقائق تک آسان رسائی ملتی ہے۔',
    },
    footer: {
      copyright: 'ویری وائس © 2026 · یونیسکو انفوڈیمک روک تھام اقدام',
      methodology: 'طریقہ کار',
      discordBot: 'ڈسکارڈ بوٹ',
    },
  },
  es: {
    nav: {
      overview: 'Resumen',
      talk: 'Voz en Vivo',
      chat: 'Chat y Evidencia',
      methodology: 'Metodología',
      discordBot: 'Bot Discord',
      selectLanguage: 'Seleccionar Idioma',
    },
    hero: {
      tagline: 'Verificación de Evidencia por Voz Multilingüe',
      headline: 'Verificación instantánea de evidencia por voz.',
      subheadline:
        'Hable o escriba rumores de salud en urdu, inglés, español o indonesio. VeriVoice consulta fuentes médicas oficiales para ofrecer veredictos hablados y citas verificadas.',
      startTalk: 'Iniciar Voz en Vivo',
      searchResearch: 'Buscar e Investigar',
      discordBot: 'Bot de Discord',
    },
    quickStart: {
      badge: 'Inicio Rápido',
      title: 'Cómo Usar VeriVoice',
      step1Tag: '01 · Sala de Voz',
      step1Title: 'Modo de Voz',
      step1Desc:
        'Toque el Núcleo Acústico y hable con naturalidad en español, urdu o inglés. Escuche respuestas concisas con interrupción instantánea.',
      step1Btn: 'Abrir Modo Voz',
      step2Tag: '02 · Investigación',
      step2Title: 'Chat y Panel de Evidencia',
      step2Desc:
        'Escriba afirmaciones para inspeccionar citas primarias de la OMS, CDC, PubMed y NIH con puntuación de autoridad de fuente.',
      step2Btn: 'Abrir Chat y Evidencia',
      step3Tag: '03 · Bot Comunitario',
      step3Title: 'Bot de Discord',
      step3Desc:
        'Agregue @VeriVoice a su servidor de Discord. Envíe notas de voz o use /verify para verificar rumores en sus canales comunitarios.',
      step3Btn: 'Agregar a Discord',
    },
    samples: {
      title: 'Pruebe una afirmación (Clic para probar)',
      tryClaim: 'Afirmación de Ejemplo',
    },
    talk: {
      roomTitle: 'Núcleo Acústico · Sala de Voz en Vivo',
      tapToSpeak: 'Toque el núcleo para hablar, toque de nuevo al terminar.',
      listening: 'Escuchando su voz...',
      verifying: 'Buscando evidencia y verificando...',
      speaking: 'Reproduciendo veredicto (toque para interrumpir)...',
      ready: 'Listo para su consulta de voz',
      newClaim: 'Nueva Consulta',
      openInChat: 'Ver Evidencia Completa y Citas',
      evidenceFound: 'Fuentes Recuperadas',
      groundedVerdict: 'Veredicto Fundamentado',
    },
    chat: {
      placeholder: 'Hable o escriba cualquier afirmación (ej. "¿Las vacunas causan autismo?")...',
      send: 'Enviar',
      analyzing: 'Analizando afirmación y consultando bases de datos...',
      serverWarmup: '⚡ El servidor se está iniciando... Verificando citas y fundamentación.',
      viewEvidence: 'Ver Citas y Evidencia',
      evidenceDrawer: 'Evidencia Primaria y Citas',
      noEvidence: 'No se encontraron elementos de evidencia para esta consulta.',
      sourceAuthority: 'Autoridad de la Fuente',
      confidence: 'Puntuación de Confianza',
      domainAll: 'Todos los Dominios',
      domainHealth: 'Salud y Medicina',
      domainScience: 'Ciencia y Naturaleza',
      domainClimate: 'Clima y Medio Ambiente',
      domainDisaster: 'Alertas de Desastres',
    },
    serverNotice: {
      wakingTitle: 'Servidor en la Nube Iniciándose',
      wakingDesc: 'Nuestro motor de verificación en la nube se está iniciando del modo de reposo (~15-30s). Por favor espere un momento antes de hablar o consultar.',
      readyTitle: 'Servidor en Línea y Listo',
      readyDesc: 'El motor de verificación está activo y listo para sus consultas.',
      pleaseWait: 'Esperando a que el servidor en la nube se active (~15-30s)...',
    },
    methodology: {
      title: 'Metodología de Evidencia y Validación',
      subtitle:
        'Cómo VeriVoice previene alucinaciones, evalúa la autoridad científica y combate la desinformación.',
      pillar1Title: 'Fundamentación Estricta en Evidencia',
      pillar1Desc:
        'Los veredictos están estrictamente limitados a bases de datos científicas oficiales (OMS, CDC, PubMed, NIH). Si no hay evidencia, responde INCIERTO.',
      pillar2Title: 'Puntuación de Autoridad de Fuentes',
      pillar2Desc:
        'Las fuentes recuperadas se ponderan según credibilidad de dominio, revisión por pares y consenso clínico.',
      pillar3Title: 'Voz Multilingüe Universal',
      pillar3Desc:
        'El reconocimiento de voz y la síntesis neural de alta fidelidad permiten a comunidades en español, urdu e indonesio verificar rumores críticos.',
    },
    footer: {
      copyright: 'VeriVoice © 2026 · Iniciativa de Mitigación de Infodemia de la UNESCO',
      methodology: 'Metodología',
      discordBot: 'Bot de Discord',
    },
  },
  id: {
    nav: {
      overview: 'Ringkasan',
      talk: 'Bicara (Suara)',
      chat: 'Obrolan & Bukti',
      methodology: 'Metodologi',
      discordBot: 'Bot Discord',
      selectLanguage: 'Pilih Bahasa',
    },
    hero: {
      tagline: 'Verifikasi Bukti & Suara Multibahasa',
      headline: 'Verifikasi Bukti Berbasis Suara Seketika.',
      subheadline:
        'Bicarakan atau ketik rumor kesehatan dalam bahasa Urdu, Inggris, Spanyol, atau Indonesia. VeriVoice memeriksa sumber medis resmi untuk memberikan putusan dan kutipan terverifikasi.',
      startTalk: 'Mulai Percakapan Suara',
      searchResearch: 'Cari & Riset',
      discordBot: 'Bot Discord',
    },
    quickStart: {
      badge: 'Panduan Cepat',
      title: 'Cara Menggunakan VeriVoice',
      step1Tag: '01 · Ruang Suara',
      step1Title: 'Mode Suara',
      step1Desc:
        'Ketuk Acoustic Core dan bicara secara alami dalam bahasa Indonesia atau Inggris. Dengarkan tanggapan audio neural dengan interupsi instan.',
      step1Btn: 'Buka Mode Suara',
      step2Tag: '02 · Riset Mendalam',
      step2Title: 'Obrolan & Panel Bukti',
      step2Desc:
        'Ketik pertanyaan untuk memeriksa kutipan primer dari WHO, CDC, PubMed, dan NIH dengan skor otoritas sumber langsung.',
      step2Btn: 'Buka Obrolan & Bukti',
      step3Tag: '03 · Bot Komunitas',
      step3Title: 'Bot Discord',
      step3Desc:
        'Tambahkan @VeriVoice ke server Discord Anda. Kirim pesan suara atau gunakan /verify untuk memverifikasi rumor di komunitas.',
      step3Btn: 'Tambahkan ke Discord',
    },
    samples: {
      title: 'Coba Klaim Sampel (Klik untuk Menguji)',
      tryClaim: 'Klaim Sampel',
    },
    talk: {
      roomTitle: 'Acoustic Core · Ruang Suara Langsung',
      tapToSpeak: 'Ketuk inti untuk berbicara, ketuk lagi setelah selesai.',
      listening: 'Mendengarkan suara Anda...',
      verifying: 'Mencari bukti & memverifikasi...',
      speaking: 'Memutar putusan (ketuk inti untuk menghentikan)...',
      ready: 'Siap untuk catatan suara Anda',
      newClaim: 'Klaim Baru',
      openInChat: 'Buka Bukti Lengkap & Kutipan',
      evidenceFound: 'Sumber Ditemukan',
      groundedVerdict: 'Putusan Terverifikasi',
    },
    chat: {
      placeholder: 'Bicarakan atau ketik klaim apa pun (contoh: "Apakah bawang putih menyembuhkan virus corona?")...',
      send: 'Kirim',
      analyzing: 'Menganalisis klaim & memeriksa basis data resmi...',
      serverWarmup: '⚡ Server sedang memuat... Memverifikasi kutipan & landasan bukti.',
      viewEvidence: 'Lihat Kutipan & Bukti',
      evidenceDrawer: 'Bukti Primer & Kutipan Resmi',
      noEvidence: 'Tidak ada bukti yang ditemukan untuk pertanyaan ini.',
      sourceAuthority: 'Otoritas Sumber',
      confidence: 'Skor Keyakinan',
      domainAll: 'Semua Domain',
      domainHealth: 'Kesehatan & Medis',
      domainScience: 'Sains & Alam',
      domainClimate: 'Iklim & Cuaca',
      domainDisaster: 'Peringatan Bencana',
    },
    serverNotice: {
      wakingTitle: 'Server Cloud Sedang Memuat',
      wakingDesc: 'Mesin verifikasi cloud kami sedang menyala dari mode tidur (~15-30 detik). Mohon tunggu sejenak sebelum berbicara atau mencari.',
      readyTitle: 'Server Online & Siap',
      readyDesc: 'Mesin verifikasi cloud sudah aktif dan siap untuk digunakan.',
      pleaseWait: 'Menunggu server cloud aktif (~15-30 detik)...',
    },
    methodology: {
      title: 'Metodologi Bukti & Validasi',
      subtitle:
        'Bagaimana VeriVoice mencegah halusinasi, menilai otoritas ilmiah, dan memvalidasi kebenaran informasi.',
      pillar1Title: 'Berlandaskan Bukti Resmi',
      pillar1Desc:
        'Semua putusan dibatasi secara ketat pada basis data ilmiah terpercaya (WHO, CDC, PubMed, NIH). Jika bukti tidak mencukupi, sistem menyatakan TIDAK PASTI.',
      pillar2Title: 'Penilaian Otoritas Sumber',
      pillar2Desc:
        'Sumber yang diperoleh dinilai berdasarkan kredibilitas domain, tinjauan sejawat, dan konsensus klinis.',
      pillar3Title: 'Suara Multibahasa Universal',
      pillar3Desc:
        'Pengenalan suara dan sintesis suara neural berkualitas tinggi memungkinkan masyarakat berbahasa Indonesia, Urdu, dan Spanyol memverifikasi informasi kesehatan.',
    },
    footer: {
      copyright: 'VeriVoice © 2026 · Inisiatif Mitigasi Infodemik UNESCO',
      methodology: 'Metodologi',
      discordBot: 'Bot Discord',
    },
  },
};

export const getTranslation = (langCode: string): TranslationSchema => {
  const code = (langCode.toLowerCase() as LanguageCode);
  return translations[code] || translations.en;
};
