<a id="top"></a>

<div align="center">

# AssetFlow

### Enterprise Asset & Resource Management Platform

**A multi-tenant system for tracking assets, people, reservations, maintenance, audits, and the operational work around them.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Better%20Auth](https://img.shields.io/badge/Auth-Better%20Auth-6B46C1)](https://www.better-auth.com/)
[![BullMQ](https://img.shields.io/badge/Queues-BullMQ-DB4437)](https://bullmq.io/)
[![Redis](https://img.shields.io/badge/Redis-Required-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Deployment%20ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![License](https://img.shields.io/badge/License-MIT-16A34A)](#license)
[![Version](https://img.shields.io/badge/Version-0.1.0-blue)](#release-status)
[![Status](https://img.shields.io/badge/Status-Active%20development-F59E0B)](#release-status)

`Multi-tenant` · `RBAC` · `Asset lifecycle` · `Background jobs` · `Auditable operations`

</div>

<a id="release-status"></a>

| Release channel | Version | Status | Intended use |
| :-- | :-- | :-- | :-- |
| `main` / current workspace | `0.1.0` | Active development | Local development, integration, and contributor feedback. |

> [!IMPORTANT]
> AssetFlow is under active development. The data model and API surface are extensive; some product areas and third-party delivery channels remain work in progress. Read **Implemented** and **Planned** labels literally.

---

## Product tour

<table>
  <tr>
    <td width="50%"><strong>Dashboard</strong><br><sub>Insert a dashboard overview screenshot at <code>docs/images/dashboard.png</code>.</sub><br><br><img src="docs/images/dashboard.png" alt="Placeholder for AssetFlow dashboard screenshot" /></td>
    <td width="50%"><strong>Organization setup</strong><br><sub>Insert an organization setup screenshot at <code>docs/images/organization-setup.png</code>.</sub><br><br><img src="docs/images/organization-setup.png" alt="Placeholder for organization setup screenshot" /></td>
  </tr>
  <tr>
    <td><strong>Assets</strong><br><sub>Insert an asset catalogue screenshot at <code>docs/images/assets.png</code>.</sub><br><br><img src="docs/images/assets.png" alt="Placeholder for assets screenshot" /></td>
    <td><strong>Booking</strong><br><sub>Insert a booking workflow screenshot at <code>docs/images/bookings.png</code>.</sub><br><br><img src="docs/images/bookings.png" alt="Placeholder for bookings screenshot" /></td>
  </tr>
  <tr>
    <td><strong>Maintenance</strong><br><sub>Insert a maintenance queue screenshot at <code>docs/images/maintenance.png</code>.</sub><br><br><img src="docs/images/maintenance.png" alt="Placeholder for maintenance screenshot" /></td>
    <td><strong>Audit</strong><br><sub>Insert an audit-cycle screenshot at <code>docs/images/audits.png</code>.</sub><br><br><img src="docs/images/audits.png" alt="Placeholder for audits screenshot" /></td>
  </tr>
  <tr>
    <td><strong>Reports</strong><br><sub>Insert a reporting screenshot at <code>docs/images/reports.png</code>.</sub><br><br><img src="docs/images/reports.png" alt="Placeholder for reports screenshot" /></td>
    <td><strong>Notifications</strong><br><sub>Insert a notification centre screenshot at <code>docs/images/notifications.png</code>.</sub><br><br><img src="docs/images/notifications.png" alt="Placeholder for notifications screenshot" /></td>
  </tr>
  <tr>
    <td colspan="2"><strong>Worker dashboard</strong><br><sub>Insert worker health and queue metrics at <code>docs/images/worker-dashboard.png</code>.</sub><br><br><img src="docs/images/worker-dashboard.png" alt="Placeholder for worker dashboard screenshot" /></td>
  </tr>
</table>

> [!NOTE]
> These are intentional image placeholders. Add the image files at the stated paths and GitHub will render them automatically.

---

## Table of contents

- [About](#about)
- [Capabilities](#capabilities)
- [Technology](#technology)
- [Monorepo architecture](#monorepo-architecture)
- [System architecture](#system-architecture)
- [Authentication and authorization](#authentication-and-authorization)
- [Multi-tenant model](#multi-tenant-model)
- [Background worker](#background-worker)
- [Notifications](#notifications)
- [Repository layout](#repository-layout)
- [Database](#database)
- [Product modules](#product-modules)
- [API architecture](#api-architecture)
- [Configuration](#configuration)
- [Getting started](#getting-started)
- [Docker](#docker)
- [Development commands](#development-commands)
- [Operational workflow](#operational-workflow)
- [Security](#security)
- [Testing](#testing)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Useful links](#useful-links)

---

## About

Organizations rarely lack asset data; they lack a reliable operating system around it. Spreadsheets, inbox approvals, local calendars, and disconnected maintenance records make it difficult to answer basic questions: *who has this asset, is it available, when was it last verified, and what happens next?*

AssetFlow brings those workflows into one tenant-aware platform. It is designed for operations teams that need a source of truth for physical equipment, shared resources, teams, locations, and the approvals that connect them.

### Why AssetFlow exists

| Business problem | AssetFlow response |
| :-- | :-- |
| Asset ownership is unclear | Allocation, return, and transfer records preserve lifecycle context. |
| Shared resources are double-booked | Bookings model time windows, status, and the requesting employee. |
| Maintenance work disappears in email | Requests, comments, priority, status, and attachments are modelled explicitly. |
| Audits are slow and inconsistent | Audit cycles and per-asset verification results support a repeatable process. |
| Tenant data can leak across teams | Organization IDs and membership-aware access form the core tenancy boundary. |

### Built for

- Enterprise operations and facilities teams.
- IT asset management teams.
- Finance and procurement teams tracking equipment lifecycle.
- Department leaders who manage people, inventory, and approvals.
- Auditors who need traceability rather than point-in-time exports.

### Design goals

1. **Tenant-aware by default** — organization ownership is represented across operational records.
2. **Lifecycle-first** — assets move through allocation, transfer, booking, maintenance, and audit states.
3. **Operationally resilient** — long-running and notification work belongs on queues.
4. **Composable services** — web, API, worker, database, auth, and UI packages evolve independently.
5. **Auditable decisions** — activity logs and approval records capture important actions.

---

## Capabilities

Legend: 🟢 implemented in the repository · 🟡 represented in schema/API or in progress · ⚪ planned.

| Domain | Capability | Status | What it provides |
| :-- | :-- | :--: | :-- |
| Identity | Email and password authentication | 🟢 | Better Auth with Prisma adapter and password-reset mail hook. |
| Identity | Session context | 🟢 | Sessions include an active organization field. |
| Organizations | Organizations and subscriptions | 🟢 | Tenant records with optional subscription linkage and settings. |
| Organizations | Departments and locations | 🟢 | Hierarchical structure and location models. |
| People | Employees and invites | 🟢 | Employee profiles, roles, organization memberships, and invites. |
| Assets | Asset catalogue | 🟢 | Categories, serials, vendors, purchases, condition, value, and media relations. |
| Assets | Asset allocation | 🟢 | Assign, return, overdue, and cancellation lifecycle fields. |
| Assets | Transfer workflow | 🟢 | Requested and approved transfers between employees. |
| Assets | QR metadata | 🟢 | A one-to-one QR code model for assets. |
| Resources | Bookings | 🟢 | Time-bounded requests for shared or bookable assets. |
| Maintenance | Maintenance requests | 🟢 | Priority, assignment, comments, attachments, and status lifecycle. |
| Audit | Audit cycles | 🟢 | Asset-level verification results and scoped audit cycles. |
| Governance | Approvals | 🟢 | Allocation, return, and maintenance approval-request types. |
| Governance | Activity logs | 🟢 | Entity/action/metadata event trail. |
| Notifications | In-app notifications | 🟢 | Tenant- and user-scoped notification records. |
| Notifications | Email delivery | 🟢 | Worker has Nodemailer and configurable SMTP/SES settings. |
| Notifications | Slack delivery | 🟡 | Webhook configuration is validated; delivery integration is a future completion item. |
| Automation | BullMQ queues | 🟢 | Notification, maintenance, audit, and booking queues/processors. |
| Automation | Scheduled jobs | 🟢 | Cron registry can be enabled through configuration. |
| Governance | RBAC | 🟢 | Roles, permissions, memberships, and protected API middleware. |
| Experience | Web dashboard | 🟢 | Next.js application with React Query, Tailwind, and theme support. |
| Experience | Mobile client | 🟡 | Expo application workspace is present. |
| API | REST endpoints | 🟢 | Versioned Express API routes across the operational domains. |
| Experience | Search and analytics | 🟡 | Dashboard routes and data model exist; advanced search/analytics are evolving. |
| Intelligence | AI modules | ⚪ | Reserved for future, tenant-safe operational assistance. |

<details>
<summary><strong>Asset lifecycle at a glance</strong></summary>

```mermaid
stateDiagram-v2
  [*] --> AVAILABLE
  AVAILABLE --> ALLOCATED: allocation approved
  ALLOCATED --> AVAILABLE: returned
  AVAILABLE --> RESERVED: booking accepted
  RESERVED --> AVAILABLE: booking completed/cancelled
  AVAILABLE --> UNDER_MAINTENANCE: maintenance opened
  UNDER_MAINTENANCE --> AVAILABLE: maintenance resolved
  AVAILABLE --> IN_AUDIT: audit started
  IN_AUDIT --> AVAILABLE: audit completed
  AVAILABLE --> LOST
  AVAILABLE --> DAMAGED
  AVAILABLE --> RETIRED
  AVAILABLE --> DISPOSED
```

</details>

---

## Technology

| Layer | Technology | Purpose |
| :-- | :-- | :-- |
| Frontend | Next.js 16, React 19 | Web application and server-rendered UI. |
| Mobile | Expo / React Native | Mobile workspace for AssetFlow clients. |
| Backend | Node.js, Express | Versioned REST API and business workflows. |
| Database | PostgreSQL | Durable relational tenant and asset data. |
| ORM | Prisma 6 | Type-safe schema, client, and database workflows. |
| Authentication | Better Auth | Password authentication, sessions, and Prisma persistence. |
| Queue | BullMQ | Durable background job orchestration. |
| Cache / broker | Redis, ioredis | BullMQ connectivity and transient operational state. |
| Worker | Node.js, BullMQ, Pino | Queue consumers, cron registry, logs, and graceful shutdown. |
| Notifications | Nodemailer, SMTP / SES settings | Email delivery plumbing. |
| Storage | Amazon S3 SDK | API-side upload and presigned-object integration. |
| Styling | Tailwind CSS, CSS Modules | Responsive web styling. |
| UI library | `@repo/ui`, Lucide | Shared primitives and interface icons. |
| Data fetching | TanStack React Query | Query caching and client synchronization. |
| Charts | — | No charting package is currently declared. |
| Maps | — | No mapping provider is currently declared. |
| Deployment | Docker-compatible services | Container deployment target; compose files are not yet committed. |
| Package manager | npm workspaces | Monorepo dependency management (`npm@10.9.2`). |
| Build orchestration | Turborepo | Task execution and workspace pipelines. |
| Testing | Vitest | Worker unit, integration, cron, queue, and performance suites. |

> [!TIP]
> Use `npm`, not `pnpm`, for this repository today. The root manifest declares npm workspaces and `npm@10.9.2`.

---

## Monorepo architecture

```text
assetflow-odoo/
├── apps/
│   ├── api/                  # Express REST API
│   ├── web/                  # Next.js web application
│   ├── worker/               # BullMQ workers and cron registry
│   ├── app/                  # Expo mobile application
│   └── docs/                 # Next.js documentation application
├── packages/
│   ├── auth/                 # Better Auth configuration and mail hook
│   ├── db/                   # Prisma schema and database client
│   ├── ui/                   # Shared React UI components
│   ├── typescript-config/    # Shared TypeScript configurations
│   └── eslint-config/        # Shared ESLint configurations
├── turbo.json                 # Turborepo pipeline configuration
├── package.json               # npm workspaces root manifest
└── README.md                  # This guide
```

| Workspace | Responsibility | Key entry points |
| :-- | :-- | :-- |
| `apps/api` | HTTP boundary, auth mounting, controllers, route modules, error middleware | `src/index.ts`, `src/app.ts`, `src/routes/` |
| `apps/web` | Web UI, route pages, React Query providers, typed service clients | `app/`, `components/`, `services/` |
| `apps/worker` | Queue registration, job processors, cron jobs, email/notification work | `src/index.ts`, `src/queues/`, `src/processors/` |
| `apps/app` | Expo-powered mobile client | `src/app/`, `src/components/` |
| `apps/docs` | Standalone Next.js documentation site | `app/` |
| `packages/auth` | Shared Better Auth instance and password-reset sender | `src/index.ts` |
| `packages/db` | Prisma schema, generated client target, database export | `prisma/schema.prisma`, `src/index.ts` |
| `packages/ui` | Reusable interface components | `src/button.tsx`, `src/card.tsx`, `src/navbar.tsx` |
| `packages/typescript-config` | Base, Next.js, and React library compiler configurations | `*.json` |
| `packages/eslint-config` | Shared lint rules for base, Next.js, and React packages | `*.js` |

---

## System architecture

```mermaid
flowchart LR
  U["User"] --> W["Next.js web app"]
  U --> M["Expo mobile app"]
  W --> A["Express API /api/v1"]
  M --> A
  A --> AU["Better Auth"]
  AU --> P[("PostgreSQL")]
  A --> P
  A --> R[("Redis")]
  A --> S["S3-compatible object storage"]
  R --> Q["BullMQ queues"]
  Q --> K["AssetFlow worker"]
  K --> P
  K --> E["SMTP / SES"]
  K -. future provider .-> L["Slack"]
```

### Service responsibilities

| Service | Owns | Does not own |
| :-- | :-- | :-- |
| Web | Human-facing UI, client queries, interaction state | Tenant authorization decisions or durable job execution. |
| API | Request validation, authorization, data mutation, queue publication | Long-running notification delivery. |
| Worker | Asynchronous jobs, schedules, delivery attempts, shutdown safety | Synchronous browser responses. |
| PostgreSQL | Source-of-truth relational records | Queue scheduling or ephemeral job state. |
| Redis | BullMQ queue transport and processing coordination | Long-term business records. |

### Core request path

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant Web as Next.js web
  participant API as Express API
  participant DB as PostgreSQL
  participant Redis
  participant Worker
  User->>Web: Submit asset operation
  Web->>API: Authenticated REST request
  API->>API: Validate input and authorize tenant role
  API->>DB: Commit tenant-scoped mutation
  API->>Redis: Enqueue follow-up work when required
  API-->>Web: Structured HTTP response
  Redis->>Worker: Deliver BullMQ job
  Worker->>DB: Read/update operational data
  Worker-->>User: Deliver notification through configured channel
```

---

## Authentication and authorization

AssetFlow configures Better Auth with the Prisma adapter. Email/password sign-in is enabled, password resets are handed to the shared mailer hook, and sessions include an optional `activeOrganizationId`.

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web client
  participant A as API / Better Auth
  participant D as PostgreSQL
  U->>W: Enter credentials
  W->>A: POST /api/v1/auth/*
  A->>D: Verify account and create session
  D-->>A: User, memberships, session
  A-->>W: Session cookie / session response
  W->>A: Tenant-scoped API request
  A->>D: Resolve session and active organization
  A->>A: Apply membership, role, permission checks
  A-->>W: Allowed response or authorization error
```

### Authorization model

| Concept | Meaning |
| :-- | :-- |
| User | Global identity with optional default organization and role fields. |
| Organization member | Join model linking one user to one organization and one role. |
| Role | Tenant-owned role; system role types include admin, asset manager, auditor, technician, and more. |
| Permission | Named capability such as `asset:create` or `maintenance:approve`. |
| Session | Authenticated session that can reference an active organization. |

> [!CAUTION]
> An authenticated user is not automatically authorized for every tenant resource. New API handlers must resolve the active organization and enforce membership and permission checks before querying or mutating tenant-owned data.

### Password reset

The Better Auth configuration invokes `sendPasswordResetEmail` from `@repo/auth`. Configure a working SMTP provider for a usable reset flow; local development can substitute a safe test SMTP service.

---

## Multi-tenant model

An organization is the primary tenancy boundary. Operational entities such as assets, bookings, maintenance requests, audit cycles, notifications, and activity logs carry an `organizationId` and database indexes designed for tenant-scoped access.

```mermaid
erDiagram
  ORGANIZATION ||--o{ ORGANIZATION_MEMBER : has
  USER ||--o{ ORGANIZATION_MEMBER : joins
  ROLE ||--o{ ORGANIZATION_MEMBER : grants
  ORGANIZATION ||--o{ ASSET : owns
  ORGANIZATION ||--o{ BOOKING : records
  ORGANIZATION ||--o{ MAINTENANCE_REQUEST : tracks
  ORGANIZATION ||--o{ AUDIT_CYCLE : conducts
  ORGANIZATION ||--|| SETTINGS : configures
  USER ||--o{ SESSION : creates
  SESSION }o--|| ORGANIZATION : active_tenant
```

### Tenant rules

1. A user may be a member of multiple organizations.
2. Each membership has a tenant-specific role.
3. One session may select an active organization.
4. Tenant-owned requests should derive scope from trusted session context, not a browser-provided organization ID alone.
5. Prisma relations and composite unique constraints prevent several cross-tenant naming collisions, but application-layer authorization remains mandatory.

### Active organization workflow

```mermaid
flowchart TD
  A["Authenticated user"] --> B{"Session has active organization?"}
  B -- No --> C["Select a valid membership"]
  C --> D["Persist activeOrganizationId in session"]
  B -- Yes --> E["Load membership and role"]
  D --> E
  E --> F{"Permission granted?"}
  F -- Yes --> G["Run tenant-scoped operation"]
  F -- No --> H["Return authorization failure"]
```

---

## Background worker

The worker is a separate Node.js process. It starts registered queue consumers, optionally registers cron schedules, performs an initial health check, and attaches graceful-shutdown handlers before accepting work.

### Queues and processors

| Queue | Processor purpose | Default concurrency |
| :-- | :-- | :--: |
| Notification | Deliver notification jobs | 10 |
| Maintenance | Process maintenance-related asynchronous work | 5 |
| Audit | Process audit-related asynchronous work | 2 |
| Booking | Process booking-related asynchronous work | 5 |

The defaults above come from the worker environment schema and can be overridden per deployment.

```mermaid
flowchart TD
  API["API transaction"] --> Q["BullMQ queue registry"]
  Q --> R[("Redis")]
  R --> N["Notification processor"]
  R --> M["Maintenance processor"]
  R --> A["Audit processor"]
  R --> B["Booking processor"]
  C["Cron registry"] --> Q
  N --> SMTP["SMTP/SES"]
  M --> DB[("PostgreSQL")]
  A --> DB
  B --> DB
```

### Operating characteristics

- **Queue namespace:** controlled with `QUEUE_PREFIX`, default `assetflow`.
- **Schedules:** controlled with `CRON_ENABLED`, default `true`.
- **Retries:** BullMQ job retry policy belongs in queue/job definitions; configure it deliberately for each side effect.
- **Dead-letter handling:** establish a failed-job inspection/replay policy before production launch. A dedicated dead-letter queue is not documented as implemented in this revision.
- **Graceful shutdown:** worker startup registers shutdown handling so consumers can stop safely when the process receives termination signals.
- **Observability:** Pino logs and an initial worker/Redis health check are included.

<details>
<summary><strong>Recommended retry policy</strong></summary>

| Job class | Attempts | Backoff | Idempotency key |
| :-- | :--: | :-- | :-- |
| Email | 5 | Exponential, capped | Notification ID + channel |
| Webhook | 8 | Exponential with jitter | Delivery ID |
| Maintenance transition | 3 | Short fixed delay | Maintenance request ID + transition |
| Audit reminder | 3 | Exponential | Audit cycle + recipient + date |

Treat this as an operational recommendation, not a claim about current queue defaults.

</details>

---

## Notifications

AssetFlow stores in-app notifications as tenant- and user-scoped records. The worker includes Nodemailer and configuration support for SES-style SMTP, generic SMTP, and Gmail SMTP fallback values. Slack configuration is validated, while the delivery adapter remains an integration to complete.

```mermaid
flowchart LR
  E["Domain event"] --> A["API"]
  A --> D[("PostgreSQL notification")]
  A --> Q["Notification queue"]
  Q --> W["Worker"]
  W --> I["In-app record"]
  W --> M["Email: SMTP / SES"]
  W -. future .-> S["Slack webhook"]
  W -. future .-> P["Additional providers"]
```

### Channel contract

| Channel | State | Operational notes |
| :-- | :-- | :-- |
| In-app | Implemented | Read/unread state is stored on notification records. |
| Email | Implemented plumbing | Requires a valid configured SMTP provider and sender address. |
| Slack | Planned completion | `SLACK_WEBHOOK_URL` is supported by environment validation. |
| SMS | Future | Twilio-related variables are recognized by the worker environment schema. |
| Push | Future | Mobile push provider and token lifecycle are not yet part of the documented implementation. |

---

## Repository layout

```text
apps/api/src/
├── config/                    # Environment loading and API configuration
├── controllers/               # Domain request handlers
├── middleware/                # Authentication and error handling
├── routes/                    # Versioned REST route modules
├── services/                  # Queue and media-upload services
├── utils/                     # Activity-log helpers
├── app.ts                     # Express app setup
└── index.ts                   # API process entry point

apps/worker/src/
├── config/                    # Zod-validated environment
├── constants/                 # Queue and job names
├── cron/                      # Scheduled job registry
├── lib/                       # Redis client
├── logger/                    # Pino logger
├── processors/                # BullMQ worker handlers
├── queues/                    # Queue definitions and registry
├── types/                     # Job contracts
├── utils/                     # Metrics and shutdown handling
└── index.ts                   # Worker bootstrap

packages/db/
├── prisma/schema.prisma       # PostgreSQL data model
├── src/index.ts               # Shared database export
└── prisma.config.ts           # Prisma configuration
```

| Directory | Why it matters |
| :-- | :-- |
| `apps/api/src/routes` | Route composition makes HTTP boundaries discoverable by domain. |
| `apps/api/src/controllers` | Controllers keep route definitions thin and domain actions explicit. |
| `apps/api/src/middleware` | Central point for authentication and error behavior. |
| `apps/worker/src/queues` | Queue names, producers, and registration live together. |
| `apps/worker/src/processors` | Background side effects are separated by job domain. |
| `packages/db/prisma` | Canonical schema for the business domain. |
| `packages/auth` | One shared auth configuration for server-side consumers. |
| `apps/web/services` | Typed browser-to-API integration boundary. |

---

## Database

Prisma defines a PostgreSQL schema that models tenant structure, asset lifecycle, operational activity, and authentication persistence. Run generated-client and schema commands from the root workspace using npm workspaces.

### Important tables

| Table / model | Responsibility | Key tenant relationship |
| :-- | :-- | :-- |
| `User` | Global identity and account profile | Optional default organization and role; memberships define tenant access. |
| `Organization` | Tenant root | Owns operational records, roles, settings, subscriptions, and memberships. |
| `OrganizationMember` | Membership join | Unique by organization/user; ties a user to a role. |
| `Department` | Organization structure | Unique name per organization; supports parent/child hierarchy. |
| `Employee` | Employee profile | Links a user to organization, department, and allocations. |
| `Asset` | Physical resource record | Scoped to organization; references category, department, location, vendor, purchase. |
| `Allocation` | Assignment history | Links one asset and employee within an organization. |
| `TransferRequest` | Movement between employees | Tracks requester, approver, source, destination, and state. |
| `Booking` | Shared-resource reservations | Indexed by asset and time window. |
| `MaintenanceRequest` | Service work lifecycle | Tracks priority, assignment, discussion, and attachments. |
| `AuditCycle` / `AuditItem` | Verification process | A cycle contains per-asset audit results. |
| `Notification` | In-app communication | Scoped to organization and recipient. |
| `ActivityLog` | Immutable-style action history | Stores entity, action, actor, and optional JSON metadata. |
| `ApprovalRequest` | Controlled decisions | Supports allocation, return, and maintenance approvals. |

### Relationship map

```mermaid
erDiagram
  ORGANIZATION ||--o{ DEPARTMENT : contains
  ORGANIZATION ||--o{ EMPLOYEE : employs
  ORGANIZATION ||--o{ ASSET : owns
  ASSET_CATEGORY ||--o{ ASSET : classifies
  EMPLOYEE ||--o{ ALLOCATION : receives
  ASSET ||--o{ ALLOCATION : assigned_as
  EMPLOYEE ||--o{ BOOKING : requests
  ASSET ||--o{ BOOKING : reserved_as
  ASSET ||--o{ MAINTENANCE_REQUEST : services
  AUDIT_CYCLE ||--o{ AUDIT_ITEM : includes
  ASSET ||--o{ AUDIT_ITEM : verified_in
  USER ||--o{ NOTIFICATION : receives
```

### Schema workflows

```bash
# Generate the Prisma client
npm run generate --workspace=@repo/db

# Push the declared schema to a development database
npm run db:push --workspace=@repo/db

# Open Prisma Studio
npm run db:studio --workspace=@repo/db
```

> [!WARNING]
> `prisma db push` is useful during development but is not a substitute for reviewed, repeatable production migrations. Establish a migration workflow before production deployment.

---

## Product modules

### Organization setup

**Purpose:** establish the tenant, its settings, internal structure, locations, roles, and membership model.

**Workflow:** create organization → configure settings → create roles/permissions → add departments and locations → invite or associate employees.

**Features:** organization metadata, subscription link, settings, departments, locations, invites, membership roles.

**Future scope:** provisioning templates, SSO, SCIM, custom role-policy UI, and organization export.

### Assets

**Purpose:** make every physical resource discoverable with ownership, state, financial context, and attachments.

**Workflow:** define category/vendor/purchase → register asset → attach media/documents → track current status and condition.

**Features:** tenant-scoped asset codes, categories, serial numbers, locations, values, warranty dates, images, documents, QR-code relation.

**Future scope:** barcode scanning flows, depreciation schedules, bulk import validation, and lifecycle policy templates.

### Allocation

**Purpose:** record custody of individually assigned assets.

**Workflow:** submit allocation → optional approval → assign to employee → monitor expected return → record return condition and notes.

**Features:** allocation status, expected/actual return dates, allocator link, return condition, transfer requests, approval records.

**Future scope:** digital handover receipts, e-signatures, recurring attestation, and hardware refresh triggers.

### Booking

**Purpose:** coordinate access to shared equipment and resources.

**Workflow:** request a time window → validate availability → approve → activate → complete or cancel.

**Features:** booking status, employee/asset references, purpose, indexed start/end window, background booking processor.

**Future scope:** calendar sync, conflict suggestions, check-in/out, recurring bookings, and capacity rules.

### Maintenance

**Purpose:** turn defects and scheduled service into a traceable operational process.

**Workflow:** raise request → approve/assign → work in progress → resolve → close; discuss via comments and attachments.

**Features:** priority, state machine, requester/assignee/approver links, comments, attachments, maintenance queue processor.

**Future scope:** vendor SLAs, preventive-maintenance plans, estimated costs, inventory parts, and technician mobile workflow.

### Audit

**Purpose:** prove the location and condition of assets at a defined point in time.

**Workflow:** create cycle → scope by department/location → assign auditor → verify items → record discrepancies → close cycle.

**Features:** audit status, assigned auditor, time bounds, item result, condition, remarks, audit queue processor.

**Future scope:** offline scanner, reconciliation proposals, audit evidence media, and recurring audit templates.

### Reports

**Purpose:** expose operational signals for managers and finance teams.

**Workflow:** dashboard request → tenant-scoped aggregation → present current status and drill-down pathways.

**Features:** dashboard API route and a web application foundation for data views.

**Future scope:** scheduled exports, saved reports, chart library integration, compliance packs, and warehouse/BI connectors.

### Notifications

**Purpose:** let the right people know when action is required without making synchronous requests slow.

**Workflow:** domain event → notification record/job → worker delivery attempt → channel status and recipient experience.

**Features:** in-app records, worker notification processor, SMTP configuration, email library.

**Future scope:** Slack adapter, SMS, mobile push, delivery analytics, preferences, quiet hours, and templates.

---

## API architecture

The API is an Express service with a versioned base path. Better Auth uses `/api/v1/auth`; domain routes are composed under the same API surface. Route modules cover organizations, people, master data, assets, lifecycle workflows, dashboards, notifications, and approvals.

### Route domains

| Domain | Route prefix |
| :-- | :-- |
| Health | `/health` |
| Media | `/media` |
| Organizations | `/organizations` |
| Departments / locations | `/departments`, `/locations` |
| Employees / roles / invites | `/employees`, `/roles`, `/invites` |
| Categories / vendors / purchases | `/categories`, `/vendors`, `/purchases` |
| Assets | `/assets` |
| Allocation / transfer / booking | `/allocations`, `/transfers`, `/bookings` |
| Maintenance / audits / approvals | `/maintenance`, `/audits`, `/approval-requests` |
| Dashboard / notifications / activity | `/dashboard`, `/notifications`, `/activity-logs` |

### API principles

| Concern | Standard |
| :-- | :-- |
| REST | Use resource-oriented paths and appropriate HTTP verbs/status codes. |
| Validation | Validate untrusted input at the HTTP boundary before business operations. |
| RBAC | Verify session, active organization, membership, and permission for protected operations. |
| Tenant isolation | Filter tenant-owned queries by a trusted organization scope. |
| Errors | Centralize error translation through the API error middleware; avoid leaking internals. |
| Responses | Keep response shape stable, typed, and documented alongside client service contracts. |
| Side effects | Commit core data before publishing asynchronous jobs where workflow semantics require it. |

### Suggested response envelope

The repository should settle on a single response contract as its API matures. A useful shape is:

```json
{
  "data": {
    "id": "asset_123",
    "name": "Conference projector"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

And a safe error shape:

```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "The requested asset was not found."
  }
}
```

> [!NOTE]
> The two envelopes are recommended public-contract shapes, not a claim that every existing endpoint already emits them.

---

## Configuration

Create a root `.env` for local service configuration. The API searches several sensible root/current-working-directory locations; the worker loads its process environment and validates it with Zod.

| Variable | Description | Required | Default |
| :-- | :-- | :--: | :-- |
| `NODE_ENV` | Runtime environment | No | `development` |
| `PORT` | API listener port | No | `5001` |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma | Yes | — |
| `BETTER_AUTH_SECRET` | Secret for Better Auth | Yes in deployed environments | — |
| `BETTER_AUTH_URL` | Canonical API/auth URL | Yes in deployed environments | `http://localhost:5001` |
| `CORS_ORIGIN` / `CORS_ORIGINS` | Comma-separated allowed origins | Yes in deployed environments | Local development origins |
| `NEXT_PUBLIC_API_BASE_URL` | Browser-facing API base URL | Yes for web deployment | — |
| `S3_REGION` | AWS region for media integration | For S3 uploads | — |
| `S3_BUCKET_NAME` | Object storage bucket | For S3 uploads | — |
| `S3_ACCESS_KEY_ID` | Storage access key | For S3 uploads | — |
| `S3_SECRET_ACCESS_KEY` | Storage secret | For S3 uploads | — |
| `S3_PUBLIC_BASE_URL` | Optional public media base URL | No | — |
| `REDIS_HOST` | Redis hostname | No | `127.0.0.1` |
| `REDIS_PORT` | Redis port | No | `6379` |
| `REDIS_PASSWORD` | Redis password | No | empty |
| `REDIS_DB` | Redis database index | No | `0` |
| `REDIS_USE_TLS` | Use TLS for Redis | No | `false` |
| `QUEUE_PREFIX` | BullMQ namespace | No | `assetflow` |
| `CRON_ENABLED` | Register cron schedules | No | `true` |
| `CONCURRENCY_NOTIFICATION` | Notification worker concurrency | No | `10` |
| `CONCURRENCY_MAINTENANCE` | Maintenance worker concurrency | No | `5` |
| `CONCURRENCY_AUDIT` | Audit worker concurrency | No | `2` |
| `CONCURRENCY_BOOKING` | Booking worker concurrency | No | `5` |
| `SMTP_FROM_EMAIL` | Sender email address | No | `noreply@assetflow.com` |
| `SES_SMTP_HOST` | SES-compatible SMTP host | For SES delivery | — |
| `SES_SMTP_PORT` | SES-compatible SMTP port | For SES delivery | — |
| `SES_SMTP_USER` / `SES_SMTP_PASS` | SES SMTP credentials | For SES delivery | — |
| `SMTP_HOST` / `SMTP_PORT` | Generic SMTP host/port fallback | For generic SMTP | — |
| `SMTP_USER` / `SMTP_PASS` | Generic SMTP credentials | For generic SMTP | — |
| `GMAIL_SMTP_HOST` | Gmail SMTP host | No | `smtp.gmail.com` |
| `GMAIL_SMTP_PORT` | Gmail SMTP port | No | `587` |
| `GMAIL_SMTP_USER` / `GMAIL_SMTP_PASS` | Gmail SMTP credentials | For Gmail delivery | — |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | No | — |

### Local `.env` template

```dotenv
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/assetflow"
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:5001"
CORS_ORIGINS="http://localhost:3000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:5001/api/v1"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_PREFIX=assetflow
CRON_ENABLED=true
SMTP_FROM_EMAIL="noreply@example.test"
```

> [!CAUTION]
> Never commit real database URLs, cloud access keys, SMTP passwords, webhook URLs, or auth secrets. If credentials have been committed anywhere, revoke/rotate them and move development configuration to an ignored `.env` file immediately.

---

## Getting started

### Prerequisites

| Requirement | Recommended version | Verify |
| :-- | :-- | :-- |
| Node.js | 18 or newer | `node --version` |
| npm | 10.9.2 or compatible | `npm --version` |
| PostgreSQL | Current supported release | `psql --version` |
| Redis | Current supported release | `redis-server --version` |
| Git | Current | `git --version` |

### 1. Clone

```bash
git clone <your-repository-url>
cd assetflow-odoo
```

### 2. Install workspace dependencies

```bash
npm install
```

### 3. Configure local environment

Create a root `.env` using the [template](#local-env-template), then supply a running PostgreSQL database and Redis instance.

```bash
# PowerShell example
Copy-Item .env.example .env
```

> [!NOTE]
> This repository does not currently include a committed `.env.example`; create one from the template above if your team wants a checked-in, secret-free starting point.

### 4. Prepare the database

```bash
npm run generate --workspace=@repo/db
npm run db:push --workspace=@repo/db
```

### 5. Start the API

```bash
npm run dev --workspace=api
```

The API defaults to <kbd>5001</kbd> unless `PORT` is set.

### 6. Start the web application

```bash
npm run dev --workspace=web
```

The web application defaults to <kbd>3000</kbd>.

### 7. Start the worker

```bash
npm run dev --workspace=worker
```

### 8. Start all development tasks

```bash
npm run dev
```

Turborepo runs the defined workspace `dev` tasks. Keep API, web, and worker logs visible in separate terminal panes when diagnosing a workflow.

### First-run checklist

- [ ] PostgreSQL connection succeeds.
- [ ] Prisma client is generated.
- [ ] Redis is reachable from the worker.
- [ ] API health route responds.
- [ ] Web app points at the intended API base URL.
- [ ] Better Auth origin and URL values match the local browser origin.
- [ ] SMTP credentials are safe test credentials or notifications are disabled for local work.

---

## Docker

AssetFlow’s services are designed to be containerized, but this revision does **not** include committed `Dockerfile` or `compose.yaml` files. Do not run `docker compose up` expecting this repository alone to succeed yet.

### Target compose topology

```mermaid
flowchart LR
  WEB["web :3000"] --> API["api :5001"]
  API --> PG[("postgres")]
  API --> REDIS[("redis")]
  WORKER["worker"] --> REDIS
  WORKER --> PG
  API --> S3["object storage"]
```

### Recommended compose services

| Service | Image / build | Required dependencies | Public port |
| :-- | :-- | :-- | :-- |
| `postgres` | Official PostgreSQL image | Persistent volume | `5432` for local debugging only |
| `redis` | Official Redis image | Persistent volume as needed | `6379` for local debugging only |
| `api` | Node build for `apps/api` | `postgres`, `redis` | `5001` |
| `worker` | Node build for `apps/worker` | `postgres`, `redis` | None |
| `web` | Next.js build for `apps/web` | `api` | `3000` |

### Deployment order

1. Provision PostgreSQL and Redis.
2. Supply production secrets through the platform secret manager.
3. Run Prisma client generation and an approved migration procedure.
4. Deploy the API and verify its health endpoint.
5. Deploy the worker and confirm Redis connectivity and registered processors.
6. Deploy the web app with the correct public API base URL.
7. Configure object storage and email provider credentials.

> [!TIP]
> When adding compose support, include health checks, non-root containers, immutable image tags, a `.env.example`, and a production override rather than putting production secrets in a compose file.

---

## Development commands

### Root workspace

| Command | Description |
| :-- | :-- |
| `npm install` | Install root and workspace dependencies. |
| `npm run dev` | Run Turborepo development tasks. |
| `npm run build` | Run all workspace build tasks through Turborepo. |
| `npm run lint` | Run workspace lint tasks. |
| `npm run check-types` | Run workspace TypeScript checks. |
| `npm run format` | Format TypeScript, TSX, and Markdown with Prettier. |

### API workspace

| Command | Description |
| :-- | :-- |
| `npm run dev --workspace=api` | Run API with Nodemon. |
| `npm run build --workspace=api` | Compile API TypeScript. |
| `npm run start --workspace=api` | Start API through `tsx`. |
| `npm run lint --workspace=api` | Lint API source. |
| `npm run check-types --workspace=api` | Type-check API source. |

### Web workspace

| Command | Description |
| :-- | :-- |
| `npm run dev --workspace=web` | Start Next.js dev server on port 3000. |
| `npm run build --workspace=web` | Create production Next.js build. |
| `npm run start --workspace=web` | Start production Next.js server. |
| `npm run lint --workspace=web` | Lint web source. |
| `npm run check-types --workspace=web` | Generate Next types and run TypeScript. |

### Worker workspace

| Command | Description |
| :-- | :-- |
| `npm run dev --workspace=worker` | Watch and run worker source. |
| `npm run build --workspace=worker` | Compile worker TypeScript. |
| `npm run start --workspace=worker` | Run compiled worker. |
| `npm run test --workspace=worker` | Run the worker test suite. |
| `npm run test:unit --workspace=worker` | Run queue, processor, service, and cron tests. |
| `npm run test:integration --workspace=worker` | Run integration tests. |
| `npm run test:coverage --workspace=worker` | Produce V8 coverage. |
| `npm run test:performance --workspace=worker` | Run worker performance tests. |

### Database workspace

| Command | Description |
| :-- | :-- |
| `npm run generate --workspace=@repo/db` | Generate Prisma client. |
| `npm run db:push --workspace=@repo/db` | Synchronize development schema. |
| `npm run db:studio --workspace=@repo/db` | Open Prisma Studio. |

---

## Operational workflow

```mermaid
flowchart LR
  DEV["Developer"] --> WEB["Web or mobile client"]
  WEB --> API["API validates + authorizes"]
  API --> DB["Persist tenant-scoped change"]
  API --> QUEUE["Publish async job"]
  QUEUE --> WORKER["Worker processes"]
  WORKER --> NOTIFY["Notification channel"]
  WORKER --> DB
```

### Example: approved asset allocation

1. A permitted user submits an allocation request for an asset and employee.
2. The API resolves the active tenant, validates input, and verifies permissions.
3. The allocation/approval state is saved in PostgreSQL.
4. A queue job may notify the requester or recipient outside the HTTP response.
5. The worker delivers email/in-app communication according to configured channel behavior.
6. The activity trail provides a basis for later review.

### Useful development rhythm

```text
edit → type-check → lint → focused test → manual API/UI verification → commit
```

Use <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop each local process gracefully. For worker behavior, prefer focused worker tests before exercising a full end-to-end flow.

---

## Security

Security is a system property, not a middleware checkbox. AssetFlow’s current foundation includes Better Auth, roles/permissions models, protected API middleware, tenant-owned data models, CORS configuration, and environment validation in the worker.

| Control | Current posture | Production expectation |
| :-- | :-- | :-- |
| Authentication | Better Auth email/password and sessions | Enforce secure cookies, secret rotation, and safe reset delivery. |
| Authorization | Roles, permissions, memberships, protected routes | Test every sensitive route for both allowed and denied paths. |
| Tenant isolation | Organization IDs and memberships in schema | Scope every database query by trusted tenant context. |
| Validation | Worker Zod configuration validation | Add/maintain request-schema validation at all API boundaries. |
| CORS | Configurable allow-list | Use exact production origins; never use a wildcard for credentialed requests. |
| Rate limiting | Not documented as implemented | Add edge/API rate limits for auth and mutating endpoints. |
| Helmet | Not documented as implemented | Add Helmet or equivalent response-header policy to Express. |
| Secrets | Environment-driven configuration | Use a secret manager and rotate exposed values immediately. |
| Storage | S3 integration is present | Use scoped IAM, signed URLs, content validation, and private buckets by default. |
| Logs | Pino worker logging | Redact secrets, session identifiers, credentials, and sensitive user content. |

### Security review checklist

- [ ] No credentials, API keys, or connection strings are tracked by Git.
- [ ] Auth secrets are long, random, and rotated on compromise.
- [ ] Every tenant-facing query has an organization scope.
- [ ] Permission checks cover read, write, approve, export, and administrative actions.
- [ ] Uploads have size, type, ownership, and malware-scanning policy.
- [ ] Login and reset endpoints have rate limiting and abuse monitoring.
- [ ] CORS origins match deployed web origins exactly.
- [ ] Production uses TLS for public traffic and Redis when required by the provider.

---

## Testing

The worker workspace contains Vitest configuration and focused coverage across queues, processors, notification services, cron behavior, Redis/SMTP integrations, and performance-oriented tests.

| Test layer | Objective | Current entry point |
| :-- | :-- | :-- |
| Unit | Isolate queue, processor, service, and cron logic | `npm run test:unit --workspace=worker` |
| Integration | Exercise service dependencies and worker paths | `npm run test:integration --workspace=worker` |
| Worker | Validate end-to-end worker boot/processing behavior | `npm run test:worker --workspace=worker` |
| Queue | Verify queue behavior/contracts | `npm run test:queues --workspace=worker` |
| Notification | Verify notification service behavior | `npm run test:notifications --workspace=worker` |
| Cron | Verify scheduled registration/behavior | `npm run test:cron --workspace=worker` |
| Performance | Guard job-processing characteristics | `npm run test:performance --workspace=worker` |
| Coverage | Measure exercised worker code | `npm run test:coverage --workspace=worker` |

### Testing conventions

1. Unit-test pure transformation and policy logic first.
2. Use test Redis/SMTP resources for integration tests—never production credentials.
3. Test idempotency, retry behavior, and failure paths for every side-effecting job.
4. Add API contract tests for authorization and organization isolation as route behavior expands.
5. Treat coverage as a signal, not a substitute for meaningful assertions.

```bash
# Run the full available worker suite
npm run test --workspace=worker

# Watch focused tests while changing a processor
npm run test:watch --workspace=worker
```

---

## Performance

AssetFlow separates request/response work from asynchronous processing so browser actions do not wait on notification delivery or other long-running side effects.

| Technique | Role in AssetFlow | Guardrail |
| :-- | :-- | :-- |
| Redis | BullMQ transport and worker coordination | Do not treat Redis as the source of truth for asset lifecycle data. |
| Queue processing | Moves long-running work off request paths | Make jobs idempotent and observable. |
| React Query | Web client query caching and synchronization | Invalidate precisely after mutations. |
| Optimistic updates | Appropriate for reversible UI interactions | Reconcile failures with server state and clear user messaging. |
| Lazy loading | Useful for heavy routes and data views | Measure bundle and route performance before adding complexity. |
| Database indexes | Present across tenant IDs and common lifecycle filters | Inspect query plans for new high-volume access paths. |
| Pagination | Recommended for catalogue/activity endpoints | Avoid unbounded list responses. |
| Object storage | Keeps binary media out of relational tables | Use presigned uploads and content constraints. |

### Performance targets to define before launch

- API p95 latency for common list/detail/mutation requests.
- Queue wait time and job completion p95 by queue name.
- Failed-job rate and retry exhaustion rate.
- PostgreSQL connection, slow-query, and index-use metrics.
- Web Core Web Vitals for dashboard and asset catalogue routes.

---

## Roadmap

This roadmap distinguishes current foundations from upcoming product work. It is not a release commitment.

### Platform foundation

- [x] npm workspaces and Turborepo setup
- [x] Prisma/PostgreSQL multi-tenant schema
- [x] Better Auth configuration with session organization context
- [x] Express route domains and protected middleware foundation
- [x] BullMQ worker, Redis configuration, cron registry, graceful shutdown
- [x] Next.js web application workspace
- [x] Expo mobile application workspace

### Product workflows

- [x] Organizations, memberships, roles, and departments data model
- [x] Asset catalogue, categories, vendors, purchases, and media relations
- [x] Allocation, transfer, booking, maintenance, audit, and approvals data model
- [x] In-app notification data model and worker notification foundation
- [ ] Complete end-to-end organization onboarding UX
- [ ] Complete production-ready asset lifecycle UI
- [ ] Add calendar-grade booking conflict and recurring-booking UX
- [ ] Add maintenance planning, SLAs, and cost tracking
- [ ] Add audit scanner and reconciliation experience
- [ ] Deliver report exports and saved analytics views

### Integrations and intelligence

- [ ] Complete Slack notification delivery adapter
- [ ] Add mobile push notification delivery
- [ ] Add Postman collection and versioned OpenAPI reference
- [ ] Add Dockerfiles and Docker Compose local stack
- [ ] Add production migration and release automation
- [ ] Add SSO / SCIM capabilities
- [ ] Add AI assistant modules with strict tenant boundaries and auditability
- [ ] Add mobile app production workflows

---

## Contributing

Contributions are welcome when they improve correctness, security, operability, or the product experience.

### Before you begin

1. Search existing issues and discussions for related work.
2. For substantial behavior changes, open an issue describing the user problem, scope, and acceptance criteria.
3. Keep a change narrow: avoid mixing formatting churn, refactors, and feature work in one pull request.
4. Never include production credentials, personal data, or generated secret-bearing files.

### Local contribution flow

```bash
git checkout -b codex/meaningful-change
npm install
npm run check-types
npm run lint
npm run test --workspace=worker
```

### Pull request checklist

- [ ] The change has a clear user or operational outcome.
- [ ] Types, linting, and relevant tests pass locally.
- [ ] New APIs enforce authentication, permission, and tenant scope.
- [ ] Database changes account for production migration and rollback.
- [ ] Queue jobs have idempotency and retry/failure behavior considered.
- [ ] User-facing changes include screenshots or a concise walkthrough.
- [ ] Documentation and environment-variable tables are updated.
- [ ] No secrets or unrelated generated files are included.

### Commit guidance

Prefer focused, imperative commits:

```text
feat(bookings): prevent overlapping reservations
fix(worker): retry transient SMTP failures
docs: document local PostgreSQL setup
```

### Code review principles

Reviewers should ask whether the change is tenant-safe, observable, testable, reversible, and understandable six months from now. The smallest correct change is usually the best change.

---

## Contributors

| Contributor | Area | Profile |
| :-- | :-- | :-- |
| Your name here | Maintainer | [Add GitHub profile](https://github.com/) |
| Your name here | Core contributor | [Add GitHub profile](https://github.com/) |
| Your name here | Documentation | [Add GitHub profile](https://github.com/) |

Want to appear here? Open a contribution that follows the [contribution guide](#contributing).

---

## License

AssetFlow is intended to be released under the MIT License.

```text
MIT License

Copyright (c) AssetFlow contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> [!NOTE]
> Add a root `LICENSE` file before publishing the repository as MIT-licensed. The mobile application contains its own license file, but this repository root does not currently expose one.

---

## Acknowledgements

AssetFlow is built with excellent open-source tools and the communities that maintain them:

- [Next.js](https://nextjs.org/) and [React](https://react.dev/) for the web experience.
- [Express](https://expressjs.com/) and [Node.js](https://nodejs.org/) for the API service.
- [Prisma](https://www.prisma.io/) and [PostgreSQL](https://www.postgresql.org/) for data modelling and persistence.
- [Better Auth](https://www.better-auth.com/) for authentication infrastructure.
- [BullMQ](https://bullmq.io/) and [Redis](https://redis.io/) for reliable background work.
- [Turborepo](https://turbo.build/) and npm workspaces for monorepo orchestration.
- [Tailwind CSS](https://tailwindcss.com/), [Lucide](https://lucide.dev/), and [TanStack Query](https://tanstack.com/query) for the interface foundation.
- [Vitest](https://vitest.dev/) and [Pino](https://getpino.io/) for confidence and observability.

---

## Useful links

| Resource | Location | Notes |
| :-- | :-- | :-- |
| Documentation | [`apps/docs`](apps/docs) | Next.js documentation workspace. |
| API integration notes | [`apps/web/docs/api-integration.md`](apps/web/docs/api-integration.md) | Web-facing API integration notes. |
| API source | [`apps/api`](apps/api) | Routes, controllers, middleware, services. |
| Worker guide | [`apps/worker/WORKER_GUIDE.md`](apps/worker/WORKER_GUIDE.md) | Worker-specific operational notes. |
| Worker testing guide | [`apps/worker/tests/TESTING_GUIDE.md`](apps/worker/tests/TESTING_GUIDE.md) | Worker test setup and practices. |
| Database schema | [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma) | Canonical relational model. |
| Postman collection | — | Planned: publish a versioned collection or OpenAPI-generated alternative. |
| Architecture | [System architecture](#system-architecture) | Diagrams and service boundaries in this README. |
| Issues | `https://github.com/<owner>/<repo>/issues` | Replace `<owner>/<repo>` after publication. |
| Discussions | `https://github.com/<owner>/<repo>/discussions` | Replace `<owner>/<repo>` after publication. |
| Project board | `https://github.com/<owner>/<repo>/projects` | Replace `<owner>/<repo>` after publication. |

---

<div align="center">

Built for accountable operations.

[Back to top](#top)

</div>
