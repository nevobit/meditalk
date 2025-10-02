import crypto from "crypto";
import { canonicalJson } from "../crypto/canonical-json";

export function verifyHmac(
  secret: string,
  path: string,
  body: unknown,
  timestamp: string,
  signature: string
) {
  const bodyStr = typeof body === "string" ? body : canonicalJson(body ?? {});
  const data = `${path}|${bodyStr}|${timestamp}`;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}