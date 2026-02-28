import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Home, Users, History } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    // ทำให้ Navbar ลอยอยู่ด้านบนสุดและมีระยะห่างจากขอบ
    <nav className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4 mb-8">
      
      {/* Container หลัก: เน้นความใส (white/20) และเบลอจัดๆ (backdrop-blur-lg) */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/20 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2rem] transition-all duration-300">
        
        {/* โลโก้ */}
        <Link
          to="/"
          className="flex items-center gap-3 group text-slate-800 transition duration-300"
        >
          {/* ไอคอนโลโก้ใสๆ */}
          <div className="w-10 h-10 rounded-full bg-white/40 border border-white/60 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,0.8)] group-hover:scale-105 transition-transform duration-300">
            <span className="text-blue-600 font-black text-lg">E</span>
          </div>
          <span className="font-bold text-lg tracking-wide hidden sm:block">ระบบการศึกษา</span>
        </Link>

        {/* เมนูตรงกลาง (ครอบด้วยกรอบใสๆ อีกชั้น) */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-white/10 border border-white/30 rounded-2xl backdrop-blur-md">
          <NavLinkItem to="/" label="หน้าหลัก" icon={<Home size={16} />} active={location.pathname === "/"} />
          <NavLinkItem to="/students" label="จัดการนักเรียน" icon={<Users size={16} />} active={location.pathname === "/students"} />
          <NavLinkItem to="/history" label="ประวัติ" icon={<History size={16} />} active={location.pathname === "/history"} />
        </div>

        {/* ข้อมูลผู้ใช้ และ ปุ่มออกจากระบบ */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name || 'Guest'}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.role || 'user'}</p>
          </div>
          
          {/* ปุ่ม Logout แบบใส */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/30 hover:bg-white/60 text-slate-600 hover:text-red-500 rounded-xl border border-white/50 transition-all duration-300 shadow-sm"
          >
            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-semibold hidden sm:block">ออก</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

// ✅ คอมโพเนนต์เมนูย่อย (ใสและนุ่มนวล)
const NavLinkItem = ({ to, label, icon, active }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
      ${active 
        ? "bg-white/70 text-blue-700 shadow-sm border border-white/80" // หน้าปัจจุบันจะสว่างขึ้นมา
        : "text-slate-500 hover:text-slate-800 hover:bg-white/40" // หน้าอื่นจะใสๆ
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;