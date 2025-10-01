export type UserRole = 'system_admin' | 'org_admin' | 'member';

export type UserStatus = 'pending' | 'active' | 'rejected';

export type OrgStatus = 'pending' | 'active' | 'rejected';

export type InviteStatus = 'pending' | 'accepted' | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  org_id?: string;
  status: UserStatus;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  branding?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
  created_by: string;
  status: OrgStatus;
  created_at: string;
}

export interface Invite {
  id: string;
  org_id: string;
  email: string;
  token: string;
  expires_at: string;
  status: InviteStatus;
  created_at: string;
}

export interface OrgAdminRequest {
  id: string;
  name: string;
  email: string;
  org_name: string;
  role: string;
  status: UserStatus;
  created_at: string;
  rejected_reason?: string;
}
