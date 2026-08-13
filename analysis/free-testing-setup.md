# VeriVoice Free Testing Setup Guide

## 10-Step Minimum-Effort Execution Guide

### Step 1 — Get Free Groq API Key
1. Go to https://console.groq.com/signup and sign in.
2. Go to https://console.groq.com/keys and click **Create API Key**.
3. Copy your key.

### Step 2 — Get Free Meta WhatsApp Cloud API Credentials
1. Go to https://developers.facebook.com/ and sign in with Facebook.
2. Click **My Apps** -> **Create App** -> Select **Other** -> **Business**.
3. Add **WhatsApp** product to your app.
4. Copy your **Temporary Access Token** and **Phone Number ID**.

### Step 3 — Configure Local .env File
Create a .env file in the project root:
env
GROQ_API_KEY=PASTE_GROQ_KEY_HERE
WHATSAPP_TOKEN=PASTE_WHATSAPP_TOKEN_HERE
WHATSAPP_PHONE_NUMBER_ID=PASTE_PHONE_NUMBER_ID_HERE
WHATSAPP_VERIFY_TOKEN=verivoice_webhook_verify_token
SPEECH_PROVIDER=whisper
TTS_PROVIDER=edge-tts
LLM_PROVIDER=groq

### Step 4 — Run Environment Doctor
Run in your terminal:
bash
npm run doctor

Verify Node.js is PASS and credentials show PRESENT.

### Step 5 — Add Sample Urdu Claims to knowledge/claims.json
Populate knowledge/claims.json with 1 to 5 approved Urdu claims (e.g. polio or vaccine safety facts).

### Step 6 — Run Automated Test Suite
bash
npm test

Verify 59/59 tests pass cleanly.

### Step 7 — Run Diagnostic Verification Test
bash
npm run verify:real -- "پولیو قطرے کے فائدے"

### Step 8 — Start Local Server
bash
npm start

Server will run on http://localhost:3000.

### Step 9 — Create Public Webhook Tunnel (ngrok)
In a separate terminal, run:
bash
npx ngrok http 3000

Copy the generated https://<subdomain>.ngrok-free.app URL.

### Step 10 — Register Webhook in Meta Developer Portal
1. In Meta Portal -> WhatsApp -> Configuration -> Edit Webhook.
2. **Callback URL**: https://<subdomain>.ngrok-free.app/webhook/whatsapp
3. **Verify Token**: verivoice_webhook_verify_token
4. Click **Verify and Save**. Subscribe to messages.
5. Send a voice note from your phone to the test WhatsApp number!
