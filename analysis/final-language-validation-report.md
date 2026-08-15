# VeriVoice — Phase 4: Cross-Language Validation & Scorecard

**Date:** 2026-08-15  
**Evaluation Scope:** Complete Voice & Text Multilingual Pipeline  
**Status:** **ALL PRIORITY LANGUAGES GREEN**  

---

## 1. Multilingual Support Matrix & Scorecard

| Language | Script / Locale | ASR Engine | Detection | Retrieval | LLM Reasoning | Edge Neural Voice | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **English** | Latin (`en`) | Whisper API | GREEN | GREEN | GREEN | `en-US-AvaNeural` | **GREEN** |
| **Urdu (اردو)** | Arabic (`ur`) | Whisper API | GREEN | GREEN | GREEN | `ur-PK-UzmaNeural` | **GREEN** |
| **Roman Urdu** | Latin (`ur-Roman`) | Whisper API | GREEN | GREEN | GREEN | `ur-PK-UzmaNeural` | **GREEN** |
| **Spanish (Español)** | Latin (`es`) | Whisper API | GREEN | GREEN | GREEN | `es-ES-ElviraNeural` | **GREEN** |
| **Indonesian (Bahasa)** | Latin (`id`) | Whisper API | GREEN | GREEN | GREEN | `id-ID-GadisNeural` | **GREEN** |
| **Arabic (العربية)** | Arabic (`ar`) | Whisper API | GREEN | GREEN | GREEN | `ar-SA-ZariyahNeural` | **GREEN** |

---

## 2. Key Language Capabilities Verified

1. **RTL Typography & Direction:**
   - Urdu & Arabic text rendering uses `Noto Naskh Arabic` with explicit `dir="rtl"` support, preserving proper ligatures and punctuation.
2. **Context-Preserved Language Switching:**
   - User can ask a claim in English and switch mid-dialogue to Urdu (*"Ab Urdu mein samjhao"*) or Spanish (*"En español"*).
   - The underlying topic, evidence citations, and truth verdict are preserved without loss of fidelity.
3. **Phonetic & Roman Urdu Handling:**
   - Transcriptions in Roman Urdu (`kya polio ke qatray mahfooz hain?`) are normalized and verified against authentic medical facts, with output synthesized in fluent Urdu Neural audio.
