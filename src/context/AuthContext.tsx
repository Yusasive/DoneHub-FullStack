import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "../hooks/useToast";
import {
  User,
  Invite,
  TaskListResponse,
  TaskOperationResponse,
  BasicMessageResponse,
  TaskStats,
} from "../types";
import { API } from "./api";

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
  }) => Promise<void>;
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
  ) => Promise<BasicMessageResponse>;
  getTasks: (filters?: Record<string, unknown>) => Promise<TaskListResponse>;
  createTask: (
    taskData: Record<string, unknown>
  ) => Promise<TaskOperationResponse>;
  updateTask: (
    taskId: string,
    updates: Record<string, unknown>
  ) => Promise<TaskOperationResponse>;
  deleteTask: (taskId: string) => Promise<BasicMessageResponse>;
  getTaskStats: () => Promise<TaskStats>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<Record<string, unknown>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
// useAuth moved to useAuthContext.ts

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await API.get("/auth/me");
          setUser(data.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      const { token, user: userData } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.info("You have been logged out");
    }
  };

  const signupOrgAdmin = async (data: {
    name: string;
    email: string;
    orgName: string;
    orgDescription: string;
    industry: string;
  }) => {
    try {
      // Explicitly create the payload to send to the backend
      const payload = {
        name: data.name,
        email: data.email,
        orgName: data.orgName,
        orgDescription: data.orgDescription,
        industry: data.industry,
      };
      const response = await API.post("/auth/signup-org-admin", payload);
      toast.success(
        "Organization admin request submitted successfully! You will receive an email notification once approved."
      );
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message ||
            "Failed to submit organization admin request"
        );
      } else {
        toast.error("Failed to submit organization admin request");
      }
      throw error;
    }
  };

  const signupMember = async (token: string, data: Record<string, unknown>) => {
    try {
      const response = await API.post("/auth/signup-member", {
        token,
        ...data,
      });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      toast.success(`Welcome to the team, ${userData.name}!`);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to join organization"
        );
      } else {
        toast.error("Failed to join organization");
      }
      throw error;
    }
  };

  const verifyInviteToken = async (token: string) => {
    try {
      const { data } = await API.get(`/auth/verify-invite/${token}`);
      return data.invite;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Invalid or expired invitation"
        );
      } else {
        toast.error("Invalid or expired invitation");
      }
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      toast.success("Password reset instructions sent to your email");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to send password reset email"
        );
      } else {
        toast.error("Failed to send password reset email");
      }
      throw error;
    }
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    setLoading(true);
    try {
      const { data } = await API.patch("/user/profile", profileData);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to update profile");
      } else {
        toast.error("Failed to update profile");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const { data } = await API.patch("/user/password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to change password");
      } else {
        toast.error("Failed to change password");
      }
      throw error;
    }
  };

  // Organization management functions
  const sendInvitations = async (
    emails: string[],
    role: string = "member",
    personalMessage?: string
  ) => {
    setLoading(true);
    try {
      const { data } = await API.post("/org/invite", {
        emails,
        role,
        personalMessage,
      });
      toast.success(data.message || "Invitations sent successfully");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to send invitations"
        );
      } else {
        toast.error("Failed to send invitations");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrganizationMembers = async (
    page: number = 1,
    limit: number = 20
  ) => {
    try {
      const { data } = await API.get(
        `/org/members?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load team members"
        );
      } else {
        toast.error("Failed to load team members");
      }
      throw error;
    }
  };

  const getInvitations = async (status?: string) => {
    try {
      const url = status ? `/org/invites?status=${status}` : "/org/invites";
      const { data } = await API.get(url);
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load invitations"
        );
      } else {
        toast.error("Failed to load invitations");
      }
      throw error;
    }
  };

  const revokeInvitation = async (inviteId: string) => {
    try {
      const { data } = await API.delete(`/org/invites/${inviteId}`);
      toast.success("Invitation revoked successfully");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to revoke invitation"
        );
      } else {
        toast.error("Failed to revoke invitation");
      }
      throw error;
    }
  };

  const getOrganizationStats = async () => {
    try {
      const { data } = await API.get("/org/stats");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message ||
            "Failed to load organization statistics"
        );
      } else {
        toast.error("Failed to load organization statistics");
      }
      throw error;
    }
  };

  // System admin functions
  const getPendingRequests = async (page: number = 1, limit: number = 10) => {
    try {
      const { data } = await API.get(
        `/admin/requests?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load pending requests"
        );
      } else {
        toast.error("Failed to load pending requests");
      }
      throw error;
    }
  };

  const approveRequest = async (userId: string, welcomeMessage?: string) => {
    setLoading(true);
    try {
      const { data } = await API.post(`/admin/approve/${userId}`, {
        welcomeMessage,
      });
      toast.success("Organization admin request approved successfully");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to approve request");
      } else {
        toast.error("Failed to approve request");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (userId: string, reason: string) => {
    setLoading(true);
    try {
      const { data } = await API.post(`/admin/reject/${userId}`, { reason });
      toast.success("Request rejected");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to reject request");
      } else {
        toast.error("Failed to reject request");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestMoreInfo = async (
    userId: string,
    message?: string
  ): Promise<BasicMessageResponse> => {
    setLoading(true);
    try {
      const { data } = await API.post<BasicMessageResponse>(
        `/admin/request-info/${userId}`,
        {
          // Backend expects 'questions'; keep message mapped for compatibility
          questions: message,
        }
      );
      toast.info("Requested more information");
      return data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to request more information"
        );
      } else {
        toast.error("Failed to request more information");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signupOrgAdmin,
    signupMember,
    verifyInviteToken,
    requestPasswordReset,
    updateUserProfile,
    changeUserPassword,
    sendInvitations,
    getOrganizationMembers,
    getInvitations,
    getOrganizationStats,
    revokeInvitation,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    requestMoreInfo,
    getTasks: async (filters = {}): Promise<TaskListResponse> => {
      try {
        const params = new URLSearchParams(
          filters as Record<string, string>
        ).toString();
        const { data } = await API.get<TaskListResponse>(`/tasks?${params}`);
        return data;
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to load tasks");
        } else {
          toast.error("Failed to load tasks");
        }
        throw error;
      }
    },
    createTask: async (
      taskData: Record<string, unknown>
    ): Promise<TaskOperationResponse> => {
      try {
        const { data } = await API.post<TaskOperationResponse>(
          "/tasks",
          taskData
        );
        toast.success("Task created successfully");
        return data;
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to create task");
        } else {
          toast.error("Failed to create task");
        }
        throw error;
      }
    },
    updateTask: async (
      taskId: string,
      updates: Record<string, unknown>
    ): Promise<TaskOperationResponse> => {
      try {
        const { data } = await API.patch<TaskOperationResponse>(
          `/tasks/${taskId}`,
          updates
        );
        toast.success("Task updated successfully");
        return data;
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to update task");
        } else {
          toast.error("Failed to update task");
        }
        throw error;
      }
    },
    deleteTask: async (taskId: string): Promise<BasicMessageResponse> => {
      try {
        const { data } = await API.delete<BasicMessageResponse>(
          `/tasks/${taskId}`
        );
        toast.success("Task deleted successfully");
        return data;
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(err.response?.data?.message || "Failed to delete task");
        } else {
          toast.error("Failed to delete task");
        }
        throw error;
      }
    },
    getTaskStats: async (): Promise<TaskStats> => {
      try {
        const { data } = await API.get<TaskStats>("/tasks/stats");
        return data;
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const err = error as { response?: { data?: { message?: string } } };
          toast.error(
            err.response?.data?.message || "Failed to load task statistics"
          );
        } else {
          toast.error("Failed to load task statistics");
        }
        throw error;
      }
    },
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
