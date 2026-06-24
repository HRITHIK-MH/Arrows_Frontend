import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileCheck2,
  Filter,
  Plus,
  Send,
  Trash2,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  approveTimesheetEntry,
  deleteTimesheetEntry,
  getTimesheetEntries,
  rejectTimesheetEntry,
  submitEntriesForApproval
} from "@/modules/timesheets/utils/timesheetStorage";
import { demoUsers, holidayCalendar, getCurrentTimesheetUser } from "@/modules/timesheets/data";
import "../styles/Timesheets.css";
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const statusMeta = {
  draft: {
    label: "Completed",
    dot: "completed"
  },
  pending: {
    label: "Pending approval",
    dot: "pending"
  },
  approved: {
    label: "Approved",
    dot: "approved"
  },
  rejected: {
    label: "Rejected",
    dot: "rejected"
  },
  missing: {
    label: "Missing entry",
    dot: "missing"
  },
  weekend: {
    label: "Weekend/Holiday",
    dot: "weekend"
  }
};
function currentMonthValue() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
}
function monthLabel(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(year, monthIndex - 1, 1));
}
function dateKey(date) {
  return date.toISOString().slice(0, 10);
}
function dateFromMonthDay(month, day) {
  return `${month}-${String(day).padStart(2, "0")}`;
}
function addMonths(month, offset) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1 + offset, 1);
  return date.toISOString().slice(0, 7);
}
function isWeekend(date) {
  const day = (/* @__PURE__ */ new Date(`${date}T00:00:00`)).getDay();
  return day === 0 || day === 6;
}
function isHoliday(date) {
  return holidayCalendar.some((holiday) => holiday.date === date);
}
function calculateMonthDays(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, index) => dateFromMonthDay(month, index + 1));
  return [...blanks, ...days];
}
function getDominantStatus(date, entries) {
  if (entries.length === 0) {
    return isWeekend(date) || isHoliday(date) ? "weekend" : "missing";
  }
  if (entries.some((entry) => entry.status === "rejected")) return "rejected";
  if (entries.some((entry) => entry.status === "pending")) return "pending";
  if (entries.every((entry) => entry.status === "approved")) return "approved";
  return "draft";
}
function formatHours(hours) {
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 2)}h`;
}
function statusBadge(status) {
  return <span className={`status ${status}`}>{statusMeta[status].label}</span>;
}
function newTimesheetUrl(date) {
  const params = new URLSearchParams({ tab: "daily" });
  if (date) params.set("date", date);
  return `/timesheet/new?${params.toString()}`;
}
function TimesheetsPage() {
  const navigate = useNavigate();
  const user = getCurrentTimesheetUser();
  const [entries, setEntries] = useState(() => getTimesheetEntries());
  const [month, setMonth] = useState(currentMonthValue());
  const [selectedDate, setSelectedDate] = useState(dateKey(/* @__PURE__ */ new Date()));
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerEmployeeId, setManagerEmployeeId] = useState("all");
  const isManagerPersona = user?.role === "manager" || user?.role === "admin";
  const visibleEmployeeId = isManagerPersona && managerEmployeeId !== "all" ? managerEmployeeId : user?.id ?? "";
  const calendarEntries = useMemo(() => {
    const monthEntries = entries.filter((entry) => entry.date.startsWith(month));
    if (isManagerPersona) {
      return managerEmployeeId === "all" ? monthEntries : monthEntries.filter((entry) => entry.employeeId === managerEmployeeId);
    }
    return monthEntries.filter((entry) => entry.employeeId === visibleEmployeeId);
  }, [entries, isManagerPersona, managerEmployeeId, month, visibleEmployeeId]);
  const calendarDays = useMemo(() => calculateMonthDays(month), [month]);
  const selectedDayEntries = calendarEntries.filter((entry) => entry.date === selectedDate);
  const workingDays = calendarDays.filter((day) => day !== null && !isWeekend(day) && !isHoliday(day));
  const filledDays = new Set(calendarEntries.map((entry) => entry.date)).size;
  const missingDays = workingDays.filter((day) => !calendarEntries.some((entry) => entry.date === day)).length;
  const totalHours = calendarEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const pendingEntries = calendarEntries.filter((entry) => entry.status === "pending");
  const approvedEntries = calendarEntries.filter((entry) => entry.status === "approved");
  const rejectedEntries = calendarEntries.filter((entry) => entry.status === "rejected");
  const editableEntries = calendarEntries.filter((entry) => entry.status === "draft" || entry.status === "rejected");
  const weeklyTrend = useMemo(() => {
    return [1, 2, 3, 4, 5].map((week) => {
      const hours = calendarEntries.filter((entry) => Math.ceil(Number(entry.date.slice(-2)) / 7) === week).reduce((sum, entry) => sum + entry.hours, 0);
      return { week: `W${week}`, hours };
    });
  }, [calendarEntries]);
  const projectDistribution = useMemo(() => {
    const totals = calendarEntries.reduce((summary, entry) => {
      summary[entry.project] = (summary[entry.project] ?? 0) + entry.hours;
      return summary;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [calendarEntries]);
  const teamSummary = useMemo(() => {
    return demoUsers.filter((employee) => employee.role === "employee").map((employee) => {
      const employeeEntries = entries.filter((entry) => entry.employeeId === employee.id && entry.date.startsWith(month));
      const employeeFilledDays = new Set(employeeEntries.map((entry) => entry.date)).size;
      return {
        employee,
        filledDays: employeeFilledDays,
        missingDays: Math.max(0, workingDays.length - employeeFilledDays),
        pendingApproval: employeeEntries.filter((entry) => entry.status === "pending").length,
        rejected: employeeEntries.filter((entry) => entry.status === "rejected").length
      };
    });
  }, [entries, month, workingDays.length]);
  function refreshEntries() {
    setEntries(getTimesheetEntries());
  }
  function handleDelete(entryId) {
    const entry = entries.find((item) => item.id === entryId);
    if (entry?.status === "pending" || entry?.status === "approved") {
      toast.error("Submitted or approved entries are locked.");
      return;
    }
    deleteTimesheetEntry(entryId);
    refreshEntries();
    toast.success("Timesheet entry deleted.");
  }
  function handleSubmitForApproval() {
    if (editableEntries.length === 0) {
      toast.error("No editable entries are ready for approval.");
      return;
    }
    submitEntriesForApproval(editableEntries.map((entry) => entry.id));
    refreshEntries();
    toast.success("Editable entries submitted for manager approval.");
  }
  function handleManagerAction(entryId, action) {
    if (action === "approve") {
      approveTimesheetEntry(entryId, "Approved from manager dashboard.");
      toast.success("Entry approved.");
    } else {
      rejectTimesheetEntry(entryId, "Please update the task details and resubmit.");
      toast.success("Entry rejected and reopened for employee editing.");
    }
    refreshEntries();
  }
  return <div className="timesheet-root">
      <div className="timesheet-header">
        <div>
          <p className="kicker">TIMESHEETS</p>
          <h1>Calendar dashboard</h1>
          <p className="lead">Log, review, submit, and track timesheets from a visual monthly calendar.</p>
        </div>
        <div className="header-actions">
          <button className="btn outline" onClick={() => navigate("/timesheet/new?tab=review")}>
            <FileCheck2 size={16} style={{ display: "inline", marginRight: "6px" }} />
            Review
          </button>
          <button className="btn primary" onClick={() => navigate(newTimesheetUrl())}>
            <Plus size={16} style={{ display: "inline", marginRight: "6px" }} />
            Add entry
          </button>
        </div>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-value">{formatHours(totalHours)}</div>
          <div className="metric-title">Total hours</div>
          <div className="metric-sub">{monthLabel(month)}</div>
          <Clock3 size={24} style={{ marginTop: "12px", opacity: 0.6 }} />
        </div>
        <div className="metric-card">
          <div className="metric-value">{filledDays}</div>
          <div className="metric-title">Filled days</div>
          <div className="metric-sub">Days with entries</div>
          <CheckCircle2 size={24} style={{ marginTop: "12px", opacity: 0.6 }} />
        </div>
        <div className="metric-card">
          <div className="metric-value">{missingDays}</div>
          <div className="metric-title">Missing days</div>
          <div className="metric-sub">Working days open</div>
          <CalendarDays size={24} style={{ marginTop: "12px", opacity: 0.6 }} />
        </div>
        <div className="metric-card">
          <div className="metric-value">{pendingEntries.length}</div>
          <div className="metric-title">Pending approval</div>
          <div className="metric-sub">Locked for review</div>
          <Send size={24} style={{ marginTop: "12px", opacity: 0.6 }} />
        </div>
        <div className="metric-card">
          <div className="metric-value">{approvedEntries.length}</div>
          <div className="metric-title">Approved entries</div>
          <div className="metric-sub">Manager cleared</div>
          <FileCheck2 size={24} style={{ marginTop: "12px", opacity: 0.6 }} />
        </div>
        <div className="metric-card">
          <div className="metric-value">{rejectedEntries.length}</div>
          <div className="metric-title">Rejected entries</div>
          <div className="metric-sub">Editable again</div>
          <BarChart3 size={24} style={{ marginTop: "12px", opacity: 0.6 }} />
        </div>
      </div>

      <div className="content-grid">
        <div className="calendar-card">
          <div className="calendar-controls">
            <div className="month">{monthLabel(month)}</div>
            <div className="filters">
              {isManagerPersona && <select className="filters" value={managerEmployeeId} onChange={(event) => setManagerEmployeeId(event.target.value)}>
                  <option value="all">All employees</option>
                  {demoUsers.filter((employee) => employee.role === "employee").map((employee) => <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>)}
                </select>}
              <select className="filters" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                {Object.entries(statusMeta).map(([status, meta]) => <option key={status} value={status}>
                    {meta.label}
                  </option>)}
              </select>
              <button className="btn outline" aria-label="Previous month" onClick={() => setMonth((current) => addMonths(current, -1))}>
                <ChevronLeft size={18} />
              </button>
              <button className="btn outline" aria-label="Next month" onClick={() => setMonth((current) => addMonths(current, 1))}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="legend">
            {Object.entries(statusMeta).map(([status, meta]) => <div key={status} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={`dot ${meta.dot}`} />
                {meta.label}
              </div>)}
          </div>

          <div className="calendar-grid">
            <div className="week-head">
              {dayNames.map((day) => <div key={day} style={{ textAlign: "center" }}>
                  {day}
                </div>)}
            </div>
            <div className="days">
              {calendarDays.map((day, index) => {
    if (!day) {
      return <div key={`blank-${index}`} className="day-cell empty" />;
    }
    const dayEntries = calendarEntries.filter((entry) => entry.date === day);
    const status = getDominantStatus(day, dayEntries);
    const hiddenByFilter = statusFilter !== "all" && status !== statusFilter;
    const dayHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
    return <button
      key={day}
      type="button"
      onClick={() => setSelectedDate(day)}
      className={`day-cell ${status} ${hiddenByFilter ? "day-cell-filtered" : ""} ${selectedDate === day ? "day-cell-selected" : ""}`}
      style={{
        opacity: hiddenByFilter ? 0.35 : 1,
        cursor: hiddenByFilter ? "default" : "pointer",
        border: selectedDate === day ? "2px solid #2563eb" : "none"
      }}
    >
                    <div className="day-num">{Number(day.slice(-2))}</div>
                    <div className="day-title">{statusMeta[status].label}</div>
                    {dayEntries.length > 0 ? <>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{dayEntries[0].project}</div>
                        <div className="day-hours">{formatHours(dayHours)}</div>
                      </> : <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{isHoliday(day) ? "Holiday" : "No records"}</div>}
                  </button>;
  })}
            </div>
          </div>
        </div>

        <div className="ts-sidebar">
          <div className="day-panel">
            <div className="day-panel-header">
              <div style={{ fontWeight: 700 }}>
                {new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(/* @__PURE__ */ new Date(`${selectedDate}T00:00:00`))}
              </div>
              {statusBadge(getDominantStatus(selectedDate, selectedDayEntries))}
            </div>

            <div>
              {selectedDayEntries.length > 0 ? selectedDayEntries.map((entry) => <div key={entry.id} className="entry-card">
                    <div className="entry-title">{entry.project}</div>
                    <div className="entry-sub">{entry.taskCategory}</div>
                    <div className="entry-row">
                      <span>Start</span>
                      <span>{entry.startTime ?? "09:00"}</span>
                    </div>
                    <div className="entry-row">
                      <span>End</span>
                      <span>{entry.endTime ?? "17:00"}</span>
                    </div>
                    <div className="entry-row">
                      <span>Hours</span>
                      <span>{formatHours(entry.hours)}</span>
                    </div>
                    {entry.notes && <div className="entry-note">{entry.notes}</div>}
                    <div className="entry-actions">
                      <button className="btn outline" onClick={() => navigate("/timesheet/new?tab=review")}>
                        <Eye size={14} style={{ marginRight: "4px" }} />
                        View
                      </button>
                      <button
    className="btn outline"
    disabled={entry.status === "pending" || entry.status === "approved"}
    onClick={() => navigate(newTimesheetUrl(entry.date))}
  >
                        <Edit3 size={14} style={{ marginRight: "4px" }} />
                        Edit
                      </button>
                      <button
    className="btn ghost"
    disabled={entry.status === "pending" || entry.status === "approved"}
    onClick={() => handleDelete(entry.id)}
  >
                        <Trash2 size={14} style={{ marginRight: "4px" }} />
                        Delete
                      </button>
                    </div>
                  </div>) : <div style={{ padding: "16px", color: "#6b7280", fontSize: "14px" }}>No entries for this day.</div>}
              <button className="btn full primary" onClick={() => navigate(newTimesheetUrl(selectedDate))}>
                <Plus size={14} style={{ marginRight: "6px" }} />
                Create entry
              </button>
            </div>
          </div>
          <div className="ts-sidebar-card">
            <h3>Weekly summary</h3>
            <p>Visual weekly totals and missing days.</p>
            <div className="summary-bars">
              {weeklyTrend.map((week) => <div key={week.week} className="summary-bar-row">
                  <span>{week.week}</span>
                  <div className="summary-bar-track">
                    <div className="summary-bar-fill" style={{ width: `${Math.min(100, week.hours / 40 * 100)}%` }} />
                  </div>
                  <strong>{formatHours(week.hours)}</strong>
                </div>)}
            </div>
          </div>
          <div className="ts-sidebar-card">
            <h3>Project distribution</h3>
            <p>Current month logged hours.</p>
            <div className="summary-bars">
              {projectDistribution.length > 0 ? projectDistribution.map(([project, hours]) => <div key={project} className="project-summary">
                    <div><span>{project}</span><strong>{formatHours(hours)}</strong></div>
                    <div className="summary-bar-track">
                      <div className="summary-bar-fill project" style={{ width: `${Math.min(100, hours / Math.max(1, totalHours) * 100)}%` }} />
                    </div>
                  </div>) : <p>No project hours yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card approval-card">
        <div className="section-header">
          <div>
            <h2>Approval status</h2>
            <p>Draft and rejected entries can be edited. Pending and approved entries are locked.</p>
          </div>
          <button className="btn primary" onClick={handleSubmitForApproval}>
            <Send size={16} />
            Submit for approval
          </button>
        </div>
        <div className="approval-grid">
          {["draft", "pending", "approved", "rejected"].map((status) => <div key={status} className="approval-tile">
              {statusBadge(status)}
              <strong>{calendarEntries.filter((entry) => (entry.status ?? "draft") === status).length}</strong>
              <span>{status === "draft" ? "Editable entries" : status === "pending" ? "Manager review" : status === "approved" ? "Locked and approved" : "Needs correction"}</span>
            </div>)}
        </div>
      </div>

      {isManagerPersona ? <div className="section-card team-card">
        <div className="section-header">
          <div>
            <h2>Team timesheet dashboard</h2>
            <p>Manager view for pending approvals and team gaps.</p>
          </div>
          <span className="manager-pill">Manager</span>
        </div>
        <div className="table-wrap">
          <table className="timesheet-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Filled days</th>
                <th>Missing days</th>
                <th>Pending approval</th>
                <th>Rejected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamSummary.map((item) => {
    const firstPending = entries.find((entry) => entry.employeeId === item.employee.id && entry.status === "pending" && entry.date.startsWith(month));
    return <tr key={item.employee.id}>
                    <td>
                      <strong>{item.employee.name}</strong>
                      <span>{item.employee.department}</span>
                    </td>
                    <td>{item.filledDays}</td>
                    <td>{item.missingDays}</td>
                    <td>{item.pendingApproval}</td>
                    <td>{item.rejected}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn outline" onClick={() => setManagerEmployeeId(item.employee.id)}>
                          <Users size={14} />
                          Calendar
                        </button>
                        <button className="btn primary" disabled={!firstPending} onClick={() => firstPending && handleManagerAction(firstPending.id, "approve")}>
                          Approve
                        </button>
                        <button className="btn outline" disabled={!firstPending} onClick={() => firstPending && handleManagerAction(firstPending.id, "reject")}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>;
  })}
            </tbody>
          </table>
        </div>
      </div> : null}

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>Timesheet APIs</h2>
            <p>Frontend integration contract retained for backend handoff.</p>
          </div>
          <Filter size={18} />
        </div>
        <div className="api-grid">
          <span>GET /timesheets/calendar</span>
          <span>GET /timesheets/day/{selectedDate}</span>
          <span>POST /timesheets/daily</span>
          <span>POST /timesheets/weekly</span>
          <span>POST /timesheets/monthly</span>
          <span>POST /timesheets/submit-approval</span>
          <span>POST /timesheets/approve</span>
          <span>POST /timesheets/reject</span>
        </div>
      </div>
    </div>;
}
export {
  TimesheetsPage
};
