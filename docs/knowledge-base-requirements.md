# VeriVoice Health Knowledge Base Requirements & Curation Specification

> **POLICY NOTICE**: VeriVoice operates under **evidence-grounded verification with uncertainty-first behavior**. The core verification engine NEVER fabricates, synthesizes, or invents health claims or medical citations. The production dataset (`knowledge/claims.json`) is initialized empty (`[]`) until authoritative medical evidence is curated and reviewed by medical professionals.

---

## 1. Required Claim Data Schema
Every claim entry in `knowledge/claims.json` MUST strictly conform to the Zod schema defined in `backend/src/models/claimSchema.js` and JSON Schema `knowledge/claims.schema.json`:

```json
{
  "id": "claim-[topic]-[number]",
  "language": "ur",
  "claim": "اردو میں واضح اور مختصر دعویٰ کی حالت",
  "verdict": "TRUE | FALSE | MIXED | UNCERTAIN",
  "explanation": "طبی طور پر درست اور آسان اردو میں مختصر وضاحت",
  "keywords": ["اہم", "اردو", "الفاظ"],
  "sources": [
    {
      "title": "Document or Guideline Title",
      "organization": "Authoritative Organization Name",
      "url": "https://www.who.int/official-guideline-url",
      "accessedAt": "YYYY-MM-DD"
    }
  ]
}
```

---

## 2. Authoritative Source Requirements
All claims MUST be derived from accredited, recognized public health authorities:
1. **World Health Organization (WHO)**
2. **UNICEF Pakistan**
3. **Ministry of National Health Services, Regulations & Coordination (NHSRC Pakistan)**
4. **National Institute of Health (NIH Pakistan)**
5. **Peer-reviewed medical journals** (e.g. The Lancet, BMJ, WHO Bulletins)

### Strictly Prohibited Sources
- ❌ Social media posts, viral WhatsApp messages, or YouTube videos
- ❌ Commercial blogs, news sites without medical citations, or forum posts
- ❌ AI-generated summaries or unverified online Q&A sites

---

## 3. Urdu Translation & Linguistic Review
- **Accuracy**: Claims and explanations must be translated into natural, accessible Urdu (`ur-PK`).
- **Simplicity**: Explanations must be easily understandable when spoken aloud via Text-to-Speech to users with varying literacy levels.
- **Keywords**: Every claim must include 3 to 8 primary Urdu keywords (including normalized character variants) to facilitate accurate keyword retrieval.

---

## 4. Recommended Initial Curation Target
- **Hackathon Demo Target**: 15 to 20 high-frequency public health rumors prevalent in Pakistan (e.g., Polio vaccination myths, Dengue fever remedies, Maternal & Child Health, Infant Nutrition, Routine Immunizations).

---

## 5. Review & Curation Process
1. **Selection**: Identify viral health rumors from field reports or public health monitoring.
2. **Fact-Checking**: Cross-reference claim against WHO/NIH Pakistan official guidelines.
3. **Drafting**: Write standardized Urdu claim, verdict (`TRUE | FALSE | MIXED`), concise explanation, and keywords.
4. **Medical Review**: A licensed medical professional or public health official reviews and signs off on the entry.
5. **JSON Schema Validation**: Run `npm run retrieve -- "<query>"` or schema validator to ensure 100% compliance before committing to `knowledge/claims.json`.

---

## 6. Pre-Commit Validation Checklist
- [ ] Claim ID follows pattern `claim-[category]-[001]`
- [ ] Verdict is exactly one of: `TRUE`, `FALSE`, `MIXED`, `UNCERTAIN`
- [ ] `explanation` is written in clear Urdu without jargon
- [ ] `keywords` list contains normalized Urdu words
- [ ] `sources` array contains at least one valid, active `http://` or `https://` URL
- [ ] Source organization is an accredited health authority
- [ ] Validated against `backend/src/models/claimSchema.js`
