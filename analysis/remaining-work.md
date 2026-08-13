# VeriVoice Remaining Work Roadmap

## P0 — Required Before Live Production Demo (Blocking)
1. **Supply Real API Credentials in `.env`**:
   - Set `GROQ_API_KEY`, `WHATSAPP_TOKEN`, and `WHATSAPP_PHONE_NUMBER_ID`.
2. **Execute Human Medical Review**:
   - Medical expert sign-off on candidates in `analysis/human-review-packet.md`.
3. **Execute Urdu Translation & Adaptation**:
   - Translate approved candidates into simple Urdu (`ur-PK`) and perform medical review.
4. **Populate Production `knowledge/claims.json`**:
   - Commit 15–20 approved Urdu health claims to `knowledge/claims.json`.

---

## P1 — Strongly Recommended (Non-Blocking for Demo)
1. **Configure Webhook Tunnel / Domain**:
   - Setup public HTTPS endpoint (e.g. ngrok / cloud deployment) for Meta webhook registration.
2. **Install System `ffmpeg` on PATH**:
   - For optional local PyTorch Whisper execution without API keys.

---

## P2 — Post-Hackathon Enhancements
1. Persistent database (MongoDB/PostgreSQL) for conversation logging.
2. React admin dashboard for medical team dataset curation.
