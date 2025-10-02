import crypto from "crypto";

export function hmacSha256(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}