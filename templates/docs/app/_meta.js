export default {
  index: "Overview",
  "###": {
    type: "separator",
  },
  "####": { type: "separator", title: "Design System" },
  "design-system": {
    title: "Design System",
  },
};

// export default {
//   index: "Overview",
//   "getting-started": "Getting Started",
//   "contributing": "Contributing",
//   "release-notes": "Release Notes",
//   faq: "FAQ",

//   "###": { type: "separator", title: "Design System" },

//   "design-system": {
//     title: "Design System",
//     items: {
//       "page": "Introduction",
//       "foundations": "Foundations",
//       "tokens": "Tokens",
//       "components": "Components",
//       "patterns": "Patterns",
//       "a11y": "Accessibility",
//       "theming": "Theming",
//       "motion": "Motion",
//       "changelog": "DS Changelog"
//     }
//   },

//   "####": { type: "separator", title: "Applications (apps/)" },

//   // Apps
//   "apps": {
//     title: "Applications",
//     items: {
//       "graphql": "GraphQL API (Apollo TS)",
//       "rest": "REST API (Fastify/Express TS)",
//       "portal": "Portal (Next.js)",
//       "site": "Site (Next.js Marketing)",
//       "mobile": "Mobile (React Native)"
//     }
//   },

//   "#####": { type: "separator", title: "Packages (packages/)" },

//   // Packages
//   "packages": {
//     title: "Packages",
//     items: {
//       "business-logic": "Business Logic",
//       "core-modules": "Core Modules",
//       "data-sources": "Data Sources",
//       "contracts": "Contracts & Types",
//       "sdk": "Client SDK",
//       "ui": "UI Shared",
//       "design-system": "Design System (pkg)",
//       "cli": "CLI",
//       "tools": "Dev Tools",
//       "eslint-config": "ESLint Config",
//       "typescript-config": "TypeScript Config",
//       "constant-definitions": "Constant Definitions"
//     }
//   },

//   "######": { type: "separator", title: "Architecture" },

//   // Architecture
//   "architecture": {
//     title: "Architecture",
//     items: {
//       "overview": "Overview",
//       "domain": "Domain & Bounded Contexts",
//       "diagrams": "Diagrams",
//       "decisions": "ADRs",
//       "security-model": "Security Model",
//       "error-handling": "Error Handling",
//       "coding-standards": "Coding Standards"
//     }
//   },

//   "#######": { type: "separator", title: "APIs" },

//   // APIs
//   "api": {
//     title: "APIs",
//     items: {
//       "graphql": "GraphQL",
//       "rest": "REST",
//       "webhooks": "Webhooks",
//       "contracts": "Contracts",
//       "versioning": "API Versioning"
//     }
//   },

//   "########": { type: "separator", title: "Database & Data" },

//   // Database
//   "database": {
//     title: "Database",
//     items: {
//       "schemas-postgres": "Schemas (Postgres)",
//       "migrations": "Migrations",
//       "seed": "Seed & Fixtures",
//       "performance": "Performance & Indexes",
//       "backup-restore": "Backups & Restore"
//     }
//   },

//   "#########": { type: "separator", title: "Infrastructure" },

//   // Infra
//   "infrastructure": {
//     title: "Infrastructure",
//     items: {
//       "overview": "Overview",
//       "aws": "AWS",
//       "k8s": "Kubernetes",
//       "terraform": "Terraform",
//       "docker": "Docker 🐳",
//       "secrets": "Secrets & Key Management",
//       "networking": "Networking"
//     }
//   },

//   "##########": { type: "separator", title: "Lambdas & Jobs" },

//   // Lambdas
//   "lambdas": {
//     title: "Lambdas",
//     items: {
//       "overview": "Overview",
//       "helebba": "Helebba Functions",
//       "common": "Common Utilities",
//       "examples": "Examples & Templates"
//     }
//   },

//   "###########": { type: "separator", title: "CI/CD & Environments" },

//   // CI/CD
//   "ci-cd": {
//     title: "CI/CD",
//     items: {
//       "overview": "Overview",
//       "github-actions": "GitHub Actions",
//       "turbo": "Turborepo Pipelines",
//       "vercel": "Vercel Deployments",
//       "aws-deploy": "AWS Deployments",
//       "release-management": "Release Management"
//     }
//   },

//   // Environments
//   "environments": {
//     title: "Environments",
//     items: {
//       "development": "Development",
//       "staging": "Staging",
//       "production": "Production",
//       "feature-flags": "Feature Flags",
//       "observability-setup": "Observability Setup"
//     }
//   },

//   "############": { type: "separator", title: "Quality & Security" },

//   // Quality
//   "quality": {
//     title: "Quality",
//     items: {
//       "testing": "Testing (Unit/IT/E2E)",
//       "lint-format": "Linting & Formatting",
//       "type-check": "Type Checking",
//       "visual-regression": "Visual Regression"
//     }
//   },

//   // Security
//   "security": {
//     title: "Security",
//     items: {
//       "threat-modeling": "Threat Modeling",
//       "authz-authn": "AuthN/AuthZ",
//       "secrets-policy": "Secrets Policy",
//       "headers": "Security Headers",
//       "vuln-scanning": "Dependency Scanning",
//       "compliance": "Compliance"
//     }
//   },

//   "#############": { type: "separator", title: "Observability & Ops" },

//   // Observability
//   "observability": {
//     title: "Observability",
//     items: {
//       "logging": "Logging",
//       "monitoring": "Monitoring",
//       "tracing": "Tracing",
//       "slo-alerts": "SLOs & Alerts",
//       "dashboards": "Dashboards"
//     }
//   },

//   // Runbooks / Ops
//   "runbooks": {
//     title: "Runbooks",
//     items: {
//       "oncall": "On-call",
//       "incidents": "Incidents",
//       "hotfix": "Hotfix",
//       "playbooks": "Playbooks",
//       "postmortems": "Postmortems"
//     }
//   },

//   "##############": { type: "separator", title: "References" },

//   // Reference & admin
//   "glossary": "Glossary",
//   "roadmap": "Roadmap",
//   "license": "License",

//   // External links (rendered in sidebar)
//   "###############": { type: "separator", title: "External" },
//   "github": { title: "GitHub", href: "https://github.com/repo/repo" },
//   "figma": { title: "Figma", href: "https://www.figma.com/files" },
//   "sentry": { title: "Sentry", href: "https://sentry.io" },
//   "vercel": { title: "Vercel", href: "https://vercel.com" },
//   "aws": { title: "AWS Console", href: "https://console.aws.amazon.com" }
// };

