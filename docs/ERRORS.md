# Error Codes

This document defines **stable error codes** used across all APIs (REST, GraphQL, gRPC) and SDKs in the repo Monorepo.  
Error codes are **consistent, machine-readable**, and must not change once published.

---

## 1. Error Format

All API errors follow a structured format:

```json
{
  "code": "AUTH_UNAUTHORIZED",
  "message": "Authentication required",
  "details": {
    "requestId": "abc123",
    "path": "/v1/users",
    "context": { "hint": "Provide a valid API key" }
  }
}
```

- **code** → Stable error code (string, uppercase, snake_case).
- **message** → Human-readable explanation (may change).
- **details** → Extra metadata (requestId, path, validation errors, etc.).

---

## 2. Error Categories

### 🔐 Authentication & Authorization

| Code                | HTTP | Description                            |
| ------------------- | ---- | -------------------------------------- |
| `AUTH_UNAUTHORIZED` | 401  | Missing or invalid authentication.     |
| `AUTH_FORBIDDEN`    | 403  | User authenticated but not authorized. |
| `AUTH_EXPIRED`      | 401  | Token/session expired.                 |

---

### 📦 Validation & Input

| Code                       | HTTP | Description                                  |
| -------------------------- | ---- | -------------------------------------------- |
| `VALIDATION_FAILED`        | 400  | One or more input fields are invalid.        |
| `VALIDATION_MISSING_FIELD` | 400  | Required field missing in request payload.   |
| `VALIDATION_TYPE_ERROR`    | 400  | Type mismatch (expected number, got string). |

---

### 🔄 Rate Limiting & Quotas

| Code                    | HTTP | Description                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `RATE_LIMIT_EXCEEDED`   | 429  | Too many requests for this time window.      |
| `QUOTA_EXCEEDED`        | 429  | Monthly/plan quota exceeded.                 |
| `PLAN_UPGRADE_REQUIRED` | 402  | Feature requires a higher subscription plan. |

---

### 💾 Data & Resources

| Code                      | HTTP | Description                        |
| ------------------------- | ---- | ---------------------------------- |
| `RESOURCE_NOT_FOUND`      | 404  | Requested resource does not exist. |
| `RESOURCE_ALREADY_EXISTS` | 409  | Resource conflict (duplicate).     |
| `RESOURCE_LOCKED`         | 423  | Resource locked or not modifiable. |

---

### ⚡ System & Infrastructure

| Code                  | HTTP | Description                             |
| --------------------- | ---- | --------------------------------------- |
| `INTERNAL_ERROR`      | 500  | Unexpected server error.                |
| `SERVICE_UNAVAILABLE` | 503  | Service temporarily unavailable.        |
| `TIMEOUT`             | 504  | Upstream timeout or dependency failure. |
| `DEPENDENCY_FAILED`   | 502  | External dependency returned an error.  |

---

### 🛠️ Developer & SDK

| Code                    | HTTP | Description                                |
| ----------------------- | ---- | ------------------------------------------ |
| `SDK_MISCONFIGURED`     | 400  | SDK missing API key or configuration.      |
| `ENDPOINT_DEPRECATED`   | 410  | Endpoint no longer available.              |
| `FEATURE_FLAG_DISABLED` | 403  | Feature not enabled for current workspace. |

---

## 3. Versioning

- Error codes are **semver-protected**.
- Once published, an error code must **not** be renamed or removed.
- Deprecations must be marked in this file and handled gracefully in clients.

---

## 4. Mapping by Transport

- **REST** → Returned in JSON response body + HTTP status.
- **GraphQL** → Returned in `errors[].extensions.code`.
- **gRPC** → Returned in metadata `error-code` + standard gRPC status.
- **SDK** → Always thrown as `ApiError` with `code` and `details`.

---

## 5. Observability

- Every error includes a **`requestId`** for traceability.
- User-facing apps log `code`, not raw messages.
- Metrics/alerts are tagged by `code` for dashboards (Grafana, Datadog, etc.).

---

## 6. Example Error Responses

### REST

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "You have exceeded your request limit",
  "details": { "limit": 1000, "window": "1h" }
}
```

### GraphQL

```json
{
  "errors": [
    {
      "message": "You are not authorized",
      "path": ["createUser"],
      "extensions": {
        "code": "AUTH_FORBIDDEN",
        "requestId": "xyz789"
      }
    }
  ]
}
```

### gRPC

```
Status: 7 PERMISSION_DENIED
Metadata:
  error-code: AUTH_FORBIDDEN
  request-id: xyz789
```

---

## 7. Error Codes Index

- **AUTH\_\*** → Authentication & authorization.
- **VALIDATION\_\*** → Validation and type errors.
- **RATE*LIMIT*\*** / **QUOTA\_\*** → Throttling and plan limits.
- **RESOURCE\_\*** → Data and resource layer.
- **INTERNAL\_\*** / **SERVICE\_\*** → System failures.
- **SDK\_\*** → SDK and developer-facing errors.
- **FEATURE\_\*** → Feature flag or plan-related.

---

**Maintainers must update this file when introducing new error codes.**
