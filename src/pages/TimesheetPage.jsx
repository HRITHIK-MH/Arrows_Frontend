import React from 'react'
import './TimesheetPage.css'

const MetricCard = ({title, value, subtitle, accent}) => (
  <div className={"metric-card " + (accent || '')}>
    <div className="metric-body">
      <div className="metric-value">{value}</div>
      <div className="metric-title">{title}</div>
      {subtitle && <div className="metric-sub">{subtitle}</div>}
    </div>
  </div>
)

const DayCell = ({day, state, title, hours}) => (
  <div className={"day-cell " + (state || '')}>
    <div className="day-num">{day}</div>
    {title && <div className="day-title">{title}</div>}
    {hours && <div className="day-hours">{hours}h</div>}
  </div>
)

export default function TimesheetPage() {
  const days = [
    {d:1, s:'approved', t:'HRMS Portal', h:8},
    {d:2, s:'approved', t:'Client Analytics', h:8},
    {d:3, s:'missing'},
    {d:4, s:'pending', t:'HRMS Portal', h:16},
    {d:5, s:'missing'},
    {d:6, s:'weekend'},
    {d:7, s:'weekend'},
    {d:8, s:'completed', t:'Internal Auto', h:8},
    {d:9, s:'rejected', t:'Internal Auto', h:8},
    {d:10, s:'rejected', t:'Payroll Modern', h:8},
    {d:11, s:'pending', t:'HRMS Portal', h:8},
    {d:12, s:'completed', t:'HRMS Portal', h:8},
  ]

  return (
    <div className="timesheet-root">
      <header className="timesheet-header">
        <div>
          <div className="kicker">TIMESHEETS</div>
          <h1>Calendar dashboard</h1>
          <p className="lead">Log, review, submit, and track timesheets from a visual monthly calendar.</p>
        </div>
        <div className="header-actions">
          <button className="btn">Review</button>
          <button className="btn primary">+ Add entry</button>
        </div>
      </header>

      <section className="metrics-row">
        <MetricCard title="Total hours" value="96h" subtitle="June 2026"/>
        <MetricCard title="Filled days" value="11" subtitle="Days with entries"/>
        <MetricCard title="Missing days" value="10" subtitle="Working days open"/>
        <MetricCard title="Pending approval" value="3" subtitle="Locked for review"/>
        <MetricCard title="Approved entries" value="3" subtitle="Manager cleared"/>
        <MetricCard title="Rejected entries" value="2" subtitle="Editable again"/>
      </section>

      <main className="content-grid">
        <div className="calendar-card">
          <div className="calendar-controls">
            <div className="month">June 2026</div>
            <div className="filters">
              <select><option>All employees</option></select>
              <select><option>All statuses</option></select>
            </div>
          </div>

          <div className="legend">
            <span className="dot completed"></span> Completed
            <span className="dot pending"></span> Pending approval
            <span className="dot approved"></span> Approved
            <span className="dot rejected"></span> Rejected
            <span className="dot missing"></span> Missing entry
            <span className="dot weekend"></span> Weekend/Holiday
          </div>

          <div className="calendar-grid">
            <div className="week-head">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="days">
              {days.map((it)=> (
                <DayCell key={it.d} day={it.d} state={it.s} title={it.t} hours={it.h} />
              ))}
              {Array.from({length: (7*6 - days.length)}).map((_,i)=>(<div className="day-cell empty" key={'e'+i}></div>))}
            </div>
          </div>
        </div>

        <aside className="ts-sidebar">
          <div className="day-panel">
            <div className="day-panel-header">
              <div>Jun 18, 2026</div>
              <div className="status completed">Completed</div>
            </div>
            <p className="day-panel-subtitle">Day details and quick options.</p>

            <div className="entry-card">
              <div className="entry-title">Internal Automation</div>
              <div className="entry-sub">Documentation</div>
              <div className="entry-row"><div>Start</div><div>09:00</div></div>
              <div className="entry-row"><div>End</div><div>17:00</div></div>
              <div className="entry-row"><div>Hours</div><div>8h</div></div>
              <p className="entry-note">Completed planned work.</p>
              <div className="entry-actions">
                <button className="btn outline">View</button>
                <button className="btn outline">Edit</button>
                <button className="btn ghost">Delete</button>
              </div>
            </div>

            <button className="btn primary full">+ Create entry for this date</button>
          </div>

          <div className="ts-sidebar-card weekly-summary">
            <h3>Weekly summary</h3>
            <p className="section-subtitle">Visual weekly totals and missing days.</p>
            <div className="weekly-bars">
              <div className="weekly-row">
                <span className="week-label">W1</span>
                <div className="bar-container">
                  <div className="bar" style={{width: '80%'}}></div>
                </div>
                <span className="hours">32h</span>
              </div>
              <div className="weekly-row">
                <span className="week-label">W2</span>
                <div className="bar-container">
                  <div className="bar" style={{width: '100%'}}></div>
                </div>
                <span className="hours">40h</span>
              </div>
              <div className="weekly-row">
                <span className="week-label">W3</span>
                <div className="bar-container">
                  <div className="bar" style={{width: '80%'}}></div>
                </div>
                <span className="hours">32h</span>
              </div>
              <div className="weekly-row">
                <span className="week-label">W4</span>
                <div className="bar-container">
                  <div className="bar" style={{width: '0%'}}></div>
                </div>
                <span className="hours">0h</span>
              </div>
              <div className="weekly-row">
                <span className="week-label">W5</span>
                <div className="bar-container">
                  <div className="bar" style={{width: '0%'}}></div>
                </div>
                <span className="hours">0h</span>
              </div>
            </div>
          </div>

          <div className="ts-sidebar-card project-distribution">
            <h3>Project distribution</h3>
            <p className="section-subtitle">Current month logged hours.</p>
            <div className="project-bars">
              <div className="project-row">
                <span className="project-name">HRMS Portal</span>
                <span className="hours">48h</span>
              </div>
              <div className="bar-container">
                <div className="bar" style={{width: '100%'}}></div>
              </div>

              <div className="project-row">
                <span className="project-name">Internal Automation</span>
                <span className="hours">32h</span>
              </div>
              <div className="bar-container">
                <div className="bar" style={{width: '66.7%'}}></div>
              </div>

              <div className="project-row">
                <span className="project-name">Client Analytics</span>
                <span className="hours">16h</span>
              </div>
              <div className="bar-container">
                <div className="bar" style={{width: '33.3%'}}></div>
              </div>

              <div className="project-row">
                <span className="project-name">Payroll Modernization</span>
                <span className="hours">8h</span>
              </div>
              <div className="bar-container">
                <div className="bar" style={{width: '16.7%'}}></div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
