import {
  Users,
  UserPlus,
  Settings,
  Activity,
  LayoutDashboard,
  CheckSquare,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/dashboard/members", icon: Users, label: "Members" },
  { to: "/dashboard/invites", icon: UserPlus, label: "Invites" },
  { to: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/dashboard/activity", icon: Activity, label: "Activity" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export const OrgAdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Org Admin</h2>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to} className="mb-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
