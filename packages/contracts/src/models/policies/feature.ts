export const premiumFlags = {
    advancedAudit: "feature.advanced_audit",
    bulkInvite: "feature.bulk_invite",
    prioritySupport: "feature.priority_support",
    sso: "feature.sso",
} as const;

export type FeatureFlag = keyof typeof premiumFlags;