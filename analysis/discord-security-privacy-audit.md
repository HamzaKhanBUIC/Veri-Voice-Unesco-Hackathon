# VeriVoice Discord Bot — Deep Security & Privacy Audit Report

**Auditor:** Principal Discord Security Engineer, Application Security Engineer, Privacy & Abuse Prevention Lead  
**Audit Scope:** Production Discord Integration Layer (`DiscordClient`, `DiscordService`, `DiscordCommands`, `DiscordMedia`, `RateLimiter`, `ConcurrencyLimiter`)  
**Audit Date:** August 2026  
**Status:** READ-ONLY Deep Threat Model & Risk Assessment

---

## 1. Security Threat Model

The VeriVoice Discord Bot connects external Discord users (Guilds, DMs, Text Channels) directly to the VeriVoice verification core. Because Discord is a public, multi-tenant environment, all incoming data is treated as **hostile, untrusted input**:

```
[ UNTRUSTED DISCORD USER ]
        │
        ▼ (WebSocket Gateway v10)
[ DiscordClient / DiscordService ] ──► [ RateLimiter (5/user, 20/global) ]
        │                                        │
        ▼ (MIME, Size <= 15MB, Path Traversal)   ▼
[ DiscordMedia (backend/tmp/) ]    ──► [ ConcurrencyLimiter (Max 3 Tasks) ]
        │
        ▼
[ StandalonePipeline (Whisper ASR + Llama 3.3 70B Grounded LLM + EdgeTTS) ]
        │
        ▼
[ CitationValidator & Zod Schema Enforcement ]
        │
        ▼
[ Discord Channel Delivery + Guaranteed Temp Cleanup ]
```

---

## 2. Security Findings Matrix

| Finding ID | Title | Severity | Impact | Status |
|---|---|:---:|---|:---:|
| **SEC-01** | Mass Mention Injection Risk (`@everyone` / `@here`) | **HIGH** | User input or retrieved text containing `@everyone` could trigger accidental server-wide pings if `allowedMentions` is unconstrained. | **Identified for Hardening** |
| **SEC-02** | Gateway Duplicate Event / Replay Vulnerability | **MEDIUM** | Discord WebSocket reconnects or replayed message IDs could trigger duplicate expensive ASR/LLM pipelines. | **Identified for Hardening** |
| **SEC-03** | Unbounded Slash Command & Mention Text Length | **MEDIUM** | Extremely long input texts (1000+ chars) could cause token inflation and degraded search quality. | **Identified for Hardening** |
| **SEC-04** | Over-privileged Gateway Intents (`GuildMessageReactions`) | **LOW** | Reaction intents are declared in `DiscordClient` but unused by VeriVoice. | **Identified for Hardening** |
| **SEC-05** | Dangerous URI Schemes in Citations (`javascript:`, `data:`) | **MEDIUM** | Malicious retrieved links could theoretically include non-HTTP schemes if not strictly sanitized. | **Identified for Hardening** |
| **SEC-06** | Privacy Disclosure & Ephemeral Audio Retention Notice | **LOW** | First-time voice users should receive a clear, concise disclosure regarding temporary audio processing. | **Identified for Hardening** |

---

## 3. Detailed Threat Vector Analysis

### SEC-01: Mass Mention & Ping Injection
- **Vector**: A user submits a claim or question containing `@everyone`, `@here`, or `<@&role_id>`. Alternatively, live web snippets scraped from malicious web pages contain mass mention tokens.
- **Vulnerability**: If `message.reply()` or `interaction.editReply()` does not disable mention parsing, Discord's message parser will notify every member or pinged role in the guild.
- **Required Hardening**:
  1. Add `allowedMentions: { parse: [], repliedUser: false }` globally to `DiscordClient`.
  2. Pass `allowedMentions: { parse: [], repliedUser: false }` in all `message.channel.send` and `interaction.reply` calls.
  3. Sanitize output text by inserting zero-width spaces (`@\u200beveryone`, `@\u200bhere`).

### SEC-02: Idempotency & Gateway Event Duplication
- **Vector**: Rapid double-clicks on slash commands or network blips triggering Discord Gateway reconnect re-delivery (`RESUME` event).
- **Vulnerability**: Duplicate AI verification jobs consuming Groq and Whisper quota simultaneously.
- **Required Hardening**: Implement an in-memory sliding-window Set of processed message and interaction IDs (`processedEvents = new Map<string, number>()`) with a 2-minute TTL.

### SEC-03: Input Length Bounds
- **Vector**: User pastes a 4,000-character payload into a slash command or mention.
- **Vulnerability**: Token exhaustion on Groq LPU and memory allocation spikes.
- **Required Hardening**: Enforce a strict ceiling of **500 characters** for claims/questions, truncating and warning gracefully.

### SEC-04: Intent Minimization
- **Vector**: Unnecessary event listeners in `DiscordClient.js`.
- **Finding**: `GatewayIntentBits.GuildMessageReactions` is enabled but never consumed.
- **Required Hardening**: Remove `GuildMessageReactions` from `DiscordClient.js`.

### SEC-05: Malicious URL Schemes in Citation Validation
- **Vector**: Retrieved links containing `javascript:alert(1)`, `data:text/html,...`, `file:///etc/passwd`.
- **Vulnerability**: Cross-site scripting (XSS) or protocol injection when links are clicked in Discord.
- **Required Hardening**: Enforce `cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://')` strictly in `CitationValidator.js`.

---

## 4. Privacy & Data Minimization Architecture

### Data Storage Policy:
- **Discord User IDs**: Kept only in ephemeral in-memory rate-limiter maps; purged automatically every 2 minutes. Never written to disk or database.
- **Audio Files**: Downloaded to `backend/tmp/` with crypto-random unguessable names. **100% purged** inside `finally` blocks after TTS delivery.
- **Transcripts & Claims**: Kept in ephemeral memory for the duration of the request; never stored in persistent databases.
- **Logs**: Structured with sanitized metadata (`requestId`, `command`, `domain`, `durationMs`). API tokens, keys, and raw audio buffers are **strictly excluded**.

---

## 5. Security Action Plan

We will implement the targeted hardening fixes across:
1. `backend/src/services/discord/DiscordClient.js` (allowedMentions + intent minimization)
2. `backend/src/services/discord/DiscordService.js` (idempotency cache + mention sanitization)
3. `backend/src/services/discord/DiscordCommands.js` (input length bounding + allowedMentions)
4. `backend/src/services/verification/CitationValidator.js` (strict HTTPS/HTTP scheme enforcement)
5. `tests/discordSecurity.test.js` (Automated 20-scenario security test battery)
