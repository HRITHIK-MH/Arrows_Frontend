import type { Department, LeaveRequest, Timesheet, User } from "@hrms/shared-types";

export type EmployeeCategory = "Billable" | "Non-Billable";
export type WorkType = "Client" | "Internal";
export type AssignmentStatus = "Pending" | "Approved" | "Rejected";

export interface WorkProfileRule {
  employeeCategory: EmployeeCategory;
  workType: WorkType;
  locations: string[];
  managerTypes: string[];
  projectRequired: boolean;
}

export interface ManagerOption {
  id: string;
  name: string;
  managerType: string;
  department: string;
}

export interface HrRepresentativeOption {
  id: string;
  name: string;
  department: string;
}

export interface EmployeeManagerMapping {
  id: string;
  employeeId: string;
  managerId: string;
  managerType: string;
  status: AssignmentStatus;
  approvedBy?: string;
  approvedDate?: string;
}

export interface EmployeeHrMapping {
  id: string;
  employeeId: string;
  hrId: string;
  active: boolean;
}

export interface TeamAssignmentRequest {
  id: string;
  employeeId: string;
  managerIds: string[];
  hrIds: string[];
  employeeCategory: EmployeeCategory;
  workType: WorkType;
  location: string;
  project: string;
  status: AssignmentStatus;
  requestedDate: string;
}

export interface ProjectDefinition {
  id: string;
  name: string;
  clientName: string;
  status: "Planning" | "Active" | "On Hold" | "Completed";
  active: boolean;
  billingType: "Billable" | "Non-Billable";
}

export interface EmployeeProjectAllocation {
  id: string;
  employeeId: string;
  projectId: string;
  allocationSource: "HR/Admin Allocation" | "Employee Request";
  active: boolean;
}

export const demoUsers: User[] = [];

export const employeeCategories: EmployeeCategory[] = ["Billable", "Non-Billable"];

export const workTypes: WorkType[] = ["Client", "Internal"];

export const projects: string[] = [];

export const projectCatalog: ProjectDefinition[] = [];

export const employeeProjectAllocations: EmployeeProjectAllocation[] = [];

export const taskCategories = ["Backend Development", "Frontend Development", "QA Testing", "Code Review", "Meetings", "Documentation"];

export const leaveCalendar = [];

export const holidayCalendar = [];

export const workProfileRules: WorkProfileRule[] = [
  {
    employeeCategory: "Billable",
    workType: "Client",
    locations: ["Client", "Remote", "Office", "Hybrid"],
    managerTypes: ["Delivery Manager", "Account Manager", "Technical Manager", "MH Manager", "Client Manager"],
    projectRequired: true
  },
  {
    employeeCategory: "Billable",
    workType: "Internal",
    locations: ["Office", "Remote", "Hybrid"],
    managerTypes: ["MH Manager"],
    projectRequired: true
  },
  {
    employeeCategory: "Non-Billable",
    workType: "Client",
    locations: ["Client", "Remote", "MH Office", "Hybrid"],
    managerTypes: ["MH Manager", "Client Manager"],
    projectRequired: true
  },
  {
    employeeCategory: "Non-Billable",
    workType: "Internal",
    locations: ["Office", "Remote", "Hybrid"],
    managerTypes: ["MH Manager"],
    projectRequired: true
  }
];

export const managerOptions: ManagerOption[] = [];

export const hrRepresentativeOptions: HrRepresentativeOption[] = [];

export const employeeManagerMappings: EmployeeManagerMapping[] = [];

export const employeeHrMappings: EmployeeHrMapping[] = [];

export const teamAssignmentRequests: TeamAssignmentRequest[] = [];

export function getWorkProfileRule(employeeCategory: EmployeeCategory, workType: WorkType) {
  return workProfileRules.find((rule) => rule.employeeCategory === employeeCategory && rule.workType === workType) ?? workProfileRules[0];
}

export function getUserName(userId: string) {
  return demoUsers.find((user) => user.id === userId)?.name ?? "Unknown employee";
}

export function getManagerName(managerId: string) {
  return managerOptions.find((manager) => manager.id === managerId)?.name ?? "Unknown manager";
}

export function getHrName(hrId: string) {
  return hrRepresentativeOptions.find((hr) => hr.id === hrId)?.name ?? "Unknown HR";
}

export const timesheets: Timesheet[] = [];

export const leaveRequests: LeaveRequest[] = [];

export const departments: Department[] = [];

export const utilizationTrend = [];

export const officeLocations: string[] = [];

export const timezoneOptions = [
  { value: "Asia/Kolkata", label: "IST (UTC+05:30) - India" },
  { value: "America/New_York", label: "EST (UTC-05:00) - New York" },
  { value: "Europe/London", label: "GMT (UTC+00:00) - London" },
  { value: "Asia/Singapore", label: "SGT (UTC+08:00) - Singapore" }
];

export const designations = [
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Engineer",
  "QA Engineer",
  "QA Lead",
  "Engineering Manager",
  "Product Designer",
  "Product Manager",
  "HR Generalist",
  "HRMS Administrator",
  "Delivery Manager",
  "Account Manager"
];

export const departmentNames: string[] = [];
