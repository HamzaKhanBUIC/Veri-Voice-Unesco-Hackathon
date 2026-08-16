# VeriVoice — Remote Production Cutover Audit
**Phase 0: Infrastructure & Remote Independence Verification**
*Date: August 16, 2026 | Objective: Full Independence from Local PC*

---

## 1. Executive Summary & Cutover Target

The goal of this phase is to ensure that **VeriVoice functions completely in the cloud without requiring any local laptop, VS Code, or terminal process to stay running**.

```
                   INTERNET
                       │
          ┌────────────┴─────────────┐
          │                          │
          ▼                          ▼
       VERCEL                    DISCORD
    (Frontend UI)               (Gateway)
          │                          │
          └────────────┬─────────────┘
                       ▼
                 RENDER CLOUD
            (Express API + Discord Bot)
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
        Groq Whisper  Groq LPU  ElevenLabs/Edge
            (ASR)      (LLM)         (TTS)
```

---

## 2. Infrastructure Inventory & Point-by-Point Determination

| Audit Dimension | Target Requirement | Current State | Verdict |
|---|---|---|:---:|
| **A. Website Independent Deployment** | Vercel hosts frontend independent of local PC | Configured via GitHub `main` branch auto-deployment to `verivoice-unesco.vercel.app`. | ✅ **PASS** |
| **B. Backend Public Reachability** | Render hosts Node.js backend with public HTTPS endpoint | `render.yaml` defines web service `verivoice` running `npm start`. | ⚠️ **PENDING CONFIG** |
| **C. Discord Remote Execution** | Render Node.js process runs Discord gateway bot 24/7 | `backend/src/server.js` starts `DiscordService` when `NODE_ENV=production` & token present. | ✅ **READY** |
| **D. Discord Gateway Persistence** | Bot maintains WebSocket connection without local relay | `DiscordClient.js` connects directly to Discord Gateway via `discord.js`. | ✅ **PASS** |
| **E. Automatic Bot Restart Recovery** | Bot automatically reconnects on process restart | Handled natively by `discord.js` gateway client with auto-reconnect. | ✅ **PASS** |
| **F. Render Automatic Deployment** | Pushes to `main` trigger cloud rebuild | Supported natively by Render GitHub integration & `render.yaml`. | ✅ **PASS** |
| **G. Production Secrets Isolation** | Secrets stored securely in cloud platform env vars | Render environment variables store Discord tokens & API keys; never committed in source. | ✅ **PASS** |
| **H. Zero Localhost Frontend Dependencies** | Vercel production build does not hardcode `localhost` | `ApiClient.ts` uses dynamic `VITE_API_BASE_URL` with resilient direct cloud fallback. | ✅ **PASS** |
| **I. Zero Localhost Discord Dependencies** | Discord message handling runs entirely on server | Audio and text verification execute in-memory inside `StandalonePipeline.js`. | ✅ **PASS** |
| **J. Audio URL Cloud Integrity** | Synthesized audio is served via relative endpoints or cloud blobs | Handled via Express static `/tmp` route or direct ElevenLabs blob synthesis. | ✅ **PASS** |
| **K. Webhook / Relay Independence** | No ngrok, local tunnels, or local PC callbacks required | Webhook and Discord events originate and terminate in cloud infrastructure. | ✅ **PASS** |

---

## 3. Localhost & Hardcoded Path Audit

A full repository audit for `localhost`, `127.0.0.1`, and machine paths (`C:\`, `D:\`, `file://`) was conducted:

| File | Occurrence | Classification | Rationale |
|---|---|---|---|
| `backend/src/app.js` | `http://localhost:5173`, `http://localhost:3000` | **SAFE (DEV ONLY)** | Allowed origins list for CORS during local development. |
| `backend/src/middleware/rateLimitMiddleware.js` | `127.0.0.1` | **SAFE** | Fallback client key identifier when IP is missing. |
| `frontend/src/components/settings/UserSettingsModal.tsx` | `http://localhost:3000` | **SAFE** | Example placeholder text inside custom backend setting. |
| `frontend/vercel.json` | `http://localhost:3000` | **SAFE** | Local development connect-src for CSP. |

**Result:** Zero production bugs or hardcoded local development URLs found in production paths.

---

## 4. Render & Vercel Configuration Requirements

### Render Environment Variables Checklist:
For Render to run the backend and the Discord bot 24/7 with zero PC dependency, the following variables must be populated in the Render Dashboard:

1. `NODE_ENV`: `production`
2. `PORT`: `10000` (Render default)
3. `DISCORD_BOT_TOKEN`: `MTUzNzIwNTU3NjgwOTg0MDcwMg.GodS8A...`
4. `DISCORD_APPLICATION_ID`: `1537205576809840702`
5. `GROQ_API_KEY`: `gsk_b9b5...`
6. `GROQ_API_KEY_1`: `gsk_AmWE...`
7. `GROQ_API_KEY_2`: `gsk_5trB...`
8. `GROQ_API_KEY_3`: `gsk_qYQF...`
9. `GROQ_API_KEY_4`: `gsk_QJjg...`
10. `ELEVENLABS_API_KEY`: `sk_db76...`
11. `ELEVENLABS_API_KEY_1`: `sk_2a7e...`
12. `ELEVENLABS_API_KEY_2`: `sk_39c9...`
13. `ELEVENLABS_API_KEY_3`: `sk_51d6...`
14. `ELEVENLABS_API_KEY_4`: `sk_afce...`
15. `SPEECH_PROVIDER`: `whisper`
16. `TTS_PROVIDER`: `elevenlabs`
17. `LLM_PROVIDER`: `groq`

---

## 5. Next Steps for Autonomous Cutover Execution

1. Ensure `render.yaml` Blueprint specifies all production parameters.
2. Confirm Discord bot health logging and auto-reconnect resilience.
3. Validate client-side direct cloud fallback for 100% website uptime.
4. Document all production verification results in `analysis/remote-production-final-report.md`.
