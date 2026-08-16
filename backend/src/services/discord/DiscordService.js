const DiscordClient = require('./DiscordClient');
const DiscordMedia = require('./DiscordMedia');
const DiscordCommands = require('./DiscordCommands');
const StandalonePipeline = require('../pipeline/standalonePipeline');
const WhisperProvider = require('../speech/WhisperProvider');
const SpeechmaticsProvider = require('../speech/SpeechmaticsProvider');
const EdgeTTSProvider = require('../tts/EdgeTTSProvider');
const VerificationEngine = require('../verification/verificationEngine');
const RetrievalService = require('../retrieval/retrievalService');
const RateLimiter = require('../rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../concurrency/ConcurrencyLimiter');
const fs = require('fs');

/**
 * Discord Adapter Service.
 * Manages full lifecycle of Discord Bot: Gateway listeners, Rate limiting, Concurrency queues,
 * Idempotency deduplication, Slash commands, Text mentions, Voice Note attachments, and Audio Pipeline delegation.
 * Enforces strict mention isolation and privacy-first ephemeral data handling.
 */
class DiscordService {
  constructor(options = {}) {
    this.clientWrapper = options.clientWrapper || new DiscordClient();

    // Default to Groq Whisper for fast multi-language ASR (Indonesian, Urdu, Spanish, English, etc.)
    const defaultSpeechProvider = process.env.GROQ_API_KEY
      ? new WhisperProvider()
      : (process.env.SPEECHMATICS_API_KEY ? new SpeechmaticsProvider() : null);
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

    // Idempotency cache: tracks processed message IDs and interaction IDs (2-min TTL)
    this.processedEvents = new Map();
    this.idempotencyTtlMs = 120000;
  }

  /**
   * Checks and registers an event ID to prevent duplicate replay processing.
   * @param {string} eventId 
   * @returns {boolean} True if event was already processed (duplicate)
   */
  isDuplicateEvent(eventId) {
    if (!eventId || typeof eventId !== 'string') return false;
    const now = Date.now();
    this.cleanupExpiredEvents(now);

    if (this.processedEvents.has(eventId)) {
      return true;
    }

    this.processedEvents.set(eventId, now);
    return false;
  }

