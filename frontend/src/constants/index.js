export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_SUSPEND: 'users:suspend',
  TASKS_READ_ALL: 'tasks:read:all',
  TASKS_DELETE_ANY: 'tasks:delete:any',
  TASKS_READ_OWN: 'tasks:read:own',
  TASKS_WRITE_OWN: 'tasks:write:own',
  TASKS_DELETE_OWN: 'tasks:delete:own',
  ANALYTICS_READ: 'analytics:read',
  AUDIT_READ: 'audit:read',
  PROJECTS_READ: 'projects:read',
  PROJECTS_WRITE: 'projects:write',
};

export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.TASKS_READ_ALL,
    PERMISSIONS.TASKS_DELETE_ANY,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_WRITE,
  ],
  user: [
    PERMISSIONS.TASKS_READ_OWN,
    PERMISSIONS.TASKS_WRITE_OWN,
    PERMISSIONS.TASKS_DELETE_OWN,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_WRITE,
  ],
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  BLOCKED: 'blocked',
};

export const TASK_STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  blocked: 'Blocked',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const STATUS_COLORS = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'user'] },
  { label: 'Projects', path: '/projects', icon: 'FolderKanban', roles: ['admin', 'user'] },
  { label: 'My Tasks', path: '/tasks', icon: 'CheckSquare', roles: ['admin', 'user'] },
];

export const ADMIN_NAV_ITEMS = [
  { label: 'Command Center', path: '/admin', icon: 'LayoutDashboard', roles: ['admin'] },
  { label: 'Users', path: '/admin/users', icon: 'Users', roles: ['admin'] },
  { label: 'All Tasks', path: '/admin/tasks', icon: 'CheckSquare', roles: ['admin'] },
  { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3', roles: ['admin'] },
  { label: 'Activity', path: '/admin/activity', icon: 'FileText', roles: ['admin'] },
];

// Session timeout (ms) — 14 min with 15 min access token
export const SESSION_TIMEOUT_MS = 14 * 60 * 1000;
export const SESSION_WARNING_MS = 2 * 60 * 1000;
