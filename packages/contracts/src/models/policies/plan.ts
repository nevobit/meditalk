export type Plan = "free" | "pro" | "enterprise";

export interface PlanLimits {
    maxUsers: number;
    maxProjects?: number;
    requestsPerMinute?: number;
}