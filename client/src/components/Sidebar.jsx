import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { CalendarDaysIcon, CalendarIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { LayoutDashboard, Users, DollarSign, Settings, LogOutIcon, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helpers";
import { IMAGE_BASE } from "../constants";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, employee, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const userName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : user?.email?.split("@")[0] || "User";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(isAdmin
      ? [
          { name: "Employees", href: "/employees", icon: Users },
          { name: "Departments", href: "/departments", icon: Building2 },
          { name: "Attendance", href: "/attendance", icon: CalendarDaysIcon },
        ]
      : [{ name: "Attendance", href: "/attendance", icon: CalendarDaysIcon }]),
    { name: "Leave", href: "/leave", icon: CalendarIcon },
    { name: "Payslips", href: "/payslips", icon: DollarSign },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="px-5 pt-6 pb-4 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <div>
            <p className="font-semibold text-[13px] text-white tracking-wide">Employee MS</p>
            <p className="text-[11px] text-slate-500 font-medium">Management System</p>
          </div>
        </div>
      </div>

      {userName && (
        <div className="mx-3 mt-4 p-3 rounded-lg bg-white/3 border border-white/4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/10 shrink-0">
              {employee?.image ? (
                <img src={`${IMAGE_BASE}${employee.image}`} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                <span className="text-slate-400 text-xs font-semibold">
                  {employee ? getInitials(employee.firstName, employee.lastName) : userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-slate-200 truncate">{userName}</p>
              <p className="text-[11px] text-slate-500 truncate">{isAdmin ? "Administrator" : "Employee"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Navigation</p>
      </div>

      <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-150 relative ${
                isActive ? "bg-indigo-500/12 text-indigo-300" : "text-slate-300 hover:text-white hover:bg-white/4"
              }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500" />}
              <item.icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-slate-300"}`} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRightIcon className="w-3.5 h-3.5 text-indigo-500/50" />}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/6">
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 transition-all duration-150"
          onClick={handleLogout}
        >
          <LogOutIcon className="w-[17px] h-[17px]" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <MenuIcon size={20} />
      </button>

      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />}

      <aside className="hidden lg:flex flex-col h-full w-[260px] bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white shrink-0 border-r border-white/4">
        {sidebarContent}
      </aside>

      <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white z-50 flex flex-col transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
