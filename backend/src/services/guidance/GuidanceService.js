/**
 * Guidance Service.
 * Provides interactive product guidance explaining VeriVoice's 2 primary modes (Verification & General Research) and domain shortcuts.
 */

class GuidanceService {
  static getOnboardingCard() {
    return {
      title: '👋 Welcome to VeriVoice',
      description: 'VeriVoice is an evidence-first, voice-first assistant designed to verify rumors, research questions, and explore authoritative sources.',
      modes: [
        {
          command: '/verify <claim>',
          badge: '🔎 VERIFICATION MODE',
          description: 'Checks whether a claim is TRUE, FALSE, MIXED, or UNCERTAIN using retrieved evidence & citations.',
        },
        {
          command: '/general <question>',
          badge: '🌐 GENERAL RESEARCH MODE',
          description: 'Answers research questions using web evidence without forcing artificial TRUE/FALSE verdicts.',
        },
      ],
      shortcuts: [
        { command: '/health', label: '🏥 Health & Medicine' },
        { command: '/science', label: '🔬 Science & Astronomy' },
        { command: '/climate', label: '🌦️ Climate & Weather' },
        { command: '/disaster', label: '🚨 Disasters & Emergencies' },
        { command: '/education', label: '🎓 Education & Policy' },
      ],
      voiceNotice: '🎙️ Send a voice message anytime: VeriVoice transcribes, analyzes, and returns a spoken audio response in your language!',
    };
  }

  static getAboutCard() {
    return {
      title: '🛡️ About VeriVoice',
      description: 'VeriVoice is an evidence-grounded research and verification platform created for UNESCO infodemic mitigation.',
      differentiators: [
        '1. Verification-First Workflow: Separates evidence verification from general research.',
        '2. Domain-Aware Retrieval: Prioritizes WHO/PAHO for Health, NASA/USGS for Space, WMO/NOAA for Climate.',
        '3. Traceable Citations: Rejects URL hallucinations and links directly to retrieved sources.',
        '4. Honest Uncertainty: Explicitly states when evidence is insufficient or conflicting.',
        '5. Multilingual Voice Interaction: Transcribes and speaks responses in 10+ languages.',
        '6. Transparent Verification: Shows "How VeriVoice Checked This" without exposing internal reasoning.',
      ],
      datasetNotice: 'Production knowledge base governance preserves strict evidence integrity. Unsupported claims return explicit uncertainty rather than model memory guesses.',
    };
  }
}

module.exports = GuidanceService;
