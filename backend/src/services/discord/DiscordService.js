const DiscordClient = require('./DiscordClient');
const DiscordMedia = require('./DiscordMedia');
const DiscordCommands = require('./DiscordCommands');
const StandalonePipeline = require('../pipeline/standalonePipeline');
const SpeechmaticsProvider = require('../speech/SpeechmaticsProvider');
const WhisperProvider = require('../speech/WhisperProvider');
const MockSpeechProvider = require('../speech/MockSpeechProvider');
const EdgeTTSProvider = require('../tts/EdgeTTSProvider');
const MockTTSProvider = require('../tts/MockTTSProvider');
const VerificationEngine = require('../verification/verificationEngine');
const GroqVerificationProvider = require('../verification/GroqVerificationProvider');
const MockVerificationProvider = require('../verification/MockVerificationProvider');
const RetrievalService = require('../retrieval/retrievalService');

/**
 * Discord Interface Adapter Service.
 * Serves as an isolated interface wrapper around the standalone core verification pipeline.
 * Contains ZERO verification/LLM/STT logic internally.
 */
class DiscordService {
  constructor(options = {}) {
    this.clientWrapper = options.clientWrapper || new DiscordClient(options);
    
    // Select speech provider based on env configuration
    let defaultSpeechProvider;
    if (process.env.SPEECH_PROVIDER === 'speechmatics' && process.env.SPEECHMATICS_API_KEY) {
      defaultSpeechProvider = new SpeechmaticsProvider();
    } else if (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY) {
      defaultSpeechProvider = new WhisperProvider();
    } else {
      defaultSpeechProvider = new MockSpeechProvider();
    }

    // Select LLM verification provider based on env configuration
    let defaultLlmProvider;
    if (process.env.GROQ_API_KEY) {
      defaultLlmProvider = new GroqVerificationProvider();
    } else {
      defaultLlmProvider = new MockVerificationProvider();
    }

    const defaultRetrieval = options.retrievalService || new RetrievalService();
    const defaultVerificationEngine = new VerificationEngine({ provider: defaultLlmProvider });

    // Select TTS provider
    const defaultTtsProvider = process.env.TTS_PROVIDER === 'mock' ? new MockTTSProvider() : new EdgeTTSProvider();

    // Core Standalone Pipeline instance
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

    // Handle Incoming Messages (Voice note attachments & Onboarding)
    client.on('messageCreate', async (message) => {
      // Ignore bot's own messages
      if (message.author.bot) return;

      // Handle audio attachments
      if (message.attachments.size > 0) {
        for (const [, attachment] of message.attachments) {
          await this.handleAudioAttachment(message, attachment);
        }
      } else if (message.content && (message.content.startsWith('!verify') || message.content.startsWith('!help'))) {
        // Send onboarding help
        const helpPayload = await DiscordCommands.handleInteraction({ commandName: 'help' }, this.pipeline);
        await message.reply(helpPayload.content);
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
          await interaction.editReply('⚠️ اس کمانڈ کی تعمیل کے دوران خرابی پیش آئی۔');
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
      // 1. Send progress acknowledgment
      try {
        progressMsg = await message.reply('آپ کا وائس نوٹ موصول ہوگیا ہے۔\nتصدیق جاری ہے، براہِ کرم انتظار فرمائیں۔ ⏳');
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

      // 5. Build structured response message
      const verdictBadge = pipelineResult.verdict === 'TRUE' ? '🟢 TRUE' :
                          pipelineResult.verdict === 'FALSE' ? '🔴 FALSE' :
                          pipelineResult.verdict === 'MIXED' ? '🟡 MIXED' : '⚪ UNCERTAIN (Insufficient Evidence)';

      const replyText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `🎙️ **VERIVOICE VOICE VERIFICATION**\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `**Transcript**: "${pipelineResult.transcript}"\n` +
                        `**Verdict**: ${verdictBadge}\n` +
                        `**Processing Time**: \`${pipelineResult.timing?.totalSeconds || 0.0}s\`\n\n` +
                        `**Explanation**: ${pipelineResult.responseText}\n\n` +
                        `🔊 **Spoken Audio Response**:`;

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
        await message.reply('اس دعوے کے بارے میں فی الحال حتمی فیصلہ ممکن نہیں ہے۔ (UNCERTAIN) ⚠️');
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
