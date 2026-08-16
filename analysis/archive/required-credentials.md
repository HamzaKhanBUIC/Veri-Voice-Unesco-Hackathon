# VeriVoice Required Credentials Audit

## Overview
Audit of all external credentials and environment variables required for live prototype testing. **No secrets or private tokens are displayed.**

---

## Credentials Audit Matrix

| Credential Variable | Required for Live Demo? | Purpose | Free Option Available? | Where Obtained | Configuration Variable |
|---|:---:|---|:---:|---|---|
| **GROQ_API_KEY** | **YES** | Fast cloud Whisper STT & Llama 3.3 70B claim verification | **YES** (Free tier quota) | [console.groq.com](https://console.groq.com/) | GROQ_API_KEY |
| **WHATSAPP_TOKEN** | **YES** | Meta Cloud API access token for voice message download & sending | **YES** (Free developer test token) | [developers.facebook.com](https://developers.facebook.com/) | WHATSAPP_TOKEN |
| **WHATSAPP_PHONE_NUMBER_ID** | **YES** | Meta Business Phone Number ID for messaging endpoint | **YES** (Free test phone number) | [developers.facebook.com](https://developers.facebook.com/) | WHATSAPP_PHONE_NUMBER_ID |
| **WHATSAPP_VERIFY_TOKEN** | **YES** | Meta webhook verification challenge token | **YES** (Custom string) | Local .env | WHATSAPP_VERIFY_TOKEN |
| **WHATSAPP_API_VERSION** | **YES** | Meta Graph API version | **YES** (Default v19.0) | Local .env | WHATSAPP_API_VERSION |
| **OPENAI_API_KEY** | **NO** | Alternative Whisper STT & GPT-4o verification | **NO** (Requires paid credits) | [platform.openai.com](https://platform.openai.com/) | OPENAI_API_KEY |
| **SPEECHMATICS_API_KEY** | **NO** | Alternative Speechmatics STT provider | **YES** (Free trial credits) | [speechmatics.com](https://www.speechmatics.com/) | SPEECHMATICS_API_KEY |
| **GEMINI_API_KEY** | **NO** | Alternative Gemini verification provider | **YES** (Free tier) | [aistudio.google.com](https://aistudio.google.com/) | GEMINI_API_KEY |
| **MONGODB_URI** | **NO** | Optional persistent database | **YES** (MongoDB Atlas free tier) | [mongodb.com](https://www.mongodb.com/cloud/atlas) | MONGODB_URI |
