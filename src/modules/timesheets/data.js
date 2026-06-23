export const demoUsers = [
  {
    id: "usr-001",
    name: "Aarav Mehta",
    email: "employee@methodhub.com",
    role: "employee",
    department: "Engineering",
    designation: "Frontend Engineer",
    manager: "Priya Rao",
    status: "active"
  },
  {
    id: "usr-002",
    name: "Priya Rao",
    email: "manager@methodhub.com",
    role: "manager",
    department: "Engineering",
    designation: "Engineering Manager",
    status: "active"
  },
  {
    id: "usr-003",
    name: "Nisha Varma",
    email: "admin@methodhub.com",
    role: "admin",
    department: "People Operations",
    designation: "HRMS Administrator",
    status: "active"
  },
  {
    id: "usr-004",
    name: "Rahul Sen",
    email: "rahul.sen@methodhub.com",
    role: "employee",
    department: "Quality Assurance",
    designation: "QA Lead",
    manager: "Priya Rao",
    status: "active"
  },
  {
    id: "usr-005",
    name: "Meera Iyer",
    email: "meera.iyer@methodhub.com",
    role: "employee",
    department: "Design",
    designation: "Product Designer",
    manager: "Priya Rao",
    status: "inactive"
  }
];

export const projectCatalog = [
  { id: "prj-001", name: "HRMS Portal", clientName: "MethodHub", status: "Active", active: true, billingType: "Billable" },
  { id: "prj-002", name: "Payroll Modernization", clientName: "MethodHub", status: "Active", active: true, billingType: "Non-Billable" },
  { id: "prj-003", name: "Client Analytics", clientName: "Northwind Retail", status: "Active", active: true, billingType: "Billable" },
  { id: "prj-004", name: "Internal Automation", clientName: "MethodHub", status: "Active", active: true, billingType: "Non-Billable" },
  { id: "prj-005", name: "Legacy Migration", clientName: "Contoso", status: "On Hold", active: false, billingType: "Billable" }
];

export const taskCategories = [
  "Backend Development",
  "Frontend Development",
  "QA Testing",
  "Code Review",
  "Meetings",
  "Documentation"
];

export const holidayCalendar = [
  { date: "2026-06-15", name: "Public holiday" }
];

function normalizeRole(value) {
  const role = String(value || "").toLowerCase();
  if (role.includes("admin")) return "admin";
  if (role.includes("manager")) return "manager";
  return "employee";
}

export function getCurrentTimesheetUser() {
  const storedEmail = String(localStorage.getItem("userEmail") || "").toLowerCase();
  const storedName = String(localStorage.getItem("userName") || "").trim();
  const role = normalizeRole(localStorage.getItem("userRole") || localStorage.getItem("userPersona"));
  const knownUser = demoUsers.find((user) => user.email.toLowerCase() === storedEmail);

  if (knownUser) {
    return { ...knownUser, role };
  }

  const roleFallback = demoUsers.find((user) => user.role === role) || demoUsers[0];
  return {
    ...roleFallback,
    name: storedName || roleFallback.name,
    email: storedEmail || roleFallback.email,
    role
  };
}
