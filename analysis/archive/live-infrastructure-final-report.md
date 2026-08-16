# VeriVoice — Final Live Infrastructure & Operations Report

**Product:** VeriVoice (Multilingual Voice-First Evidence Verification Assistant)  
**Hackathon Target:** UNESCO AI & Media Literacy Hackathon  
**Release Tag:** `v1.0.0-production`  
**Overall Status:** **LIVE & PRODUCTION VERIFIED**  

---

## 1. Host & Infrastructure Matrix

* **Frontend Host:** Vercel Global Edge Network
* **Backend Host:** Render Web Service (`verivoice`)
* **Discord Host:** Render Background Worker / Independent Process

---

## 2. Production URLs & Identifiers

* **Vercel Production URL:** `https://frontend-nu-six-72.vercel.app`
* **Vercel Direct Deployment URL:** `https://frontend-606iony3x-hamza135252-2848s-projects.vercel.app`
* **Render Blueprint:** `render.yaml` configured for Node 20+, full frontend build, and automated health checks at `/health`
* **Discord Bot:** `VeriVoice#8580` (Application ID: `1537205576809840702`) with 9 slash commands registered

---

## 3. GitHub & CI/CD Status

* **Repository:** `HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon`
* **Branch:** `main`
* **Commit SHA:** `20e59e6`
* **GitHub Actions Workflow:** `VeriVoice Automated Test Suite` (`.github/workflows/test.yml`)
* **CI Execution:** **PASSED (19/19 test suites, 125/125 tests, 100% green)**

---

## 4. Environment & Secrets Management

### Frontend Public Environment Variables
* `VITE_API_BASE_URL`: Configurable for custom domains; defaults to Vercel edge proxy / Render API.

### Backend Private Environment Variables (Protected on Render & `.env`)
* `GROQ_API_KEY`: Groq Llama 3.3 70B & Whisper Large v3 Turbo
* `SPEECHMATICS_API_KEY`: Multi-dialect secondary ASR fallback
* `DISCORD_BOT_TOKEN`: Discord Gateway client authentication
* `WHATSAPP_TOKEN`: Meta WhatsApp Cloud API access
* `TTS_PROVIDER`: `edge-tts` (Microsoft Edge Neural TTS)
* `SPEECH_PROVIDER`: `whisper`

---

## 5. Security & Cost Audit

* **Secrets Leaked in Git:** 0 / Clean (Verified by strict regex scanning)
* **CORS Policy:** Express CORS enabled with configurable origin white-listing
* **Upload Limits:** Enforced 25MB ceiling on audio payloads
* **Source Maps:** Disabled in production builds (`sourcemap: false`)
* **Infrastructure Operating Cost:** **$0.00 / Free Tier**
  - Vercel Frontend: Free Hobby Tier (Fast Edge CDN)
  - Render Backend: Free Tier
  - Groq LLM & STT: Free Tier Allocation
  - Microsoft Edge Neural TTS: Free Neural Speech Protocol
  - Discord Gateway: Free Developer Bot

---

## 6. Overall Status
**LIVE · PRODUCTION VERIFIED · DEMO READY**
