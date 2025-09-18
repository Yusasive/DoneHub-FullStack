import { Card, CardContent } from "../../../ui/Card";
import { Users, Clock, BarChart3, Building } from "lucide-react";
import { useEffect, useState } from "react";
import useAuth from "../../../../context/useAuthContext";
import { Invite, User } from "../../../../types";

interface OrganizationStats {
  members: {
    total: number;
    active: number;
    pending: number;
  };
  invites: {
    total: number;
    pending: number;
  };
  tasks: {
    total: number;
    completed: number;
    active: number;
    overdue: number;
  };
  projects: {
    total: number;
  };
  organization: {
    name: string;
    status: string;
    memberCount: number;
    createdAt: string;
  };
  recentActivity: {
    newMembers: number;
    tasksCompleted: number;
    invitesSent: number;
  };
}

export const OrgOverview = () => {
  const { getInvitations, getOrganizationMembers, getOrganizationStats } =
    useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [invitesData, membersData, statsData] = await Promise.all([
          getInvitations(),
          getOrganizationMembers(),
          getOrganizationStats(),
        ]);
        setInvites(invitesData || []);
        setMembers(membersData || []);
        setStats(statsData as unknown as OrganizationStats);
      } catch (error) {
        console.error("Failed to load overview data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getInvitations, getOrganizationMembers, getOrganizationStats]);

  const pendingInvites = invites.filter((i) => i.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600">Summary of your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.members.active || activeMembers.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Invites
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.invites.pending || pendingInvites.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tasks Completed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.tasks.completed || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.projects.total || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
