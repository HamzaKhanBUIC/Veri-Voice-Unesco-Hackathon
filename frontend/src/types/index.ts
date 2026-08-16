/**
 * VeriVoice TypeScript Domain Models & API Schemas
 */

export type VerdictType = 'TRUE' | 'FALSE' | 'MIXED' | 'UNCERTAIN' | 'RESEARCH_RESPONSE';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type EvidenceStrength =
  | 'STRONG_EVIDENCE'
  | 'SUFFICIENT_EVIDENCE'
  | 'WEAK_EVIDENCE'
  | 'NO_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'INFRASTRUCTURE_FAILURE';

export type AuthorityLevel =
  | 'PRIMARY_INSTITUTIONAL'
  | 'PRIMARY_SCIENTIFIC_DATA'
  | 'OFFICIAL_GOVERNMENT'
  | 'SCIENTIFIC_REVIEW'
  | 'FACT_CHECKING_ORGANIZATION'
  | 'RESEARCH_NETWORK'
  | 'SECONDARY_REPUTABLE'
  | 'CITIZEN_SCIENCE'
  | 'PRIMARY_AUTHORITY'
  | 'SECONDARY_AUTHORITY'
  | 'REPUTABLE_NEWS'
  | 'GENERAL_WEB'
  | 'UNKNOWN';

export interface EvidenceItem {
  claimId: string;
  sourceTitle: string;
  organization?: string;
  url: string;
  authorityLevel?: AuthorityLevel;
  statement?: string;
  excerpt?: string;
  publicationDate?: string;
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  verdict?: VerdictType;
  timestamp?: number;
}

export interface ConversationContext {
  sessionId?: string;
  turnCount?: number;
  history?: ConversationTurn[];
  activeEvidence?: EvidenceItem[];
  activeClaim?: string;
  targetLanguage?: string;
  voiceMode?: boolean;
}

export interface ConversationMeta {
  sessionId?: string;
  turnCount?: number;
  activeClaim?: string | null;
  activeEvidenceCount?: number;
  inputLanguage?: string;
  responseLanguage?: string;
  isExpired?: boolean;
  intent?: string;
  evidenceReused?: boolean;
}

export interface VerificationResponse {
  success: boolean;
  transcript?: string;
  userClaim?: string;
  verdict: VerdictType;
  confidence: string | number;
  explanation: string;
  audioUrl?: string | null;
  evidence: EvidenceItem[];
  languageMetadata?: {
    detectedLanguage: string;
    targetLanguage: string;
    originalText: string;
  };
  domain?: string;
  mode?: 'VERIFICATION' | 'GENERAL_RESEARCH' | 'LIVE';
  timing?: {
    sttMs?: number;
    verifMs?: number;
    ttsMs?: number;
    totalMs?: number;
  };
  conversation?: ConversationMeta;
  error?: string;
}

export type VerifyResponse = VerificationResponse;

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'CHECKING' | 'RESPONDING' | 'ERROR';

export type AppView = 'landing' | 'talk' | 'chat' | 'live' | 'methodology' | 'privacy';

export type DomainCategory =
  | 'ALL'
  | 'HEALTH'
  | 'WEATHER_CLIMATE'
  | 'AI_DISINFORMATION'
  | 'SCIENCE'
  | 'EARTH_SPACE'
  | 'DISASTER'
  | 'BIODIVERSITY'
  | 'EDUCATION'
  | 'GENERAL';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
  voice: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  verdict?: VerdictType;
  confidence?: string | number;
  explanation?: string;
  evidence?: EvidenceItem[];
  audioUrl?: string | null;
  isAudioInput?: boolean;
  isError?: boolean;
  mode?: 'VERIFICATION' | 'GENERAL_RESEARCH' | 'LIVE';
}

// Live Information & Emergency Awareness Types
export type LiveCategory = 'LIVE_ALERTS' | 'WEATHER' | 'DISASTERS' | 'NEWS' | 'ALL';
export type LiveSeverity = 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFORMATIONAL' | 'UNKNOWN';
export type LiveSourceType =
  | 'OFFICIAL_ALERT'
  | 'OFFICIAL_WEATHER'
  | 'OFFICIAL_DISASTER'
  | 'OFFICIAL_GOVERNMENT_UPDATE'
  | 'NEWS_REPORT'
  | 'RESEARCH_UPDATE'
  | 'BACKGROUND'
  | 'UNKNOWN';

export interface LiveLocation {
  country: string;
  region?: string | null;
  city?: string | null;
  district?: string | null;
}

export interface LiveItem {
  id: string;
  title: string;
  summary: string;
  category: LiveCategory;
  severity: LiveSeverity;
  sourceOrganization: string;
  sourceType: LiveSourceType;
  url: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  retrievedAt: string;
  validUntil?: string | null;
  location?: LiveLocation;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'UNKNOWN_STATUS';
  freshness: 'LIVE' | 'RECENT' | 'OUTDATED' | 'EXPIRED' | 'UNKNOWN_FRESHNESS';
  authorityLevel?: string;
  excerpt?: string;
}

export interface LiveResponse {
  success: boolean;
  query: string;
  category: LiveCategory;
  location: LiveLocation;
  items: LiveItem[];
  summary: string;
  disclaimer: string;
  retrievedAt: string;
  sourceCount: number;
}
