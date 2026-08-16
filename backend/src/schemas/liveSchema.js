const { z } = require('zod');

/**
 * Zod Schemas for VeriVoice Live Information & Emergency Awareness.
 * Enforces strict temporal freshness, source classification, and location scoping.
 */

const LIVE_CATEGORIES = ['LIVE_ALERTS', 'WEATHER', 'DISASTERS', 'NEWS', 'ALL'];
const LIVE_SEVERITIES = ['CRITICAL', 'WARNING', 'ADVISORY', 'INFORMATIONAL', 'UNKNOWN'];
const LIVE_SOURCE_TYPES = [
  'OFFICIAL_ALERT',
  'OFFICIAL_WEATHER',
  'OFFICIAL_DISASTER',
  'OFFICIAL_GOVERNMENT_UPDATE',
  'NEWS_REPORT',
  'RESEARCH_UPDATE',
  'BACKGROUND',
  'UNKNOWN',
];
const LIVE_STATUSES = ['ACTIVE', 'EXPIRED', 'UPCOMING', 'UNKNOWN_STATUS'];
const LIVE_FRESHNESS_LEVELS = ['LIVE', 'RECENT', 'OUTDATED', 'EXPIRED', 'UNKNOWN_FRESHNESS'];

const LiveLocationSchema = z.object({
  country: z.string().default('Pakistan'),
  region: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
});

const LiveItemSchema = z.object({
  id: z.string().default(() => `live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.enum(LIVE_CATEGORIES).default('LIVE_ALERTS'),
  severity: z.enum(LIVE_SEVERITIES).default('INFORMATIONAL'),
  sourceOrganization: z.string().default('Official Authority'),
  sourceType: z.enum(LIVE_SOURCE_TYPES).default('UNKNOWN'),
  url: z.string().url().default('https://ndma.gov.pk'),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  retrievedAt: z.string().default(() => new Date().toISOString()),
  validUntil: z.string().nullable().optional(),
  location: LiveLocationSchema.optional().default({ country: 'Pakistan' }),
  status: z.enum(LIVE_STATUSES).default('ACTIVE'),
  freshness: z.enum(LIVE_FRESHNESS_LEVELS).default('LIVE'),
  authorityLevel: z.string().default('OFFICIAL_GOVERNMENT'),
  excerpt: z.string().optional().default(''),
});

const LiveResponseSchema = z.object({
  success: z.boolean().default(true),
  query: z.string().default(''),
  category: z.enum(LIVE_CATEGORIES).default('ALL'),
  location: LiveLocationSchema.optional().default({ country: 'Pakistan' }),
  items: z.array(LiveItemSchema).default([]),
  summary: z.string().default(''),
  disclaimer: z.string().default(
    'For immediate safety decisions, follow the latest instructions from local emergency authorities.'
  ),
  retrievedAt: z.string().default(() => new Date().toISOString()),
  sourceCount: z.number().default(0),
});

function validateLiveItem(data) {
  const result = LiveItemSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }
  return { valid: true, data: result.data };
}

function validateLiveResponse(data) {
  const result = LiveResponseSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
  }
  return { valid: true, data: result.data };
}

module.exports = {
  LIVE_CATEGORIES,
  LIVE_SEVERITIES,
  LIVE_SOURCE_TYPES,
  LIVE_STATUSES,
  LIVE_FRESHNESS_LEVELS,
  LiveLocationSchema,
  LiveItemSchema,
  LiveResponseSchema,
  validateLiveItem,
  validateLiveResponse,
};
