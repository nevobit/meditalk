export function redactPII(input: string): string {
    return input.replace(/\b[\w._%+-]+@[\w.-]+\.[a-z]{2,}\b/gi, "[redacted-email]");
  }
  