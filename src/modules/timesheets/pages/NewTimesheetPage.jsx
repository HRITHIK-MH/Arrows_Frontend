import { ArrowLeft, ClipboardList, Copy, Edit3, Plus, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  deleteTimesheetEntry,
  getTimesheetEntries,
  saveTimesheetEntries,
  submitEntriesForApproval,
  updateTimesheetEntry
} from "@/modules/timesheets/utils/timesheetStorage";
import { holidayCalendar, projectCatalog, taskCategories, getCurrentTimesheetUser } from "@/modules/timesheets/data";
import "../styles/NewTimesheet.css";
const autoSaveKey = "hrms-timesheet-entry-form";
const workspaceTabs = ["daily", "weekly", "monthly", "review"];
const weekdayOptions = [
  { label: "Monday", offset: 0 },
  { label: "Tuesday", offset: 1 },
  { label: "Wednesday", offset: 2 },
  { label: "Thursday", offset: 3 },
  { label: "Friday", offset: 4 }
];
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function currentMonth() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
}
function startOfWeek(dateValue) {
  const date = /* @__PURE__ */ new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}
function addDays(dateValue, offset) {
  const date = /* @__PURE__ */ new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}
function isWeekend(dateValue) {
  const day = (/* @__PURE__ */ new Date(`${dateValue}T00:00:00`)).getDay();
  return day === 0 || day === 6;
}
function isHoliday(dateValue) {
  return holidayCalendar.some((holiday) => holiday.date === dateValue);
}
function monthDates(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`);
}
function calculateHours(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return Math.max(0, (end - start) / 60);
}
function formatHours(hours) {
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 2)}h`;
}
function defaultForm() {
  return {
    date: today(),
    project: projectCatalog.find((project) => project.active)?.name ?? "",
    task: taskCategories[0] || "",
    startTime: "09:00",
    endTime: "17:00",
    notes: ""
  };
}
function resolveWorkspaceTab(tab) {
  return workspaceTabs.includes(tab) ? tab : "daily";
}
function resolveDate(date) {
  return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today();
}
function toCalendarEntry(form, user, mode, sourceLabel) {
  const hours = calculateHours(form.startTime, form.endTime);
  return {
    id: crypto.randomUUID(),
    employeeId: user.id,
    employeeName: user.name,
    date: form.date,
    project: form.project,
    task: form.task,
    taskCategory: form.task,
    description: form.notes || form.task,
    startTime: form.startTime,
    endTime: form.endTime,
    hours,
    regularHours: hours,
    overtimeHours: 0,
    billable: true,
    status: "draft",
    mode,
    sourceLabel,
    notes: form.notes
  };
}
function statusLabel(status) {
  return status === "draft" ? "Editable" : status ?? "draft";
}
const NewTimesheetPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getCurrentTimesheetUser();
  const initialDate = resolveDate(searchParams.get("date"));
  const reviewOnly = searchParams.get("tab") === "review";
  const [activeTab, setActiveTab] = useState(() => resolveWorkspaceTab(searchParams.get("tab") ?? searchParams.get("mode")));
  const visibleTab = reviewOnly ? "review" : activeTab;
  const [entries, setEntries] = useState(() => getTimesheetEntries());
  const [dailyForms, setDailyForms] = useState(() => {
    if (searchParams.has("date")) return [{ ...defaultForm(), date: initialDate }];
    const saved = localStorage.getItem(autoSaveKey);
    if (!saved) return [defaultForm()];
    try {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : [defaultForm()];
    } catch {
      return [defaultForm()];
    }
  });
  const [weeklyForm, setWeeklyForm] = useState({ ...defaultForm(), date: startOfWeek(today()) });
  const [selectedWeekdays, setSelectedWeekdays] = useState([0, 1, 2, 3, 4]);
  const [month, setMonth] = useState(currentMonth());
  const [applyEntireMonth, setApplyEntireMonth] = useState(true);
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeHolidays, setExcludeHolidays] = useState(true);
  const [monthlyForm, setMonthlyForm] = useState({ ...defaultForm(), date: `${currentMonth()}-01` });
  const [editingEntryId, setEditingEntryId] = useState(null);
  const employeeEntries = useMemo(() => entries.filter((entry) => entry.employeeId === user.id), [entries, user.id]);
  const editableReviewEntries = employeeEntries.filter((entry) => entry.status === "draft" || entry.status === "rejected");
  const totalReviewHours = employeeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const dailyHours = dailyForms.reduce((sum, form) => sum + calculateHours(form.startTime, form.endTime), 0);
  const weeklyGeneratedCount = selectedWeekdays.length;
  const monthlyGeneratedDates = monthDates(month).filter((date) => {
    if (!applyEntireMonth) return date === monthlyForm.date;
    if (excludeWeekends && isWeekend(date)) return false;
    if (excludeHolidays && isHoliday(date)) return false;
    return true;
  });
  const weeklySummary = useMemo(() => employeeEntries.reduce((summary, entry) => {
    const week = startOfWeek(entry.date);
    summary[week] = (summary[week] ?? 0) + entry.hours;
    return summary;
  }, {}), [employeeEntries]);
  const monthlySummary = useMemo(() => employeeEntries.reduce((summary, entry) => {
    const entryMonth = entry.date.slice(0, 7);
    summary[entryMonth] = (summary[entryMonth] ?? 0) + entry.hours;
    return summary;
  }, {}), [employeeEntries]);
  const validationMessages = useMemo(() => {
    const messages = [];
    dailyForms.forEach((form, index) => {
      if (!form.project) messages.push(`Daily row ${index + 1}: project is required.`);
      if (!form.task) messages.push(`Daily row ${index + 1}: task is required.`);
      if (calculateHours(form.startTime, form.endTime) <= 0) messages.push(`Daily row ${index + 1}: end time must be after start time.`);
    });
    employeeEntries.forEach((entry) => {
      if (calculateHours(entry.startTime ?? "09:00", entry.endTime ?? "17:00") <= 0) {
        messages.push(`${entry.date}: invalid time range.`);
      }
    });
    employeeEntries.forEach((entry, index) => {
      employeeEntries.slice(index + 1).forEach((nextEntry) => {
        if (entry.date !== nextEntry.date) return;
        const entryStart = entry.startTime ?? "09:00";
        const entryEnd = entry.endTime ?? "17:00";
        const nextStart = nextEntry.startTime ?? "09:00";
        const nextEnd = nextEntry.endTime ?? "17:00";
        if (entryStart < nextEnd && nextStart < entryEnd) {
          messages.push(`${entry.date}: ${entry.project} overlaps with ${nextEntry.project}.`);
        }
      });
    });
    return messages;
  }, [dailyForms, employeeEntries]);
  useEffect(() => {
    localStorage.setItem(autoSaveKey, JSON.stringify(dailyForms));
  }, [dailyForms]);
  function refreshEntries() {
    setEntries(getTimesheetEntries());
  }
  function updateDailyForm(index, nextForm) {
    setDailyForms((current) => current.map((form, formIndex) => formIndex === index ? { ...form, ...nextForm } : form));
  }
  function submitDailyEntries() {
    const invalid = dailyForms.some((form) => calculateHours(form.startTime, form.endTime) <= 0 || !form.project || !form.task);
    if (invalid) {
      toast.error("Fix daily entry validation before submitting.");
      return;
    }
    saveTimesheetEntries(dailyForms.map((form) => toCalendarEntry(form, user, "daily")));
    refreshEntries();
    toast.success("Daily entries saved as editable records.");
    setActiveTab("review");
  }
  function generateWeeklyEntries(submitAfterGenerate = false) {
    const hours = calculateHours(weeklyForm.startTime, weeklyForm.endTime);
    if (hours <= 0 || selectedWeekdays.length === 0) {
      toast.error("Select at least one weekday and a valid time range.");
      return;
    }
    const generated = selectedWeekdays.map((offset) => toCalendarEntry({ ...weeklyForm, date: addDays(weeklyForm.date, offset) }, user, "weekly", "Weekly generation"));
    saveTimesheetEntries(generated);
    if (submitAfterGenerate) submitEntriesForApproval(generated.map((entry) => entry.id));
    refreshEntries();
    toast.success(submitAfterGenerate ? "Weekly entries generated and submitted." : "Weekly entries generated.");
    setActiveTab("review");
  }
  function copyPreviousWeek() {
    const previousWeekStart = addDays(weeklyForm.date, -7);
    const previousEntries = employeeEntries.filter((entry) => entry.date >= previousWeekStart && entry.date <= addDays(previousWeekStart, 4));
    const firstEntry = previousEntries[0];
    if (!firstEntry) {
      toast.error("No previous week entries found. Keeping the current template.");
      return;
    }
    setWeeklyForm({
      date: weeklyForm.date,
      project: firstEntry.project,
      task: firstEntry.taskCategory,
      startTime: firstEntry.startTime ?? "09:00",
      endTime: firstEntry.endTime ?? "17:00",
      notes: firstEntry.notes ?? ""
    });
    toast.success("Previous week template copied.");
  }
  function generateMonthlyEntries(submitAfterGenerate = false) {
    const hours = calculateHours(monthlyForm.startTime, monthlyForm.endTime);
    if (hours <= 0) {
      toast.error("End time must be after start time.");
      return;
    }
    const generated = monthlyGeneratedDates.map((date) => toCalendarEntry({ ...monthlyForm, date }, user, "monthly", "Monthly generation"));
    saveTimesheetEntries(generated);
    if (submitAfterGenerate) submitEntriesForApproval(generated.map((entry) => entry.id));
    refreshEntries();
    toast.success(submitAfterGenerate ? "Monthly entries generated and submitted." : "Monthly entries generated.");
    setActiveTab("review");
  }
  function deleteEntry(entry) {
    if (entry.status === "pending" || entry.status === "approved") {
      toast.error("Submitted or approved entries are locked.");
      return;
    }
    deleteTimesheetEntry(entry.id);
    refreshEntries();
    toast.success("Entry deleted.");
  }
  function saveEditedEntry(entry, patch) {
    const startTime = patch.startTime ?? entry.startTime ?? "09:00";
    const endTime = patch.endTime ?? entry.endTime ?? "17:00";
    const hours = calculateHours(startTime, endTime);
    updateTimesheetEntry({ ...entry, ...patch, startTime, endTime, hours, regularHours: hours });
    setEditingEntryId(null);
    refreshEntries();
    toast.success("Entry updated.");
  }
  function submitForApproval() {
    if (editableReviewEntries.length === 0) {
      toast.error("No editable entries available to submit.");
      return;
    }
    submitEntriesForApproval(editableReviewEntries.map((entry) => entry.id));
    refreshEntries();
    toast.success("Timesheet submitted for approval.");
    navigate("/timesheet");
  }
  function renderEntryFields(form, onChange, showDate = true) {
    const hours = calculateHours(form.startTime, form.endTime);
    return <div className="entry-form-grid">
        {showDate ? <label className="form-group">
            <span className="form-label">Date</span>
            <input type="date" value={form.date} onChange={(event) => onChange({ date: event.target.value })} className="form-input" />
          </label> : null}
        <label className="form-group">
          <span className="form-label">Project</span>
          <select value={form.project} onChange={(event) => onChange({ project: event.target.value })} className="form-input">
            {projectCatalog.filter((project) => project.active).map((project) => <option key={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label className="form-group">
          <span className="form-label">Task</span>
          <select value={form.task} onChange={(event) => onChange({ task: event.target.value })} className="form-input">
            {taskCategories.map((task) => <option key={task}>{task}</option>)}
          </select>
        </label>
        <label className="form-group">
          <span className="form-label">Start</span>
          <input type="time" value={form.startTime} onChange={(event) => onChange({ startTime: event.target.value })} className="form-input" />
        </label>
        <label className="form-group">
          <span className="form-label">End</span>
          <input type="time" value={form.endTime} onChange={(event) => onChange({ endTime: event.target.value })} className="form-input" />
        </label>
        <label className="form-group">
          <span className="form-label">Hours</span>
          <input readOnly value={formatHours(hours)} className={`form-input ${hours <= 0 ? "input-error" : ""}`} />
        </label>
        <label className="form-group">
          <span className="form-label">Notes</span>
          <input value={form.notes} onChange={(event) => onChange({ notes: event.target.value })} className="form-input" placeholder="Optional" />
        </label>
      </div>;
  }
  return <div className="timesheet-entry-root">
      <div className="entry-content">
        <div className="entry-topbar">
          <div>
            <p className="entry-kicker">TIMESHEETS</p>
            <h1 className="entry-title">Entry and review workspace</h1>
            <p className="entry-description">Create daily, weekly, or monthly entries with automatic hour calculation before approval submission.</p>
          </div>
          <button className="back-button" onClick={() => navigate("/timesheet")}>
            <ArrowLeft size={18} />
            Back to calendar
          </button>
        </div>

        {!reviewOnly ? <div className="entry-tabs">
          {[
    ["daily", "Daily Entry", "Different work per day"],
    ["weekly", "Weekly Entry", "Same pattern across weekdays"],
    ["monthly", "Monthly Entry", "Same pattern across the month"],
    ["review", "Review Timesheet", "Validate and submit"]
  ].map(([tab, label, description]) => <button key={tab} className={`tab ${visibleTab === tab ? "tab-active" : ""}`} onClick={() => setActiveTab(tab)}>
              <div className="tab-title">{label}</div>
              <div className="tab-subtitle">{description}</div>
            </button>)}
        </div> : null}

        {visibleTab === "daily" ? <div className="entry-panel">
            <div className="entry-section-header compact">
              <div>
                <h2 className="entry-section-title">Daily entry</h2>
                <p className="entry-section-description">Use this when work changes throughout the day. Hours are calculated from start and end time.</p>
              </div>
              <button className="add-entry-button" onClick={() => setDailyForms((current) => [...current, defaultForm()])}>
                <Plus size={18} />
                Add entry
              </button>
            </div>

            <div className="entries-list">
              {dailyForms.map((form, index) => <div key={`${form.date}-${index}`} className="entry-item">
                  <div className="entry-item-header">
                    <h3 className="entry-item-title">Entry {index + 1}</h3>
                    <button className="remove-button" disabled={dailyForms.length === 1} onClick={() => setDailyForms((current) => current.filter((_, formIndex) => formIndex !== index))}>
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                  {renderEntryFields(form, (nextForm) => updateDailyForm(index, nextForm))}
                </div>)}
            </div>

            <div className="entry-footer">
              <p className="hours-summary">{formatHours(dailyHours)} calculated across {dailyForms.length} daily entr{dailyForms.length === 1 ? "y" : "ies"}.</p>
              <button className="submit-button" onClick={submitDailyEntries}>
                <Send size={18} />
                Submit Daily Entry
              </button>
            </div>
          </div> : null}

        {visibleTab === "weekly" ? <div className="entry-panel">
            <div className="entry-section-header compact">
              <div>
                <h2 className="entry-section-title">Weekly entry</h2>
                <p className="entry-section-description">Generate daily records for selected weekdays using one project, task, and time range.</p>
              </div>
              <button className="add-entry-button" onClick={copyPreviousWeek}>
                <Copy size={18} />
                Copy Previous Week
              </button>
            </div>
            <label className="form-group short-field">
              <span className="form-label">Week start date</span>
              <input type="date" value={weeklyForm.date} onChange={(event) => setWeeklyForm((current) => ({ ...current, date: startOfWeek(event.target.value) }))} className="form-input" />
            </label>
            {renderEntryFields(weeklyForm, (nextForm) => setWeeklyForm((current) => ({ ...current, ...nextForm })), false)}
            <div className="option-grid">
              {weekdayOptions.map((day) => <label key={day.label} className="check-card">
                  <input
    type="checkbox"
    checked={selectedWeekdays.includes(day.offset)}
    onChange={() => setSelectedWeekdays((current) => current.includes(day.offset) ? current.filter((offset) => offset !== day.offset) : [...current, day.offset].sort())}
  />
                  {day.label}
                </label>)}
            </div>
            <div className="entry-footer">
              <p className="hours-summary">{weeklyGeneratedCount} daily records will be generated, {formatHours(calculateHours(weeklyForm.startTime, weeklyForm.endTime) * weeklyGeneratedCount)} total.</p>
              <div className="button-row">
                <button className="add-entry-button" onClick={() => generateWeeklyEntries(false)}>
                  <Save size={18} />
                  Generate Entries
                </button>
                <button className="submit-button" onClick={() => generateWeeklyEntries(true)}>
                  <Send size={18} />
                  Submit Weekly Entry
                </button>
              </div>
            </div>
          </div> : null}

        {visibleTab === "monthly" ? <div className="entry-panel">
            <div className="entry-section-header">
              <h2 className="entry-section-title">Monthly entry</h2>
              <p className="entry-section-description">Generate repeated daily records for working days in the selected month.</p>
            </div>
            <label className="form-group short-field">
              <span className="form-label">Month</span>
              <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="form-input" />
            </label>
            {renderEntryFields(monthlyForm, (nextForm) => setMonthlyForm((current) => ({ ...current, ...nextForm })), false)}
            <div className="option-grid three">
              {[
    ["Apply to entire month", applyEntireMonth, setApplyEntireMonth],
    ["Exclude weekends", excludeWeekends, setExcludeWeekends],
    ["Exclude holidays", excludeHolidays, setExcludeHolidays]
  ].map(([label, checked, setter]) => <label key={label} className="check-card">
                  <input type="checkbox" checked={checked} onChange={(event) => setter(event.target.checked)} />
                  {label}
                </label>)}
            </div>
            <div className="entry-footer">
              <p className="hours-summary">{monthlyGeneratedDates.length} records will be generated, {formatHours(calculateHours(monthlyForm.startTime, monthlyForm.endTime) * monthlyGeneratedDates.length)} total.</p>
              <div className="button-row">
                <button className="add-entry-button" onClick={() => generateMonthlyEntries(false)}>
                  <Save size={18} />
                  Generate Monthly Entries
                </button>
                <button className="submit-button" onClick={() => generateMonthlyEntries(true)}>
                  <Send size={18} />
                  Submit Monthly Entry
                </button>
              </div>
            </div>
          </div> : null}

        {visibleTab === "review" ? <div className="review-space">
            <div className="summary-grid">
              {[
    ["Total Hours", formatHours(totalReviewHours)],
    ["Editable", editableReviewEntries.length],
    ["Pending", employeeEntries.filter((entry) => entry.status === "pending").length],
    ["Approved", employeeEntries.filter((entry) => entry.status === "approved").length]
  ].map(([label, value]) => <div key={label} className="summary-card">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>)}
            </div>
            <div className="entry-panel">
              <div className="entry-section-header compact">
                <div>
                  <h2 className="entry-section-title">Daily records</h2>
                  <p className="entry-section-description">Review all logged entries before approval submission.</p>
                </div>
                <button className="submit-button" onClick={submitForApproval}>
                  <Send size={18} />
                  Submit For Approval
                </button>
              </div>
              <div className="review-table-wrap">
                <table className="review-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Project</th>
                      <th>Task</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Hours</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeEntries.map((entry) => {
    const isEditing = editingEntryId === entry.id;
    return <tr key={entry.id}>
                          <td>{isEditing ? <input type="date" defaultValue={entry.date} className="form-input mini" onBlur={(event) => saveEditedEntry(entry, { date: event.target.value })} /> : entry.date}</td>
                          <td>{entry.project}</td>
                          <td>{entry.taskCategory}</td>
                          <td>{isEditing ? <input type="time" defaultValue={entry.startTime} className="form-input mini" onBlur={(event) => saveEditedEntry(entry, { startTime: event.target.value })} /> : entry.startTime}</td>
                          <td>{isEditing ? <input type="time" defaultValue={entry.endTime} className="form-input mini" onBlur={(event) => saveEditedEntry(entry, { endTime: event.target.value })} /> : entry.endTime}</td>
                          <td>{formatHours(entry.hours)}</td>
                          <td><span className={`status-pill ${entry.status ?? "draft"}`}>{statusLabel(entry.status)}</span></td>
                          <td>
                            <div className="button-row">
                              <button className="add-entry-button tiny" disabled={entry.status === "pending" || entry.status === "approved"} onClick={() => setEditingEntryId(entry.id)}>
                                <Edit3 size={14} />
                                Edit
                              </button>
                              <button className="remove-button" disabled={entry.status === "pending" || entry.status === "approved"} onClick={() => deleteEntry(entry)}>
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>;
  })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="review-summary-panels">
              <div className="entry-panel validation-panel">
                <div className="entry-section-header">
                  <h2 className="entry-section-title">Weekly summary</h2>
                  <p className="entry-section-description">Week-wise totals.</p>
                </div>
                <div className="summary-list">
                  {Object.entries(weeklySummary).map(([week, hours]) => <div key={week} className="summary-row">
                      <span>Week of {week}</span>
                      <strong>{formatHours(hours)}</strong>
                    </div>)}
                </div>
              </div>
              <div className="entry-panel validation-panel">
                <div className="entry-section-header">
                  <h2 className="entry-section-title">Monthly summary</h2>
                  <p className="entry-section-description">Month-wise totals.</p>
                </div>
                <div className="summary-list">
                  {Object.entries(monthlySummary).map(([summaryMonth, hours]) => <div key={summaryMonth} className="summary-row">
                      <span>{summaryMonth}</span>
                      <strong>{formatHours(hours)}</strong>
                    </div>)}
                </div>
              </div>
              <div className="entry-panel validation-panel">
                <div className="entry-section-header compact">
                  <div>
                    <h2 className="entry-section-title">Validation checks</h2>
                    <p className="entry-section-description">Missing data, overlaps, and invalid time ranges.</p>
                  </div>
                  <ClipboardList size={18} />
                </div>
                {validationMessages.length > 0 ? <ul className="validation-list">
                    {validationMessages.map((message) => <li key={message}>{message}</li>)}
                  </ul> : <p className="hours-summary">No blocking validation issues found.</p>}
              </div>
            </div>
          </div> : null}
      </div>
    </div>;
};
export {
  NewTimesheetPage
};
