# VeriVoice Health Verification & Safety Policy

## 1. Evidence-Grounded Verification Mandate
- System operates under **evidence-grounded verification with uncertainty-first behavior**.
- When no evidence is retrieved from `knowledge/claims.json`, the verification engine does not call the LLM and returns `UNCERTAIN` (`reason: NO_EVIDENCE`).
- Outside parametric knowledge of health facts is strictly prohibited.
- If confidence score is low, evidence is contradictory, or no keyword match is found, system MUST default to `UNCERTAIN`.

## 2. Production Dataset Limitation Note
- The production knowledge base (`knowledge/claims.json`) is initialized empty (`[]`) pending authoritative health team curation.
- Live WhatsApp queries evaluated against the production dataset will return `UNCERTAIN` (`NO_EVIDENCE`) until real health claims are supplied.

## 3. Prompt-Injection Defense & Tag Isolation
- User inputs and retrieved content are wrapped in strict tags: `<USER_CLAIM>` and `<EVIDENCE>`.
- System instructions explicitly direct the LLM to treat content inside tags as untrusted data and ignore any embedded command overrides.

## 4. Authoritative Source Hierarchy
VeriVoice accepts health claims ONLY from verified, authoritative health organizations:
1. **World Health Organization (WHO)**
2. **UNICEF Pakistan**
3. **Ministry of National Health Services, Regulations & Coordination (NHSRC Pakistan)**
4. **National Institute of Health (NIH Pakistan)**
5. **Recognized peer-reviewed public health literature**

## 5. Standard Verdict Categories
1. **TRUE**: High-confidence keyword match and alignment with trusted source.
2. **FALSE**: High-confidence keyword match identifying a debunked myth.
3. **MIXED**: Partially true claim requiring nuance or contextual caveats.
4. **UNCERTAIN**: Insufficient evidence, low match score, or contradictory claims.
