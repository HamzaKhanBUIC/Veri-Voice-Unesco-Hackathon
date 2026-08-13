const { z } = require('zod');

const sourceSchema = z.object({
  title: z.string().min(1, 'Source title is required'),
  organization: z.string().min(1, 'Source organization is required'),
  url: z.string().url('Source URL must be a valid HTTP/HTTPS URL'),
  accessedAt: z.string().optional(),
});

const claimSchema = z.object({
  id: z.string().min(1, 'Claim ID is required'),
  language: z.string().default('ur'),
  claim: z.string().min(1, 'Claim text is required'),
  verdict: z.enum(['TRUE', 'FALSE', 'MIXED', 'UNCERTAIN'], {
    errorMap: () => ({ message: 'Verdict must be one of: TRUE, FALSE, MIXED, UNCERTAIN' }),
  }),
  explanation: z.string().min(1, 'Explanation is required'),
  keywords: z.array(z.string().min(1)).min(1, 'At least one keyword is required'),
  sources: z.array(sourceSchema).min(1, 'At least one source citation is required'),
});

const claimsDatasetSchema = z.array(claimSchema);

/**
 * Validates a single claim object against the schema.
 * @param {object} data 
 * @returns {{ valid: boolean, data?: object, errors?: string[] }}
 */
function validateClaim(data) {
  const result = claimSchema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { valid: false, errors: formattedErrors };
  }
  return { valid: true, data: result.data };
}

/**
 * Validates an entire claims dataset array.
 * @param {array} dataset 
 * @returns {{ valid: boolean, data?: array, errors?: string[] }}
 */
function validateClaimsDataset(dataset) {
  const result = claimsDatasetSchema.safeParse(dataset);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { valid: false, errors: formattedErrors };
  }
  return { valid: true, data: result.data };
}

module.exports = {
  sourceSchema,
  claimSchema,
  claimsDatasetSchema,
  validateClaim,
  validateClaimsDataset,
};
