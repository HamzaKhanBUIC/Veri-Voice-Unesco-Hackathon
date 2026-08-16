/**
 * Guidance Service.
 * Provides interactive product guidance, command usage, methodology links, and privacy disclosures.
 */

const GITHUB_REPO_URL = 'https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon';
const PRIVACY_URL = 'https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon/blob/main/docs/discord-privacy.md';
const METHODOLOGY_URL = 'https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon/blob/main/docs/architecture.md';
const WEBSITE_URL = 'https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon#readme';

class GuidanceService {
  static getOnboardingCard() {
    return {
      title: 'VeriVoice Commands & Usage Guide',
      description: 'VeriVoice is an evidence-first, voice-first verification assistant designed to counter rumors, research factual questions, and ground answers in credible international institutions.',
      modes: [
        {
          command: '/verify <claim>',
          badge: '🔎 VERIFICATION MODE',
          description: 'Checks whether a claim is 🟢 TRUE, 🔴 FALSE, 🟡 MIXED, or ⚪ UNCERTAIN using retrieved evidence & citations.',
        },
        {
          command: '/general <question>',
          badge: '🌐 GENERAL RESEARCH MODE',
          description: 'Researches open factual inquiries using live web evidence without forcing artificial TRUE/FALSE verdicts.',
        },
      ],
      shortcuts: [
        { command: '/health <text>', label: '🏥 Health & Medicine (WHO, CDC, PAHO, NIH)' },
        { command: '/science <text>', label: '🔬 Science & Astronomy (NASA, ESA, CERN, USGS)' },
        { command: '/climate <text>', label: '🌦️ Climate & Weather (WMO, IPCC, NOAA, PMD, BMKG)' },
        { command: '/disaster <text>', label: '🚨 Disasters & Warnings (NDMA, BNPB, UN OCHA, ReliefWeb)' },
        { command: '/education <text>', label: '🎓 Education & Policy (UNESCO, GADRRRES)' },
      ],
      voiceNotice: '🎙️ **Voice Messages**: Hold your mic and send a voice note anytime in this channel or DM! VeriVoice transcribes the audio, validates the claims, and replies with a spoken neural voice response in your language.',
      privacyNotice: `🎙️ Your audio is processed to transcribe your request and generate a response. See our [Privacy Policy](${PRIVACY_URL}) for details.`,
      privacyUrl: PRIVACY_URL,
    };
  }

  static getAboutCard() {
    return {
      title: 'VeriVoice',
      subtitle: 'A voice-first evidence verification assistant.',
      links: [
        { label: 'Learn how it works', url: WEBSITE_URL },
        { label: 'Privacy', url: PRIVACY_URL },
        { label: 'Source methodology', url: METHODOLOGY_URL },
        { label: 'GitHub', url: GITHUB_REPO_URL },
      ],
      differentiators: [
        'Evidence-Grounded Verification: Prioritizes peer-reviewed and primary institutional sources (WHO, NASA, IPCC, CDC, USGS).',
        'Multilingual Voice Interaction: Native recognition and neural voice synthesis in 9 languages (Urdu, English, Spanish, Indonesian, Arabic, Hindi, French, German).',
        'Honest Uncertainty Principle: Explicitly outputs UNCERTAIN when evidence is absent, conflicting, or unverified.',
        'Zero-Retention Privacy: Voice notes are processed ephemerally and immediately purged after synthesis.',
      ],
      privacyUrl: PRIVACY_URL,
      githubUrl: GITHUB_REPO_URL,
    };
  }
}

module.exports = GuidanceService;
