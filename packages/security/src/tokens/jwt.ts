import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";


export interface IssueJwtOptions extends SignOptions {
  secretOrPrivateKey: string;
  payload: Record<string, unknown>;
}

export function issueJwt(opts: IssueJwtOptions): string {
  const { secretOrPrivateKey, payload, ...signOpts } = opts;

  return jwt.sign(payload, secretOrPrivateKey, {
    algorithm: signOpts.algorithm ?? "HS256",
    expiresIn: signOpts.expiresIn ?? "15m",
    issuer: signOpts.issuer,
    audience: signOpts.audience,
    subject: signOpts.subject,
    keyid: signOpts.keyid,
  });
}

export interface VerifyJwtOptions extends VerifyOptions {
  secretOrPublicKey: string;
  required?: Partial<{
    aud: boolean;
    iss: boolean;
    sub: boolean;
  }>;
}

export type VerifyJwtResult<T = JwtPayload> =
  | { ok: true; payload: T }
  | { ok: false; code: number; type: string; message: string };

export function verifyJwt<T = JwtPayload>(
  token: string,
  opts: VerifyJwtOptions,
): VerifyJwtResult<T> {
  try {
    const payload = jwt.verify(token, opts.secretOrPublicKey, {
      algorithms: opts.algorithms ?? ["HS256", "RS256", "ES256"],
      audience: opts.audience,
      issuer: opts.issuer,
      clockTolerance: opts.clockTolerance ?? 60, 
    }) as T & Record<string, unknown>;

    if (opts.required?.aud && !payload.aud) {
      return { ok: false, code: 401, type: "aud_missing", message: "Token missing 'aud'" };
    }
    if (opts.required?.iss && !payload.iss) {
      return { ok: false, code: 401, type: "iss_missing", message: "Token missing 'iss'" };
    }
    if (opts.required?.sub && !payload.sub) {
      return { ok: false, code: 401, type: "sub_missing", message: "Token missing 'sub'" };
    }

    return { ok: true, payload };
  } catch (err: unknown) {
    const msg =
      (err as Error)?.name === "TokenExpiredError"
        ? "Token expired"
        : (err as Error)?.name === "JsonWebTokenError"
        ? "Invalid token"
        : "Token verification failed";

    return { ok: false, code: 401, type: "jwt_invalid", message: msg };
  }
}
