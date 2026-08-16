# VeriVoice — Discord Bot Integration Guide

**Bot Name:** `VeriVoice#8580`  
**Application ID:** `1537205576809840702`  
**OAuth2 Permissions:** `101376` (View Channels, Send Messages, Read Message History, Attach Files)  
**Invite URL:** [Add to Discord Server](https://discord.com/api/oauth2/authorize?client_id=1537205576809840702&permissions=101376&scope=bot%20applications.commands)

---

## 1. Features
- **Instant Truth Verification (`/verify`)**: Fact-checks rumors against UNESCO, WHO, and NASA institutional repositories.
- **MIL Research Exploration (`/general`)**: Answers complex scientific, health, or environmental queries with spoken audio clips.
- **Voice Note Processing**: Upload any `.ogg`, `.mp3`, or `.wav` audio attachment directly in a channel to receive a spoken audio response.
- **UNESCO Guidelines (`/mil`)**: Presents core Media & Information Literacy verification principles.

---

## 2. Slash Commands List

| Command | Arguments | Description |
|---|---|---|
| `/verify` | `claim` (string, required), `language` (optional) | Fact-check a health or climate claim. |
| `/general` | `query` (string, required), `language` (optional) | Deep conversational research response with citations. |
| `/mil` | *none* | Display UNESCO Media & Information Literacy guidelines. |
| `/voice` | `claim` (string, required) | Verifies claim and returns an attached MP3 voice note. |
| `/status` | *none* | Operational metrics and server connectivity status. |
| `/ping` | *none* | Discord Gateway latency check. |

---

## 3. Architecture & Security
- **Cloud Gateway:** Connects directly from Render Web Service (`NODE_ENV=production`) to Discord WebSocket Gateway.
- **Mention Protection:** Disallows all automatic `@everyone`, `@here`, or role pings (`allowedMentions: { parse: [] }`).
- **Input Sanitization:** Strips Discord markdown formatting and rejects oversized attachments (>15 MB).
