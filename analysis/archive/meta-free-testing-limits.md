# Meta WhatsApp Cloud API — Free Testing Limits & Constraints Report

This document outlines the authoritative current limits, pricing rules, token behavior, and sandbox policies for Meta WhatsApp Cloud API developer testing.

---

## 1. Sandbox & Testing Allowance Summary

| Feature / Metric | Developer Test Setting | Citation / Official Rule |
| :--- | :--- | :--- |
| **Developer Cost** | **$0.00 (100% Free)** | Free developer sandbox provided by Meta. |
| **Credit Card Requirement** | **Not Required** | Developer sandbox testing requires zero payment method setup. |
| **Business Verification** | **Not Required** | Sandbox testing works immediately without official business verification. |
| **Test Phone Number** | **Meta-Provided** | Meta automatically assigns a free test phone number (e.g. `+1 555-652-8635`). |
| **Test Recipient Limit** | **Up to 5 Phone Numbers** | Up to 5 recipient numbers can be added to the test recipient list per app. |
| **Free Conversation Credit** | **1,000 Free Conversations / Month** | First 1,000 service conversations every month are free per WhatsApp Business Account (WABA). |
| **Customer Service Window** | **24-Hour Free Window** | When a user sends a message to the bot, a 24-hour free conversation window opens. |
| **Temporary Access Token** | **Valid for 24 Hours** | Sandbox dashboard tokens expire after 24 hours. |
| **Permanent Access Token** | **Never Expiring** | Created via System Users in Meta Business Settings. |

---

## 2. Capabilities & Constraints for VeriVoice Prototype

### Supported Sandbox Capabilities
- **Voice Notes & Audio Files**: Can send and receive audio/voice message files (`.ogg`, `.mp3`, `.m4a`).
- **Interactive Messages**: Text, button templates, and media responses supported.
- **Webhook Integration**: Full GET challenge verification and POST incoming payload notifications supported.
- **Multiple Test Users**: Up to 5 team member phone numbers can participate simultaneously in testing.

### Current Sandbox Constraints
1. **Allowed Recipient Enforcement**: In Development Mode, Meta will ONLY deliver outgoing bot messages to phone numbers explicitly added to the recipient list under **Step 1: Select Phone Numbers**. Attempting to reply to unapproved numbers returns API error `#131030`.
2. **24-Hour Token Refresh**: Temporary developer access tokens expire every 24 hours unless a System User token is created in Meta Business Settings.
3. **Public HTTPS Requirement**: Webhook endpoints MUST use a valid public `https://` URL (handled locally via zero-landing-page SSH tunnel or cloud deployment).

---

## 3. Production Transition Requirements (Future Phase)
*Not required for current prototype or hackathon testing:*
- Meta Business Verification (submission of legal business documentation).
- Dedicated WhatsApp Phone Number (a clean phone number not currently registered on personal WhatsApp).
- Payment Method Attachment (credit card attached for volume beyond 1,000 free monthly conversations).
