const WhatsAppClient = require('./WhatsAppClient');
const WhatsAppMedia = require('./WhatsAppMedia');
const WhatsAppIdempotency = require('./WhatsAppIdempotency');
const StandalonePipeline = require('../pipeline/standalonePipeline');
const SpeechmaticsProvider = require('../speech/SpeechmaticsProvider');
const WhisperProvider = require('../speech/WhisperProvider');
const MockSpeechProvider = require('../speech/MockSpeechProvider');
const EdgeTTSProvider = require('../tts/EdgeTTSProvider');
const MockTTSProvider = require('../tts/MockTTSProvider');
const VerificationEngine = require('../verification/verificationEngine');
const GroqVerificationProvider = require('../verification/GroqVerificationProvider');
const MockVerificationProvider = require('../verification/MockVerificationProvider');

/**
 * WhatsApp Business Integration Service.
 * Serves as an interface wrapper around the standalone core verification pipeline.
 * Contains ZERO verification/LLM/STT logic internally.
 */
class WhatsAppService {
  constructor(options = {}) {
    this.client = options.client || new WhatsAppClient();
    this.idempotency = options.idempotency || new WhatsAppIdempotency();
    
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

    const defaultVerificationEngine = new VerificationEngine({ provider: defaultLlmProvider });

    // Select TTS provider
    const defaultTtsProvider = process.env.TTS_PROVIDER === 'mock' ? new MockTTSProvider() : new EdgeTTSProvider();

    // Core Standalone Pipeline instance
    this.pipeline = options.pipeline || new StandalonePipeline({
      speechProvider: options.speechProvider || defaultSpeechProvider,
      verificationEngine: options.verificationEngine || defaultVerificationEngine,
      ttsProvider: options.ttsProvider || defaultTtsProvider,
    });
  }

  /**
   * Safe parser for incoming Meta WhatsApp webhook payload.
   * @param {object} body 
   * @returns {object|null} Extracted message metadata object or null if not a message
   */
  parseWebhookPayload(body) {
    try {
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value || !value.messages || value.messages.length === 0) {
        return null; // Not a user message event (could be status update, read receipt, etc.)
      }

      const msg = value.messages[0];
      const senderPhone = msg.from;
      const messageId = msg.id;
      const msgType = msg.type;

      let mediaId = null;
      let mimeType = null;

      if (msgType === 'audio' || msgType === 'voice') {
        mediaId = msg.audio?.id || msg.voice?.id;
        mimeType = msg.audio?.mime_type || msg.voice?.mime_type;
      }

      return {
        senderPhone,
        messageId,
        msgType,
        mediaId,
        mimeType,
        timestamp: msg.timestamp,
      };
    } catch (err) {
      console.warn(`⚠️ WhatsAppService: Failed to parse webhook payload: ${err.message}`);
      return null;
    }
  }

  /**
   * Main entry point for handling incoming webhook events.
   * Runs asynchronously after controller acknowledges Meta HTTP POST 200.
   * @param {object} body 
   */
  async handleIncomingPayload(body) {
    const meta = this.parseWebhookPayload(body);
    if (!meta) {
      return; // Safe ignore for status updates or malformed events
    }

    const { senderPhone, messageId, msgType, mediaId } = meta;

    // Idempotency check: Ignore duplicate deliveries
    if (this.idempotency.isDuplicate(messageId)) {
      console.log(`ℹ️ WhatsAppService: Ignoring duplicate message ID '${messageId}'`);
      return;
    }

    console.log(`📩 WhatsAppService: Processing message '${messageId}' from ${senderPhone} (Type: ${msgType})`);

    // Non-Audio Message handling: Send polite guidance message
    if (msgType !== 'audio' && msgType !== 'voice') {
      try {
        await this.client.sendTextMessage(
          senderPhone,
          'سلام! ویری وائس (VeriVoice) میں خوش آمدید۔ براہِ کرم اپنا دعویٰ یا افواہ وائس نوٹ کی صورت میں بھیجیں۔'
        );
      } catch (err) {
        console.warn(`⚠️ WhatsAppService: Failed to send non-audio guidance text: ${err.message}`);
      }
      return;
    }

    // Audio Message handling
    let tempInputPath = null;
    try {
      // 1. Send immediate progress acknowledgment
      await this.client.sendTextMessage(
        senderPhone,
        'آپ کا وائس نوٹ موصول ہوگیا ہے۔ تصدیق جاری ہے، براہِ کرم انتظار فرمائیں۔'
      );

      // 2. Fetch media download URL from Meta
      const mediaMeta = await this.client.getMediaUrl(mediaId);

      // 3. Validate media security rules
      const valResult = WhatsAppMedia.validateMetadata(mediaMeta);
      if (!valResult.valid) {
        console.warn(`⚠️ WhatsAppMedia validation error: ${valResult.error}`);
        await this.client.sendTextMessage(
          senderPhone,
          'معذرت، موصول شدہ آڈیو فائل کا سائز یا فارمیٹ تصدیق کے لیے درست نہیں ہے۔'
        );
        return;
      }

      // 4. Download audio securely to safe temp file
      tempInputPath = WhatsAppMedia.generateSafeTempPath('.ogg');
      await this.client.downloadMedia(mediaMeta.url, tempInputPath);

      // 5. Delegate to existing standalone pipeline
      console.log(`⚡ WhatsAppService: Delegating to StandalonePipeline (${tempInputPath})...`);
      const pipelineResult = await this.pipeline.process(tempInputPath);

      // 6. Upload output spoken Urdu MP3 to Meta Media API
      const outputAudioPath = pipelineResult.audioPath;
      const uploadedMediaId = await this.client.uploadMedia(outputAudioPath, 'audio/mpeg');

      // 7. Send audio response to user's WhatsApp number
      await this.client.sendAudioMessage(senderPhone, uploadedMediaId);
      console.log(`✅ WhatsAppService: Successfully sent verification voice response to ${senderPhone}`);
    } catch (err) {
      console.error(`❌ WhatsAppService processing failure: ${err.message}`);
      // Safe Urdu fallback response
      try {
        await this.client.sendTextMessage(
          senderPhone,
          'اس دعوے کے بارے میں فی الحال حتمی فیصلہ ممکن نہیں ہے۔'
        );
      } catch (sendErr) {
        console.error(`❌ Failed to send fallback message: ${sendErr.message}`);
      }
    } finally {
      // Cleanup temp input audio file
      WhatsAppMedia.safeCleanup(tempInputPath);
    }
  }
}

module.exports = WhatsAppService;
