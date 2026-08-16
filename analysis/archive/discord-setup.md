# VeriVoice — Official Discord Bot Developer Setup & Installation Guide

This document provides step-by-step instructions for creating a free Discord application, configuring the bot token, generating the OAuth2 installation link, and connecting it to VeriVoice.

---

## 1. Step-by-Step Discord Developer Portal Setup

### Step 1: Access Discord Developer Portal
1. Open [Discord Developer Portal](https://discord.com/developers/applications).
2. Sign in with your Discord account.

### Step 2: Create New Application
1. Click **New Application** at top right.
2. Enter Name: `VeriVoice` (or `VeriVoice-Bot`).
3. Agree to Developer Terms and click **Create**.
4. Under **General Information**, copy your **Application ID** (Client ID).

### Step 3: Create Bot
1. In the left sidebar, click **Bot**.
2. Under **Build-A-Bot**, click **Reset Token** (or **Add Bot**).
3. Copy your **Bot Token** immediately.
4. Scroll down to **Privileged Gateway Intents**:
   - Enable **MESSAGE CONTENT INTENT** (Required to detect voice note attachments and text messages).
5. Click **Save Changes**.

---

## 2. Environment Variables Configuration

Copy your credentials into your local `.env` file:

```env
DISCORD_BOT_TOKEN=your_copied_discord_bot_token_here
DISCORD_APPLICATION_ID=your_copied_application_id_here
DISCORD_GUILD_ID=
DISCORD_MAX_FILE_SIZE_MB=15
```

---

## 3. Bot Installation / Server Invite Link

To add the bot to your personal Discord test server, use the generated OAuth2 URL format:

```text
https://discord.com/api/oauth2/authorize?client_id=YOUR_DISCORD_APPLICATION_ID&permissions=101376&scope=bot%20applications.commands
```

### Required Bot Permissions:
- `View Channels` (1024)
- `Send Messages` (2048)
- `Attach Files` (32768)
- `Read Message History` (65536)
- **Total Permission Integer**: `101376`

---

## 4. Starting the Bot

Run:
```bash
npm start
```
The console will log:
```text
🤖 DiscordService: Bot online as VeriVoice#1234
✅ DiscordClient: Successfully registered 4 slash commands.
```

---

## 5. Security & Privacy Notice
> [!IMPORTANT]
> - Never expose your `DISCORD_BOT_TOKEN` in source code, GitHub, or public channels.
> - The bot only processes messages with audio attachments or `/verify` slash commands.
> - Temporary audio files downloaded from Discord attachments are stored inside `backend/tmp/` and immediately deleted in a `finally` block after processing.
