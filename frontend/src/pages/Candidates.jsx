import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Candidates() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    role: "",
    stage: "Screening",
    status: "In Review",
    remarks: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const idCounter = useRef(1);
  const dragIndex = useRef(null);
  const [stageOptions, setStageOptions] = useState([
    "Screening",
    "Interview Round 1",
    "Interview Round 2",
    "Final Round",
    "Offer Discussion",
    "Hired",
    "Rejected",
  ]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Job Openings", path: "/jobs" },
    { label: "Candidates", path: "/candidates" },
    { label: "Interviews", path: "/dashboard" },
    { label: "Reports", path: "/dashboard" },
    { label: "Chat", path: "/dashboard" },
    { label: "Calendar", path: "/dashboard" },
    { label: "User Roles", path: "/dashboard" },
  ];

  const statusBadge = (status) => {
    const s = status.toLowerCase();
    if (s.includes("review")) return "blue";
    if (s.includes("schedule")) return "orange";
    if (s.includes("offer")) return "green";
    if (s.includes("progress")) return "orange";
    if (s.includes("close") || s.includes("hire")) return "purple";
    if (s.includes("reject")) return "rose";
    return "blue";
  };

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === "all" || c.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [candidates, search, stageFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortDir, sortKey]);

  const statusOptions = ["In Review", "Scheduled", "Offer Sent", "In Progress", "Closed", "Rejected"];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.role) return;
    const id = idCounter.current++;
    setCandidates([...candidates, { ...newCandidate, id, badge: statusBadge(newCandidate.status) }]);
    setNewCandidate({ name: "", role: "", stage: "Screening", status: "In Review", remarks: "" });
    setShowForm(false);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleAddStage = () => {
    const name = prompt("Enter new process/stage name:");
    if (!name) return;
    const clean = name.trim();
    if (!clean || stageOptions.includes(clean)) return;
    setStageOptions([...stageOptions, clean]);
  };

  const handleDragStart = (index) => () => {
    dragIndex.current = index;
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const updated = [...stageOptions];
    const [moved] = updated.splice(from, 1);
    updated.splice(index, 0, moved);
    dragIndex.current = null;
    setStageOptions(updated);
  };

  const startEdit = (person) => {
    setEditingId(person.id);
    setEditingRow({ ...person });
  };

  const saveEdit = () => {
    setCandidates(candidates.map(c => c.id === editingId ? { ...editingRow, badge: statusBadge(editingRow.status) } : c));
    setEditingId(null);
    setEditingRow(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingRow(null);
  };

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
          <h2 className="page-title">Candidates</h2>
          <div className="search">
            <input
              type="search"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="top-right">
            <span className="pill">Active</span>
            <div className="avatar">HR</div>
          </div>
        </div>

        <div className="page-card">
          {!showForm ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div className="muted">Click "Add Candidate" to enter candidate details.</div>
              <button className="btn btn-primary" type="button" onClick={() => setShowForm(true)}>Add Candidate</button>
            </div>
          ) : (
            <form onSubmit={handleAdd} className="form-row" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label htmlFor="name">Candidate Name</label>
                <input id="name" type="text" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} placeholder="e.g. Priya Nair" required />
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label htmlFor="role">Applied Role</label>
                <input id="role" type="text" value={newCandidate.role} onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })} placeholder="e.g. Product Manager" required />
              </div>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <label htmlFor="stage">Stage</label>
                <select id="stage" value={newCandidate.stage} onChange={(e) => setNewCandidate({ ...newCandidate, stage: e.target.value })}>
                  {stageOptions.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <label htmlFor="status">Status</label>
                <select id="status" value={newCandidate.status} onChange={(e) => setNewCandidate({ ...newCandidate, status: e.target.value })}>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label htmlFor="remarks">Remarks</label>
                <input id="remarks" type="text" value={newCandidate.remarks} onChange={(e) => setNewCandidate({ ...newCandidate, remarks: e.target.value })} placeholder="Notes..." />
              </div>
              <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end" }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setNewCandidate({ name: "", role: "", stage: "Screening", status: "In Review", remarks: "" }); }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="page-card" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className={`btn ${stageFilter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStageFilter("all")}
            type="button"
          >
            All Stages
          </button>
          {stageOptions.map((option, index) => (
            <button
              key={option}
              className={`btn ${stageFilter === option ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setStageFilter(option)}
              type="button"
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={handleDrop(index)}
              title="Drag to reorder process stages"
            >
              {option}
            </button>
          ))}
          <button className="btn btn-ghost" type="button" onClick={handleAddStage}>+ Add Stage</button>
        </div>

        <div className="data-card">
          <div className="stat-label">Candidate List</div>
          <div style={{ maxHeight: "440px", overflowY: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th><button className="btn btn-ghost" type="button" onClick={() => toggleSort("name")}>Name</button></th>
                  <th><button className="btn btn-ghost" type="button" onClick={() => toggleSort("role")}>Role</button></th>
                  <th><button className="btn btn-ghost" type="button" onClick={() => toggleSort("stage")}>Stage</button></th>
                  <th><button className="btn btn-ghost" type="button" onClick={() => toggleSort("status")}>Status</button></th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(person => (
                  <tr key={person.id}>
                    <td>
                      {editingId === person.id ? (
                        <input type="text" value={editingRow.name} onChange={(e) => setEditingRow({ ...editingRow, name: e.target.value })} />
                      ) : person.name}
                    </td>
                    <td>
                      {editingId === person.id ? (
                        <input type="text" value={editingRow.role} onChange={(e) => setEditingRow({ ...editingRow, role: e.target.value })} />
                      ) : person.role}
                    </td>
                    <td>
                      {editingId === person.id ? (
                        <select value={editingRow.stage} onChange={(e) => setEditingRow({ ...editingRow, stage: e.target.value })}>
                          {stageOptions.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      ) : person.stage}
                    </td>
                    <td>
                      {editingId === person.id ? (
                        <select value={editingRow.status} onChange={(e) => setEditingRow({ ...editingRow, status: e.target.value })}>
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : <span className={`badge ${person.badge}`}>{person.status}</span>}
                    </td>
                    <td>
                      {editingId === person.id ? (
                        <input type="text" value={editingRow.remarks} onChange={(e) => setEditingRow({ ...editingRow, remarks: e.target.value })} />
                      ) : person.remarks}
                    </td>
                    <td>
                      {editingId === person.id ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-primary" type="button" onClick={saveEdit}>Save</button>
                          <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn btn-ghost" type="button" onClick={() => startEdit(person)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">No candidates yet. Click "Add Candidate" to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
