export interface Subject {
    id: string;
    roles: string[];
    attrs?: Record<string, unknown>;
  }
  
  export interface Resource {
    id: string;
    type: string;
    ownerId?: string;
    attrs?: Record<string, unknown>;
  }
  
  export type Action = "read" | "write" | "delete" | "update";
  
  export type Policy = (sub: Subject, act: Action, res: Resource) => boolean;
  
  const policies: Policy[] = [];
  
  export function registerPolicy(p: Policy) {
    policies.push(p);
  }
  
  export function authorize(sub: Subject, act: Action, res: Resource): boolean {
    return policies.some((p) => p(sub, act, res));
  }
  