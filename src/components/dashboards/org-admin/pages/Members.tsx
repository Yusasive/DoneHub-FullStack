import { Card, CardContent, CardHeader } from "../../../ui/Card";
import { useEffect, useState } from "react";
import useAuth from "../../../../context/useAuthContext";
import { User } from "../../../../types";
import { Calendar, Settings } from "lucide-react";
import { Button } from "../../../ui/Button";

export const OrgMembers = () => {
  const { getOrganizationMembers } = useAuth();
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getOrganizationMembers();
      setMembers(res || []);
    })();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-gray-600">Manage your team members</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Team Members
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{member.email}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {getTimeAgo(member.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
