import { useEffect, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Job Openings", path: "/jobs" },
    { label: "Candidates", path: "/candidates" },
    { label: "Interviews", path: "/dashboard" },
    { label: "Reports", path: "/dashboard" },
    { label: "Chat", path: "/dashboard" },
    // { label: "Calendar", path: "/dashboard" }, // Disabled for later
    // { label: "User Roles", path: "/dashboard" }, // Disabled for later
  ];

  const stats = [
    { title: "Total Open Positions", value: jobs.length || "0", sub: "Live openings", tone: "blue" },
  ];

  const tasks = [];
  const chart = [];
  const candidates = [];

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    setJobsError("");
    try {
      const res = await fetch(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      setJobsError(err.message || "Unable to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    const handleFocus = () => fetchJobs();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchJobs();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchJobs]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">ARROWS</div>
        <ul className="nav-list">
          {navItems.map(item => (
            <li
              key={item.label}
              className={`nav-item ${pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">*</span>
              {item.label}
            </li>
          ))}
        </ul>
        <button className="btn btn-ghost" onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}>
          Logout
        </button>
      </aside>

      <main className="main">
        <div className="topbar">
          <h2 className="page-title">Dashboard</h2>
          <div className="search">
            <input type="search" placeholder="Search here..." />
          </div>
          <div className="top-right">
            <span className="pill">This week</span>
            <div className="avatar">DM</div>
          </div>
        </div>

        <div className="summary-grid">
          {stats.map(stat => (
            <div key={stat.title} className={`stat-card ${stat.tone}`}>
              <div className="stat-label">{stat.title}</div>
              <p className="stat-value">{stat.value}</p>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {jobsError && <div className="muted" style={{ color: "#f75555" }}>Jobs: {jobsError}</div>}
        {loadingJobs && <div className="muted">Refreshing job openings...</div>}

        <div className="card status-card">
          <div>
            <div className="stat-label">Recruitment Status</div>
            <div className="progress-bar" aria-label="Recruitment progress">
              <div className="progress-fill" style={{ width: "100%" }}></div>
            </div>
            <div className="status-legend">
              <span>No recruitment status data available.</span>
            </div>
            <div className="to-performer">
              <span>-</span>
              <span>-</span>
            </div>
          </div>
          <div className="tasks">
            {tasks.map(task => (
              <div key={task.title} className={`task-card ${task.tone === "blue" ? "blue" : task.tone === "gold" ? "gold" : ""}`}>
                <div className="task-info">
                  <strong>{task.title}</strong>
                  <span className="muted">+{task.progress}%</span>
                </div>
                <div className="task-bar">
                  <div className="task-fill" style={{ width: `${task.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-grid">
          <div className="chart-card">
            <div className="stat-label">Hiring Metrics</div>
            <div className="bar-chart">
              {chart.map(bar => (
                <div key={bar.month} className="bar-col">
                  <div className="bar" style={{ height: `${bar.height * 2}px` }}></div>
                  <div className="bar-label">{bar.month}</div>
                </div>
              ))}
            </div>
            <div className="stat-sub">No of openings vs Completed</div>
          </div>

          <div className="data-card">
            <div className="stat-label">Candidates Status</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Applied For Role</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(person => (
                  <tr key={person.name}>
                    <td>{person.name}</td>
                    <td>{person.role}</td>
                    <td>{person.stage}</td>
                    <td><span className={`badge ${person.badge}`}>{person.status}</span></td>
                    <td>{person.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="stat-sub">Showing {candidates.length} entries</div>
          </div>
        </div>
      </main>
    </div>
  );
}

