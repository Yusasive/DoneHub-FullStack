import { Outlet } from "react-router-dom";
import { OrgAdminSidebar } from "./Sidebar";

export const OrgAdminLayout = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OrgAdminSidebar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
