const { z } = require('zod');

const verdictEvidenceSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  sourceTitle: z.string().default('Authoritative Source'),
  organization: z.string().default('Health Authority'),
  url: z.string().url('Evidence URL must be a valid HTTP/HTTPS URL').or(z.literal('')),
});

const verdictSchema = z.object({
  verdict: z.enum(['TRUE', 'FALSE', 'MIXED', 'UNCERTAIN', 'RESEARCH_RESPONSE'], {
    errorMap: () => ({ message: 'Verdict must be one of: TRUE, FALSE, MIXED, UNCERTAIN, RESEARCH_RESPONSE' }),
  }),
  confidence: z.number().min(0.0).max(1.0, 'Confidence must be between 0.0 and 1.0'),
  explanation: z.string().min(1, 'Explanation string is required'),
  evidence: z.array(verdictEvidenceSchema).default([]),
  reason: z.string().default('EVIDENCE_GROUNDED'),
});

/**
 * Validates a verification result payload against the strict Zod verdict schema.
 * @param {object} data 
 * @returns {{ valid: boolean, data?: object, errors?: string[] }}
 */
function validateVerdict(data) {
  const result = verdictSchema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { valid: false, errors: formattedErrors };
  }
  return { valid: true, data: result.data };
}

module.exports = {
  verdictEvidenceSchema,
  verdictSchema,
  validateVerdict,
};
