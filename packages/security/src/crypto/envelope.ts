import crypto from "crypto";

export function encrypt(secret: Buffer, data: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", secret, iv);
  const enc = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, enc, tag };
}

export function decrypt(secret: Buffer, payload: { iv: Buffer; enc: Buffer; tag: Buffer }) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", secret, payload.iv);
  decipher.setAuthTag(payload.tag);
  const dec = Buffer.concat([decipher.update(payload.enc), decipher.final()]);
  return dec.toString("utf8");
}
