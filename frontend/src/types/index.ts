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
  sessionId: string;
  turnCount: number;
  intent: string;
  evidenceReused: boolean;
  responseLanguage?: string;
}

export interface VerifyResponse {
  success: boolean;
  userClaim: string;
  verdict: VerdictType;
  confidence: number | string;
  explanation: string;
  evidence: EvidenceItem[];
  retrievalMatchesCount?: number;
  audioUrl?: string | null;
  conversation?: ConversationMeta;
  timing?: {
    sttMs: number;
    retrievalMs: number;
    verificationMs: number;
    ttsMs: number;
    totalMs: number;
    totalSeconds: string;
  };
  providers?: {
    stt: string;
    llm: string;
    tts: string;
  };
  error?: string;
}

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'CHECKING' | 'RESPONDING' | 'ERROR';

export type AppView = 'landing' | 'talk' | 'chat' | 'methodology';

export type DomainCategory = 'ALL' | 'HEALTH' | 'EARTH_SPACE' | 'WEATHER_CLIMATE' | 'DISASTER' | 'SCIENCE' | 'EDUCATION';

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
  mode?: 'VERIFICATION' | 'GENERAL_RESEARCH';
}
