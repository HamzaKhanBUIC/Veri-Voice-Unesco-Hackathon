const app = require('./app');
const { env } = require('./config/env');
const DiscordService = require('./services/discord/DiscordService');

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 VeriVoice backend server listening on port ${env.PORT} [${env.NODE_ENV}]`);

  // Start Discord Bot Adapter Service (Dedicated to Render cloud host in production)
  if (process.env.ENABLE_DISCORD_BOT === 'true' || (process.env.NODE_ENV === 'production' && process.env.DISCORD_BOT_TOKEN)) {
    try {
      const discordService = new DiscordService();
      await discordService.start();
    } catch (err) {
      console.warn(`⚠️ Discord Bot initialization warning: ${err.message}`);
    }
  } else {
    console.log('🤖 Discord Bot is set to run in the cloud on Render (local gateway disabled to prevent session collision).');
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

module.exports = server;
