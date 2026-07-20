import {
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiFileText,
  FiHome,
  FiMessageSquare,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiUsers
} from "react-icons/fi";
import { isBusinessStakeholderValue } from "../../utils/userRoleUtils";

export const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/headcount", label: "Headcount", icon: FiUserPlus, stakeholderOnly: true },
  { to: "/job-openings", label: "Job Openings", icon: FiBriefcase },
  { to: "/candidates", label: "Candidates", icon: FiUsers },
  // { to: "/applications", label: "Applications", icon: FiFileText }, // Disabled for later
  { to: "/interviews", label: "Interviews", icon: FiUserCheck },
  { to: "/clients", label: "Clients", icon: FiUser },
  // { to: "/reports", label: "Reports", icon: FiBarChart2 },
  // { to: "/timesheet", label: "Timesheet", icon: FiClock },
  // { to: "/calendar", label: "Calendar", icon: FiCalendar }, // Disabled for later
  // { to: "/users", label: "User Roles", icon: FiUserPlus }, // Disabled for later
];

export const isBusinessStakeholder = () => {
  if (typeof window === "undefined") return false;

  const personaValue = window.localStorage.getItem("userPersona") || "";
  const roleValue = window.localStorage.getItem("userRole") || "";
  return isBusinessStakeholderValue(personaValue) || isBusinessStakeholderValue(roleValue);
};

export const getVisibleLinks = () => LINKS.filter((link) => !link.stakeholderOnly || isBusinessStakeholder());
