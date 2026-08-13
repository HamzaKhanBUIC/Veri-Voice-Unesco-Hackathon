const request = require('supertest');
const app = require('../backend/src/app');
const { envSchema } = require('../backend/src/config/env');

describe('Milestone 0 — System Health & Environment Baseline', () => {
  it('GET /health should return 200 OK with valid status payload', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'verivoice-backend');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });

  it('GET /non-existent-route should return 404 Not Found JSON error', async () => {
    const response = await request(app).get('/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  it('envSchema should parse valid environment variable defaults', () => {
    const parsed = envSchema.safeParse({
      PORT: '3000',
      NODE_ENV: 'test',
      LOG_LEVEL: 'info',
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.PORT).toBe(3000);
      expect(parsed.data.NODE_ENV).toBe('test');
    }
  });
});
