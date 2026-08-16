const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');

/**
 * Discord Client Wrapper and OAuth2 Gateway Manager.
 * Encapsulates Discord Bot login, permissions, slash command registration, and gateway event handlers.
 * Enforces minimal privilege intents and global mention protection (allowedMentions).
 */
class DiscordClient {
  constructor(options = {}) {
    this.applicationId = options.applicationId || process.env.DISCORD_APPLICATION_ID || null;
    this.botToken = options.botToken || process.env.DISCORD_BOT_TOKEN || null;
    this.guildId = options.guildId || process.env.DISCORD_GUILD_ID || null;
    this.isMock = options.isMock || false;
    this.client = null;

    if (!this.isMock && this.botToken && !this.botToken.includes('your_') && this.botToken !== 'placeholder') {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent, // Required to read verified claims and audio attachments
          GatewayIntentBits.DirectMessages,
        ],
        partials: [Partials.Channel, Partials.Message],
        // Global Security Guardrail: Disallow all automatic @everyone, @here, and role pings
        allowedMentions: {
          parse: [],
          repliedUser: false,
        },
      });

      // Production Observability: Safe gateway lifecycle logs (never logs tokens)
      this.client.on('shardDisconnect', (event, id) => {
        console.warn(`⚠️ Discord Gateway connection lost (Shard ${id}). Automatic reconnect queued.`);
      });
      this.client.on('shardReconnecting', (id) => {
        console.log(`🔄 Discord Gateway reconnecting (Shard ${id})...`);
      });
      this.client.on('shardResume', (id, replayedEvents) => {
        console.log(`✅ Discord Gateway connection restored (Shard ${id}, replayed ${replayedEvents} events).`);
      });
      this.client.on('error', (err) => {
        console.warn(`⚠️ Discord Gateway event error: ${err.message}`);
      });
    }
  }

  /**
   * Generates official Discord Bot OAuth2 Invite Link with minimal required permissions (101376).
   * Permissions: View Channels, Send Messages, Read Message History, Attach Files.
   * @param {string} applicationId 
   * @param {number} [permissions=101376] 
   * @returns {string} Clickable OAuth2 invite link
   */
  static getInviteUrl(applicationId, permissions = 101376) {
    const id = applicationId || process.env.DISCORD_APPLICATION_ID || 'APPLICATION_ID';
    return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=${permissions}&scope=bot%20applications.commands`;
  }

  /**
   * Registers Slash Commands with Discord REST API Gateway.
   * @param {Array<object>} commandsList - List of command JSON schemas
   * @returns {Promise<object>} Registration status
   */
  async registerSlashCommands(commandsList) {
    if (this.isMock || !this.applicationId || !this.botToken) {
      console.log('ℹ️ DiscordClient: Skipping slash command registration (Mock/Missing Credentials).');
      return { registered: false, reason: 'MOCK_OR_MISSING_CREDENTIALS' };
    }

    try {
      const rest = new REST({ version: '10' }).setToken(this.botToken);
      let route = Routes.applicationCommands(this.applicationId);

      if (this.guildId) {
        route = Routes.applicationGuildCommands(this.applicationId, this.guildId);
      }

      await rest.put(route, { body: commandsList });
      console.log(`✅ DiscordClient: Successfully registered ${commandsList.length} slash commands.`);
      return { registered: true, count: commandsList.length };
    } catch (err) {
      console.warn(`⚠️ DiscordClient: Slash command registration failed: ${err.message}`);
      return { registered: false, error: err.message };
    }
  }

  /**
   * Connects bot client to Discord Gateway.
   * @returns {Promise<boolean>} Success status
   */
  async start() {
    if (this.isMock || !this.client || !this.botToken) {
      console.log('ℹ️ DiscordClient: Operating in mock/offline mode.');
      return false;
    }

    try {
      await this.client.login(this.botToken);
      console.log(`🤖 DiscordClient: Logged in as ${this.client.user.tag}`);
      return true;
    } catch (err) {
      console.error(`❌ DiscordClient connection error: ${err.message}`);
      return false;
    }
  }

  /**
   * Safely stops the Discord bot connection.
   */
  async stop() {
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (e) {
        // Ignore destroy error
      }
    }
  }
}

module.exports = DiscordClient;
