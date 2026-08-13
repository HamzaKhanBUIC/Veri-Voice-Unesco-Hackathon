# VeriVoice — Discord Bot Deployment & Free Cloud Hosting Options

This document outlines the deployment architecture and free hosting options for the VeriVoice Discord bot backend.

---

## 1. Runtime Deployment Requirements

Unlike serverless webhooks, a Discord bot maintains a persistent WebSocket connection (Discord Gateway) to receive events in real time.

### Deployment Prerequisites:
- Node.js runtime (v18+)
- Persistent background worker / daemon process
- Environment variables (`DISCORD_BOT_TOKEN`, `GROQ_API_KEY`, `SPEECHMATICS_API_KEY`)
- Local filesystem access (`backend/tmp/`) for temporary audio file downloads and TTS synthesis

---

## 2. Recommended Free Deployment Options

### Option A: Render (Free Web Service / Background Worker)
- **URL**: [https://dashboard.render.com/](https://dashboard.render.com/)
- **Cost**: $0.00 / month
- **Setup**: Connect GitHub repository, select `Background Worker` or `Web Service`, set build command `npm install` and start command `npm start`.
- **Environment**: Add `.env` variables directly in Render Dashboard settings.

### Option B: Railway (Free Trial / Developer Tier)
- **URL**: [https://railway.app/](https://railway.app/)
- **Cost**: Free trial credit
- **Setup**: Auto-detects `package.json` Node environment and runs `npm start`.

### Option C: Local Workstation (Instant Zero-Cost Prototype Testing)
- **Cost**: $0.00
- **Setup**: Simply run `npm start` on your local computer while testing on Discord!

---

## 3. Deployment Steps Summary

1. Create Discord Application & Bot in Discord Developer Portal.
2. Add `DISCORD_BOT_TOKEN` & `DISCORD_APPLICATION_ID` to `.env`.
3. Add bot to your Discord test server via the OAuth2 invite link.
4. Deploy code to Render or run `npm start` locally.
5. Upload an Urdu voice note or test `/verify` in your Discord server!
