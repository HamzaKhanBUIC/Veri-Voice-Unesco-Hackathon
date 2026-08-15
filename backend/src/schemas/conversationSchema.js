const { z } = require('zod');

const EvidenceReferenceSchema = z.object({
  claimId: z.string().min(1).max(120),
  sourceTitle: z.string().min(1).max(300),
  organization: z.string().min(1).max(200).optional().default('Verified Source'),
  url: z.string().url().max(500),
  authorityLevel: z.enum([
    'PRIMARY_AUTHORITY',
    'SECONDARY_AUTHORITY',
    'REPUTABLE_NEWS',
    'GENERAL_WEB',
    'UNKNOWN',
  ]).optional().default('GENERAL_WEB'),
  statement: z.string().max(800).optional(),
  excerpt: z.string().max(800).optional(),
});

const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().min(1).max(1500),
  verdict: z.enum(['TRUE', 'FALSE', 'MIXED', 'UNCERTAIN', 'RESEARCH_RESPONSE']).optional(),
  timestamp: z.number().optional(),
});

const ConversationContextSchema = z.object({
  sessionId: z.string().min(1).max(64).optional(),
  turnCount: z.number().int().min(0).max(50).optional().default(0),
  history: z.array(ConversationTurnSchema).max(10).optional().default([]),
  activeEvidence: z.array(EvidenceReferenceSchema).max(8).optional().default([]),
  activeClaim: z.string().max(600).optional(),
  targetLanguage: z.string().max(16).optional(),
  voiceMode: z.boolean().optional().default(false),
});

function validateConversationContext(context) {
  if (!context) return { valid: true, data: null };
  const result = ConversationContextSchema.safeParse(context);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      data: null,
    };
  }
  return { valid: true, data: result.data, errors: [] };
}

module.exports = {
  EvidenceReferenceSchema,
  ConversationTurnSchema,
  ConversationContextSchema,
  validateConversationContext,
};
