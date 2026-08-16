# VeriVoice — Security Architecture & Threat Mitigation
**System Hardening, Abuse Prevention, and Guardrail Specification**
*Version: 1.0.0 | Passing Security Tests: 21/21 Suites (170/170 Tests)*

---

## 1. Security Envelope & Architecture

VeriVoice enforces a multi-layered security model separating untrusted public ingress from the verified execution core:

```
[ UNTRUSTED PUBLIC INGRESS ]
       │
       ▼
┌────────────────────────────────────────────────────────────────────────┐
│ INGRESS SHIELD: Network & Rate Throttling                              │
│ • Reverse Proxy Trust (trust proxy = 1) for accurate IP resolution     │
│ • Endpoint Sliding-Window Rate Limiters (/api/verify, /api/tts)        │
│ • Concurrency Semaphores (max 4 concurrent worker threads)             │
│ • Strict 10MB JSON and Audio Buffer Ingress Body Limits                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DATA INTEGRITY & SANITIZATION LAYER                                    │
│ • Audio Magic-Byte Header Verification (RIFF, OggS, WebM/EBML, ID3)    │
│ • Scheme Whitelisting (Permits ONLY http:// and https://)              │
│ • Dangerous Protocol Stripping (Rejects javascript:, data:, file:)     │
│ • Prompt Delimiter Isolation (<USER_CLAIM>, <EVIDENCE>)                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ VERIFIED REASONING & OUTPUT GUARDRAILS                                 │
│ • Zod Verdict Schema Runtime Validation (`validateVerdict`)            │
│ • Citation Allowlist Check (Rejects un-retrieved URLs)                 │
│ • Boundedness Fallback (Forces UNCERTAIN if 0 citations found)         │
│ • Sanitized Public Error Categories (Zero stack trace leaks)           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
[ SECURE CLIENT & EGRESS DELIVERY ]
```

---

## 2. Server-Side Rate Limiting & Concurrency Policies

| Endpoint | Ingress Method | Client Window Limit | Global Traffic Ceiling | Concurrency Semaphore | Violator Response |
|---|:---:|:---:|:---:|:---:|---|
| `/api/verify` | `POST` | 8 req / 60s / Client | 40 req / 60s Global | Max 4 Concurrent Jobs | `HTTP 429 Too Many Requests` |
| `/api/tts` | `GET` | 10 req / 60s / Client | 50 req / 60s Global | Max 4 Concurrent Jobs | `HTTP 429 Too Many Requests` |
| `/health` | `GET` | 60 req / 60s / IP | 200 req / 60s Global | Unlimited | `HTTP 429 Too Many Requests` |

---

## 3. Anti-XSS & URL Scheme Validation

* **React JSX Escaping**: All dynamic text elements (user claims, transcripts, explanations, source titles) are rendered through React's native escaping mechanism, neutralizing `<script>` tag execution.
* **Outbound Link Sanitation in `SourceCard.tsx`**:
  ```ts
  const rawUrl = (evidence.url || '').trim();
  const isSafeScheme = rawUrl.startsWith('https://') || rawUrl.startsWith('http://');
  const safeUrl = isSafeScheme ? rawUrl : '#';
  ```
* **Citation Allowlisting in `CitationValidator.js`**:
  Every citation returned in an LLM payload is cross-referenced against the set of URLs and domains physically retrieved during search. Fabricated or hallucinated URLs are rejected and trigger the safe uncertainty fallback.

---

## 4. HTTP Security Headers & Content Security Policy (CSP)

### Express API Headers (`backend/src/app.js`):
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: microphone=(self), camera=(), geolocation=()`

### Vercel Edge Headers (`frontend/vercel.json`):
* `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: data: https: https://api.elevenlabs.io; connect-src 'self' blob: data: https://api.groq.com https://api.elevenlabs.io https://*.onrender.com http://localhost:3000 http://localhost:5173 http://127.0.0.1:3000 http://127.0.0.1:5173; frame-ancestors 'none'; object-src 'none';`

---

## 5. Automated Security Test Suite

The test suite in [`tests/security.test.js`](file:///c:/Users/Hamza%20Imran/Desktop/Veri-Voice%20Unesco%20Hackathon/tests/security.test.js) validates 22 distinct attack vectors:
* HTTP Security Headers and Frame Protections
* URL Scheme Rejections (`javascript:`, `data:`, `file:`)
* Un-retrieved citation hallucination rejection
* Conversation context untrusted URL sanitization
* 10-turn session quota ceiling
* Oversized text and audio payload boundaries
* Zero-byte and non-existent audio handling
* Sliding-window rate limiters and global throttles
* Concurrency semaphore queue behavior
* Safe public error messages (zero stack trace leakage)
