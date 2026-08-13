# VeriVoice — Render 24/7 Live Deployment Guide

This guide details how to deploy **VeriVoice** to [Render](https://render.com) as a 24/7 persistent Web Service so that your Discord bot remains active even when your local computer is turned off.

---

## 📌 STEP 1: Push Repository to GitHub

> **[USER ACTION REQUIRED]**

If your local codebase is not yet on GitHub:

1. Open your terminal in the project directory:
   ```bash
   git init
   git add .
   git commit -m "VeriVoice Render Deployment Setup"
   ```
2. Create a new **Private** repository on [GitHub](https://github.com/new) named `Veri-Voice-Unesco-Hackathon`.
3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Veri-Voice-Unesco-Hackathon.git
   git branch -M main
   git push -u origin main
   ```

---

## 📌 STEP 2: Create a Free Web Service on Render

> **[USER ACTION REQUIRED]**

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in (or sign up with GitHub).
2. Click **New +** top right ➔ Select **Web Service**.
3. Connect your GitHub account and select your repository `Veri-Voice-Unesco-Hackathon`.
4. Configure the service settings:
   - **Name**: `verivoice`
   - **Region**: Choose closest to you (e.g. Frankfurt / Oregon / Singapore)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or Starter)

---

## 📌 STEP 3: Add Environment Variables in Render

> **[USER ACTION REQUIRED]**

Scroll down to **Environment Variables** on Render and add the following keys:

| Environment Variable | Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `DISCORD_APPLICATION_ID` | `1537205576809840702` |
| `DISCORD_BOT_TOKEN` | *[Your Discord Bot Token]* |
| `GROQ_API_KEY` | *[Your Primary Groq API Key]* |
| `GROQ_API_KEY_1` | *[Your 2nd Groq API Key]* |
| `GROQ_API_KEY_2` | *[Your 3rd Groq API Key]* |
| `SPEECHMATICS_API_KEY` | *[Your Speechmatics API Key]* |
| `SPEECH_PROVIDER` | `speechmatics` |
| `TTS_PROVIDER` | `edge-tts` |
| `LLM_PROVIDER` | `groq` |

---

## 📌 STEP 4: Configure Health Check

> **[USER ACTION REQUIRED]**

Under **Advanced Settings** on Render:
- **Health Check Path**: `/health`

Click **Create Web Service**.

---

## 📌 STEP 5: Verify Deployment Status

Render will now build your application and start the process.

In the Render deployment logs, verify that you see:
```text
🚀 VeriVoice backend server listening on port 10000 [production]
🤖 DiscordClient: Logged in as VeriVoice#8580
🤖 DiscordService: Bot online as VeriVoice#8580
✅ DiscordClient: Successfully registered 9 slash commands.
```

Your Render URL will be: `https://verivoice.onrender.com/health`

---

## 📌 STEP 6: Test Discord Bot Live

Test the bot directly in your Discord server:
- Type `/verify claim: Is Earth flat?`
- Type `/general question: Who discovered penicillin?`
- Upload a voice note (`.ogg` / `.wav` / `.mp3`)
