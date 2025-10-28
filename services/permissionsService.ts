import { UserRole } from '../types';

// Permission types
export type Permission =
  // User Management
  | 'create_user'
  | 'edit_user'
  | 'delete_user'
  | 'view_users'
  // Financial
  | 'create_invoice'
  | 'edit_invoice'
  | 'delete_invoice'
  | 'view_invoices'
  | 'create_quotation'
  | 'edit_quotation'
  | 'delete_quotation'
  | 'view_quotations'
  | 'manage_payments'
  | 'view_financial_reports'
  // Marketing
  | 'create_campaign'
  | 'edit_campaign'
  | 'delete_campaign'
  | 'view_campaigns'
  | 'manage_marketing_budget'
  | 'view_marketing_analytics'
  // Projects
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'view_all_projects'
  | 'view_own_projects'
  // Tasks
  | 'create_task'
  | 'assign_task'
  | 'edit_task'
  | 'delete_task'
  | 'view_all_tasks'
  | 'view_team_tasks'
  | 'view_own_tasks'
  // Employees
  | 'view_all_employees'
  | 'view_team_employees'
  | 'view_own_profile'
  | 'manage_employee_performance'
  | 'approve_leave'
  | 'approve_expenses'
  // System
  | 'manage_system_settings'
  | 'view_audit_logs'
  | 'manage_roles'
  | 'access_admin_panel'
  | 'access_hr_panel';

// Role-based permissions configuration
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    'create_user', 'edit_user', 'delete_user', 'view_users',
    'create_invoice', 'edit_invoice', 'delete_invoice', 'view_invoices',
    'create_quotation', 'edit_quotation', 'delete_quotation', 'view_quotations',
    'manage_payments', 'view_financial_reports',
    'create_campaign', 'edit_campaign', 'delete_campaign', 'view_campaigns',
    'manage_marketing_budget', 'view_marketing_analytics',
    'create_project', 'edit_project', 'delete_project', 'view_all_projects',
    'create_task', 'assign_task', 'edit_task', 'delete_task', 'view_all_tasks',
    'view_all_employees', 'manage_employee_performance', 'approve_leave', 'approve_expenses',
    'manage_system_settings', 'view_audit_logs', 'manage_roles', 'access_admin_panel'
  ],
  
  hr: [
    // HR has user management and employee-related permissions
    'create_user', 'edit_user', 'view_users',
    'view_all_employees', 'manage_employee_performance', 'approve_leave',
    'view_all_tasks', 'view_team_tasks',
    'access_hr_panel'
  ],
  
  finance_executive: [
    // Finance has full access to financial operations
    'create_invoice', 'edit_invoice', 'delete_invoice', 'view_invoices',
    'create_quotation', 'edit_quotation', 'delete_quotation', 'view_quotations',
    'manage_payments', 'view_financial_reports',
    'view_all_projects', 'approve_expenses',
    'view_own_profile'
  ],
  
  marketing_head: [
    // Marketing has campaign and budget management
    'create_campaign', 'edit_campaign', 'delete_campaign', 'view_campaigns',
    'manage_marketing_budget', 'view_marketing_analytics',
    'view_all_projects', 'create_project', 'edit_project',
    'view_team_employees', 'view_team_tasks',
    'view_own_profile'
  ],
  
  manager: [
    // Manager has department-level access
    'view_users', 'view_all_employees', 'view_team_employees',
    'manage_employee_performance', 'approve_leave', 'approve_expenses',
    'create_project', 'edit_project', 'view_all_projects',
    'create_task', 'assign_task', 'edit_task', 'view_all_tasks', 'view_team_tasks',
    'view_own_profile'
  ],
  
  team_lead: [
    // Team Lead has team-level access
    'view_team_employees',
    'create_task', 'assign_task', 'edit_task', 'view_team_tasks', 'view_own_tasks',
    'view_own_projects',
    'view_own_profile'
  ],
  
  normal_employee: [
    // Normal Employee has minimal access
    'view_own_tasks', 'edit_task',
    'view_own_projects',
    'view_own_profile'
  ],
  
  freelancer: [
    // Freelancer has task and commission access
    'view_own_tasks', 'edit_task',
    'view_own_projects',
    'view_own_profile'
  ],
  
  customer: [
    // Customer has limited access to their own projects
    'view_own_projects',
    'view_own_profile'
  ]
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Administrator',
  hr: 'HR Manager',
  finance_executive: 'Finance Executive',
  marketing_head: 'Marketing Head',
  manager: 'Manager',
  team_lead: 'Team Lead',
  normal_employee: 'Employee',
  freelancer: 'Freelancer',
  customer: 'Customer'
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access and control',
  hr: 'Manages employees, leave, and HR operations',
  finance_executive: 'Manages payments, invoices, and financial reports',
  marketing_head: 'Manages campaigns, budgets, and marketing analytics',
  manager: 'Manages departments, approvals, and performance',
  team_lead: 'Manages tasks and team members',
  normal_employee: 'Views own tasks and profile',
  freelancer: 'Contract worker with task access',
  customer: 'Client with project access'
};

// Dashboard routes for each role
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  admin: '/admin',
  hr: '/hr',
  finance_executive: '/finance-dashboard',
  marketing_head: '/marketing-dashboard',
  manager: '/manager-dashboard',
  team_lead: '/team-lead-dashboard',
  normal_employee: '/employee-dashboard',
  employee: '/employee-dashboard',
  freelancer: '/freelancer-dashboard',
  customer: '/customer-dashboard'
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Check if a role has any of the specified permissions
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

// Check if a role has all of the specified permissions
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};

// Get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

// Get dashboard route for a role
export const getDashboardRoute = (role: UserRole): string => {
  return ROLE_DASHBOARDS[role] || '/';
};

// Department options
export const DEPARTMENTS = [
  'Finance',
  'Marketing',
  'IT',
  'Sales',
  'Operations',
  'HR',
  'Customer Support',
  'Product',
  'Engineering',
  'Design'
];

// Team options
export const TEAMS = [
  'Team Alpha',
  'Team Beta',
  'Team Gamma',
  'Team Delta',
  'Team Epsilon'
];

// Role hierarchy (higher number = higher authority)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  hr: 90,
  finance_executive: 80,
  marketing_head: 80,
  manager: 70,
  team_lead: 60,
  normal_employee: 50,
  employee: 50,
  freelancer: 40,
  customer: 30
};

// Check if role1 has higher authority than role2
export const hasHigherAuthority = (role1: UserRole, role2: UserRole): boolean => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
};

// Get roles that can be managed by a specific role
export const getManageableRoles = (role: UserRole): UserRole[] => {
  const currentLevel = ROLE_HIERARCHY[role];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < currentLevel)
    .map(([roleName, _]) => roleName as UserRole);
};

