# System Architecture

This document provides a high–level overview of the **Monorepo** architecture, its guiding principles, and how the different applications and packages interact with each other.

---

## 1. Guiding Principles

- **Monorepo First**  
  All applications, shared libraries, and developer tooling live in a single repository. This enables consistent tooling, atomic commits, and easier dependency management.

- **Separation of Concerns**  
  Each application and package has a clear responsibility:
  - Applications (`apps/`) focus on delivering business functionality to end-users.
  - Packages (`packages/`) provide reusable building blocks (UI, contracts, data sources, etc.).
  - Tooling (`packages/tools/`, `infrastructure/`) focuses on DX, CI/CD, and deployment.

- **Contracts over Conventions**  
  Shared contracts (types, DTOs, errors, schemas) act as the single source of truth between APIs, SDKs, and clients.

- **Cloud-Native by Design**  
  Applications are designed to run in containers, orchestrated with Kubernetes, and provisioned via Terraform.

---

## 2. Repository Structure

apps/ → Applications (end-user and backend)
├─ web / site → Marketing site or landing page
├─ admin / portal→ Backoffice and internal dashboards
├─ mobile → React Native client application
├─ rest → REST API service (Fastify/Express)
└─ graphql → GraphQL API service

packages/ → Shared libraries and modules
├─ cli → Developer CLI (mdi / mdi)
├─ contracts → Shared contracts, types, error codes
├─ sdk → SDK for external and internal clients
├─ ui → Component library / design system
├─ data-sources → Database clients, external API wrappers
├─ business-logic/domain → Core business rules and services
├─ core-modules → Cross-cutting modules (auth, logging, etc.)
├─ eslint-config → Shared linting configuration
├─ typescript-config → Shared tsconfig presets
└─ tools/scripts → Developer productivity scripts

infrastructure/ → Infra-as-code and deployments
├─ terraform → IaC modules and provisioning
└─ k8s → Kubernetes manifests

lambdas/ → Independent serverless functions
legacy/ → Archived code not in active development
playgrounds/ → Experimental sandboxes (ignored in CI)
templates/ → Project templates and code generators
docs/ → Architecture, decisions, errors, runbooks

---

## 3. Applications

- **Web / Site (Next.js)**  
  Public-facing website and marketing pages. Deployed to Vercel.
- **Portal / Admin (React + Vite)**  
  Internal admin interface for operations and backoffice tasks.
- **Mobile (React Native)**  
  Cross-platform mobile app sharing logic with contracts and SDK.
- **REST API (Fastify)**  
  Core backend, exposing REST endpoints, connected to data sources.
- **GraphQL API (Apollo/Fastify)**  
  GraphQL gateway exposing schemas, using federation or stitched resolvers.

---

## 4. Shared Packages

- **Contracts**  
  Contains types, DTOs, error codes, enums, and API contracts. Acts as the single source of truth for communication across services.

- **SDK**  
  Typed client library for interacting with APIs. Can be published to npm for external usage. Provides adapters (`fetch`, `axios`) and ensures authentication and error handling.

- **UI**  
  Shared component library and design tokens. Enables a consistent design system across web and admin apps.

- **Data Sources**  
  Database connectors (Postgres, Redis, etc.) and wrappers around external APIs.

- **Business Logic / Domain Services**  
  Encapsulates core rules and use cases, independent of UI or persistence.

- **Core Modules**  
  Cross-cutting concerns such as logging, observability, authentication, and configuration.

- **CLI**  
  Internal developer CLI (`mdi` or `mdi`) with commands such as:
  - `install` (dependency management via pnpm catalogs)
  - `build`, `dev`, `test` (turborepo tasks)
  - `sync-env`, `preflight`, `kill-ports`, `gen` (DX helpers)

---

## 5. Infrastructure

- **Terraform (`infrastructure/terraform`)**  
  Manages cloud resources (databases, queues, storage, networking).

- **Kubernetes (`infrastructure/k8s`)**  
  Contains manifests for deploying services to clusters.

- **Docker Compose (`docker-compose.yml`)**  
  Used locally for spinning up dependencies (DBs, queues, etc.).

---

## 6. Documentation

- **ARCHITECTURE.md** → This document.
- **DECISIONS.md** → Architecture decision records (ADR).
- **OPERATIONS.md** → Operational guidelines.
- **ERRORS.md** → Error codes catalog.
- **RUNBOOKS/** → Incident response and troubleshooting guides.
- **SECURITY.md** → Security policy.
- **SUPPORT.md** → How to request support.

---

## 7. Developer Experience

- **pnpm Workspaces**  
  Dependency management with catalogs (`catalog:`) to enforce consistent versions.

- **Turborepo**  
  Task runner with caching and dependency graph execution.

- **CI/CD**  
  GitHub Actions workflows for linting, testing, building, and deploying.

- **Preflight Checks**  
  `pnpm preflight` validates Node, pnpm, Vercel CLI, and AWS CLI before running tasks.

- **Env Management**  
  `pnpm sync-env` ensures `.env.local` is always aligned with `.env.example`.

---

## 8. Future Directions

- Introduce **feature-based domain packages** (`domain-users`, `domain-billing`, etc.).
- Adopt **Biome** for linting/formatting (replace ESLint + Prettier).
- Expand **codegen** workflows (GraphQL + OpenAPI).
- Strengthen **observability** (metrics, tracing, structured logging).
- Progressive migration of legacy code into modern packages.

---

## 9. Summary

The **Monorepo** follows a modular, domain-driven architecture with a strong emphasis on shared contracts, developer experience, and cloud-native deployment. Each application is autonomous but built on top of reusable packages, enabling rapid development, consistent quality, and long-term maintainability.
