import crypto from "crypto";

export function issueCsrf(secret: string, sessionId: string) {
  return crypto.createHmac("sha256", secret).update(sessionId).digest("hex");
}

export function verifyCsrf(secret: string, sessionId: string, token: string) {
  const expected = issueCsrf(secret, sessionId);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
