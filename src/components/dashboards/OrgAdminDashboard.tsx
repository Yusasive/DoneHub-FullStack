import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { OrgAdminLayout } from "./org-admin/Layout";
import { OrgOverview } from "./org-admin/pages/Overview";
import { OrgMembers } from "./org-admin/pages/Members";
import { OrgInvites } from "./org-admin/pages/Invites";
import { OrgTasks } from "./org-admin/pages/Tasks";
import { OrgSettings } from "./org-admin/pages/Settings";
import { OrgActivity } from "./org-admin/pages/Activity";

export const OrgAdminDashboard: React.FC = () => {
  return (
    <Routes>
      <Route element={<OrgAdminLayout />}>
        <Route index element={<OrgOverview />} />
        <Route path="members" element={<OrgMembers />} />
        <Route path="invites" element={<OrgInvites />} />
        <Route path="tasks" element={<OrgTasks />} />
        <Route path="settings" element={<OrgSettings />} />
        <Route path="activity" element={<OrgActivity />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
