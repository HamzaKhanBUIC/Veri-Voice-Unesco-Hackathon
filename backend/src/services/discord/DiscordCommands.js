const GuidanceService = require('../guidance/GuidanceService');

/**
 * Discord Slash Commands Definition and Handler.
 * Supports /verify, /general, /health, /science, /climate, /disaster, /education, /help, /about.
 * Enforces input bounding (500 chars), mention escaping (@everyone protection), and UNESCO MIL disclosures.
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
            description: 'The claim to verify (max 500 chars)',
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
            description: 'The research question (max 500 chars)',
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
            description: 'Health claim or question (max 500 chars)',
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
            description: 'Science claim or question (max 500 chars)',
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
            description: 'Climate/weather claim or question (max 500 chars)',
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
            description: 'Disaster warning or question (max 500 chars)',
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
            description: 'Education claim or question (max 500 chars)',
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: 'live',
        description: 'VeriVoice Live — Check official emergency alerts, flood warnings & weather',
        options: [
          {
            name: 'query',
            description: 'Location or disaster topic (e.g. Karachi flood, Sindh weather)',
            type: 3,
            required: false,
          },
        ],
      },
      {
        name: 'help',
        description: 'VeriVoice Onboarding — Learn how to verify claims & research questions',
      },
      {
        name: 'about',
        description: 'VeriVoice Architecture & Methodology — UNESCO MIL Grounding & Safety Platform',
      },
    ];
  }

  /**
   * Sanitizes output strings against mass mention injection (@everyone, @here).
   * @param {string} text 
   * @returns {string}
   */
  static sanitizeOutputText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/@everyone/g, '@\u200beveryone')
      .replace(/@here/g, '@\u200bhere');
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
      const content = `ℹ️ **${card.title}**\n\n` +
                      `${card.description}\n\n` +
                      `**Primary Verification Commands:**\n` +
                      card.modes.map((m) => `• \`${m.command}\`: ${m.description}`).join('\n') + `\n\n` +
                      `**Domain Shortcuts:**\n` +
                      card.shortcuts.map((s) => `• \`${s.command}\`: ${s.label}`).join('\n') + `\n\n` +
                      `**Voice Verification:**\n` +
                      `${card.voiceNotice}\n\n` +
                      `🔒 **Privacy Policy**:\n` +
                      `${card.privacyNotice}`;
      return { type: 'text', content: DiscordCommands.sanitizeOutputText(content) };
    }

    if (commandName === 'about') {
      const card = GuidanceService.getAboutCard();
      const linksText = card.links.map((l) => `• **${l.label}**: [${l.label}](${l.url})`).join('\n');
      const diffText = card.differentiators.map((d) => `• ${d}`).join('\n');
      const content = `🛡️ **${card.title}**\n` +
                      `${card.subtitle}\n\n` +
                      `${linksText}\n\n` +
                      `**Key Capabilities:**\n` +
                      `${diffText}`;
      return { type: 'text', content: DiscordCommands.sanitizeOutputText(content) };
    }

    if (commandName === 'live') {
      const LiveInformationService = require('../live/LiveInformationService');
      const liveService = new LiveInformationService();
      const userQuery = interaction.options?.getString ? interaction.options.getString('query') : (interaction.claimInput || '');
      const liveData = await liveService.getLiveUpdates(userQuery || '', {
        location: { country: 'Pakistan', region: userQuery || null },
      });

      let itemsList = '';
      if (liveData.items && liveData.items.length > 0) {
        itemsList = '\n\n' + liveData.items.slice(0, 3).map((it) => {
          const badge = it.severity === 'CRITICAL' ? '🚨 CRITICAL' : it.severity === 'WARNING' ? '⚠️ WARNING' : 'ℹ️ ADVISORY';
          const typeBadge = it.sourceType === 'OFFICIAL_ALERT' ? '🏛️ Official Alert' : it.sourceType === 'OFFICIAL_WEATHER' ? '🌦️ Weather Service' : '📰 News Report';
          return `**[${badge}] ${it.title}**\n` +
                 `*${typeBadge} • ${it.sourceOrganization}*\n` +
                 `${it.summary}\n` +
                 `🔗 [View Official Advisory](${it.url})`;
        }).join('\n\n');
      }

      const content = `🔴 **VERIVOICE LIVE — OFFICIAL EMERGENCY & WEATHER AWARENESS**\n\n` +
                      `**Summary**: ${liveData.summary}` +
                      itemsList +
                      `\n\n⚠️ *${liveData.disclaimer}*`;

      return { type: 'text', content: DiscordCommands.sanitizeOutputText(content) };
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

    let userText = interaction.options?.getString ? (
      interaction.options.getString('claim') ||
      interaction.options.getString('question') ||
      interaction.options.getString('input')
    ) : (interaction.claimInput || interaction.userText);

    if (!userText || typeof userText !== 'string' || userText.trim() === '') {
      return { type: 'text', content: '⚠️ Please enter a valid claim or question.' };
    }

    userText = userText.trim();
    if (userText.length > 500) {
      userText = userText.substring(0, 500);
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

    // Format Product Response Cards cleanly
    const isResearch = verifResult.mode === 'GENERAL_RESEARCH' || verifResult.verdict === 'RESEARCH_RESPONSE';

    const header = isResearch ? '🌐 **VERIVOICE GENERAL RESEARCH**' : '🔎 **VERIVOICE VERIFICATION**';
    const domainIcon = verifResult.domain === 'EARTH_SPACE' ? '🌍 Earth & Space' :
                       verifResult.domain === 'HEALTH' ? '🏥 Health & Medicine' :
                       verifResult.domain === 'WEATHER_CLIMATE' ? '🌦️ Climate & Weather' :
                       verifResult.domain === 'DISASTER' ? '🚨 Disasters & Emergencies' :
                       verifResult.domain === 'EDUCATION' ? '🎓 Education & Policy' : '🌐 General';

    const verdictBadge = verifResult.verdict === 'TRUE' ? '🟢 **TRUE**' :
                        verifResult.verdict === 'FALSE' ? '🔴 **FALSE**' :
                        verifResult.verdict === 'MIXED' ? '🟡 **MIXED**' :
                        isResearch ? '🔬 **RESEARCH RESPONSE**' : '⚪ **UNCERTAIN** (Insufficient Evidence)';

    const confidenceLabel = verifResult.confidence === 'HIGH' || verifResult.confidence >= 0.8 ? 'High' :
                            verifResult.confidence === 'MEDIUM' || verifResult.confidence >= 0.5 ? 'Medium' : 'Low';

    let evidenceBullets = '';
    if (verifResult.evidence && verifResult.evidence.length > 0) {
      evidenceBullets = '\n\n**Key Evidence:**\n' + verifResult.evidence.map((e) => `• ${e.statement || e.claimText || 'Verified evidence statement'}`).join('\n');
    }

    let sourceCitations = '';
    if (verifResult.sources && verifResult.sources.length > 0) {
      sourceCitations = '\n\n**Sources & Citations:**\n' + verifResult.sources.map((s) => `• [${s.organization || s.sourceTitle || 'Official Source'}](${s.url})`).join('\n');
    }

    const howChecked = '\n\n🛡️ *How VeriVoice checked this*:\n' +
                       `Retrieved live evidence ➔ evaluated source authority ➔ compared evidence ➔ validated citations.`;

    const rawContent = `${header}\n\n` +
                       `**Claim / Question**: "${verifResult.languageMetadata?.originalText || userText}"\n` +
                       `**Domain**: ${domainIcon}\n` +
                       (!isResearch ? `**Verdict**: ${verdictBadge}\n` : '') +
                       `**Confidence**: ${confidenceLabel}\n\n` +
                       `**${isResearch ? 'Answer' : 'Explanation'}**: ${verifResult.explanation || verifResult.answer}` +
                       evidenceBullets +
                       sourceCitations +
                       howChecked;

    const content = DiscordCommands.sanitizeOutputText(rawContent);

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
