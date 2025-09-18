import {
  BarChart,
  Users,
  Building,
  FileText,
  Activity,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/admin", icon: BarChart, label: "Overview" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/organizations", icon: Building, label: "Organizations" },
  { to: "/admin/requests", icon: FileText, label: "Approval Requests" },
  { to: "/admin/activity", icon: Activity, label: "Activity Log" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Admin</h2>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to} className="mb-4">
              <NavLink
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
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
    </div>
  );
};
