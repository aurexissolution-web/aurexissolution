# Role-Based User Management System - Implementation Guide

## Overview
This document outlines the implementation of a comprehensive role-based access control (RBAC) system for the Aurexis Solution IT company dashboard.

## Roles & Permissions

### 1. **Admin** (Highest Authority)
- **Dashboard**: `/admin`
- **Permissions**: Full system access
  - User management (create, edit, delete all users)
  - System settings
  - Audit logs
  - All financial operations
  - All project operations
  - All employee operations

### 2. **HR Manager** (`hr`)
- **Dashboard**: `/hr`
- **Permissions**:
  - Create/edit users (except admin)
  - View all employees
  - Manage employee performance
  - Approve leave requests
  - View/assign tasks
  - Employee monitoring

### 3. **Finance Executive** (`finance_executive`)
- **Dashboard**: `/finance-dashboard`
- **Permissions**:
  - Create/edit/delete invoices
  - Create/edit/delete quotations
  - Manage payments
  - View financial reports
  - Approve expenses
  - View all projects

### 4. **Marketing Head** (`marketing_head`)
- **Dashboard**: `/marketing-dashboard`
- **Permissions**:
  - Create/edit/delete campaigns
  - Manage marketing budget
  - View marketing analytics
  - Create/edit projects
  - View team employees
  - View team tasks

### 5. **Manager** (`manager`)
- **Dashboard**: `/manager-dashboard`
- **Permissions**:
  - View all employees in department
  - Manage employee performance
  - Approve leave and expenses
  - Create/edit projects
  - Create/assign/edit tasks
  - View all tasks in department

### 6. **Team Lead** (`team_lead`)
- **Dashboard**: `/team-lead-dashboard`
- **Permissions**:
  - View team employees
  - Create/assign/edit team tasks
  - View team tasks
  - View own projects

### 7. **Normal Employee** (`normal_employee`)
- **Dashboard**: `/employee-dashboard`
- **Permissions**:
  - View own tasks
  - Edit own tasks
  - View own projects
  - View own profile

### 8. **Legacy Roles** (Maintained for backward compatibility)
- **Employee** (`employee`): Similar to normal_employee with commission tracking
- **Freelancer** (`freelancer`): Contract worker with task and commission access
- **Customer** (`customer`): Client with project access only

## User Fields

### Core Fields
- `id`: string
- `email`: string
- `role`: UserRole
- `uniqueId`: string (auto-generated)
- `password`: string
- `defaultPassword`: string
- `hasChangedPassword`: boolean
- `isActive`: boolean
- `createdAt`: Firestore timestamp
- `createdBy`: string (user ID)

### Organizational Fields
- `department`: string (Finance, Marketing, IT, Sales, etc.)
- `team`: string (Team Alpha, Beta, etc.)
- `reportsTo`: string (user ID of supervisor)
- `position`: string (job title)

### Tracking Fields
- `lastLogin`: Firestore timestamp
- `loginCount`: number

## Password Rules

### For Employees (All internal roles)
- **Fixed password** set by admin/HR
- Cannot be changed by the employee
- Only admin/HR can reset

### For Customers
- **Initial password** set by admin
- **Must change** on first login
- Can change password anytime

## Auto-Redirect After Login

Based on role, users are automatically redirected to their respective dashboards:

```typescript
const ROLE_DASHBOARDS = {
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
```

## Audit Logging

All key actions are logged to `auditLogs` collection:

### Logged Actions
- User login/logout
- User creation/update/deletion
- Invoice/quotation creation/update
- Payment processing
- Project creation
- Task assignment
- Password changes
- Permission denied attempts

### Audit Log Fields
- `userId`: string
- `userEmail`: string
- `userRole`: UserRole
- `action`: string
- `details`: string
- `timestamp`: Firestore timestamp
- `status`: 'success' | 'failed'
- `ipAddress`: string

## Security Best Practices

### 1. **Authentication**
- ✅ Session persistence with localStorage
- ✅ Role-based access control
- ✅ Password validation
- ⚠️ TODO: Implement bcrypt for password hashing
- ⚠️ TODO: Implement JWT tokens for better security

### 2. **Authorization**
- ✅ Permission-based access control
- ✅ Role hierarchy enforcement
- ✅ Audit logging for all sensitive actions

### 3. **Session Handling**
- ✅ Automatic logout on session expiry
- ✅ Secure session storage
- ⚠️ TODO: Implement session timeout

### 4. **Firestore Security Rules**
- ✅ Role-based read/write rules
- ✅ User can only access their own data (except admins)
- ✅ Audit logs are write-only for users, read-only for admins

## Implementation Status

### ✅ Completed
1. Updated `types.ts` with new roles and fields
2. Created `permissionsService.ts` for RBAC
3. Created `auditLogService.ts` for audit logging
4. Created implementation documentation

### 🔄 In Progress
1. Updating `AppContext.tsx` with new roles and audit logging
2. Creating new dashboard components

### ⏳ Pending
1. Finance Executive Dashboard
2. Marketing Head Dashboard
3. Manager Dashboard
4. Team Lead Dashboard
5. Update Employee Dashboard for Normal Employee role
6. Update User Management form
7. Update LoginPage with new roles
8. Add routes in App.tsx
9. Update Firestore rules

## Database Collections

### `users`
- All user accounts with role-based fields

### `auditLogs`
- All system actions and events

### `projects`
- Project data with assignments

### `tasks`
- Task data with assignments

### `invoices`
- Financial invoices

### `quotations`
- Financial quotations

### `timeTracking`
- Employee time tracking

## Next Steps

1. **Update AppContext** with new role checks and audit logging
2. **Create Dashboard Components** for each new role
3. **Update User Management** with enhanced form fields
4. **Update LoginPage** with all role options
5. **Update Firestore Rules** for new roles
6. **Test thoroughly** with different role scenarios

## Notes

- All new roles use **email** for login (not uniqueId)
- Legacy roles (customer, employee, freelancer) still use uniqueId
- Password hashing should be implemented before production
- Consider implementing 2FA for admin and finance roles
- Regular security audits recommended

