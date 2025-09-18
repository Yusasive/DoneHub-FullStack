import React from "react";
import { Route, Routes } from "react-router-dom";
import { Sidebar } from "./admin/Sidebar";
import { AdminOverview } from "./admin/AdminOverview";
import { UserManagement } from "./admin/UserManagement";
import { OrgManagement } from "./admin/OrgManagement";
import { ApprovalRequests } from "./admin/ApprovalRequests";
import { ActivityLog } from "./admin/ActivityLog";
import { AdminSettings } from "./admin/AdminSettings";

export const SystemAdminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/organizations" element={<OrgManagement />} />
          <Route path="/requests" element={<ApprovalRequests />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};
