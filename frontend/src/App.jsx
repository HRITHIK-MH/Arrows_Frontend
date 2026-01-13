import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import Candidates from "./pages/Candidates";

const isAuth = () => localStorage.getItem("token");

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={isAuth() ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/candidates" element={isAuth() ? <Candidates /> : <Navigate to="/login" />} />
      <Route path="/jobs" element={isAuth() ? <Jobs /> : <Navigate to="/login" />} />
      <Route path="/jobs/create" element={isAuth() ? <CreateJob /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
