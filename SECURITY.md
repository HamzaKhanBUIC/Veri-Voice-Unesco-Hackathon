# VeriVoice — Security & Privacy Policy

## 🔒 Secret & Credential Protection Policy

VeriVoice enforces strict secret safety across all environments:
1. **Zero Credential Persistence**: API keys (`GROQ_API_KEY`, `SPEECHMATICS_API_KEY`, `DISCORD_BOT_TOKEN`, `WHATSAPP_TOKEN`) are supplied exclusively via process environment variables (`.env` in local development, Render Environment Variables in production).
2. **Git Hygiene**: `.env` and `.env.*` files are strictly excluded via `.gitignore` and must never be committed to source control.
3. **Log Protection**: Application logs report key presence (`PRESENT` / `MISSING`) without printing sensitive token strings or Authorization headers.

---

## 🎙️ Ephemeral Voice Processing & Data Privacy

1. **Temporary Storage Only**: Inbound voice recordings (`.ogg`, `.wav`, `.mp3`) are written to temporary directory storage (`backend/tmp/`) solely for duration of ASR transcription.
2. **Immediate Unlinking**: All temporary audio files are deleted immediately after response generation or pipeline exception using `safeCleanup()` in `finally` execution blocks.
3. **No Retained User Audio**: VeriVoice does not store or archive raw user voice recordings.

---

## 🛡️ AI Safety, Prompt Injection Defenses & Grounding

1. **Strict Prompt Boundaries**: External user inputs and retrieved web evidence are isolated inside untrusted `<USER_CLAIM>` and `<EVIDENCE>` XML tags.
2. **Adversarial Defenses**: Prompt injections attempting to override system instructions (e.g. *"Ignore previous instructions..."*) are neutralized and return `UNCERTAIN` verdicts.
3. **Citation Validation**: VeriVoice enforces strict URL matching against retrieved evidence sets. Hallucinated or un-retrieved URLs are rejected.
4. **Transparent Uncertainty**: When retrieved evidence is insufficient, contradictory, or absent, VeriVoice explicitly reports `UNCERTAIN` verdict with `LOW` qualitative confidence.

---

## 📩 Reporting Security Vulnerabilities

If you discover a security vulnerability or credential exposure in VeriVoice, please report it responsibly:
- Email: `security@verivoice.org` (or open a private security advisory on GitHub).
- Please do **NOT** post security vulnerabilities or API credentials in public GitHub Issues.
