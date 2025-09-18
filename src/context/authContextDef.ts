import { createContext } from "react";
import { User, Invite } from "../types";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signupOrgAdmin: (data: {
    name: string;
    email: string;
    orgName: string;
    orgDescription: string;
    industry: string;
  }) => Promise<any>;
  signupMember: (token: string, data: Record<string, unknown>) => Promise<void>;
  verifyInviteToken: (token: string) => Promise<Invite>;
  requestPasswordReset: (email: string) => Promise<Record<string, unknown>>;
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<Record<string, unknown>>;
  sendInvitations: (
    emails: string[],
    role?: string,
    personalMessage?: string
  ) => Promise<{ message: string }>;
  getOrganizationMembers: (page?: number, limit?: number) => Promise<User[]>;
  getInvitations: (status?: string) => Promise<Invite[]>;
  getOrganizationStats: () => Promise<Record<string, unknown>>;
  revokeInvitation: (inviteId: string) => Promise<Record<string, unknown>>;
  getPendingRequests: (page?: number, limit?: number) => Promise<User[]>;
  approveRequest: (
    userId: string,
    welcomeMessage?: string
  ) => Promise<Record<string, unknown>>;
  rejectRequest: (
    userId: string,
    reason: string
  ) => Promise<Record<string, unknown>>;
  requestMoreInfo: (
    userId: string,
    message?: string
  ) => Promise<Record<string, unknown>>;
  getTasks: <T = unknown>(filters?: Record<string, unknown>) => Promise<T>;
  createTask: (
    taskData: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;
  updateTask: (
    taskId: string,
    updates: Record<string, unknown>
  ) => Promise<any>;
  deleteTask: (taskId: string) => Promise<any>;
  getTaskStats: () => Promise<any>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<Record<string, unknown>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
