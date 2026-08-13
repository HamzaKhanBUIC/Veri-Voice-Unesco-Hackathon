const DiscordClient = require('./DiscordClient');
const DiscordMedia = require('./DiscordMedia');
const DiscordCommands = require('./DiscordCommands');
const StandalonePipeline = require('../pipeline/standalonePipeline');
const SpeechmaticsProvider = require('../speech/SpeechmaticsProvider');
const EdgeTTSProvider = require('../tts/EdgeTTSProvider');
const VerificationEngine = require('../verification/verificationEngine');
const RetrievalService = require('../retrieval/retrievalService');
const LanguageDetector = require('../language/LanguageDetector');

/**
 * Discord Adapter Service.
 * Manages full lifecycle of Discord Bot: Gateway listeners, Slash commands,
 * Text mentions (@VeriVoice), Voice Note attachments, and Audio Pipeline delegation.
 */
class DiscordService {
  constructor(options = {}) {
    this.clientWrapper = options.clientWrapper || new DiscordClient();

    // Default to real production-grade providers
    const defaultSpeechProvider = process.env.SPEECHMATICS_API_KEY
      ? new SpeechmaticsProvider()
      : null;
    const defaultTtsProvider = new EdgeTTSProvider();
    const defaultRetrieval = new RetrievalService();
    const defaultVerificationEngine = new VerificationEngine();

    this.pipeline = options.pipeline || new StandalonePipeline({
      speechProvider: options.speechProvider || defaultSpeechProvider,
      verificationEngine: options.verificationEngine || defaultVerificationEngine,
      retrievalService: defaultRetrieval,
      ttsProvider: options.ttsProvider || defaultTtsProvider,
    });
  }

