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
    domainAi: string;
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
      tagline: 'UNESCO Global Youth Hackathon 2026 · Voice-First Media Literacy',
      headline: 'Truth Shouldn’t Require a College Degree to Read.',
      subheadline:
        'When viral rumors spread through 30-second voice notes in WhatsApp groups, text-heavy fact-checking fails. VeriVoice empowers communities to speak any claim across 12 domains in Urdu, Indonesian, Spanish, or English—and receive instant spoken answers verified directly against primary institutional archives.',
      startTalk: 'Start Voice Talk',
      searchResearch: 'Search & Citations',
      discordBot: 'Discord Bot',
    },
    quickStart: {
      badge: 'How It Works',
      title: 'Voice Truth Forward in Three Steps',
      step1Tag: '01 · Speak Naturally',
      step1Title: 'Voice In, No Typing Required',
      step1Desc:
        'Tap the Acoustic Core and speak naturally in Urdu, Indonesian, Spanish, or English. Conversational ASR transcribes regional accents with zero delay.',
      step1Btn: 'Open Talk Mode',
      step2Tag: '02 · Multi-Source Grounding',
      step2Title: 'Primary Institutions Over Clickbait',
      step2Desc:
        'Cross-examines claims against WHO, NOAA, NASA, and USGS registries. If evidence is missing, the engine admits uncertainty rather than hallucinating.',
      step2Btn: 'Open Chat & Evidence',
      step3Tag: '03 · Spoken Truth Out',
      step3Title: 'Listen & Share Verified Facts',
      step3Desc:
        'Hear high-definition neural spoken explanations in your mother tongue and forward verified audio cards directly back to family chat groups.',
      step3Btn: 'Add to Discord',
    },
    samples: {
      title: 'Curated Sample Claims (Click to Test)',
      tryClaim: 'Sample Claim',
    },
    talk: {
      roomTitle: 'Acoustic Core · Live Voice Room',
      tapToSpeak: 'Tap the core to speak, tap again when finished.',
      listening: 'Listening to your voice...',
      verifying: 'Cross-checking primary archives & verifying...',
      speaking: 'Speaking verified response (tap core to interrupt)...',
      ready: 'Ready for your voice inquiry',
      newClaim: 'New Claim',
      openInChat: 'Open Full Citations & Evidence',
      evidenceFound: 'Primary Sources Retrieved',
      groundedVerdict: 'Grounded Verdict',
    },
    chat: {
      placeholder: 'Speak or type any claim (e.g. "Are atmospheric CO₂ levels at record highs?")...',
      send: 'Verify',
      analyzing: 'Extracting atomic claims & querying institutional repositories...',
      serverWarmup: '⚡ Server is active... Grounding claims against verified datasets.',
      viewEvidence: 'View Verified Citations',
      evidenceDrawer: 'Primary Evidence & Institutional Citations',
      noEvidence: 'No verified evidence items retrieved for this inquiry.',
      sourceAuthority: 'Source Authority Hierarchy',
      confidence: 'Grounding Confidence',
      domainAll: 'All 12 Domains',
      domainHealth: 'Health & Medicine',
      domainScience: 'Science & Astronomy',
      domainClimate: 'Climate & Atmosphere',
      domainDisaster: 'Emergency Disasters',
      domainAi: 'AI & Deepfakes',
    },
    serverNotice: {
      wakingTitle: 'Cloud Engine Initializing',
      wakingDesc: 'Our cloud verification server is starting up from standby (~15-30s). Please wait a moment before submitting audio.',
      readyTitle: 'Server Online & Ready',
      readyDesc: 'Cloud verification engine is active and ready for inquiries.',
      pleaseWait: 'Waiting for verification server to initialize (~15-30s)...',
    },
    methodology: {
      title: 'Institutional Grounding & Epistemic Safety Standard',
      subtitle:
        'How VeriVoice safeguards against AI hallucinations, ranks primary scientific consensus, and empowers oral-first communities.',
      pillar1Title: 'Bounded Evidence First (0% Hallucination)',
      pillar1Desc:
        'Reasoning is strictly constrained to peer-reviewed and authoritative scientific archives (WHO, NOAA, USGS, UNESCO). If proof is absent, the engine yields UNCERTAIN instead of guessing.',
      pillar2Title: 'Deterministic Authority Hierarchy',
      pillar2Desc:
        'Retrieved sources undergo strict authority tiering: Primary Institutional & Scientific Data outrank secondary media feeds and blogs.',
      pillar3Title: 'Universal Oral Accessibility',
      pillar3Desc:
        'Conversational speech recognition and neural TTS enable low-literacy communities in Urdu, Spanish, and Indonesian to verify critical rumors.',
    },
    footer: {
      copyright: 'VeriVoice © 2026 · UNESCO Global Youth Hackathon (#GlobalMILWeek2026)',
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
      tagline: 'یونیسکو یوتھ ہیکاتھون 2026 · صوتی بنیاد پر میڈیا اور معلوماتی خواندگی',
      headline: 'حقائق جاننے کے لیے ڈگری یا انگریزی کی مجبوری نہیں۔',
      subheadline:
        'جب واٹس ایپ گروپس میں 30 سیکنڈ کے صوتی پیغامات کے ذریعے افواہیں پھیلتی ہیں، تو انگریزی کے روایتی فیکٹ چیکرز ناکام ہو جاتے ہیں۔ ویری وائس ہر شہری کو اپنی مادری زبان میں افواہ بولنے اور عالمی سائنسی اداروں (WHO، NOAA) کے مصدقہ صوتی جواب سننے کی طاقت دیتا ہے۔',
      startTalk: 'صوتی گفتگو شروع کریں',
      searchResearch: 'تحقیق اور حوالہ جات',
      discordBot: 'ڈسکارڈ بوٹ',
    },
    quickStart: {
      badge: 'کام کرنے کا طریقہ',
      title: 'تین آسان مراحل میں حقائق کی تصدیق',
      step1Tag: '01 · روانی سے بولیں',
      step1Title: 'صوتی ان پٹ، لکھنے کی ضرورت نہیں',
      step1Desc:
        'اکوسٹک کور پر کلک کریں اور روانی سے اردو میں بات کریں۔ جدید ترین اسپیچ ریکگنیشن مقامی لہجے کو فوری پہچانتی ہے۔',
      step1Btn: 'صوتی موڈ کھولیں',
      step2Tag: '02 · مستند شواہد کی جانچ',
      step2Title: 'سوشل میڈیا افواہوں کے مقابلے میں عالمی ادارے',
      step2Desc:
        'ڈبلیو ایچ او اور عالمی موسمیاتی اداروں سے براہ راست حقائق کی تصدیق۔ اگر ثبوت نہ ہوں تو ماڈل قیاس آرائی کی بجائے غیر یقینی ظاہر کرتا ہے۔',
      step2Btn: 'چیٹ اور شواہد کھولیں',
      step3Tag: '03 · صوتی سچائی سنیں',
      step3Title: 'سنیں اور درست معلومات آگے بھیجیں',
      step3Desc:
        'اپنی زبان میں واضح صوتی جواب سنیں اور واٹس ایپ گروپس میں فوری طور پر مصدقہ حوالہ جات شیئر کریں۔',
      step3Btn: 'ڈسکارڈ پر شامل کریں',
    },
    samples: {
      title: 'نمونہ دعووں کی جانچ کریں (ٹیسٹ کرنے کے لیے کلک کریں)',
      tryClaim: 'نمونہ دعویٰ',
    },
    talk: {
      roomTitle: 'اکوسٹک کور · لائیو وائس روم',
      tapToSpeak: 'بولنے کے لیے کور پر کلک کریں، مکمل ہونے پر دوبارہ کلک کریں۔',
      listening: 'آپ کی آواز سن رہا ہے...',
      verifying: 'عالمی سائنسی ریکارڈ سے تصدیق کی جا رہی ہے...',
      speaking: 'مصدقہ صوتی جواب سنایا جا رہا ہے (روکنے کے لیے کلک کریں)...',
      ready: 'آپ کے صوتی سوال کا منتظر',
      newClaim: 'نیا سوال',
      openInChat: 'مکمل شواہد اور حوالہ جات دیکھیں',
      evidenceFound: 'مصدقہ سائنسی شواہد',
      groundedVerdict: 'مصدقہ فیصلہ',
    },
    chat: {
      placeholder: 'کوئی بھی دعویٰ یا سائنسی سوال بولیں یا لکھیں (مثلاً: کیا پولیو ویکسین محفوظ ہے؟)...',
      send: 'تصدیق کریں',
      analyzing: 'دعوے کا تجزیہ اور مستند ڈیٹا بیسز سے موازنہ کیا جا رہا ہے...',
      serverWarmup: '⚡ سرور فعال ہے... مصدقہ ڈیٹا بیسز سے جانچ جاری ہے۔',
      viewEvidence: 'مصدقہ حوالہ جات دیکھیں',
      evidenceDrawer: 'بنیادی شواہد اور سرکاری سائنسی حوالہ جات',
      noEvidence: 'اس سوال کے لیے کوئی شواہد موصول نہیں ہوئے۔',
      sourceAuthority: 'ذرائع کی مستند درجہ بندی',
      confidence: 'شواہد کا اعتماد',
      domainAll: 'تمام 12 شعبے',
      domainHealth: 'صحت اور ادویات',
      domainScience: 'سائنس اور کائنات',
      domainClimate: 'موسمیات و فضا',
      domainDisaster: 'ہنگامی آفات',
      domainAi: 'مصنوعی ذہانت اور ڈیپ فیک',
    },
    serverNotice: {
      wakingTitle: 'کلاؤڈ سرور شروع ہو رہا ہے',
      wakingDesc: 'ویری وائس کا کلاؤڈ انجن نیند کی حالت سے بیدار ہو رہا ہے (~15-30 سیکنڈ)۔ بولنے سے قبل براہ کرم کچھ دیر انتظار فرمائیں۔',
      readyTitle: 'سرور تیار ہے',
      readyDesc: 'کلاؤڈ تصدیقی انجن مکمل طور پر فعال اور تیار ہے۔',
      pleaseWait: 'سرور کے بیدار ہونے کا انتظار فرمائیں (~15-30 سیکنڈ)...',
    },
    methodology: {
      title: 'شواہد اور تصدیق کا سائنسی طریقہ کار',
      subtitle:
        'ویری وائس کس طرح جھوٹی معلومات اور من گھڑت جوابات کو روک کر مستند سائنسی حقائق پیش کرتا ہے۔',
      pillar1Title: 'صرف مستند شواہد پر انحصار (0% غلط بیانی)',
      pillar1Desc:
        'تمام فیصلے مستند عالمی ڈیٹا بیسز (WHO، NOAA، USGS، UNESCO) کے حوالہ جات کے پابند ہیں۔ اگر ثبوت ناکافی ہوں تو ماڈل قیاس آرائی کی بجائے غیر یقینی (UNCERTAIN) ظاہر کرتا ہے۔',
      pillar2Title: 'ذرائع کی معتبریت کی درجہ بندی',
      pillar2Desc:
        'بنیادی سائنسی اور سرکاری ادارے عام سوشل میڈیا فیڈز پر فوقیت رکھتے ہیں۔',
      pillar3Title: 'کثیر لسانی صوتی رسائی',
      pillar3Desc:
        'اردو، ہسپانوی اور انڈونیشیائی زبانوں میں بولنے اور سننے کی مکمل سہولت تاکہ ہر طبقے کو حقائق تک آسان رسائی ملے۔',
    },
    footer: {
      copyright: 'ویری وائس © 2026 · یونیسکو گلوبل یوتھ ہیکاتھون (#GlobalMILWeek2026)',
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
      tagline: 'UNESCO Global Youth Hackathon 2026 · Alfabetización Mediática por Voz',
      headline: 'La verdad no debería requerir un título universitario para leerse.',
      subheadline:
        'Cuando los rumores virales se propagan mediante notas de voz en WhatsApp, el fact-checking tradicional falla. VeriVoice permite a las comunidades hablar en español, urdu o inglés y recibir explicaciones orales verificadas directamente con la OMS, NOAA y repositorios científicos.',
      startTalk: 'Iniciar Voz en Vivo',
      searchResearch: 'Buscar y Citas',
      discordBot: 'Bot de Discord',
    },
    quickStart: {
      badge: 'Cómo Funciona',
      title: 'Verdad Hablada en Tres Pasos',
      step1Tag: '01 · Hable con Naturalidad',
      step1Title: 'Entrada de Voz, Sin Escribir',
      step1Desc:
        'Toque el Núcleo Acústico y hable en español o inglés. El reconocimiento de voz procesa acentos con respuesta inmediata.',
      step1Btn: 'Abrir Modo Voz',
      step2Tag: '02 · Fundamentación Multifuente',
      step2Title: 'Instituciones Oficiales Sobre el Clickbait',
      step2Desc:
        'Verifica contra bases de datos de la OMS, NOAA y NASA. Si no hay evidencia, admite incertidumbre en lugar de alucinar.',
      step2Btn: 'Abrir Chat y Evidencia',
      step3Tag: '03 · Verdad Hablada',
      step3Title: 'Escuche y Comparta Citas Verificadas',
      step3Desc:
        'Escuche explicaciones neurales en su idioma materno y comparta veredictos verificados con sus grupos comunitarios.',
      step3Btn: 'Agregar a Discord',
    },
    samples: {
      title: 'Afirmaciones de Muestra (Clic para probar)',
      tryClaim: 'Afirmación de Ejemplo',
    },
    talk: {
      roomTitle: 'Núcleo Acústico · Sala de Voz en Vivo',
      tapToSpeak: 'Toque el núcleo para hablar, toque de nuevo al terminar.',
      listening: 'Escuchando su voz...',
      verifying: 'Consultando archivos primarios y verificando...',
      speaking: 'Reproduciendo respuesta verificada (toque para interrumpir)...',
      ready: 'Listo para su consulta de voz',
      newClaim: 'Nueva Consulta',
      openInChat: 'Ver Citas y Evidencia Completa',
      evidenceFound: 'Fuentes Oficiales Recuperadas',
      groundedVerdict: 'Veredicto Fundamentado',
    },
    chat: {
      placeholder: 'Hable o escriba cualquier afirmación (ej. "¿Las vacunas causan autismo?")...',
      send: 'Verificar',
      analyzing: 'Extrayendo afirmaciones y consultando repositorios oficiales...',
      serverWarmup: '⚡ El servidor está activo... Verificando contra datos oficiales.',
      viewEvidence: 'Ver Citas Verificadas',
      evidenceDrawer: 'Evidencia Primaria y Citas Institucionales',
      noEvidence: 'No se encontraron elementos de evidencia para esta consulta.',
      sourceAuthority: 'Jerarquía de Autoridad de Fuentes',
      confidence: 'Puntuación de Confianza',
      domainAll: 'Los 12 Dominios',
      domainHealth: 'Salud y Medicina',
      domainScience: 'Ciencia y Astronomía',
      domainClimate: 'Clima y Atmósfera',
      domainDisaster: 'Alertas de Desastres',
      domainAi: 'IA y Deepfakes',
    },
    serverNotice: {
      wakingTitle: 'Servidor en la Nube Iniciándose',
      wakingDesc: 'Nuestro motor de verificación en la nube se está iniciando del modo de reposo (~15-30s). Por favor espere un momento.',
      readyTitle: 'Servidor en Línea y Listo',
      readyDesc: 'El motor de verificación está activo y listo para sus consultas.',
      pleaseWait: 'Esperando a que el servidor en la nube se active (~15-30s)...',
    },
    methodology: {
      title: 'Metodología de Validación y Seguridad Epistémica',
      subtitle:
        'Cómo VeriVoice previene alucinaciones de IA, evalúa el consenso científico y combate la desinformación.',
      pillar1Title: 'Fundamentación Estricta (0% Alucinación)',
      pillar1Desc:
        'Los veredictos están estrictamente limitados a bases de datos oficiales (OMS, NOAA, USGS, UNESCO). Si no hay evidencia, responde INCIERTO.',
      pillar2Title: 'Jerarquía Determinista de Fuentes',
      pillar2Desc:
        'Las instituciones científicas y datos oficiales tienen prioridad sobre medios secundarios y blogs.',
      pillar3Title: 'Accesibilidad Oral Universal',
      pillar3Desc:
        'El reconocimiento de voz y síntesis neural permiten a comunidades orales en español, urdu e indonesio verificar rumores críticos.',
    },
    footer: {
      copyright: 'VeriVoice © 2026 · UNESCO Global Youth Hackathon (#GlobalMILWeek2026)',
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
      tagline: 'UNESCO Global Youth Hackathon 2026 · Literasi Media Berbasis Suara',
      headline: 'Kebenaran Tidak Memerlukan Gelar Sarjana untuk Dibaca.',
      subheadline:
        'Ketika rumor viral menyebar lewat pesan suara 30 detik di WhatsApp, fact-checking teks sering kali gagal. VeriVoice memungkinkan masyarakat berbicara dalam bahasa Indonesia, Urdu, atau Spanyol dan mendengar penjelasan suara terverifikasi langsung dari WHO, NOAA, dan arsip sains global.',
      startTalk: 'Mulai Percakapan Suara',
      searchResearch: 'Cari & Kutipan',
      discordBot: 'Bot Discord',
    },
    quickStart: {
      badge: 'Cara Kerja',
      title: 'Kebenaran Bersuara dalam Tiga Langkah',
      step1Tag: '01 · Bicara Alami',
      step1Title: 'Input Suara, Tanpa Mengetik',
      step1Desc:
        'Ketuk Acoustic Core dan bicara secara alami dalam bahasa Indonesia atau Inggris. ASR percakapan memproses dialek tanpa jeda.',
      step1Btn: 'Buka Mode Suara',
      step2Tag: '02 · Landasan Multumber',
      step2Title: 'Institusi Utama di Atas Clickbait',
      step2Desc:
        'Memeriksa silang klaim terhadap basis data WHO, NOAA, dan NASA. Jika bukti tidak ada, sistem menyatakan TIDAK PASTI daripada berhalusinasi.',
      step2Btn: 'Buka Obrolan & Bukti',
      step3Tag: '03 · Tanggapan Suara Terverifikasi',
      step3Title: 'Dengar & Bagikan Fakta Terverifikasi',
      step3Desc:
        'Dengarkan penjelasan suara neural berkualitas tinggi dalam bahasa ibu Anda dan bagikan kartu bukti terverifikasi langsung ke grup keluarga.',
      step3Btn: 'Tambahkan ke Discord',
    },
    samples: {
      title: 'Klaim Sampel Terpilih (Klik untuk Menguji)',
      tryClaim: 'Klaim Sampel',
    },
    talk: {
      roomTitle: 'Acoustic Core · Ruang Suara Langsung',
      tapToSpeak: 'Ketuk inti untuk berbicara, ketuk lagi setelah selesai.',
      listening: 'Mendengarkan suara Anda...',
      verifying: 'Memeriksa arsip resmi & memverifikasi...',
      speaking: 'Memutar tanggapan terverifikasi (ketuk inti untuk menghentikan)...',
      ready: 'Siap untuk pertanyaan suara Anda',
      newClaim: 'Pertanyaan Baru',
      openInChat: 'Buka Kutipan Lengkap & Bukti',
      evidenceFound: 'Sumber Resmi Ditemukan',
      groundedVerdict: 'Putusan Terverifikasi',
    },
    chat: {
      placeholder: 'Bicarakan atau ketik klaim apa pun (contoh: "Apakah kadar CO₂ atmosfer mencapai rekor tertinggi?")...',
      send: 'Verifikasi',
      analyzing: 'Mengekstrak klaim & memeriksa repositori institusi resmi...',
      serverWarmup: '⚡ Server aktif... Memverifikasi klaim terhadap kumpulan data resmi.',
      viewEvidence: 'Lihat Kutipan Terverifikasi',
      evidenceDrawer: 'Bukti Primer & Kutipan Resmi Institusi',
      noEvidence: 'Tidak ada bukti resmi yang ditemukan untuk pertanyaan ini.',
      sourceAuthority: 'Hierarki Otoritas Sumber',
      confidence: 'Skor Keyakinan',
      domainAll: 'Semua 12 Domain',
      domainHealth: 'Kesehatan & Medis',
      domainScience: 'Sains & Astronomi',
      domainClimate: 'Iklim & Atmosfer',
      domainDisaster: 'Peringatan Bencana',
      domainAi: 'AI & Deepfake',
    },
    serverNotice: {
      wakingTitle: 'Server Cloud Sedang Memuat',
      wakingDesc: 'Mesin verifikasi cloud kami sedang menyala dari mode tidur (~15-30 detik). Mohon tunggu sejenak sebelum mengirim suara.',
      readyTitle: 'Server Online & Siap',
      readyDesc: 'Mesin verifikasi cloud sudah aktif dan siap untuk digunakan.',
      pleaseWait: 'Menunggu server verifikasi aktif (~15-30 detik)...',
    },
    methodology: {
      title: 'Metodologi Pembuktian & Standar Keamanan Epistemik',
      subtitle:
        'Bagaimana VeriVoice mencegah halusinasi AI, menilai konsensus ilmiah resmi, dan memberdayakan komunitas berbasis lisan.',
      pillar1Title: 'Berlandaskan Bukti Resmi (0% Halusinasi)',
      pillar1Desc:
        'Semua putusan dibatasi secara ketat pada basis data ilmiah terpercaya (WHO, NOAA, USGS, UNESCO). Jika bukti tidak mencukupi, sistem menyatakan TIDAK PASTI.',
      pillar2Title: 'Hierarki Otoritas Deterministik',
      pillar2Desc:
        'Institusi ilmiah dan data resmi diutamakan dibandingkan berita sekunder dan blog.',
      pillar3Title: 'Aksesibilitas Lisan Universal',
      pillar3Desc:
        'Pengenalan suara dan sintesis suara neural memungkinkan masyarakat berbahasa Indonesia, Urdu, dan Spanyol memverifikasi informasi.',
    },
    footer: {
      copyright: 'VeriVoice © 2026 · UNESCO Global Youth Hackathon (#GlobalMILWeek2026)',
      methodology: 'Metodologi',
      discordBot: 'Bot Discord',
    },
  },
};

export const getTranslation = (langCode: string): TranslationSchema => {
  const code = (langCode.toLowerCase() as LanguageCode);
  return translations[code] || translations.en;
};
