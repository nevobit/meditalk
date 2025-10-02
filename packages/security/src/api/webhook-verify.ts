import crypto from "crypto";

export function verifyWebhook(secret: string, payload: string, signature: string) {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}