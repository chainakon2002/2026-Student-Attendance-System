import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import StudentManager from './pages/StudentManager';
import CheckInHistory from './pages/CheckInHistory';
import Dashboard from './pages/Dashboard';
import EditSchedule from './pages/EditSchedule';
import DepositPage from './pages/DepositManager';
import Login from './pages/Login';

import {
  ClipboardList,
  Users,
  Clock,
  BarChart2,
  CalendarCheck,
  Wallet,
  Menu,
  X,
  LogOut 
} from "lucide-react";

function App() {
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    setUser(savedUser);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-slate-100"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-400 animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <img src="/student.ico" className="w-10 h-10 drop-shadow-md" alt="logo" />
          </div>
        </div>
      </div>
    );
  }

  const allNavItems = [
    { to: "/", label: "เช็คชื่อ", icon: ClipboardList, roles: ['student', 'teacher'] },
    { to: "/students", label: "นักเรียน", icon: Users, roles: ['teacher'] },
    { to: "/history", label: "ประวัติ", icon: Clock, roles: ['teacher'] },
    { to: "/dashboard", label: "สถิติ", icon: BarChart2, roles: ['teacher'] },
    { to: "/edit-schedule", label: "แก้ไขตาราง", icon: CalendarCheck, roles: ['teacher'] },
    { to: "/deposit", label: "ฝากเงิน", icon: Wallet, roles: ['student', 'teacher'] },
  ];

  const navItems = user 
    ? allNavItems.filter(item => item.roles.includes(user.role))
    : [];

  return (
    <Router>
      {/* 1. พื้นหลังหลัก ปรับให้สว่างและคลีนขึ้น พร้อมเอฟเฟกต์แสงจางๆ ด้านหลัง */}
      <div className="min-h-screen bg-[#f8fafc] font-sans relative overflow-hidden">
        
        {/* แสงสีฟ้าและม่วงอ่อนๆ ด้านหลัง เพื่อให้กระจกมีอะไรให้เบลอ (Liquid Glass Effect) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none"></div>

        {user && (
          // 2. Container ของ Navbar ให้ลอยตัว (Sticky) และเว้นขอบ
          <div className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8">
            
            {/* 3. ตัวกล่อง Navbar สไตล์ White Liquid Glass */}
            <nav className="relative flex flex-wrap items-center justify-between px-6 py-3 bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl transition-all duration-300">
              
              {/* โลโก้และชื่อ */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/80 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_5px_rgba(255,255,255,1)] border border-white transition-transform hover:scale-105 duration-300">
                  <img src="/student.ico" alt="Logo" className="w-7 h-7 object-contain drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">ระบบเช็คชื่อ</h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {user.name} • <span className="text-blue-500">{user.role === 'teacher' ? 'ครู' : 'นักเรียน'}</span>
                  </p>
                </div>
              </div>

              {/* ปุ่มเปิดเมนูสำหรับมือถือ */}
              <button 
                className="md:hidden p-2 text-slate-600 hover:bg-white/60 rounded-xl transition-colors border border-transparent hover:border-white/50" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* เมนู Desktop */}
              <div className="hidden md:flex gap-3 items-center">
                
                {/* กลุ่มเมนู (ซ้อนกระจกอีกชั้นเพื่อความลึก) */}
                <div className="flex items-center bg-white/30 border border-white/50 rounded-2xl p-1.5 backdrop-blur-md">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <Link 
                      key={to} 
                      to={to} 
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-white/80 hover:shadow-sm font-semibold text-sm transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </Link>
                  ))}
                </div>

                {/* ปุ่ม Logout แบบ Minimal */}
                <button 
                  onClick={handleLogout} 
                  className="group flex items-center gap-2 bg-white/60 hover:bg-red-50 hover:border-red-100 text-slate-700 hover:text-red-600 px-5 py-2.5 rounded-2xl border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all font-bold text-sm"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> ออกระบบ
                </button>
              </div>
            </nav>

            {/* เมนูมือถือ (Dropdown แบบ Liquid Glass) */}
            {isMenuOpen && (
              <div className="md:hidden absolute top-24 left-4 right-4 z-40 bg-white/80 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-4 text-slate-800 animate-fade-in">
                <div className="flex flex-col gap-1">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <Link 
                      key={to} 
                      to={to} 
                      onClick={() => setIsMenuOpen(false)} 
                      className="flex items-center gap-3 py-3.5 px-4 hover:bg-white/80 rounded-2xl text-slate-700 font-semibold transition-colors border border-transparent hover:border-white shadow-sm hover:shadow-md"
                    >
                      <Icon className="w-5 h-5 text-blue-500" /> {label}
                    </Link>
                  ))}
                  <div className="h-px bg-slate-200/50 my-2 mx-4"></div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left flex items-center gap-3 py-3.5 px-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-semibold transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. พื้นที่เนื้อหาหลัก (Content) */}
        <div className="relative z-10 container mx-auto p-4 md:px-8">
          <Routes>
            {!user ? (
              <Route path="*" element={<Login />} />
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/checkin/:day/:period" element={<CheckIn />} />
                <Route path="/students" element={user.role === 'teacher' ? <StudentManager /> : <Home />} />
                <Route path="/history" element={user.role === 'teacher' ? <CheckInHistory /> : <Home />} />
                <Route path="/dashboard" element={user.role === 'teacher' ? <Dashboard /> : <Home />} />
                <Route path="/edit-schedule" element={user.role === 'teacher' ? <EditSchedule /> : <Home />} />
                <Route path="/deposit" element={<DepositPage />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;