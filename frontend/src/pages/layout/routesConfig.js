

// src/pages/layout/routesConfig.js
import HomeIcon        from "../../assets/icons/home-alt.svg?react";
import UsersIcon       from "../../assets/icons/users.svg?react";
import CandidatesIcon       from "../../assets/icons/candidates.svg?react";
import InterviewsIcon       from "../../assets/icons/Interviews.svg?react";
import ClientIcon       from "../../assets/icons/client.svg?react";
import ReportsIcon       from "../../assets/icons/reports.svg?react";
import ChatIcon       from "../../assets/icons/chat.svg?react";
import CalendarIcon       from "../../assets/icons/calendar.svg?react";
import UserRolesIcon       from "../../assets/icons/users-roles.svg?react";


// Add other icons here as needed…


export const LINKS = [
  { to: "/dashboard",  label: "Dashboard",    icon: HomeIcon },
  { to: "/job-openings",      label: "Job Openings", icon: UsersIcon },
  { to: "/candidates", label: "Candidates",   icon: CandidatesIcon },
  { to: "/interviews", label: "Interviews",   icon: InterviewsIcon },
  { to: "/clients",    label: "Client",       icon: ClientIcon },
  { to: "/reports",    label: "Reports",      icon: ReportsIcon },
  { to: "/chat",       label: "Chat",         icon: ChatIcon },
  { to: "/calendar",   label: "Calendar",     icon: CalendarIcon },
  { to: "/users",      label: "User Roles",   icon: UserRolesIcon },
];





