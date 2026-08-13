# AGENT RULES — VERIVOICE ENGINEERING CONTRACT

## 1. Core Engineering Loop
For every task use:
`UNDERSTAND → PLAN → IMPLEMENT → TEST → INSPECT → FIX → VERIFY → DOCUMENT → CONTINUE`

Never skip testing or verification merely because the code appears correct.

## 2. Evidence-Grounded Verification & Safety Principles
- VeriVoice handles health-related claims. Correctness is strictly prioritized over confidence.
- System relies on **evidence-grounded verification with uncertainty-first behavior**.
- System MUST NOT invent medical facts, citations, organizations, or URLs.
- LLM MUST NOT be allowed to invent evidence outside the retrieved context.
- Default to `UNCERTAIN` when evidence is insufficient, contradictory, or weak.

## 3. Strict Verdict Schema
All verification engine outputs MUST validate against a strict Zod schema:
```json
{
  "verdict": "TRUE | FALSE | MIXED | UNCERTAIN",
  "confidence": 0.0,
  "claim": "...",
  "explanation": "...",
  "language": "ur",
  "evidence": [
    {
      "source": "...",
      "title": "...",
      "url": "..."
    }
  ]
}
```

## 4. Architectural Boundaries
- Keep WhatsApp adapter isolated. Core pipeline must run CLI/test harness standalone.
- Abstract Speech Provider (Whisper, Speechmatics).
- Abstract LLM Provider (Groq, Gemini, OpenAI).
- Do NOT introduce vector DBs, LangChain, multi-agent frameworks, or unnecessary microservices.

## 5. Scope Creep Firewall
- Stick strictly to approved milestone plan.
- Primary target language for prototype is **Urdu**.
