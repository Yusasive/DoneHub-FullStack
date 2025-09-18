export interface User {
  id: string;
  name: string;
  email: string;
  role: "system_admin" | "org_admin" | "member";
  org_id?: string;
  status: "active" | "pending" | "rejected";
  emailVerified?: boolean;
  lastLogin?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  settings?: {
    allowSelfRegistration?: boolean;
    requireEmailVerification?: boolean;
    inviteExpiration?: number;
  };
  created_by: string;
  status: "active" | "pending" | "suspended" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  memberCount?: number;
  created_at: string;
}

export interface Invite {
  id: string;
  org_id: string;
  email: string;
  token?: string; // token is present only right after creation response
  role?: string;
  expires_at: string | Date;
  status: "pending" | "accepted" | "expired" | "revoked";
  created_by: any;
  accepted_by?: any;
  accepted_at?: string | Date;
  metadata?: {
    inviterName?: string;
    orgName?: string;
    personalMessage?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PendingRequest {
  id: string;
  name: string;
  email: string;
  org_name: string;
  org_description?: string;
  industry?: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reason?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  org_id: string;
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  org_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Common pagination shape used by list endpoints
export interface Pagination {
  current: number;
  pages: number;
  total: number;
}

// Tasks API response types
export interface TaskListResponse {
  tasks: Task[];
  pagination: Pagination;
}

export interface TaskOperationResponse {
  message: string;
  task: Task;
}

export interface BasicMessageResponse {
  message: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  today: number;
  highPriority: number;
}
