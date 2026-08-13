# Agent Instructions — VeriVoice Project Governance

**Empire Mode:** Speed · Hackathon Prototype Sprint  
**Project:** VeriVoice (WhatsApp Voice-Based Claim Verification Prototype for Urdu)

## Bootstrap Protocol
1. Read `AGENTS.md` (this file) and `AGENT_RULES.md` at session start.
2. Read project charter in `README.md` and `docs/architecture.md`.
3. Follow the strict engineering workflow:
   **UNDERSTAND → PLAN → IMPLEMENT → TEST → INSPECT → FIX → VERIFY → DOCUMENT → CONTINUE**

## Core Product Principle
The primary product loop is:
`VOICE → TRANSCRIPTION → CLAIM → EVIDENCE → VERDICT → EXPLANATION → VOICE`

WhatsApp is an interface wrapper around this core pipeline.
Therefore, the core verification engine **MUST** remain independently testable without WhatsApp.

## Lead Architect Governance
- The Lead Architect (human user) approves architectural steps and git commits.
- Suggest small, atomic commits; run `git commit` only when explicitly requested.