  /**
   * Initializes Discord event listeners and logs in bot client.
   */
  async start() {
    if (!this.clientWrapper.client) {
      console.log('ℹ️ DiscordService: Discord client is unconfigured or in mock mode.');
      return false;
    }

    const client = this.clientWrapper.client;

    client.on('ready', async () => {
      console.log(`🤖 DiscordService: Bot online as ${client.user.tag}`);
      await this.clientWrapper.registerSlashCommands(DiscordCommands.getSlashCommands());
    });

    // Handle Incoming Messages (Voice note attachments, Mentions & Text queries)
    client.on('messageCreate', async (message) => {
      // Ignore bot's own messages
      if (message.author.bot) return;

      // 1. Handle audio attachments
      if (message.attachments.size > 0) {
        for (const [, attachment] of message.attachments) {
          await this.handleAudioAttachment(message, attachment);
        }
        return;
      }

      // 2. Handle Bot Mentions (@VeriVoice <query>) or !verify / !help
      const botMentioned = client.user && message.mentions.has(client.user);
      const isLegacyCmd = message.content && (message.content.startsWith('!verify') || message.content.startsWith('!help'));

      if (botMentioned || isLegacyCmd) {
        let queryText = message.content;
        if (botMentioned) {
          // Strip bot mention tag from message content
          queryText = queryText.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
        } else if (message.content.startsWith('!verify')) {
          queryText = queryText.replace('!verify', '').trim();
        }

        if (!queryText || isLegacyCmd && message.content.startsWith('!help')) {
          const helpPayload = await DiscordCommands.handleInteraction({ commandName: 'help' }, this.pipeline);
          await message.reply(helpPayload.content);
          return;
        }

        // Process text claim/question directly
        try {
          const mockInteraction = {
            commandName: 'verify',
            options: {
              getString: (key) => (key === 'claim' ? queryText : null),
            },
          };
          const responsePayload = await DiscordCommands.handleInteraction(mockInteraction, this.pipeline);
          await message.reply(responsePayload.content);
        } catch (err) {
          console.error(`❌ DiscordService mention handler error: ${err.message}`);
          await message.reply('⚠️ Verification error: Unable to process request. Please try again using `/verify <claim>`.');
        }
      }
    });

    // Handle Slash Commands (/verify, /general, /health, /science, /climate, /disaster, /education, /help, /about)
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        await interaction.deferReply();
        const responsePayload = await DiscordCommands.handleInteraction(interaction, this.pipeline);
        await interaction.editReply(responsePayload.content);
      } catch (err) {
        console.error(`❌ DiscordService command error: ${err.message}`);
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply('⚠️ An error occurred while executing this command. Please try again.');
        }
      }
    });

    return await this.clientWrapper.start();
  }

  /**
   * Processes incoming Discord audio attachment end-to-end through StandalonePipeline.
   * @param {object} message - Discord message object
   * @param {object} attachment - Discord attachment object
   */
  async handleAudioAttachment(message, attachment) {
    const valResult = DiscordMedia.validateAttachment(attachment);
    if (!valResult.valid) {
      console.warn(`⚠️ DiscordMedia validation warning: ${valResult.error}`);
      try {
        await message.reply(`⚠️ ${valResult.error}`);
      } catch (e) {
        // Ignore reply error
      }
      return;
    }

    let tempInputPath = null;
    let progressMsg = null;

    try {
      // 1. Send initial progress acknowledgment
      try {
        progressMsg = await message.reply('🎙️ **Voice note received.** VeriVoice is transcribing and verifying your audio, please wait... ⏳');
      } catch (e) {
        // Ignore reply error
      }

      // 2. Determine file extension
      const fileName = attachment.name || attachment.filename || 'voice.ogg';
      const ext = fileName.includes('.') ? fileName.split('.').pop() : 'ogg';
      tempInputPath = DiscordMedia.generateSafeTempPath(ext);

      // 3. Download audio file securely
      await DiscordMedia.downloadAttachment(attachment.url, tempInputPath);

      // 4. Delegate to core StandalonePipeline
      console.log(`⚡ DiscordService: Delegating to StandalonePipeline (${tempInputPath})...`);
      const pipelineResult = await this.pipeline.processAudio(tempInputPath);

      // 5. Detect language to format response card consistently
      const lang = pipelineResult.language || 'ur';
      const isUrdu = lang === 'ur' || lang === 'ur-Roman';

      const verdictBadge = pipelineResult.verdict === 'TRUE' ? '🟢 TRUE' :
                          pipelineResult.verdict === 'FALSE' ? '🔴 FALSE' :
                          pipelineResult.verdict === 'MIXED' ? '🟡 MIXED' :
                          pipelineResult.verdict === 'RESEARCH_RESPONSE' ? '🔬 RESEARCH RESPONSE' :
                          '⚪ UNCERTAIN (Insufficient Evidence)';

      const headerTitle = isUrdu ? '🎙️ VERIVOICE وائس واک تصدیق' : '🎙️ VERIVOICE VOICE VERIFICATION';
      const transcriptLabel = isUrdu ? 'متن (Transcript)' : 'Transcript';
      const verdictLabel = isUrdu ? 'نتیجہ (Verdict)' : 'Verdict';
      const explanationLabel = isUrdu ? 'تفصیل (Explanation)' : 'Explanation';
      const audioLabel = isUrdu ? '🔊 صوتی جواب (Audio Response)' : '🔊 Spoken Audio Response';

      const replyText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `**${headerTitle}**\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `**${transcriptLabel}**: "${pipelineResult.transcript}"\n` +
                        `**${verdictLabel}**: ${verdictBadge}\n` +
                        `**Processing Time**: \`${pipelineResult.timing?.totalSeconds || 0.0}s\`\n\n` +
                        `**${explanationLabel}**: ${pipelineResult.responseText}\n\n` +
                        `**${audioLabel}**:`;

      // 6. Send result + generated MP3 audio file attachment
      await message.channel.send({
        content: replyText,
        files: [
          {
            attachment: pipelineResult.outputAudio,
            name: `verivoice_response_${Date.now()}.mp3`,
            description: 'VeriVoice Spoken Audio Response',
          },
        ],
      });

      console.log(`✅ DiscordService: Successfully delivered voice response for message ${message.id}`);
    } catch (err) {
      console.error(`❌ DiscordService pipeline processing error: ${err.message}`);
      try {
        await message.reply('⚠️ Unable to determine a conclusive verification verdict for this voice note. (UNCERTAIN)');
      } catch (e) {
        // Ignore reply error
      }
    } finally {
      // 7. Cleanup temp input file
      DiscordMedia.safeCleanup(tempInputPath);
    }
  }

  /**
   * Stop bot client.
   */
  async stop() {
    await this.clientWrapper.stop();
  }
}

module.exports = DiscordService;
