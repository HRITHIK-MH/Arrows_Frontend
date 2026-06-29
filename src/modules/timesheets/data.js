export const demoUsers = [];

export const projectCatalog = [];

export const taskCategories = [
  "Backend Development",
  "Frontend Development",
  "QA Testing",
  "Code Review",
  "Meetings",
  "Documentation"
];

export const holidayCalendar = [];

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

  return {
    id: storedEmail || "current-user",
    name: storedName || storedEmail || "",
    email: storedEmail,
    role
  };
}
