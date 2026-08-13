# API Contracts & Data Schemas

## 1. Webhook Verification Contract (GET /webhook/whatsapp)
Query Parameters:
```http
GET /webhook/whatsapp?hub.mode=subscribe&hub.verify_token=verivoice_webhook_verify_token&hub.challenge=CHALLENGE_CODE_123
```
Responses:
- `HTTP 200 OK`: Returns plain text string `CHALLENGE_CODE_123`
- `HTTP 403 Forbidden`: Returned when `hub.verify_token` is invalid
- `HTTP 400 Bad Request`: Returned when parameters are missing

## 2. Webhook Event Notification (POST /webhook/whatsapp)
Request Payload (Meta Cloud API Webhook):
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_ENTRY_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "923001234567",
                "id": "wamid.HBgLMTIzNDU2Nzg5MA==",
                "timestamp": "1700000000",
                "type": "audio",
                "audio": { "id": "media_id_123", "mime_type": "audio/ogg" }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```
Response:
- `HTTP 200 OK`: Plain text `"EVENT_RECEIVED"`

## 3. Verdict Output Schema (Zod Validated Core Response)
```json
{
  "verdict": "TRUE | FALSE | MIXED | UNCERTAIN",
  "confidence": 0.95,
  "explanation": "پولیو ویکسین مکمل طور پر محفوظ ہے اور بچوں کو معذوری سے بچاتی ہے۔",
  "evidence": [
    {
      "claimId": "claim-polio-001",
      "sourceTitle": "Polio Vaccination Guidance",
      "organization": "WHO Pakistan",
      "url": "https://www.who.int/pakistan"
    }
  ],
  "reason": "EVIDENCE_GROUNDED"
}
```