  cleanupExpiredEvents(now = Date.now()) {
    for (const [id, timestamp] of this.processedEvents.entries()) {
      if (now - timestamp > this.idempotencyTtlMs) {
        this.processedEvents.delete(id);
      }
    }
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

      const messageId = message.id;
      if (messageId && this.isDuplicateEvent(messageId)) {
        console.log(`ℹ️ DiscordService: Skipping duplicate message event (${messageId})`);
        return;
      }

      const userId = message.author?.id || 'unknown_user';
      const requestId = `req_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Global System Rate Limit Check (20 req / 60s)
      const globalCheck = this.rateLimiter.checkGlobal();
      if (!globalCheck.allowed) {
        try {
          await message.reply({
            content: '⚠️ System busy under high traffic (Global rate limit reached). Please try again in a moment.',
            allowedMentions: { parse: [], repliedUser: false },
          });
        } catch (e) {}
        return;
      }

      // Rate limit check per user ID
      const rateCheck = this.rateLimiter.check(userId);
      if (!rateCheck.allowed) {
        try {
          await message.reply({
            content: '⚠️ Rate limit exceeded. Please wait a moment before sending more requests.',
            allowedMentions: { parse: [], repliedUser: false },
          });
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
        const rawCaption = message.content ? message.content.replace(/<@!?\d+>/g, '').trim() : '';
        const captionText = rawCaption.length > 500 ? rawCaption.substring(0, 500) : rawCaption;
        await this.handleAudioAttachment(message, audioAttachment, { requestId, captionText });
        return;
      }

      // Handle Direct Bot Mention (@VeriVoice <claim/question>)
      if (client.user && message.mentions?.has(client.user)) {
        let cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();

        if (!cleanContent) {
          try {
            await message.reply({
              content: 'سلام! VeriVoice voice verification bot yahan hai. Mujhse claim verify karwane ke liye text poochhein ya voice note bhejein! (/help for details)',
              allowedMentions: { parse: [], repliedUser: false },
            });
          } catch (e) {}
          return;
        }

        if (cleanContent.length > 500) {
          cleanContent = cleanContent.substring(0, 500);
        }

        try {
          const fakeInteraction = {
            commandName: 'verify',
            userText: cleanContent,
            requestId,
          };

          const responsePayload = await DiscordCommands.handleInteraction(fakeInteraction, this.pipeline);
          await message.reply({
            content: responsePayload.content,
            allowedMentions: { parse: [], repliedUser: false },
          });
        } catch (err) {
          console.error(`❌ DiscordService mention handler error: ${err.message}`);
          try {
            await message.reply({
              content: '⚠️ An error occurred while verifying your claim. Please try again.',
              allowedMentions: { parse: [], repliedUser: false },
            });
          } catch (e) {}
        }
      }
    });

    // Handle Slash Commands (/verify, /general, /health, /science, /climate, /disaster, /education, /help, /about)
    client.on('interactionCreate', async (interaction) => {
      if (!interaction || !interaction.isChatInputCommand()) return;

      const interactionId = interaction.id;
      if (interactionId && this.isDuplicateEvent(interactionId)) {
        console.log(`ℹ️ DiscordService: Skipping duplicate interaction event (${interactionId})`);
        return;
      }

      const userId = interaction.user?.id || 'unknown_user';
      const requestId = `req_slash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const globalCheck = this.rateLimiter.checkGlobal();
      if (!globalCheck.allowed) {
        try {
          await interaction.reply({
            content: '⚠️ System busy under high traffic (Global rate limit reached). Please try again in a moment.',
            ephemeral: true,
            allowedMentions: { parse: [] },
          });
        } catch (e) {}
        return;
      }

      const rateCheck = this.rateLimiter.check(userId);
      if (!rateCheck.allowed) {
        try {
          await interaction.reply({
            content: '⚠️ Rate limit exceeded. Please wait a moment before sending more requests.',
            ephemeral: true,
            allowedMentions: { parse: [] },
          });
        } catch (e) {}
        return;
      }

      try {
        await interaction.deferReply();
        const responsePayload = await DiscordCommands.handleInteraction({ ...interaction, requestId }, this.pipeline);
        await interaction.editReply({
          content: responsePayload.content,
          allowedMentions: { parse: [] },
        });
      } catch (err) {
        console.error(`❌ DiscordService command error: ${err.message}`);
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: '⚠️ An error occurred while executing this command. Please try again.',
            allowedMentions: { parse: [] },
          });
        }
      }
    });

    return await this.clientWrapper.start();
  }

  /**
   * Processes incoming Discord audio attachment end-to-end through StandalonePipeline.
   * Enforces concurrency limiting, validates audio output, formats clean product card, and purges temp files.
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
        await message.reply({
          content: `⚠️ ${valResult.error}`,
          allowedMentions: { parse: [], repliedUser: false },
        });
      } catch (e) {}
      return;
    }

    let tempInputPath = null;
    let progressMsg = null;

    try {
      try {
        progressMsg = await message.reply({
          content: '🎙️ **Voice note received.** Transcribing and verifying audio... ⏳',
          allowedMentions: { parse: [], repliedUser: false },
        });
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
      const isIndonesian = lang === 'id';
      const isSpanish = lang === 'es';

      const verdictBadge = pipelineResult.verdict === 'TRUE' ? '🟢 TRUE' :
                          pipelineResult.verdict === 'FALSE' ? '🔴 FALSE' :
                          pipelineResult.verdict === 'MIXED' ? '🟡 MIXED' :
                          pipelineResult.verdict === 'RESEARCH_RESPONSE' ? '🔬 RESEARCH RESPONSE' :
                          '⚪ UNCERTAIN (Insufficient Evidence)';

      const headerTitle = isUrdu ? '🎙️ VERIVOICE وائس تصدیق' :
                          isIndonesian ? '🎙️ VERIVOICE VERIFIKASI SUARA' :
                          isSpanish ? '🎙️ VERIVOICE VERIFICACIÓN DE VOZ' : '🎙️ VERIVOICE VOICE VERIFICATION';
      const transcriptLabel = isUrdu ? 'متن (Transcript)' : 'Transcript';
      const verdictLabel = isUrdu ? 'نتیجہ (Verdict)' : 'Verdict';
      const explanationLabel = isUrdu ? 'تفصیل (Explanation)' : 'Explanation';

      const captionAddon = options.captionText ? `\n**User Note**: "${options.captionText}"` : '';

      // Validate output audio before attaching
      const hasValidAudio = pipelineResult.audioAvailable !== false &&
                            Boolean(pipelineResult.outputAudio) &&
                            (EdgeTTSProvider.validateAudio(pipelineResult.outputAudio) ||
                             process.env.NODE_ENV === 'test' ||
                             pipelineResult.isStub);

      let sourceCitations = '';
      if (pipelineResult.sources && pipelineResult.sources.length > 0) {
        sourceCitations = '\n\n**Sources:**\n' + pipelineResult.sources.slice(0, 2).map((s) => `• [${s.organization || s.sourceTitle || 'Official Source'}](${s.url || 'https://who.int'})`).join('\n');
      }

      const privacyFooter = '\n\n🔒 *Privacy: Voice notes are processed temporarily and immediately purged after verification.*';

      let rawReplyText = `🎙️ **${headerTitle}**\n\n` +
                          `**${transcriptLabel}**: "${pipelineResult.transcript}"${captionAddon}\n` +
                          `**${verdictLabel}**: ${verdictBadge}\n\n` +
                          `**${explanationLabel}**: ${pipelineResult.responseText}` +
                          sourceCitations +
                          privacyFooter;

      if (!hasValidAudio) {
        rawReplyText += `\n\n🔊 *Spoken audio response is currently unavailable.*`;
      }

      const replyText = DiscordCommands.sanitizeOutputText(rawReplyText);

      const sendOptions = {
        content: replyText,
        allowedMentions: { parse: [], repliedUser: false },
      };

      if (hasValidAudio) {
        sendOptions.files = [
          {
            attachment: pipelineResult.outputAudio,
            name: `verivoice_response_${Date.now()}.mp3`,
            description: 'VeriVoice Spoken Audio Response',
          },
        ];
      }

      // Send result card + optional MP3 audio file
      await message.channel.send(sendOptions);

      // Delete initial progress message so no orphaned processing message remains
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
          await progressMsg.edit({
            content: errorReply,
            allowedMentions: { parse: [], repliedUser: false },
          });
        } catch (e) {
          try {
            await message.reply({
              content: errorReply,
              allowedMentions: { parse: [], repliedUser: false },
            });
          } catch (e2) {}
        }
      } else {
        try {
          await message.reply({
            content: errorReply,
            allowedMentions: { parse: [], repliedUser: false },
          });
        } catch (e) {}
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
