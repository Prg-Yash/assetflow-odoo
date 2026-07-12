# AssetFlow Enterprise API Documentation 🚀

Welcome to the **AssetFlow Enterprise API** – a production-grade, multi-tenant, Role-Based Access Control (RBAC) backend built for comprehensive physical asset tracking, lifecycle operations, maintenance management, physical audits, and enterprise procurement.

This document serves as the **definitive reference** for all RESTful endpoints, authentication workflows, multi-tenant headers, RBAC permissions, and request/response specifications across our backend architecture.

---

## Table of Contents
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Base URL & Server Status](#base-url--server-status)
- [Authentication & Multi-Tenant Context](#authentication--multi-tenant-context)
- [Error Handling & Standard Responses](#error-handling--standard-responses)
- [Modular API Endpoints](#modular-api-endpoints)
  - [1. System Health & Diagnostics (`/api/v1/health`)](#1-system-health--diagnostics-apiv1health)
  - [2. Authentication & Sessions (`/api/v1/auth`)](#2-authentication--sessions-apiv1auth)
  - [3. Multi-Tenant Organizations (`/api/v1/organizations`)](#3-multi-tenant-organizations-apiv1organizations)
  - [4. Departments (`/api/v1/departments`)](#4-departments-apiv1departments)
  - [5. Locations (`/api/v1/locations`)](#5-locations-apiv1locations)
  - [6. Employee Profiles (`/api/v1/employees`)](#6-employee-profiles-apiv1employees)
  - [7. Roles & RBAC (`/api/v1/roles`)](#7-roles--rbac-apiv1roles)
  - [8. Organization Invites (`/api/v1/invites`)](#8-organization-invites-apiv1invites)
  - [9. Asset Categories (`/api/v1/categories`)](#9-asset-categories-apiv1categories)
  - [10. Vendors & Suppliers (`/api/v1/vendors`)](#10-vendors--suppliers-apiv1vendors)
  - [11. Purchase Orders (`/api/v1/purchases`)](#11-purchase-orders-apiv1purchases)
  - [12. Core Asset Management (`/api/v1/assets`)](#12-core-asset-management-apiv1assets)
  - [13. Asset Allocations (`/api/v1/allocations`)](#13-asset-allocations-apiv1allocations)
  - [14. Transfer Workflows (`/api/v1/transfers`)](#14-transfer-workflows-apiv1transfers)
  - [15. Asset Bookings & Reservations (`/api/v1/bookings`)](#15-asset-bookings--reservations-apiv1bookings)
  - [16. Maintenance & Repairs (`/api/v1/maintenance`)](#16-maintenance--repairs-apiv1maintenance)
  - [17. Physical Verification Audits (`/api/v1/audits`)](#17-physical-verification-audits-apiv1audits)
  - [18. Dashboard & Executive KPI Metrics (`/api/v1/dashboard`)](#18-dashboard--executive-kpi-metrics-apiv1dashboard)
  - [19. Media & Document Management (`/api/v1/media`)](#19-media--document-management-apiv1media)
  - [20. Notifications & Audit Logs (`/api/v1/notifications` & `/api/v1/activity-logs`)](#20-notifications--audit-logs-apiv1notifications--apiv1activity-logs)
- [Running Locally & Scripts](#running-locally--scripts)

---

## Architecture & Technology Stack

- **Runtime Environment:** Node.js (ESM Modular Architecture)
- **Framework:** Express.js 4.x with strict TypeScript typing
- **Database ORM:** Prisma ORM running against PostgreSQL (with full foreign-key constraints & multi-tenant isolation)
- **Authentication Engine:** Better-Auth (`@repo/auth`) with secure HTTP-only cookie sessions (`better-auth.session_token` / `__clerk_db_jwt`)
- **Security & CORS:** Configured with credentials support, payload limits, and strict header isolation

---

## Base URL & Server Status

All API routes are mounted under the `/api/v1` namespace.

```http
Base URL: http://localhost:5001/api/v1
```

### Root Landing Check
```http
GET http://localhost:5001/
```
**Response (200 OK):**
```json
{
  "success": true,
  "service": "AssetFlow Enterprise API Server",
  "version": "1.0.0",
  "status": "ONLINE",
  "documentation": "All API endpoints are mounted under /api/v1",
  "healthCheck": "/api/v1/health"
}
```

---

## Authentication & Multi-Tenant Context

AssetFlow is designed from the ground up as a **True Multi-Tenant SaaS Platform**. This means users can belong to multiple `Organization` tenants simultaneously with different roles (e.g., `ADMIN` in Organization A, `EMPLOYEE` in Organization B).

### 1. Authentication Credentials
Authentication is maintained via secure **HTTP-Only Session Cookies** or explicit Bearer tokens. When making requests from the frontend or API clients, ensure credentials are sent:
- **CORS Credentials:** `credentials: 'include'` (or `--cookie` flag in `curl`)
- **Session Header:** `Cookie: better-auth.session_token=<token>` or `Authorization: Bearer <token>`

### 2. Multi-Tenant Organization Isolation (`X-Organization-Id`)
Whenever accessing tenant-isolated resources (`/assets`, `/allocations`, `/maintenance`, `/dashboard`, etc.), the API requires an active Organization context. You can supply this context through:
1. **HTTP Request Header (Recommended):**
   ```http
   X-Organization-Id: <organization-uuid>
   ```
2. **User's Default Membership Context:** If the `X-Organization-Id` header is omitted, the middleware (`requireOrganization`) automatically infers the organization from the user's active switched membership context.

---

## Error Handling & Standard Responses

All API endpoints follow a consistent JSON response format for both successes and errors.

### Success Format (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Error Format (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ACCESS",
    "message": "You must be logged in to access this resource."
  }
}
```

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Request body or query parameters failed validation. |
| `401 Unauthorized` | `UNAUTHORIZED` | Session cookie or token is missing, expired, or invalid. |
| `403 Forbidden` | `FORBIDDEN_ACCESS` | User lacks the required RBAC role (e.g., `ADMIN` required). |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Requested asset, employee, or ID does not exist in this tenant. |
| `409 Conflict` | `DUPLICATE_ENTRY` | Unique constraint violation (e.g., Duplicate Asset Tag or Email). |
| `500 Internal Error` | `INTERNAL_SERVER_ERROR`| Unhandled server exception or database connectivity issue. |

---

## Modular API Endpoints

---

### 1. System Health & Diagnostics (`/api/v1/health`)
Used by load balancers, container orchestrators (Docker/Kubernetes), and uptime monitors to verify server and database health.

#### `GET /api/v1/health`
Checks database connectivity and memory usage.

**Response (`200 OK`):**
```json
{
  "success": true,
  "status": "HEALTHY",
  "timestamp": "2026-07-12T05:50:00.000Z",
  "uptime": 1420.5,
  "database": "CONNECTED",
  "memoryUsage": {
    "rss": "54 MB",
    "heapTotal": "28 MB",
    "heapUsed": "22 MB"
  }
}
```

---

### 2. Authentication & Sessions (`/api/v1/auth`)
Powered by Better-Auth and our modular controller wrapper (`auth.controller.ts`). Handles registration, sign-in, session resolution, and password resets.

#### `POST /api/v1/auth/sign-up/email`
Registers a new user account and initializes session credentials.
- **Payload:**
  ```json
  {
    "email": "admin@acmecorp.com",
    "password": "SecurePassword123!",
    "name": "Jane Doe"
  }
  ```
- **Response (`201 Created`):** Returns user profile + sets HTTP-only session cookie (`better-auth.session_token`).

#### `POST /api/v1/auth/sign-in/email`
Authenticates an existing user via email and password.
- **Payload:**
  ```json
  {
    "email": "admin@acmecorp.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (`200 OK`):** Returns authenticated user object and session token.

#### `GET /api/v1/auth/get-session`
Retrieves the currently authenticated user session details from the active cookie.
- **Response (`200 OK`):**
  ```json
  {
    "session": {
      "id": "sess_abc123",
      "userId": "usr_998877",
      "expiresAt": "2026-08-11T22:00:00.000Z"
    },
    "user": {
      "id": "usr_998877",
      "name": "Jane Doe",
      "email": "admin@acmecorp.com"
    }
  }
  ```

#### `POST /api/v1/auth/sign-out`
Invalidates the current session token and clears the authentication cookie.

---

### 3. Multi-Tenant Organizations (`/api/v1/organizations`)
Manages tenant onboarding, multi-organization membership switching, and tenant-wide settings.

#### `GET /api/v1/organizations/my-memberships`
**Middleware Required:** `requireAuth`  
Lists all organizations where the authenticated user is a member, along with their assigned role in each tenant.

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "organizationId": "org_uuid_101",
      "name": "Acme Global HQ",
      "slug": "acme-global",
      "role": "ADMIN",
      "isActiveContext": true
    },
    {
      "organizationId": "org_uuid_202",
      "name": "Stark Industries Branch",
      "slug": "stark-industries",
      "role": "EMPLOYEE",
      "isActiveContext": false
    }
  ]
}
```

#### `POST /api/v1/organizations`
**Middleware Required:** `requireAuth`  
Creates a brand new Organization tenant. Automatically creates an `ADMIN` membership for the creator and establishes default tenant categories/roles.
- **Payload:**
  ```json
  {
    "name": "Wayne Enterprises",
    "slug": "wayne-enterprises",
    "email": "ops@wayneenterprises.com",
    "phone": "+1-555-0199"
  }
  ```

#### `POST /api/v1/organizations/switch`
**Middleware Required:** `requireAuth`  
Switches the user's active organization context.
- **Payload:**
  ```json
  {
    "organizationId": "org_uuid_202"
  }
  ```
- **Response (`200 OK`):** Updates user session metadata and returns active tenant confirmation.

#### `GET /api/v1/organizations/current`
**Middleware Required:** `requireOrganization`  
Retrieves full details of the currently active tenant organization.

#### `PATCH /api/v1/organizations/settings`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN")`  
Updates tenant settings, logo URLs, notification preferences, and subscription tier.

---

### 4. Departments (`/api/v1/departments`)
Manages internal organizational units (e.g., IT, HR, Operations, Finance) for filtering employees and tracking departmental asset allocations.

#### `GET /api/v1/departments`
**Middleware Required:** `requireOrganization`  
Lists all departments within the current organization. Includes total employee and assigned asset counts.

#### `POST /api/v1/departments`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Creates a new department.
- **Payload:**
  ```json
  {
    "name": "Information Technology",
    "code": "IT-DEP",
    "description": "Enterprise IT infrastructure and computing assets",
    "headId": "emp_uuid_001"
  }
  ```

#### `GET /api/v1/departments/:id` | `PATCH /api/v1/departments/:id` | `DELETE /api/v1/departments/:id`
Standard CRUD lifecycle operations for specific departments. Deletion requires `ADMIN` privileges and checks that no assets are currently hard-locked to the department.

---

### 5. Locations (`/api/v1/locations`)
Tracks physical sites where assets are stored, deployed, or audited (e.g., Head Office, Server Room 3B, Warehouse A, Remote Branch).

#### `GET /api/v1/locations`
**Middleware Required:** `requireOrganization`  
Lists all locations with real-time asset density counts.

#### `POST /api/v1/locations`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Adds a new physical location.
- **Payload:**
  ```json
  {
    "name": "HQ - Server Room 101",
    "address": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "IL",
    "country": "USA",
    "postalCode": "62704",
    "type": "WAREHOUSE"
  }
  ```

#### `GET /api/v1/locations/:id` | `PATCH /api/v1/locations/:id` | `DELETE /api/v1/locations/:id`
Retrieves location inventory details, updates address information, or archives inactive sites.

---

### 6. Employee Profiles (`/api/v1/employees`)
Manages the human staff directory (`EmployeeProfile`) within the organization. Links user login accounts (`User`) to real-world employees who check out physical equipment.

#### `GET /api/v1/employees`
**Middleware Required:** `requireOrganization`  
Supports filtering by `departmentId`, `locationId`, and `search` query.

#### `POST /api/v1/employees`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Creates an employee profile.
- **Payload:**
  ```json
  {
    "employeeCode": "EMP-8092",
    "userId": "usr_uuid_optional",
    "designation": "Senior DevOps Engineer",
    "departmentId": "dep_uuid_it",
    "locationId": "loc_uuid_hq",
    "phone": "+1-555-8822"
  }
  ```

#### `GET /api/v1/employees/:id`
Returns full employee profile **along with their complete active asset inventory** (`allocations`), booking history, and recent transfer logs.

#### `PATCH /api/v1/employees/:id` | `DELETE /api/v1/employees/:id`
Updates designation/department or deactivates an employee (blocks further asset allocations).

---

### 7. Roles & RBAC (`/api/v1/roles`)
Provides Role-Based Access Control and custom permission definitions per tenant.

#### `GET /api/v1/roles`
**Middleware Required:** `requireOrganization`  
Returns system roles (`ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`, `AUDITOR`, `TECHNICIAN`) and tenant-defined custom roles with their permission matrices.

#### `POST /api/v1/roles`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN")`  
Creates a custom role with specific granular permissions.
- **Payload:**
  ```json
  {
    "name": "Inventory Technician",
    "description": "Can manage assets and maintenance but cannot view financial purchase orders",
    "permissions": [
      "asset:read",
      "asset:create",
      "asset:update",
      "allocation:manage",
      "maintenance:manage",
      "audit:execute"
    ]
  }
  ```

#### `GET /api/v1/roles/:id` | `PATCH /api/v1/roles/:id` | `DELETE /api/v1/roles/:id`
Modifies role permission matrices or deletes custom roles.

---

### 8. Organization Invites (`/api/v1/invites`)
Allows admins to invite new team members via secure tokenized email links.

#### `GET /api/v1/invites`
Lists all pending/unexpired email invitations.

#### `POST /api/v1/invites`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Sends an invitation to join the current organization.
- **Payload:**
  ```json
  {
    "email": "alex.smith@acmecorp.com",
    "roleId": "role_uuid_manager",
    "departmentId": "dep_uuid_it"
  }
  ```

#### `POST /api/v1/invites/:token/accept`
**Middleware Required:** `requireAuth`  
Accepts an invitation token and links the authenticated user into the target organization.

---

### 9. Asset Categories (`/api/v1/categories`)
Defines the taxonomy of assets (e.g., Laptops, Heavy Machinery, Vehicles, Software Licenses, Furniture) and configures default financial depreciation models.

#### `GET /api/v1/categories`
**Middleware Required:** `requireOrganization`  
Retrieves hierarchical category trees (using `parentId` for sub-categories).

#### `POST /api/v1/categories`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Creates a new asset category.
- **Payload:**
  ```json
  {
    "name": "MacBook Workstations",
    "code": "CAT-MAC",
    "deprecationRate": 20.0,
    "defaultLifeSpanMonths": 36,
    "description": "Apple laptop hardware"
  }
  ```

#### `GET /api/v1/categories/:id` | `PATCH /api/v1/categories/:id` | `DELETE /api/v1/categories/:id`
Manages category attributes and prevents deletion if active assets are linked.

---

### 10. Vendors & Suppliers (`/api/v1/vendors`)
Tracks equipment suppliers, maintenance contractors, and software vendors along with contact details and quality ratings.

#### `GET /api/v1/vendors`
Retrieves vendors list with optional `search` and `minRating` filters.

#### `POST /api/v1/vendors`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Adds a vendor.
- **Payload:**
  ```json
  {
    "name": "Dell Technologies Enterprise",
    "contactPerson": "Marcus Brody",
    "email": "enterprise.sales@dell.com",
    "phone": "+1-800-555-DELL",
    "address": "One Dell Way, Round Rock, TX",
    "taxId": "US-74-8899221",
    "rating": 4.8
  }
  ```

#### `GET /api/v1/vendors/:id`
Returns vendor profile along with **all historical purchase orders and assets supplied** by this vendor.

#### `PATCH /api/v1/vendors/:id` | `DELETE /api/v1/vendors/:id`
Updates contact info or archives vendor.

---

### 11. Purchase Orders (`/api/v1/purchases`)
Tracks procurement lifecycles, invoices, and automated asset onboarding upon purchase order receipt.

#### `GET /api/v1/purchases`
Lists purchase records filtered by `vendorId`, `status` (`PENDING`, `APPROVED`, `RECEIVED`, `CANCELLED`), and date ranges.

#### `POST /api/v1/purchases`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Records a new purchase order.
- **Payload:**
  ```json
  {
    "orderNumber": "PO-2026-0891",
    "vendorId": "vnd_uuid_dell",
    "purchaseDate": "2026-07-10T00:00:00.000Z",
    "totalAmount": 45000.00,
    "status": "APPROVED",
    "notes": "Q3 IT Refresh - 20 Latitude Laptops"
  }
  ```

#### `GET /api/v1/purchases/:id` | `PATCH /api/v1/purchases/:id` | `DELETE /api/v1/purchases/:id`
Manages invoice details and updates order fulfillment statuses.

---

### 12. Core Asset Management (`/api/v1/assets`)
The primary engine of AssetFlow. Manages complete physical asset profiles, QR barcodes, serial numbers, financial valuations, and real-time statuses (`AVAILABLE`, `ALLOCATED`, `IN_MAINTENANCE`, `DISPOSED`, `LOST`).

#### `GET /api/v1/assets`
**Middleware Required:** `requireOrganization`  
Supports high-performance pagination and rich multi-field filtering.
- **Query Parameters:**
  - `page` / `limit`: Pagination controls (default `page=1, limit=20`).
  - `status`: Filter by status (`AVAILABLE`, `ALLOCATED`, `IN_MAINTENANCE`).
  - `categoryId` / `locationId` / `departmentId`: Spatial/taxonomic filters.
  - `assignedToId`: Find assets currently assigned to a specific employee ID.
  - `search`: Fuzzy search by `assetTag`, `serialNumber`, or `name`.

#### `POST /api/v1/assets`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Registers a new physical asset and automatically generates a unique `assetTag` and QR code token if omitted.
- **Payload:**
  ```json
  {
    "name": "MacBook Pro M3 Max 16-inch",
    "assetTag": "AST-100492",
    "serialNumber": "C02G8912LLQ",
    "categoryId": "cat_uuid_mac",
    "locationId": "loc_uuid_hq",
    "departmentId": "dep_uuid_it",
    "purchasePrice": 3499.00,
    "purchaseDate": "2026-07-01T00:00:00.000Z",
    "warrantyExpiry": "2029-07-01T00:00:00.000Z",
    "status": "AVAILABLE"
  }
  ```

#### `GET /api/v1/assets/by-tag/:assetTag`
**Instant QR Scan Lookup Endpoint:** Used by mobile scanners or QR web readers to immediately fetch asset details using the barcode tag.

#### `GET /api/v1/assets/:id`
Returns a **Full 360° Asset Dossier**, including:
- Core specifications & financial depreciation status.
- Current active allocation & employee check-out info.
- Complete historical allocation log (`AssetAllocation[]`).
- Maintenance repair ticket history (`MaintenanceRequest[]`).
- Physical verification audit history (`AuditItem[]`).
- Attached documents and media images (`AssetImage[]`, `AssetDocument[]`).

#### `PATCH /api/v1/assets/:id`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Updates specifications, serial numbers, location migrations, or lifecycle states.

#### `DELETE /api/v1/assets/:id`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN")`  
Soft-deletes or disposes of an asset. Automatically prevents deletion if the asset is currently checked out (`ALLOCATED`) without prior check-in.

---

### 13. Asset Allocations (`/api/v1/allocations`)
Handles checking out equipment (`ALLOCATED`) to employees and checking them back into inventory (`AVAILABLE`).

#### `GET /api/v1/allocations`
**Middleware Required:** `requireOrganization`  
Lists historical check-out/check-in records filtered by `assetId`, `employeeId`, and `isActive` status.  
- **Role-Based Scoping:**
  - `EMPLOYEE`: Strictly scoped to allocations where they are the assignee (`Views assets allocated to them`).
  - `DEPARTMENT_HEAD`: Scoped to allocations within their department.
  - `ADMIN` / `ASSET_MANAGER`: Full visibility across all allocations.

#### `POST /api/v1/allocations`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD")`  
Assigns/Checks out an available asset to an employee. **Automatically updates the parent Asset status to `ALLOCATED` and links the current custodian.** If the caller is a `DEPARTMENT_HEAD`, the asset and employee must strictly belong to their assigned department.
- **Payload:**
  ```json
  {
    "assetId": "ast_uuid_macbook",
    "employeeId": "emp_uuid_001",
    "expectedReturn": "2026-12-31T00:00:00.000Z",
    "remarks": "Assigned for remote project deployment"
  }
  ```

#### `PATCH /api/v1/allocations/:id/request-return`
**Middleware Required:** `requireOrganization` (Accessible by `EMPLOYEE`)  
Allows the assigned employee custodian to **initiate a return request** per PDF Page 5 (`Employee: Initiates return/transfer requests`). Sets return request remarks and notifies the `ASSET_MANAGER` / `DEPARTMENT_HEAD` to verify physical condition check-in.
- **Payload:**
  ```json
  {
    "reason": "Project completed, returning MacBook early."
  }
  ```

#### `PATCH /api/v1/allocations/:id/return`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD")`  
Processes an asset return/check-in from an employee. **Automatically resets the parent Asset status to `AVAILABLE` and records physical condition notes.**
- **Payload:**
  ```json
  {
    "returnedAt": "2026-07-12T10:30:00.000Z",
    "condition": "EXCELLENT",
    "remarks": "Returned with all chargers and original packaging intact."
  }
  ```

---

### 14. Transfer Workflows (`/api/v1/transfers`)
Manages formal inter-location or inter-departmental equipment transfer requests with multi-step approval workflows.

#### `GET /api/v1/transfers`
Lists active transfer requests (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`).

#### `POST /api/v1/transfers`
**Middleware Required:** `requireOrganization`  
Initiates a transfer request.
- **Payload:**
  ```json
  {
    "assetId": "ast_uuid_server",
    "fromLocationId": "loc_uuid_hq",
    "toLocationId": "loc_uuid_branch",
    "toDepartmentId": "dep_uuid_ops",
    "reason": "Re-deploying server cluster to expand regional branch capacity"
  }
  ```

#### `POST /api/v1/transfers/:id/approve`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Approves and executes the transfer. **Automatically updates the asset's physical `locationId` and `departmentId` in real-time.**

#### `POST /api/v1/transfers/:id/reject`
Rejects the transfer request with documented feedback (`rejectionReason`).

---

### 15. Asset Bookings & Reservations (`/api/v1/bookings`)
Allows employees and teams to reserve shared assets (e.g., Projectors, Shared Specialized Lab Equipment, Test Vehicles, Meeting Rooms) for specific time slots.

#### `GET /api/v1/bookings`
Retrieves booking calendars filtered by `assetId` and date intervals.

#### `POST /api/v1/bookings`
**Middleware Required:** `requireOrganization`  
Creates a booking reservation. **Contains automated conflict-detection logic that prevents double-booking the same asset for overlapping time windows.**
- **Payload:**
  ```json
  {
    "assetId": "ast_uuid_projector",
    "startTime": "2026-07-15T14:00:00.000Z",
    "endTime": "2026-07-15T16:00:00.000Z",
    "purpose": "Q3 Board of Directors Executive Pitch"
  }
  ```

#### `PATCH /api/v1/bookings/:id` | `DELETE /api/v1/bookings/:id`
Modifies reservation timing or cancels bookings.

---

### 16. Maintenance & Repairs (`/api/v1/maintenance`)
Manages preventative maintenance schedules, breakdown tickets, technician repair logs, and maintenance cost accounting.

#### `GET /api/v1/maintenance`
Lists maintenance requests filtered by `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), and `assetId`.

#### `POST /api/v1/maintenance`
**Middleware Required:** `requireOrganization`  
Submits a new maintenance ticket. **Automatically locks the parent Asset status to `IN_MAINTENANCE` to prevent unauthorized employee checkout.**
- **Payload:**
  ```json
  {
    "assetId": "ast_uuid_forklift",
    "title": "Hydraulic Lift Arm Stuttering",
    "description": "Noticeable pressure drop when lifting loads over 500 lbs.",
    "priority": "HIGH",
    "maintenanceType": "REPAIR",
    "scheduledDate": "2026-07-13T09:00:00.000Z",
    "estimatedCost": 450.00
  }
  ```

#### `GET /api/v1/maintenance/:id`
Retrieves full maintenance ticket details along with **all technician inspection comments (`MaintenanceComment`) and cost records.**

#### `POST /api/v1/maintenance/:id/comments`
Adds a diagnostic or progress log comment to the maintenance ticket.
- **Payload:**
  ```json
  {
    "comment": "Inspected hydraulic seals. Ordered replacement O-rings from vendor."
  }
  ```

#### `PATCH /api/v1/maintenance/:id/status`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "MANAGER")`  
Updates ticket state (`IN_PROGRESS` -> `RESOLVED`). **When marked `RESOLVED` or `CLOSED`, the system automatically releases the parent Asset status back to `AVAILABLE`.**

---

### 17. Physical Verification Audits (`/api/v1/audits`)
Provides enterprise inventory reconciliation. Allows auditors to create physical verification cycles (`AuditCycle`) and verify inventory presence item-by-item (`AuditItem`) via barcode/QR scans.

#### `GET /api/v1/audits`
Lists audit cycles filtered by location and progress status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`).

#### `POST /api/v1/audits`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "AUDITOR", "MANAGER")`  
Launches a new verification campaign. Automatically snapshots all expected assets at the target `locationId` into checklist `AuditItem` rows.
- **Payload:**
  ```json
  {
    "title": "2026 Annual Server Room 101 Audit",
    "locationId": "loc_uuid_hq",
    "departmentId": "dep_uuid_it",
    "scheduledDate": "2026-07-20T00:00:00.000Z"
  }
  ```

#### `GET /api/v1/audits/:id`
Retrieves the audit campaign overview along with real-time tally counters (`foundCount`, `missingCount`, `damagedCount`).

#### `POST /api/v1/audits/:id/scan`
**The Core Barcode Scanning Endpoint:** Processes live QR code scans from field auditors.
- **Payload:**
  ```json
  {
    "assetTag": "AST-100492",
    "condition": "GOOD",
    "notes": "Verified present inside Rack 4B",
    "locationVerified": true
  }
  ```
- **Response (`200 OK`):** Marks the corresponding `AuditItem` status as `FOUND` and timestamps the verification.

#### `POST /api/v1/audits/:id/complete`
Finalizes the audit cycle, freezes the verification checklist, and calculates total inventory discrepancy valuation ($).

---

### 18. Dashboard & Executive KPI Metrics (`/api/v1/dashboard`)
Delivers real-time aggregation analytics, financial charts, and KPI counters for executive reporting and frontend dashboards.

#### `GET /api/v1/dashboard/metrics`
**Middleware Required:** `requireOrganization`  
Returns primary top-level statistics.
```json
{
  "success": true,
  "data": {
    "totalAssetsCount": 1420,
    "totalAssetValuation": 1845000.00,
    "activeAllocationsCount": 892,
    "assetsInMaintenanceCount": 14,
    "pendingTransfersCount": 5,
    "openAuditAlerts": 2
  }
}
```

#### `GET /api/v1/dashboard/overdue` & `GET /api/v1/dashboard/upcoming`
Retrieves assets currently checked out where the return due date is either **past due (Overdue Returns)** or **approaching in the future (Upcoming Returns)**, enabling instant follow-up alerts and clear visual separation on the dashboard.

#### `GET /api/v1/dashboard/asset-status-distribution`
Returns exact percentage and numerical distributions for pie charts (`AVAILABLE` vs `ALLOCATED` vs `IN_MAINTENANCE` vs `DISPOSED`).

#### `GET /api/v1/dashboard/category-breakdown`
Returns grouped valuations and quantities per asset category (e.g., Laptops = $450k, Servers = $900k).

#### `GET /api/v1/dashboard/department-allocations`
Identifies top equipment-consuming departments across the organization.

#### `GET /api/v1/dashboard/recent-activities`
Streams the latest 15 actions (check-outs, check-ins, maintenance alerts, audit scans) across the entire tenant.

---

### 19. Media & Document Management (`/api/v1/media`)
Handles uploading high-resolution asset imagery (`AssetImage`), purchase order invoices/receipts (`AssetDocument`), and audit evidence attachments (`Attachment`).

#### `POST /api/v1/media/upload`
Accepts `multipart/form-data` uploads or base64 data payloads, stores the asset in local/S3 storage, and returns CDN-ready URLs.

#### `GET /api/v1/media/:id` | `DELETE /api/v1/media/:id`
Retrieves file metadata or securely deletes attached files.

---

### 20. Notifications & Audit Logs (`/api/v1/notifications` & `/api/v1/activity-logs`)
Ensures system transparency, automated reminder alerts, and immutable compliance tracking.

#### `GET /api/v1/notifications`
Retrieves unread notifications for the active user (e.g., `"Your asset transfer request #TR-991 was approved by IT Manager"`).

#### `PATCH /api/v1/notifications/:id/read`
Marks a specific notification alert as acknowledged/read.

#### `GET /api/v1/activity-logs`
**Middleware Required:** `requireOrganization`, `requireRoleType("ADMIN", "AUDITOR")`  
Retrieves immutable system-wide activity logs (`ActivityLog`). Tracks every state change (`User X allocated Asset Y to Employee Z at Location W on July 12`). Supports pagination and date filtering.

---

### 21. Queue-Based Async Processing (`queue.service.ts`)
To reduce API latency and database lock contention under heavy enterprise concurrency, AssetFlow integrates an asynchronous **Queue-Based Task Manager** (`AsyncQueueManager`).
- **`NOTIFICATION_DISPATCH` Worker:** Decouples email and in-app alert creation from main user request threads.
- **`ACTIVITY_LOG` Worker:** Asynchronously batches and commits audit logs.
- **`AUDIT_DISCREPANCY_GENERATOR` Worker:** Asynchronously updates thousands of asset statuses (`LOST`, `DAMAGED`) when physical verification cycles (`AuditCycle`) close.

---

## Running Locally & Scripts

To run the API server directly in development mode with live reloading:

```powershell
# From the project root workspace:
npm run dev --workspace=api

# Or navigate to the api app directory directly:
cd apps/api
npm run dev
```

### Available Package Scripts (`apps/api/package.json`)
- `npm run dev`: Starts the TypeScript server with `nodemon` and `tsx` on `http://localhost:5001`.
- `npm run build`: Compiles TypeScript sources into optimized JavaScript inside `./dist`.
- `npm run start`: Runs the compiled production bundle (`dist/index.js`).
- `npm run lint`: Runs ESLint over all route and controller files.

---
*AssetFlow Enterprise API — Built with modularity, multi-tenancy, and high-throughput reliability in mind.*
