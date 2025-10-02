import { authenticator } from 'otplib';

export function generateSecret() {
  return authenticator.generateSecret();
}

export function generateTOTP(secret: string) {
  return authenticator.generate(secret);
}

export function verifyTOTP(token: string, secret: string) {
  return authenticator.check(token, secret);
}
