# VeriVoice — Discord Prototype User Action Checklist

This checklist summarizes the minimal manual steps required from you to run and test the live VeriVoice Discord bot.

---

## 📋 Minimal Action Checklist

- [ ] **Step 1: Sign in to Discord Developer Portal**
  - Go to [https://discord.com/developers/applications](https://discord.com/developers/applications).

- [ ] **Step 2: Create Application & Copy IDs**
  - Click **New Application** → Name it `VeriVoice`.
  - Copy the **Application ID**.

- [ ] **Step 3: Create Bot & Copy Token**
  - In left menu click **Bot** → Click **Reset Token** → Copy **Bot Token**.
  - Scroll down and toggle ON **MESSAGE CONTENT INTENT**.

- [ ] **Step 4: Add Credentials to `.env`**
  - Paste `DISCORD_BOT_TOKEN=...` and `DISCORD_APPLICATION_ID=...` into your `.env` file.

- [ ] **Step 5: Add Bot to Test Server**
  - Open the OAuth2 link: `https://discord.com/api/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=101376&scope=bot%20applications.commands`
  - Select your test server and click **Authorize**.

- [ ] **Step 6: Run System Doctor**
  - Run `npm run doctor` to verify configuration status.

- [ ] **Step 7: Start Bot & Test**
  - Run `npm start`.
  - Type `/verify زمین سورج کے گرد گردش کرتی ہے` in Discord.
  - Upload an Urdu voice note in Discord and listen to the spoken Urdu response!
