export type SubscriptionTier = "free" | "plus" | "business" | "enterprise";

export interface TierFeatures {
  meetingsPerMonth: number | null;
  transcriptHistoryDays: number | null;
  unlimitedSessionLength: boolean;
  basicSearch: boolean;
  emailSupport: boolean;
  priorityEmailSupport: boolean;
  pdfTextExport: boolean;
  basicIntegrations: boolean;
  advancedAiSummaries: boolean;
  sentimentAnalysis: boolean;
  customVocabulary: boolean;
  analyticsDashboard: boolean;
  teamWorkspaces: boolean;
  sharedMeetingLibraries: boolean;
  realtimeCollaboration: boolean;
  premiumIntegrations: boolean;
  calendarSync: boolean;
  customBranding: boolean;
  zeroDataRetention: boolean;
  privateAiDeployment: boolean;
  ssoSaml: boolean;
  advancedSecurityControls: boolean;
  auditLog: boolean;
  scimProvisioning: boolean;
  dedicatedSuccessManager: boolean;
  slaGuarantee: boolean;
  customIntegrationsApi: boolean;
}

export interface TierDefinition {
  tier: SubscriptionTier;
  label: string;
  rank: number;
  features: TierFeatures;
}

const FREE_FEATURES: TierFeatures = {
  meetingsPerMonth: 5,
  transcriptHistoryDays: 7,
  unlimitedSessionLength: false,
  basicSearch: true,
  emailSupport: true,
  priorityEmailSupport: false,
  pdfTextExport: false,
  basicIntegrations: false,
  advancedAiSummaries: false,
  sentimentAnalysis: false,
  customVocabulary: false,
  analyticsDashboard: false,
  teamWorkspaces: false,
  sharedMeetingLibraries: false,
  realtimeCollaboration: false,
  premiumIntegrations: false,
  calendarSync: false,
  customBranding: false,
  zeroDataRetention: false,
  privateAiDeployment: false,
  ssoSaml: false,
  advancedSecurityControls: false,
  auditLog: false,
  scimProvisioning: false,
  dedicatedSuccessManager: false,
  slaGuarantee: false,
  customIntegrationsApi: false,
};

const PLUS_FEATURES: TierFeatures = {
  ...FREE_FEATURES,
  meetingsPerMonth: 50,
  transcriptHistoryDays: 60,
  unlimitedSessionLength: true,
  pdfTextExport: true,
  basicIntegrations: true,
  priorityEmailSupport: true,
};

const BUSINESS_FEATURES: TierFeatures = {
  ...PLUS_FEATURES,
  meetingsPerMonth: null,
  transcriptHistoryDays: null,
  advancedAiSummaries: true,
  sentimentAnalysis: true,
  customVocabulary: true,
  analyticsDashboard: true,
  teamWorkspaces: true,
  sharedMeetingLibraries: true,
  realtimeCollaboration: true,
  premiumIntegrations: true,
  calendarSync: true,
  customBranding: true,
};

const ENTERPRISE_FEATURES: TierFeatures = {
  ...BUSINESS_FEATURES,
  zeroDataRetention: true,
  privateAiDeployment: true,
  ssoSaml: true,
  advancedSecurityControls: true,
  auditLog: true,
  scimProvisioning: true,
  dedicatedSuccessManager: true,
  slaGuarantee: true,
  customIntegrationsApi: true,
};

export const TIER_DEFINITIONS: Record<SubscriptionTier, TierDefinition> = {
  free: { tier: "free", label: "Free", rank: 0, features: FREE_FEATURES },
  plus: { tier: "plus", label: "Plus", rank: 1, features: PLUS_FEATURES },
  business: { tier: "business", label: "Business", rank: 2, features: BUSINESS_FEATURES },
  enterprise: { tier: "enterprise", label: "Enterprise", rank: 3, features: ENTERPRISE_FEATURES },
};

export function normalizeTier(value?: string | null): SubscriptionTier {
  const normalized = (value ?? "").toLowerCase().trim();
  if (normalized === "premium") return "plus";
  if (normalized in TIER_DEFINITIONS) return normalized as SubscriptionTier;
  return "free";
}

export function getTierDefinition(tier: SubscriptionTier): TierDefinition {
  return TIER_DEFINITIONS[tier];
}

export function isTierAtLeast(current: SubscriptionTier, minimum: SubscriptionTier): boolean {
  return TIER_DEFINITIONS[current].rank >= TIER_DEFINITIONS[minimum].rank;
}
