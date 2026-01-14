

// src/pages/layout/routesConfig.js
import HomeIcon        from "../../assets/icons/home-alt.svg?react";
import UsersIcon       from "../../assets/icons/users.svg?react";
import CandidatesIcon       from "../../assets/icons/candidates.svg?react";
import InterviewsIcon       from "../../assets/icons/interviews.svg?react";
import ClientIcon       from "../../assets/icons/client.svg?react";
import ReportsIcon       from "../../assets/icons/reports.svg?react";
import ChatIcon       from "../../assets/icons/chat.svg?react";
import CalendarIcon       from "../../assets/icons/calendar.svg?react";


// Add other icons here as needed…


export const LINKS = [
  { to: "/dashboard",  label: "Dashboard",    icon: HomeIcon },
  { to: "/job-openings",      label: "Job Openings", icon: UsersIcon },
  { to: "/application", label: "Application", icon: CandidatesIcon },
  { to: "/example-forms", label: "Example Forms", icon: CandidatesIcon },
  { to: "/candidates", label: "Candidates",   icon: CandidatesIcon },
  { to: "/interviews", label: "Interviews",   icon: InterviewsIcon },
  { to: "/clients",    label: "Client",       icon: ClientIcon },
  { to: "/reports",    label: "Reports",      icon: ReportsIcon },
  { to: "/chat",       label: "Chat",         icon: ChatIcon },
  { to: "/calendar",   label: "Calendar",     icon: CalendarIcon },
];





