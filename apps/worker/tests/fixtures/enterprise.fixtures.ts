/**
 * Strongly typed enterprise fixtures for background worker tests.
 * Resembles realistic production records rather than simple placeholders.
 */

export interface DepartmentFixture {
  id: string;
  name: string;
  code: string;
  managerEmail: string;
}

export interface EmployeeFixture {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "ENGINEER" | "STAFF";
  departmentId: string;
}

export interface AssetFixture {
  id: string;
  assetTag: string;
  name: string;
  category: "HARDWARE" | "SOFTWARE" | "VEHICLE" | "FACILITY";
  status: "ACTIVE" | "MAINTENANCE" | "DECOMMISSIONED" | "ARCHIVED";
  location: string;
}

export interface MaintenanceTicketFixture {
  id: string;
  assetId: string;
  title: string;
  description: string;
  scheduledDate: string;
  assignedToEmail: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface BookingFixture {
  id: string;
  userId: string;
  userEmail: string;
  assetId: string;
  assetName: string;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface AuditCycleFixture {
  id: string;
  departmentId: string;
  scope: string[];
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  creatorId: string;
  createdAt: string;
}

// ==========================================
// Fixture instances
// ==========================================

export const ENTERPRISE_FIXTURES = {
  department: {
    engineering: {
      id: "dept-eng-001",
      name: "Core Engineering",
      code: "ENG",
      managerEmail: "engineering-manager@company.com",
    } satisfies DepartmentFixture,
    facilities: {
      id: "dept-fac-002",
      name: "Facilities & Operations",
      code: "FAC",
      managerEmail: "facilities-head@company.com",
    } satisfies DepartmentFixture,
  },
  
  employee: {
    janeAdmin: {
      id: "emp-jane-001",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@company.com",
      role: "ADMIN",
      departmentId: "dept-eng-001",
    } satisfies EmployeeFixture,
    bobEngineer: {
      id: "emp-bob-002",
      firstName: "Bob",
      lastName: "Miller",
      email: "bob.miller@company.com",
      role: "ENGINEER",
      departmentId: "dept-eng-001",
    } satisfies EmployeeFixture,
  },

  asset: {
    macbookPro: {
      id: "ast-mac-091",
      assetTag: "AST-2026-0091",
      name: "MacBook Pro 16-inch M3 Max",
      category: "HARDWARE",
      status: "ACTIVE",
      location: "San Francisco HQ - Desk 12",
    } satisfies AssetFixture,
    hvacSystem: {
      id: "ast-hvac-102",
      assetTag: "AST-2026-0102",
      name: "Carrier Industrial HVAC Compressor Unit 3",
      category: "FACILITY",
      status: "MAINTENANCE",
      location: "Building B - Rooftop",
    } satisfies AssetFixture,
  },

  maintenance: {
    compressorCheck: {
      id: "maint-comp-501",
      assetId: "ast-hvac-102",
      title: "Quarterly HVAC Compressor Maintenance",
      description: "Perform pressure testing, oil inspection, and fan belt replacement.",
      scheduledDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
      assignedToEmail: "bob.miller@company.com",
      status: "PENDING",
      priority: "HIGH",
    } satisfies MaintenanceTicketFixture,
  },

  booking: {
    projectorBooking: {
      id: "bok-proj-302",
      userId: "emp-bob-002",
      userEmail: "bob.miller@company.com",
      assetId: "ast-proj-888",
      assetName: "Epson 4K Laser Projector",
      startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // In 30 minutes
      endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // In 90 minutes
      status: "CONFIRMED",
    } satisfies BookingFixture,
  },

  audit: {
    hardwareAudit: {
      id: "aud-hw-2026-q3",
      departmentId: "dept-eng-001",
      scope: ["ast-mac-091", "ast-mac-092", "ast-proj-888"],
      status: "ACTIVE",
      creatorId: "emp-jane-001",
      createdAt: new Date().toISOString(),
    } satisfies AuditCycleFixture,
  },
};
