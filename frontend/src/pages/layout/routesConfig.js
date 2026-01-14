

// src/pages/layout/routesConfig.js
import HomeIcon        from "../../assets/icons/home-alt.svg?react";
import HomeIconActive  from "../../assets/icons/home-alt-active.svg?react";


import UsersIcon       from "../../assets/icons/users.svg?react";
import UsersIconActive from "../../assets/icons/users-active.svg?react";


import CandidatesIcon       from "../../assets/icons/candidates.svg?react";


import InterviewsIcon       from "../../assets/icons/interviews.svg?react";


import ClientIcon       from "../../assets/icons/client.svg?react";


import ReportsIcon       from "../../assets/icons/reports.svg?react";


import ChatIcon       from "../../assets/icons/chat.svg?react";


import CalendarIcon       from "../../assets/icons/calendar.svg?react";


// Add other icons here as needed…


export const LINKS = [
  { to: "/dashboard",  label: "Dashboard",    icons: { normal: HomeIcon,  active: HomeIconActive } },
  { to: "/job-openings",      label: "Job Openings", icons: { normal: UsersIcon, active: UsersIconActive } },
  { to: "/application", label: "Application", icons: { normal: CandidatesIcon, active: UsersIconActive } },
  { to: "/example-forms", label: "Example Forms", icons: { normal: CandidatesIcon, active: UsersIconActive } },
  { to: "/candidates", label: "Candidates",   icons: { normal: CandidatesIcon, active: UsersIconActive } },
  { to: "/interviews", label: "Interviews",   icons: { normal: InterviewsIcon, active: UsersIconActive } },
  { to: "/clients",    label: "Client",       icons: { normal: ClientIcon, active: UsersIconActive } },
  { to: "/reports",    label: "Reports",      icons: { normal: ReportsIcon, active: UsersIconActive } },
  { to: "/chat",       label: "Chat",         icons: { normal: ChatIcon, active: UsersIconActive } },
  { to: "/calendar",   label: "Calendar",     icons: { normal: CalendarIcon, active: UsersIconActive } },
];





