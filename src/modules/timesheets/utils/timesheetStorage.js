const draftsStorageKey = "hrms-timesheet-drafts";
const entriesStorageKey = "hrms-timesheet-calendar-entries";
const defaultEmployeeId = "usr-001";
const defaultEmployeeName = "Aarav Mehta";
function getTodayMonth() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
}
function toDate(month, day) {
  return `${month}-${String(day).padStart(2, "0")}`;
}
function calculateHours(startTime = "09:00", endTime = "17:00") {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return Math.max(0, (end - start) / 60);
}
function makeEntry(id, date, status, project = "HRMS Portal", task = "Frontend Development", employeeId = defaultEmployeeId, employeeName = defaultEmployeeName) {
  const startTime = "09:00";
  const endTime = "17:00";
  const hours = calculateHours(startTime, endTime);
  return {
    id,
    employeeId,
    employeeName,
    date,
    project,
    task,
    taskCategory: task,
    description: "Timesheet module delivery",
    startTime,
    endTime,
    regularHours: hours,
    overtimeHours: 0,
    hours,
    billable: true,
    status,
    mode: "daily",
    notes: status === "rejected" ? "Needs task detail correction." : "Completed planned work."
  };
}
function getSeedEntries() {
  const month = getTodayMonth();
  return [
    makeEntry("seed-001", toDate(month, 1), "approved"),
    makeEntry("seed-002", toDate(month, 2), "approved", "Client Analytics", "Code Review"),
    makeEntry("seed-003", toDate(month, 4), "pending", "HRMS Portal", "Backend Development"),
    makeEntry("seed-004", toDate(month, 8), "draft", "Internal Automation", "Documentation"),
    makeEntry("seed-005", toDate(month, 10), "rejected", "Payroll Modernization", "QA Testing"),
    makeEntry("seed-006", toDate(month, 11), "pending", "HRMS Portal", "Meetings"),
    makeEntry("seed-007", toDate(month, 12), "draft", "HRMS Portal", "Frontend Development"),
    makeEntry("seed-008", toDate(month, 16), "approved", "Client Analytics", "Frontend Development"),
    makeEntry("seed-009", toDate(month, 17), "draft", "HRMS Portal", "Backend Development"),
    makeEntry("seed-010", toDate(month, 18), "draft", "Internal Automation", "Documentation"),
    makeEntry("seed-011", toDate(month, 4), "pending", "Internal Automation", "Meetings", "usr-004", "Rahul Sen"),
    makeEntry("seed-012", toDate(month, 9), "rejected", "Internal Automation", "QA Testing", "usr-004", "Rahul Sen")
  ];
}
function persistEntries(entries) {
  localStorage.setItem(entriesStorageKey, JSON.stringify(entries));
}
function getTimesheetEntries() {
  const raw = localStorage.getItem(entriesStorageKey);
  if (!raw) {
    const seedEntries = getSeedEntries();
    persistEntries(seedEntries);
    return seedEntries;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const seedEntries = getSeedEntries();
    persistEntries(seedEntries);
    return seedEntries;
  }
}
function saveTimesheetEntries(entries) {
  const existing = getTimesheetEntries();
  const incomingIds = new Set(entries.map((entry) => entry.id));
  persistEntries([...entries, ...existing.filter((entry) => !incomingIds.has(entry.id))]);
}
function updateTimesheetEntry(nextEntry) {
  persistEntries(getTimesheetEntries().map((entry) => entry.id === nextEntry.id ? nextEntry : entry));
}
function deleteTimesheetEntry(entryId) {
  persistEntries(getTimesheetEntries().filter((entry) => entry.id !== entryId));
}
function submitEntriesForApproval(entryIds) {
  const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
  persistEntries(
    getTimesheetEntries().map(
      (entry) => entryIds.includes(entry.id) && (entry.status === "draft" || entry.status === "rejected") ? { ...entry, status: "pending", submittedAt } : entry
    )
  );
}
function approveTimesheetEntry(entryId, approvalComment) {
  persistEntries(
    getTimesheetEntries().map((entry) => entry.id === entryId ? { ...entry, status: "approved", approvalComment } : entry)
  );
}
function rejectTimesheetEntry(entryId, approvalComment) {
  persistEntries(
    getTimesheetEntries().map((entry) => entry.id === entryId ? { ...entry, status: "rejected", approvalComment } : entry)
  );
}
function saveTimesheetDraft(draft) {
  const drafts = getTimesheetDrafts().filter((item) => item.id !== draft.id);
  localStorage.setItem(draftsStorageKey, JSON.stringify([draft, ...drafts]));
}
function getTimesheetDrafts() {
  const raw = localStorage.getItem(draftsStorageKey);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
export {
  approveTimesheetEntry,
  deleteTimesheetEntry,
  getTimesheetDrafts,
  getTimesheetEntries,
  rejectTimesheetEntry,
  saveTimesheetDraft,
  saveTimesheetEntries,
  submitEntriesForApproval,
  updateTimesheetEntry
};
