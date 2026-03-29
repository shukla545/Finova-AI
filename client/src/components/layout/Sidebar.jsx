import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Bot ,
  Database,
  ArrowLeft ,
  Power,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "My Portfolio", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Truth Agent", icon: ShieldCheck, path: "/dashboard/true" },
        { name: "Market Pulse", icon: TrendingUp, path: "/dashboard/news" },
        { name: "Finpilot AI ", icon: Bot , path: "/dashboard/bot" },
    { name: "Ingest Settings", icon: Database, path: "/dashboard/ingest" },
     { name: "Go Back", icon: ArrowLeft , path: "/" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col justify-between p-6">
      
      {/* Top Section */}
      <div>
        <div className="mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">FinovaAI</h1>
            <p className="text-xs text-blue-600 font-medium">
              Finance Growth With AI
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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
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