const GuidanceService = require('../guidance/GuidanceService');

/**
 * Discord Slash Commands Definition and Handler.
 * Supports /verify, /general, /health, /science, /climate, /disaster, /education, /help, /about.
 */
class DiscordCommands {
  /**
   * Returns list of Discord Application Slash Command Definitions.
   */
  static getSlashCommands() {
    return [
      {
        name: 'verify',
        description: 'Verify a claim against retrieved evidence (TRUE, FALSE, MIXED, UNCERTAIN)',
        options: [
          {
            name: 'claim',
            description: 'The claim to verify',
            type: 3, // STRING
            required: true,
          },
        ],
      },
      {
        name: 'general',
        description: 'Research a general question using web evidence',
        options: [
          {
            name: 'question',
            description: 'The research question',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'health',
        description: 'Check health information or verify health claims',
        options: [
          {
            name: 'input',
            description: 'Health claim or question',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'science',
        description: 'Check science & astronomy claims or research questions',
        options: [
          {
            name: 'input',
            description: 'Science claim or question',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'climate',
        description: 'Check weather & climate information',
        options: [
          {
            name: 'input',
            description: 'Climate/weather claim or question',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'disaster',
        description: 'Verify emergency or disaster warnings',
        options: [
          {
            name: 'input',
            description: 'Disaster warning or question',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'education',
        description: 'Check education statistics or policy information',
        options: [
          {
            name: 'input',
            description: 'Education claim or question',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'help',
        description: 'VeriVoice Onboarding — Learn how to verify claims & research questions',
      },
      {
        name: 'about',
        description: 'About VeriVoice Evidence Verification Platform',
      },
    ];
  }

  /**
   * Handles incoming slash command interactions.
   * @param {object} interaction - Discord interaction object
   * @param {object} pipeline - StandalonePipeline instance
   * @returns {Promise<object>} Response payload object
   */
  static async handleInteraction(interaction, pipeline) {
    if (!interaction || typeof interaction !== 'object') {
      throw new Error('DiscordCommands: Invalid interaction object');
    }

    const commandName = interaction.commandName;

    if (commandName === 'help') {
      const card = GuidanceService.getOnboardingCard();
      const content = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `${card.title}\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `${card.description}\n\n` +
                      `**Primary Modes:**\n` +
                      card.modes.map((m) => `• \`${m.command}\`: ${m.description}`).join('\n') + `\n\n` +
                      `**Domain Shortcuts:**\n` +
                      card.shortcuts.map((s) => `• \`${s.command} <text>\`: ${s.label}`).join('\n') + `\n\n` +
                      `${card.voiceNotice}`;
      return { type: 'text', content };
    }

    if (commandName === 'about') {
      const card = GuidanceService.getAboutCard();
      const content = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `${card.title}\n` +
                      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `${card.description}\n\n` +
                      `**Key Differentiators:**\n` +
                      card.differentiators.map((d) => `• ${d}`).join('\n') + `\n\n` +
                      `*${card.datasetNotice}*`;
      return { type: 'text', content };
    }

    // Determine requested mode and domain hint from command
    let mode = 'VERIFICATION';
    let requestedDomain = null;

    if (commandName === 'general') {
      mode = 'GENERAL_RESEARCH';
    } else if (['health', 'science', 'climate', 'disaster', 'education'].includes(commandName)) {
      requestedDomain = commandName.toUpperCase();
      if (commandName === 'science') requestedDomain = 'EARTH_SPACE';
      if (commandName === 'climate') requestedDomain = 'WEATHER_CLIMATE';
    }

    const userText = interaction.options?.getString ? (
      interaction.options.getString('claim') ||
      interaction.options.getString('question') ||
      interaction.options.getString('input')
    ) : (interaction.claimInput || interaction.userText);

    if (!userText || typeof userText !== 'string' || userText.trim() === '') {
      return { type: 'text', content: '⚠️ Please enter a valid claim or question.' };
    }

    // Execute through retrieval & verification engine
    const engine = pipeline.verificationEngine;
    const retrieval = pipeline.retrievalService;

    let matches = [];
    if (retrieval) {
      const retResult = await retrieval.search(userText, { mode, domain: requestedDomain });
      matches = retResult.matches || [];
    }

    const verifResult = await engine.verifyClaim(userText, matches, { mode, requestedDomain });

    // Format Product Response Cards
    const isResearch = verifResult.mode === 'GENERAL_RESEARCH' || verifResult.verdict === 'RESEARCH_RESPONSE';

    const header = isResearch ? '🌐 VERIVOICE GENERAL RESEARCH' : '🔎 VERIVOICE VERIFICATION';
    const domainIcon = verifResult.domain === 'EARTH_SPACE' ? '🌍 Earth & Space' :
                       verifResult.domain === 'HEALTH' ? '🏥 Health & Medicine' :
                       verifResult.domain === 'WEATHER_CLIMATE' ? '🌦️ Climate & Weather' :
                       verifResult.domain === 'DISASTER' ? '🚨 Disasters & Emergencies' :
                       verifResult.domain === 'EDUCATION' ? '🎓 Education & Policy' : '🌐 General';

    const verdictBadge = verifResult.verdict === 'TRUE' ? '🟢 TRUE' :
                        verifResult.verdict === 'FALSE' ? '🔴 FALSE' :
                        verifResult.verdict === 'MIXED' ? '🟡 MIXED' :
                        isResearch ? 'ℹ️ RESEARCH RESULT' : '⚪ UNCERTAIN (Insufficient Evidence)';

    const confidenceTag = verifResult.confidence || 'LOW';

    let evidenceBullets = '';
    if (verifResult.evidence && verifResult.evidence.length > 0) {
      evidenceBullets = '\n\n**Key Evidence:**\n' + verifResult.evidence.map((e) => `• ${e.statement || e.claimText || 'Verified evidence statement'}`).join('\n');
    }

    let sourceCitations = '';
    if (verifResult.sources && verifResult.sources.length > 0) {
      sourceCitations = '\n\n**Sources & Citations:**\n' + verifResult.sources.map((s) => `• [${s.organization || s.sourceTitle || 'Official Source'}](${s.url}) (${s.authorityLevel || 'PRIMARY_AUTHORITY'})`).join('\n');
    }

    const howChecked = '\n\n**How VeriVoice Checked:**\n' +
                       `Domain Detection (\`${verifResult.domain || 'GENERAL'}\`) ➔ Targeted Retrieval ➔ Source Authority (${verifResult.sources?.length || 0} sources) ➔ Evidence Evaluation ➔ Citation Validation`;

    const content = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `${header}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `**Input**: "${verifResult.languageMetadata?.originalText || userText}"\n` +
                    `**Domain**: ${domainIcon}\n` +
                    (!isResearch ? `**Verdict**: ${verdictBadge}\n` : '') +
                    `**Evidence Strength**: \`${verifResult.evidenceStrength || 'SUFFICIENT'}\` | Confidence: \`${confidenceTag}\`\n\n` +
                    `**Explanation / Answer**: ${verifResult.explanation || verifResult.answer}` +
                    evidenceBullets +
                    sourceCitations +
                    howChecked;

    return {
      type: 'text',
      content,
      verdict: verifResult.verdict,
      mode: verifResult.mode,
      domain: verifResult.domain,
    };
  }
}

module.exports = DiscordCommands;
