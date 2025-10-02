import type { Plan, PlanLimits } from "@mdi/contracts";

export const planLimits: Record<Plan, PlanLimits> = {
  free: {
    maxUsers: 5,
    maxProjects: 1,
    requestsPerMinute: 60,
  },
  pro: {
    maxUsers: 100,
    maxProjects: 10,
    requestsPerMinute: 1000,
  },
  enterprise: {
    maxUsers: Infinity,
    maxProjects: Infinity,
    requestsPerMinute: Infinity,
  },
};

export const canAddUser = (plan: Plan, currentCount: number): boolean =>
  currentCount < planLimits[plan].maxUsers;

export const assertCanAddUser = (plan: Plan, currentCount: number): void => {
  if (!canAddUser(plan, currentCount)) {
    const e = new Error(`User quota exceeded for plan '${plan}'`);
    (e as Error & { code: string }).code = "PLAN_USER_LIMIT_EXCEEDED";
    throw e;
  }
};
