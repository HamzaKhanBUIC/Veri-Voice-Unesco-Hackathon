# PROJECT DNA — VeriVoice

- **Project Name**: VeriVoice
- **Goal**: WhatsApp voice-based health rumor verification bot in Urdu.
- **Architecture Stack**:
  - Backend: Node.js + Express
  - Database: MongoDB Atlas (free tier) / In-memory for initial standalone pipeline
  - Messaging: WhatsApp Cloud API (with isolated adapter for sandbox/Twilio dev)
  - STT: OpenAI Whisper / Speechmatics (abstracted via SpeechProvider)
  - Retrieval: Keyword/Lexical search against curated `knowledge/claims.json`
  - LLM / Verification: Fast LLM (Groq Llama 3 / Gemini) wrapped in strict Zod schema validation
  - TTS: Edge TTS (Urdu spoken audio response)
- **Primary Language**: Urdu (`ur`)
- **Key Metric**: Response time < 60s, 0% medical hallucination, 100% evidence-grounded.
