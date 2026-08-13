# VeriVoice Pitch Demo Script

## Demo Flow (Under 60 Seconds)
1. **User Action**: Record an Urdu voice note on WhatsApp containing a common health rumor (e.g. "Do polio drops cause illness?").
2. **Webhook Ingestion**: Express server receives WhatsApp message event, downloads `.ogg` audio file.
3. **STT Processing**: Whisper/Speechmatics transcribes voice note into Urdu text.
4. **Retrieval**: System matches claim against `knowledge/claims.json` (Polio vaccine claim).
5. **LLM Verification**: Model evaluates evidence and outputs structured JSON (`FALSE` for myth).
6. **TTS Generation**: Edge TTS renders clear spoken Urdu explanation.
7. **WhatsApp Reply**: User receives spoken audio message answering their rumor.
