const request = require('supertest');
const app = require('../backend/src/app');
const WhatsAppClient = require('../backend/src/services/whatsapp/WhatsAppClient');
const WhatsAppMedia = require('../backend/src/services/whatsapp/WhatsAppMedia');
const WhatsAppIdempotency = require('../backend/src/services/whatsapp/WhatsAppIdempotency');
const WhatsAppService = require('../backend/src/services/whatsapp/WhatsAppService');

describe('Milestone 4 — WhatsApp Integration Layer', () => {
  describe('Webhook GET Verification (Meta Challenge)', () => {
    it('should return 200 and challenge string when verify token matches', async () => {
      const res = await request(app)
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'verivoice_webhook_verify_token',
          'hub.challenge': 'CHALLENGE_CODE_98765',
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('CHALLENGE_CODE_98765');
    });

    it('should work on alias route /webhook', async () => {
      const res = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'verivoice_webhook_verify_token',
          'hub.challenge': 'ALIAS_CHALLENGE_123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('ALIAS_CHALLENGE_123');
    });

    it('should return 403 Forbidden when verify token is incorrect', async () => {
      const res = await request(app)
        .get('/webhook/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'WRONG_TOKEN',
          'hub.challenge': 'CHALLENGE_CODE_98765',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('should return 400 Bad Request when verification parameters are missing', async () => {
      const res = await request(app).get('/webhook/whatsapp');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Webhook POST Events & Payload Parsing', () => {
    it('should respond HTTP 200 EVENT_RECEIVED quickly for valid incoming webhook', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_ENTRY_ID',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '12345', phone_number_id: '67890' },
                  messages: [
                    {
                      from: '923001234567',
                      id: 'wamid.HBgLMTIzNDU2Nzg5MA==',
                      timestamp: '1700000000',
                      type: 'audio',
                      audio: { id: 'media_id_audio_123', mime_type: 'audio/ogg; codecs=opus' },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const res = await request(app).post('/webhook/whatsapp').send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('EVENT_RECEIVED');
    });

    it('should handle malformed / empty POST payloads gracefully without crashing', async () => {
      const res1 = await request(app).post('/webhook/whatsapp').send({});
      const res2 = await request(app).post('/webhook/whatsapp').send({ entry: [] });

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
    });
  });

  describe('Idempotency & Deduplication', () => {
    it('should detect duplicate message IDs and ignore re-deliveries', () => {
      const idempotency = new WhatsAppIdempotency();
      const messageId = 'wamid.TEST_IDEMPOTENT_001';

      expect(idempotency.isDuplicate(messageId)).toBe(false); // First time seen
      expect(idempotency.isDuplicate(messageId)).toBe(true);  // Duplicate!
    });
  });

  describe('Media Security Controls', () => {
    it('should reject media exceeding 16MB file size limit', () => {
      const oversized = { file_size: 20 * 1024 * 1024, mime_type: 'audio/ogg' };
      const val = WhatsAppMedia.validateMetadata(oversized);

      expect(val.valid).toBe(false);
      expect(val.error).toContain('exceeds 16MB');
    });

    it('should reject unsupported MIME types (e.g. application/pdf)', () => {
      const pdf = { file_size: 1024, mime_type: 'application/pdf' };
      const val = WhatsAppMedia.validateMetadata(pdf);

      expect(val.valid).toBe(false);
      expect(val.error).toContain('Unsupported audio MIME type');
    });

    it('should generate safe temp paths inside designated tmp folder', () => {
      const tempPath = WhatsAppMedia.generateSafeTempPath('.ogg');
      expect(tempPath).toContain('tmp');
      expect(tempPath.endsWith('.ogg')).toBe(true);
    });
  });

  describe('Core Boundary & Orchestration Delegation Test', () => {
    it('should delegate audio processing directly to StandalonePipeline without duplicate verification logic', async () => {
      let pipelineProcessedPath = null;

      const mockPipeline = {
        process: async (inputPath) => {
          pipelineProcessedPath = inputPath;
          return {
            audioPath: inputPath,
            transcript: 'ٹیسٹ',
            verdictResult: { verdict: 'TRUE' },
          };
        },
      };

      const mockClient = {
        sendTextMessage: jest.fn().mockResolvedValue({}),
        getMediaUrl: jest.fn().mockResolvedValue({ url: 'https://example.org/audio.ogg', mime_type: 'audio/ogg' }),
        downloadMedia: jest.fn().mockImplementation(async (url, targetPath) => {
          require('fs').writeFileSync(targetPath, Buffer.from('OggS_MOCK_AUDIO_HEADER'));
          return targetPath;
        }),
        uploadMedia: jest.fn().mockResolvedValue('uploaded_media_id_999'),
        sendAudioMessage: jest.fn().mockResolvedValue({}),
      };

      const service = new WhatsAppService({
        client: mockClient,
        pipeline: mockPipeline,
      });

      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: '923001234567',
                      id: 'wamid.DELEGATION_TEST_001',
                      type: 'audio',
                      audio: { id: 'media_id_123', mime_type: 'audio/ogg' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await service.handleIncomingPayload(payload);

      // Verify progress message sent
      expect(mockClient.sendTextMessage).toHaveBeenCalledWith(
        '923001234567',
        expect.stringContaining('تصدیق جاری ہے')
      );

      // Verify pipeline was called
      expect(pipelineProcessedPath).not.toBeNull();

      // Verify audio response sent
      expect(mockClient.sendAudioMessage).toHaveBeenCalledWith('923001234567', 'uploaded_media_id_999');
    });

    it('should send safe Urdu guidance text for non-audio messages (text / image)', async () => {
      const mockClient = {
        sendTextMessage: jest.fn().mockResolvedValue({}),
      };

      const service = new WhatsAppService({ client: mockClient });

      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: '923001234567',
                      id: 'wamid.TEXT_MSG_001',
                      type: 'text',
                      text: { body: 'Hello' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await service.handleIncomingPayload(payload);

      expect(mockClient.sendTextMessage).toHaveBeenCalledWith(
        '923001234567',
        expect.stringContaining('وائس نوٹ کی صورت میں بھیجیں')
      );
    });

    it('should catch failures safely and send Urdu fallback message to user', async () => {
      const mockClient = {
        sendTextMessage: jest.fn().mockResolvedValue({}),
        getMediaUrl: jest.fn().mockRejectedValue(new Error('Meta API 500 Server Error')),
      };

      const service = new WhatsAppService({ client: mockClient });

      const payload = {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: '923001234567',
                      id: 'wamid.FAILURE_TEST_001',
                      type: 'audio',
                      audio: { id: 'media_id_fail', mime_type: 'audio/ogg' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      await service.handleIncomingPayload(payload);

      expect(mockClient.sendTextMessage).toHaveBeenCalledWith(
        '923001234567',
        expect.stringContaining('حتمی فیصلہ ممکن نہیں ہے')
      );
    });
  });
});
