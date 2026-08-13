# VeriVoice — End-to-End Demo Runbook

This document provides step-by-step instructions for running a live demo of VeriVoice on Discord or via the interactive Web UI.

---

## 1. Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file populated with `GROQ_API_KEY`, `DISCORD_BOT_TOKEN`, and `DISCORD_APPLICATION_ID`
- [ ] Automated tests passing (`npm test`)

---

## 2. Step-by-Step Execution Guide

### Step 1: Run Setup Check
```bash
npm run setup:check
```
Verify that Node.js, dependencies, tests, and API readiness return PASS.

### Step 2: Start VeriVoice Server & Discord Bot
```bash
npm start
```
Console output will show:
```text
🚀 VeriVoice backend server listening on port 3000 [development]
🤖 DiscordService: Bot online as VeriVoice#1234
✅ DiscordClient: Successfully registered 4 slash commands.
```

### Step 3: Run Interactive Demo

#### Option A: Discord Interface Demo
1. Open Discord and navigate to your test server channel.
2. Type `/verify claim: کیا سوات میں سیلاب کی خبر سچی ہے؟`
3. Observe the structured response:
   - **Original Claim**
   - **Verdict**: `TRUE` / `FALSE` / `MIXED` / `UNCERTAIN`
   - **Confidence**: `85%`
   - **Explanation**: Grounded explanation
   - **Sources & Citations**: Clickable official sources (WHO/PAHO/NDMA/Google Search)
4. Upload an Urdu voice note attachment in the channel.
5. Listen to the generated spoken Urdu MP3 response!

#### Option B: Web UI Demo
1. Open your browser and go to `http://localhost:3000`.
2. Click the microphone icon to record your voice or type a claim.
3. View the text verdict card and press play on the Urdu audio response player!

---

## 3. What to Expect & Troubleshooting

| Scenario | Expected Outcome | Troubleshooting |
|---|---|---|
| **Authoritative Fact** (e.g. *"Earth orbits sun"*) | `TRUE` (85-95% confidence) with citations | Check `GROQ_API_KEY` in `.env` |
| **False Rumor** (e.g. *"Moon made of cheese"*) | `FALSE` with debunking explanation | Check retrieval matches |
| **Unknown/Unverified Claim** | `UNCERTAIN` (0% confidence) | Expected safety behavior when evidence is missing |
| **Discord Bot Offline** | Slash commands timeout | Verify `DISCORD_BOT_TOKEN` in `.env` |
