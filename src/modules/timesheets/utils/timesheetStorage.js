const draftsStorageKey = "hrms-timesheet-drafts";
const entriesStorageKey = "hrms-timesheet-calendar-entries";
function getSeedEntries() {
  return [];
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
