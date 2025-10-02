import { createRemoteJWKSet, jwtVerify, JWTPayload, JWTVerifyResult } from "jose";

const JWKS_CACHE = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export type VerifyOpts = {
  audience?: string | string[];
  issuer?: string | string[];
  clockTolerance?: number; 
  timeoutMs?: number;     
  cooldownMs?: number;    
};

function getRemoteJwks(jwksUri: string, timeoutMs = 5000, cooldownMs = 60_000) {
  let jwks = JWKS_CACHE.get(jwksUri);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(jwksUri), {
      timeoutDuration: timeoutMs,
      cooldownDuration: cooldownMs,
    });
    JWKS_CACHE.set(jwksUri, jwks);
  }
  return jwks;
}

export function createJwksVerifier(jwksUri: string) {
  return async function verifyJwtWithJwks<T extends JWTPayload>(
    token: string,
    opts: VerifyOpts = {},
  ): Promise<JWTVerifyResult & { payload: T }> {
    const jwks = getRemoteJwks(jwksUri, opts.timeoutMs ?? 5000, opts.cooldownMs ?? 60_000);
    return jwtVerify(token, jwks, {
      algorithms: ["RS256", "RS512", "ES256", "ES512"],
      audience: opts.audience,
      issuer: opts.issuer,
      clockTolerance: opts.clockTolerance ?? 60,
    }) as Promise<JWTVerifyResult & { payload: T }>;
  };
}

export async function verifyJwtWithJwks<T extends JWTPayload>(
  token: string,
  jwksUri: string,
  opts: VerifyOpts = {},
): Promise<JWTVerifyResult & { payload: T }> {
  const jwks = getRemoteJwks(jwksUri, opts.timeoutMs ?? 5000, opts.cooldownMs ?? 60_000);
  return jwtVerify(token, jwks, {
    algorithms: ["RS256", "RS512", "ES256", "ES512"],
    audience: opts.audience,
    issuer: opts.issuer,
    clockTolerance: opts.clockTolerance ?? 60,
  }) as Promise<JWTVerifyResult & { payload: T }>;
}

export function clearJwksCache(jwksUri?: string) {
  if (jwksUri) JWKS_CACHE.delete(jwksUri);
  else JWKS_CACHE.clear();
}