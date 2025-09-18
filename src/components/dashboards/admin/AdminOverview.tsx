import React, { useEffect, useState } from "react";
import API from "../../../api";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import { Badge } from "../../ui/Badge";
import {
  Users,
  Building,
  Clock,
  CheckCircle,
  Activity,
  AlertCircle,
} from "lucide-react";

interface Stats {
  users: {
    total: number;
    active: number;
    pending: number;
  };
  organizations: {
    total: number;
    active: number;
    pending: number;
  };
  recentActivity: any[];
}

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await API.get("/admin/stats");
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch system statistics.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div>No statistics available.</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total,
      icon: <Users className="h-6 w-6 text-gray-500" />,
      subtext: `${stats.users.active} active`,
    },
    {
      title: "Total Organizations",
      value: stats.organizations.total,
      icon: <Building className="h-6 w-6 text-gray-500" />,
      subtext: `${stats.organizations.active} active`,
    },
    {
      title: "Pending Approvals",
      value: stats.users.pending + stats.organizations.pending,
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      subtext: `${stats.organizations.pending} orgs`,
    },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "org_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "org_rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatActivityDetails = (activity: any) => {
    const { details, action } = activity;

    if (typeof details === "string") {
      return details;
    }

    if (details && typeof details === "object") {
      switch (action) {
        case "user_login":
          return "User logged in successfully.";
        case "user_updated":
          if (details.body) {
            const fields = Object.keys(details.body).join(", ");
            return `Updated profile fields: ${fields}.`;
          }
          return "User profile updated.";
        case "org_created":
          return `Organization "${details.body?.name}" created.`;
        default:
          return `Action: ${action}`;
      }
    }
    return "No details available.";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">System Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <li
                  key={activity._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getActionIcon(activity.action)}
                    <div>
                      <p className="font-medium">
                        {activity.user_id?.name || "A user"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatActivityDetails(activity)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{activity.action}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
