const app = require('./app');
const { env } = require('./config/env');
const DiscordService = require('./services/discord/DiscordService');

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 VeriVoice backend server listening on port ${env.PORT} [${env.NODE_ENV}]`);

  // Start Discord Bot Adapter Service
  try {
    const discordService = new DiscordService();
    await discordService.start();
  } catch (err) {
    console.warn(`⚠️ Discord Bot initialization warning: ${err.message}`);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

module.exports = server;
