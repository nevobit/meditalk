import type { FeatureFlag } from "@mdi/contracts";

export const planFeatures: Record<"free" | "pro" | "enterprise", FeatureFlag[]> = {
    free: [],
    pro: ["advancedAudit", "bulkInvite"],
    enterprise: ["advancedAudit", "bulkInvite", "prioritySupport", "sso"],
};

export const hasFeature = (plan: "free" | "pro" | "enterprise", feature: FeatureFlag): boolean =>
    planFeatures[plan].includes(feature);
