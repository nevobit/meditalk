# Architecture Decisions

This document tracks major architecture decisions for the repo Monorepo.  
Each entry follows the ADR format: **Context → Decision → Consequences**.

---

## ADR-001: Monorepo with pnpm + Turborepo

**Context**  
We manage multiple applications (web, admin, mobile, REST API, GraphQL API) and shared packages (contracts, SDK, UI, domain logic). A polyrepo setup would increase duplication and version drift.

**Decision**  
Adopt a **monorepo** powered by **pnpm workspaces** and **Turborepo** for build orchestration and caching.

**Consequences**

- Single source of truth for dependencies and tooling.
- Faster CI/CD through Turbo caching.
- Larger mdi size; requires discipline with boundaries.

---

## ADR-002: Dependency Management via pnpm Catalogs

**Context**  
Maintaining consistent dependency versions across multiple apps/packages is error-prone.

**Decision**  
Use **pnpm catalogs** (`catalog:` specifiers) to enforce consistent versions of core dependencies (React, Next.js, Vite, TypeScript, Fastify, etc.).

**Consequences**

- Eliminates version drift across workspaces.
- Centralized upgrade path.
- Requires a custom CLI command (`mdi install`) to enforce usage.

---

## ADR-003: Shared Contracts as Source of Truth

**Context**  
APIs (REST, GraphQL, gRPC) and clients (web, mobile, SDK) must stay aligned on types, DTOs, and error codes.

**Decision**  
Create a **`packages/contracts`** library as the **single source of truth** for types, DTOs, and error definitions.

**Consequences**

- Reduces breaking changes between services and clients.
- Enables type-safe SDK and codegen.
- Requires discipline to avoid duplicating contracts in other layers.

---

## ADR-004: Internal Developer CLI

**Context**  
Running `pnpm` or `turbo` commands directly is verbose and inconsistent across projects.

**Decision**  
Provide an **internal CLI** (`mdi` or `mdi`) under `packages/cli` that wraps common commands:

- `install` (dependency management via catalogs)
- `build`, `dev`, `test`, `deploy`
- `sync-env`, `preflight`, `kill-ports`, `gen`

**Consequences**

- Consistent DX for all developers.
- Room for project-specific workflows (codegen, migrations).
- CLI must stay up to date with workspace scripts.

---

## ADR-005: Documentation and Runbooks in repo

**Context**  
Architecture knowledge, error codes, and incident handling are often siloed.

**Decision**  
Include all critical docs (`ARCHITECTURE.md`, `DECISIONS.md`, `OPERATIONS.md`, `ERRORS.md`, `RUNBOOKS/`) inside the repository.

**Consequences**

- Improves onboarding.
- Ensures docs evolve with code.
- Needs ownership to prevent stale docs.

---

## ADR-006: Cloud-Native Infrastructure

**Context**  
Applications are deployed in containerized environments and need reproducible infra definitions.

**Decision**  
Use **Terraform** (`infrastructure/terraform`) for cloud resources and **Kubernetes manifests** (`infrastructure/k8s`) for orchestration.

**Consequences**

- Portable and declarative infra.
- Supports multi-environment deployments.
- Requires infra expertise in the team.

---

## ADR-007: Error Codes and Observability

**Context**  
Unstable error messages across APIs lead to unreliable clients and poor debugging.

**Decision**  
Define **stable error codes** in `packages/contracts/errors.ts` and document them in `ERRORS.md`. APIs must always respond with structured error codes + request IDs.

**Consequences**

- Predictable error handling across clients.
- Easier observability and support.
- Must keep `ERRORS.md` synchronized with code changes.

---

_(This document will evolve. Each ADR should be updated or superseded when decisions change.)_
