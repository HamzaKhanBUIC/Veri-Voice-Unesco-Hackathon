# VeriVoice — Deployment Architecture & Operations Guide

## 1. Render Web Service Architecture

VeriVoice is deployed on [Render](https://render.com) as a **persistent Node.js Web Service**.

```text
                     Render Web Service Container
 ┌──────────────────────────────────────────────────────────────────┐
 │                                                                  │
 │   Express HTTP Server (Port $PORT)                               │
 │   ├── GET /health  ───> HTTP 200 OK                              │
 │   └── GET /        ───> Dashboard / Status                       │
 │                                                                  │
 │   Embedded Discord Client                                        │
 │   └── WebSocket Gateway Connection ───> Discord Server 24/7     │
 │                                                                  │
 └──────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Deployment Properties

- **Start Command**: `npm start` (`node backend/src/server.js`)
- **Build Command**: `npm install`
- **Dynamic Port Binding**: Listens on `process.env.PORT` dynamically assigned by Render.
- **Health Check Endpoint**: `/health` returning `{ "status": "ok", "service": "verivoice-backend" }`.
- **Gateway Persistence**: The Discord WebSocket connection remains open continuously as long as the Web Service container is running.

---

## 3. Environment Variables Setup

Configure the following secrets in Render Dashboard under **Environment Variables**:

- `NODE_ENV`: `production`
- `DISCORD_APPLICATION_ID`: `1537205576809840702`
- `DISCORD_BOT_TOKEN`: *[Your Bot Token]*
- `GROQ_API_KEY`: *[Primary Groq Key]*
- `GROQ_API_KEY_1`: *[Secondary Groq Key]*
- `GROQ_API_KEY_2`: *[Tertiary Groq Key]*
- `SPEECHMATICS_API_KEY`: *[Speechmatics API Key]*
- `SPEECH_PROVIDER`: `speechmatics`
- `TTS_PROVIDER`: `edge-tts`
- `LLM_PROVIDER`: `groq`

---

## 4. Free Tier Considerations & Limitations

- **Cold Starts**: Render free instances enter sleep mode after 15 minutes of inactivity if no HTTP requests are received. Incoming Discord events will wake the service.
- **Multi-Key Protection**: Multiple Groq API keys are rotated automatically to prevent `HTTP 429` rate limits.
- **Ephemeral Storage**: Audio files in `backend/tmp/` exist only in container memory during synthesis and are automatically unlinked.
