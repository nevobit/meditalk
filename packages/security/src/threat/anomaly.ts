export interface AnomalyEvent {
    userId?: string;
    ip?: string;
    ua?: string;
    score: number;
    reason: string;
  }
  
  export function detectAnomaly(ev: AnomalyEvent): boolean {
    return ev.score > 0.8;
  }
  