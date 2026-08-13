const DiscordClient = require('./DiscordClient');
const DiscordMedia = require('./DiscordMedia');
const DiscordCommands = require('./DiscordCommands');
const StandalonePipeline = require('../pipeline/standalonePipeline');
const SpeechmaticsProvider = require('../speech/SpeechmaticsProvider');
const EdgeTTSProvider = require('../tts/EdgeTTSProvider');
const VerificationEngine = require('../verification/verificationEngine');
const RetrievalService = require('../retrieval/retrievalService');
const RateLimiter = require('../rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../concurrency/ConcurrencyLimiter');

/**
 * Discord Adapter Service.
 * Manages full lifecycle of Discord Bot: Gateway listeners, Rate limiting, Concurrency queues,
 * Slash commands, Text mentions (@VeriVoice), Voice Note attachments, and Audio Pipeline delegation.
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

    this.rateLimiter = options.rateLimiter || new RateLimiter({ maxRequests: 5, windowMs: 60000 });
    this.concurrencyLimiter = options.concurrencyLimiter || new ConcurrencyLimiter({ maxConcurrent: 3 });
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

    client.on('messageCreate', async (message) => {
      if (!message || message.author?.bot) return;

      const userId = message.author?.id || 'unknown_user';
      const requestId = `req_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Rate limit check per user ID
      const rateCheck = this.rateLimiter.check(userId);
      if (!rateCheck.allowed) {
        try {
          await message.reply('⚠️ Rate limit exceeded. Please wait a moment before sending more requests.');
        } catch (e) {}
        return;
      }

      // Check for audio attachments
      const audioAttachment = message.attachments?.find((att) => {
        const mime = (att.contentType || '').toLowerCase();
        const name = (att.name || att.filename || '').toLowerCase();
        return mime.startsWith('audio/') || /\.(ogg|opus|mp3|wav|m4a|amr|webm)$/i.test(name);
      });

      if (audioAttachment) {
        // Explicit Audio + Text handling: pass message text context if user provided a text caption
        const captionText = message.content ? message.content.replace(/<@!?\d+>/g, '').trim() : '';
        await this.handleAudioAttachment(message, audioAttachment, { requestId, captionText });
        return;
      }

      // Handle Direct Bot Mention (@VeriVoice <claim/question>)
      if (client.user && message.mentions?.has(client.user)) {
        const cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();

        if (!cleanContent) {
          try {
            await message.reply('سلام! VeriVoice voice verification bot yahan hai. Mujhse claim verify karwane ke liye text poochhein ya voice note bhejein! (/help for details)');
          } catch (e) {}
          return;
        }

        try {
          const fakeInteraction = {
            commandName: 'verify',
            userText: cleanContent,
            requestId,
          };

          const responsePayload = await DiscordCommands.handleInteraction(fakeInteraction, this.pipeline);
          await message.reply(responsePayload.content);
        } catch (err) {
          console.error(`❌ DiscordService mention handler error: ${err.message}`);
          try {
            await message.reply('⚠️ An error occurred while verifying your claim. Please try again.');
          } catch (e) {}
        }
      }
    });

    // Handle Slash Commands (/verify, /general, /health, /science, /climate, /disaster, /education, /help, /about)
    client.on('interactionCreate', async (interaction) => {
      if (!interaction || !interaction.isChatInputCommand()) return;

      const userId = interaction.user?.id || 'unknown_user';
      const requestId = `req_slash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const rateCheck = this.rateLimiter.check(userId);
      if (!rateCheck.allowed) {
        try {
          await interaction.reply({ content: '⚠️ Rate limit exceeded. Please wait a moment before sending more requests.', ephemeral: true });
        } catch (e) {}
        return;
      }

      try {
        await interaction.deferReply();
        const responsePayload = await DiscordCommands.handleInteraction({ ...interaction, requestId }, this.pipeline);
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
   * Enforces concurrency limiting and eliminates orphaned progress messages.
   * @param {object} message - Discord message object
   * @param {object} attachment - Discord attachment object
   * @param {object} [options] - Optional requestId and captionText
   */
  async handleAudioAttachment(message, attachment, options = {}) {
    const requestId = options.requestId || `req_audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const valResult = DiscordMedia.validateAttachment(attachment);
    if (!valResult.valid) {
      console.warn(`⚠️ [${requestId}] DiscordMedia validation warning: ${valResult.error}`);
      try {
        await message.reply(`⚠️ ${valResult.error}`);
      } catch (e) {}
      return;
    }

    let tempInputPath = null;
    let progressMsg = null;

    try {
      try {
        progressMsg = await message.reply('🎙️ **Voice note received.** VeriVoice is transcribing and verifying your audio, please wait... ⏳');
      } catch (e) {}

      const fileName = attachment.name || attachment.filename || 'voice.ogg';
      const ext = fileName.includes('.') ? fileName.split('.').pop() : 'ogg';
      tempInputPath = DiscordMedia.generateSafeTempPath(ext);

      await DiscordMedia.downloadAttachment(attachment.url, tempInputPath);

      // Execute within Concurrency Limiter semaphore (max 3 active tasks)
      const pipelineResult = await this.concurrencyLimiter.run(async () => {
        console.log(`⚡ [${requestId}] DiscordService: Delegating to StandalonePipeline (${tempInputPath})...`);
        return await this.pipeline.processAudio(tempInputPath, null, { requestId, ...options });
      });

      const lang = pipelineResult.language || 'ur';
      const isUrdu = lang === 'ur' || lang === 'ur-Roman';

      const verdictBadge = pipelineResult.verdict === 'TRUE' ? '🟢 TRUE' :
                          pipelineResult.verdict === 'FALSE' ? '🔴 FALSE' :
                          pipelineResult.verdict === 'MIXED' ? '🟡 MIXED' :
                          pipelineResult.verdict === 'RESEARCH_RESPONSE' ? '🔬 RESEARCH RESPONSE' :
                          '⚪ UNCERTAIN (Insufficient Evidence)';

      const headerTitle = isUrdu ? '🎙️ VERIVOICE وائس تصدیق' : '🎙️ VERIVOICE VOICE VERIFICATION';
      const transcriptLabel = isUrdu ? 'متن (Transcript)' : 'Transcript';
      const verdictLabel = isUrdu ? 'نتیجہ (Verdict)' : 'Verdict';
      const explanationLabel = isUrdu ? 'تفصیل (Explanation)' : 'Explanation';
      const audioLabel = isUrdu ? '🔊 صوتی جواب (Audio Response)' : '🔊 Spoken Audio Response';

      const captionAddon = options.captionText ? `\n**User Note**: "${options.captionText}"` : '';

      const replyText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `**${headerTitle}**\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `**${transcriptLabel}**: "${pipelineResult.transcript}"${captionAddon}\n` +
                        `**${verdictLabel}**: ${verdictBadge}\n` +
                        `**Processing Time**: \`${pipelineResult.timing?.totalSeconds || 0.0}s\`\n\n` +
                        `**${explanationLabel}**: ${pipelineResult.responseText}\n\n` +
                        `**${audioLabel}**:`;

      // Send result card + MP3 audio file
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

      // Safely delete initial progress message so no orphaned processing message remains
      if (progressMsg && typeof progressMsg.delete === 'function') {
        try {
          await progressMsg.delete();
        } catch (e) {}
      }

      console.log(`✅ [${requestId}] DiscordService: Successfully delivered voice response for message ${message.id}`);
    } catch (err) {
      console.error(`❌ [${requestId}] DiscordService pipeline processing error: ${err.message}`);
      
      const errorReply = '⚠️ Unable to determine a conclusive verification verdict for this voice note. (UNCERTAIN)';
      if (progressMsg && typeof progressMsg.edit === 'function') {
        try {
          await progressMsg.edit(errorReply);
        } catch (e) {
          try { await message.reply(errorReply); } catch (e2) {}
        }
      } else {
        try { await message.reply(errorReply); } catch (e) {}
      }
    } finally {
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
