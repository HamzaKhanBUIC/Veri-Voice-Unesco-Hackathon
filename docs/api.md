# VeriVoice — REST API Reference

The VeriVoice backend exposes standard REST endpoints for verification, health checks, and audio generation.

---

## 1. Verify Claim Endpoint (`POST /api/verify`)

Analyzes a user's text claim or Base64-encoded audio clip against retrieved institutional evidence and returns a structured verdict.

### Request Headers
```http
Content-Type: application/json
Accept: application/json
```

### Request Body (JSON)
```json
{
  "claimText": "Is the Earth flat?",
  "audioBase64": "optional_base64_string...",
  "fileExt": "webm",
  "mode": "VERIFICATION",
  "targetLanguage": "en",
  "context": {
    "sessionId": "sess_12345",
    "turnCount": 1,
    "history": [
      {
        "role": "user",
        "text": "Is the Earth flat?"
      }
    ]
  }
}
```

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "userClaim": "Is the Earth flat?",
  "verdict": "FALSE",
  "confidence": "HIGH",
  "explanation": "Satellite telemetry and global scientific consensus confirm Earth is spherical.",
  "evidence": [
    {
      "claimId": "src_1",
      "sourceTitle": "NASA Earth Science Observations",
      "organization": "NASA",
      "url": "https://climate.nasa.gov",
      "statement": "Orbital imagery and planetary physics confirm Earth is an oblate spheroid.",
      "authorityLevel": "PRIMARY_SCIENTIFIC_DATA",
      "relevanceScore": 0.95
    }
  ],
  "audioUrl": "/tmp/pipeline_res_12345.mp3",
  "conversation": {
    "sessionId": "sess_12345",
    "turnCount": 2,
    "intent": "FACT_CHECKING",
    "evidenceReused": false,
    "responseLanguage": "en"
  }
}
```

---

## 2. Health Endpoint (`GET /health`)

Lightweight operational check verifying server lifecycle status.

### Response (`HTTP 200 OK`)
```json
{
  "status": "ok",
  "service": "verivoice-backend",
  "timestamp": "2026-08-16T12:00:00.000Z",
  "environment": "production"
}
```

---

## 3. Rate Limits & Security
- **Per-IP Rate Limit**: 30 requests per minute per IP.
- **Global Concurrency Limit**: Max 25 concurrent LLM verification requests.
- **Payload Size Bound**: 10 MB maximum payload.

---

## 4. Live Information Endpoint (`GET /api/live` & `POST /api/live`)

Retrieves current official emergency alerts, meteorological forecasts, and disaster advisories with strict temporal freshness, source authority classification, and emergency safety disclaimers.

### Request Query Parameters (`GET /api/live`)
- `q` / `query` (optional string): Keyword or location search.
- `category` (optional string): `'ALL'` | `'LIVE_ALERTS'` | `'WEATHER'` | `'DISASTERS'` | `'NEWS'`.
- `country` (optional string): Country name (default: `'Pakistan'`).
- `region` (optional string): Province or region (e.g. `'Sindh'`).
- `city` (optional string): City name (e.g. `'Karachi'`).
- `refresh` (optional boolean): Force cache bypass.

### Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "query": "Karachi rain",
  "category": "LIVE_ALERTS",
  "location": {
    "country": "Pakistan",
    "region": "Sindh",
    "city": "Karachi"
  },
  "summary": "Official advisory active for Karachi, Sindh, Pakistan: \"NDMA National Monsoon & Flash Flood Advisory (Sindh)\" issued by National Disaster Management Authority (NDMA).",
  "disclaimer": "For immediate safety decisions, follow the latest instructions from local emergency authorities.",
  "retrievedAt": "2026-08-17T01:15:00.000Z",
  "sourceCount": 2,
  "items": [
    {
      "id": "live_12345",
      "title": "NDMA National Monsoon & Flash Flood Advisory (Sindh)",
      "summary": "National Disaster Management Authority active advisory for monsoon season...",
      "category": "LIVE_ALERTS",
      "severity": "ADVISORY",
      "sourceOrganization": "National Disaster Management Authority (NDMA)",
      "sourceType": "OFFICIAL_ALERT",
      "url": "https://www.ndma.gov.pk",
      "publishedAt": null,
      "updatedAt": null,
      "retrievedAt": "2026-08-17T01:15:00.000Z",
      "validUntil": null,
      "location": { "country": "Pakistan", "region": "Sindh" },
      "status": "ACTIVE",
      "freshness": "LIVE",
      "authorityLevel": "OFFICIAL_GOVERNMENT"
    }
  ]
}
```
