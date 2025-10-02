export interface AuditEvent {
    ts: number;
    actor?: string;
    ip?: string;
    action: string;
    resource?: string;
    outcome: "allow" | "deny" | "error";
    reason?: string;
    requestId?: string;
  }
  
  export function auditLog(ev: AuditEvent) {
    console.log(JSON.stringify(ev));
  }
  