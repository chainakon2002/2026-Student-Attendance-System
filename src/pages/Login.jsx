import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, get, child } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();
console.log("HELLO! หน้า Login กำลังทำงานแล้วนะ"); // เพิ่มบรรทัดนี้
  
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    // 1. ตัดช่องว่าง และแปลงเป็นตัวพิมพ์เล็ก (ป้องกันการเผลอพิมพ์ตัวใหญ่)
    const cleanUsername = username.trim().toLowerCase();

    try {
      const dbRef = ref(db);
      // ค้นหาไปที่ users/admin (หรือชื่อที่เราพิมพ์)
      const snapshot = await get(child(dbRef, `users/${cleanUsername}`));
const testSnapshot = await get(dbRef);
      console.log("ข้อมูลทั้งหมดในฐานข้อมูลที่เห็นตอนนี้:", testSnapshot.val());
      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // 2. จุดสำคัญ: ต้องแปลง password เป็น String เสมอเพื่อเปรียบเทียบ
        // ไม่ว่าใน Firebase จะเก็บเป็นตัวเลข 12345 หรือข้อความ "12345"
        if (String(userData.password) === String(password)) {
          localStorage.setItem('user', JSON.stringify({
            username: cleanUsername,
            role: userData.role,
            name: userData.name
          }));
          
          navigate('/');
          window.location.reload(); 
        } else {
          setErrorMsg("รหัสผ่านไม่ถูกต้อง");
        }
      } else {
        setErrorMsg("ไม่พบชื่อผู้ใช้งานนี้ในระบบ");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden ">
      
 
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-slate-50/80 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-gray-50/80 rounded-full blur-[100px]"></div>

      
      <div className="relative w-full max-w-lg p-10 md:p-14 rounded-[2.5rem] bg-white/60 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_40px_70px_-15px_rgba(0,0,0,0.08)]">
        
        
        <div className="absolute inset-0 rounded-[2.5rem] border-[1.5px] border-white pointer-events-none bg-gradient-to-br from-white/90 via-transparent to-white/40"></div>
        <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/80 to-transparent rounded-t-[2.5rem] pointer-events-none"></div>

       
        <div className="relative z-10 text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[1.5rem] bg-white flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.03)] border border-gray-100 transform rotate-3 transition-transform hover:rotate-0 duration-300">
            <LogIn className="w-10 h-10 text-slate-800" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">เข้าสู่ระบบ</h2>
          <p className="text-slate-500 mt-3 text-sm md:text-base">ระบบเช็คชื่อนักเรียนออนไลน์</p>
        </div>

        {errorMsg && (
          <div className="relative z-10 mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-100 flex items-center gap-3 animate-fade-in shadow-sm backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600 text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="relative z-10 space-y-5">
          {/* ช่อง Username */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-slate-800" />
            <input
              type="text"
              placeholder="ชื่อผู้ใช้งาน (Username)"
              className="w-full pl-12 pr-4 py-4 bg-white/80 border border-white rounded-2xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* ช่อง Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-slate-800" />
            <input
              type="password"
              placeholder="รหัสผ่าน (Password)"
              className="w-full pl-12 pr-4 py-4 bg-white/80 border border-white rounded-2xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-6 pb-2">
            <div className="flex justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-[#0071e3]" strokeWidth={1.5} />
            </div>
            <p className="text-[11px] text-[#86868b] text-center leading-relaxed">
              ข้อมูลบัญชีของคุณใช้เพื่อลงชื่อเข้าใช้ได้อย่างปลอดภัยและเข้าถึงข้อมูลในระบบ บันทึกข้อมูลบางอย่างเพื่อวัตถุประสงค์ด้านความปลอดภัย การสนับสนุน และการรายงาน  <span className="text-[#0071e3] cursor-pointer hover:underline">ดูการจัดการข้อมูลของคุณ...</span>
            </p>
          </div>
          {/* ปุ่ม Login สีดำ/เทาเข้ม สไตล์มินิมอลแพงๆ */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-8 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg rounded-2xl shadow-[0_10px_20px_rgba(15,23,42,0.15)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border border-slate-700"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>

        <div className="relative z-10 text-center mt-8 pt-6">
            <p className="text-xs text-slate-400">© 2026 Student Attendance System</p>
        </div>

      </div>
    </div>
  );
};

export default Login;