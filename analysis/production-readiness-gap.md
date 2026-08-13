# Production Readiness Gap Analysis

## 1. Remaining Requirements Before `claims.json` Population

Before any candidate item can safely enter the production knowledge base (`knowledge/claims.json`), the following **15 mandatory steps** must be executed:

1. **Human Candidate Approval**: Medical expert must select and sign off on candidates in `analysis/human-review-packet.md`.
2. **Medical Context Validation**: Medical reviewer must define explicit boundary caveats for all 11 `MIXED_CLAIM` items.
3. **Provenance Confirmation**: Cross-reference 11 `DATASET_SUMMARY` items against primary WHO/PAHO publication PDFs.
4. **Duplicate Resolution**: Consolidate overlapping candidates in Vaccine Safety and Dengue groups.
5. **English Source Text Finalization**: Lock down approved English claim statements and explanations.
6. **Urdu Translation**: Perform professional human translation from English to clear, natural Urdu (`ur-PK`).
7. **Medical Terminology Review**: Ensure medical terms (e.g., *immunization*, *adverse events*, *larval source management*) are translated with clinical precision in Urdu.
8. **Spoken Urdu Adaptation**: Simplify Urdu wording so it is natural and accessible when rendered via Text-to-Speech audio.
9. **Medical Sign-Off on Urdu Content**: Medical reviewer approves the final Urdu claims and explanations.
10. **Zod Schema Validation**: Validate Urdu payload against `backend/src/models/claimSchema.js`.
11. **Keyword Extraction & Token Normalization**: Extract 3 to 8 Urdu keywords per claim and test with `textUtils.js`.
12. **Evidence URL Verification**: Test all source URLs to guarantee 100% active HTTP/HTTPS links.
13. **Deterministic Retrieval Validation**: Run `npm run retrieve -- "<query>"` to verify top ranking for each candidate.
14. **Production Import Sign-Off**: Lead Architect approves commit of validated items into `knowledge/claims.json`.
15. **Full System Integration Test**: Execute `npm test` to confirm zero system regressions.
