import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileSearch,
  FilePlus,
  Target,           // for Mock Preparation
  Mail,              // for Contact Us
  Shield,            // for Admin Control
  Power 
,            // optional logout
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "News Insight", icon: FileSearch, path: "/dashboard/news" },
    { name: "Truth Agent", icon: FilePlus, path: "/dashboard/true" },
    { name: "Prepare with AI", icon: Target, path: "/dashboard/prepare" },
          { name: "Confidence Lens", icon: Mail, path: "/dashboard/off" },
    { name: "Admin Controls", icon: Shield, path: "/dashboard/admin" },

    { name: "Contact Us", icon: Mail, path: "/dashboard/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col justify-between p-6">
      {/* Top Section */}
      <div>
        <div className="mb-8 flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="SkillBridge Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SkillBridge</h1>
            <p className="text-xs text-blue-600 font-medium">
              Career Growth AI
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
<button
  onClick={() => {
    // Clear any stored tokens/session data
    localStorage.removeItem('token');   // adjust key names as needed
    localStorage.removeItem('user');
    // Optionally clear cookies, context, etc.
    // Then force a full page reload to the home page (or login)
    window.location.href = "/";         // or "/login"
  }}
  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all w-full text-left"
>
  <Power size={18} />
  <span>Log Out</span>
</button>
    </div>
  );
};

export default Sidebar;
