import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Image as ImageIcon, 
  MapPin, 
  BarChart2, 
  LayoutGrid 
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const [isMerging, setIsMerging] = useState(false);
  const [isPopped, setIsPopped] = useState(false);

  useEffect(() => {
    // 1. ใส่ CSS Keyframes
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes float-slow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-12px); }
      }
      @keyframes float-medium {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-18px); }
      }
      @keyframes float-fast {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
      .animate-float-medium { animation: float-medium 3.5s ease-in-out infinite; }
      .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
    `;
    document.head.appendChild(styleSheet);

    // 2. ฟังก์ชันควบคุมรอบแอนิเมชัน (1 รอบ = 6 วินาที)
    const runAnimationCycle = () => {
      // เริ่มต้น: รีเซ็ตให้กระจายออกและโลโก้ขนาดปกติ
      setIsMerging(false);
      setIsPopped(false);

      // ผ่านไป 3 วิ: สั่งดูดรวมกัน
      setTimeout(() => {
        setIsMerging(true);
      }, 4000);

      // ผ่านไป 3.5 วิ: โลโก้กระแทกขยาย
      setTimeout(() => {
        setIsPopped(true);
      }, 4500);
    };

    // รันรอบแรกทันทีที่เปิดหน้าเว็บ
    runAnimationCycle();

    // ตั้งเวลาให้รันซ้ำทุกๆ 6 วินาที
    const intervalId = setInterval(runAnimationCycle, 6000);

    return () => {
      clearInterval(intervalId);
      styleSheet.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center font-sans relative overflow-hidden selection:bg-blue-200">
      <div className="flex flex-col items-center w-full max-w-md p-6">
        
        {/* คอนเทนเนอร์ขนาด 64x64 (256x256 px) */}
        <div className="relative w-64 h-64 mb-6 flex items-center justify-center pointer-events-none">
          
          {/* ================= โลโก้ตรงกลาง ================= */}
          <div 
            className={`relative z-20 w-32 h-32 flex items-center justify-center transition-all duration-500 ease-out transform ${
              isPopped ? 'scale-110 drop-shadow-2xl' : 'scale-100 drop-shadow-none'
            }`}
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* ================= กลุ่มไอคอนรอบนอก ================= */}
          
          {/* ไอคอนที่ 1: Mail (ซ้ายบน) */}
          <div className={`absolute z-10 transition-all duration-700 ease-in-out ${
            isMerging ? 'top-[100px] left-[100px] opacity-0 scale-50' : 'top-[16px] left-[24px] opacity-100 scale-100'
          }`}>
            <div className="animate-float-slow">
              <div className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                <Mail className="text-white w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ไอคอนที่ 2: Photos (ขวาบน) */}
          <div className={`absolute z-0 transition-all duration-700 ease-in-out ${
            isMerging ? 'top-[108px] left-[108px] opacity-0 scale-50' : 'top-[0px] left-[176px] opacity-100 scale-100'
          }`}>
            <div className="animate-float-medium" style={{ animationDelay: '1s' }}>
              <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                <ImageIcon className="text-rose-500 w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ไอคอนที่ 3: Map (ขวากลาง) */}
          <div className={`absolute z-10 transition-all duration-700 ease-in-out ${
            isMerging ? 'top-[104px] left-[104px] opacity-0 scale-50' : 'top-[96px] left-[224px] opacity-100 scale-100'
          }`}>
            <div className="animate-float-fast" style={{ animationDelay: '0.5s' }}>
              <div className="w-12 h-12 bg-emerald-100 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                <MapPin className="text-emerald-500 w-6 h-6" />
              </div>
            </div>
          </div>

          {/* ไอคอนที่ 4: Chart (ขวาล่าง) */}
          <div className={`absolute z-30 transition-all duration-700 ease-in-out ${
            isMerging ? 'top-[100px] left-[100px] opacity-0 scale-50' : 'top-[176px] left-[168px] opacity-100 scale-100'
          }`}>
            <div className="animate-float-slow" style={{ animationDelay: '1.5s' }}>
              <div className="w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                <BarChart2 className="text-white w-7 h-7" />
              </div>
            </div>
          </div>

          {/* ไอคอนที่ 5: Grid (ซ้ายล่าง) */}
          <div className={`absolute z-0 transition-all duration-700 ease-in-out ${
            isMerging ? 'top-[108px] left-[108px] opacity-0 scale-50' : 'top-[176px] left-[16px] opacity-100 scale-100'
          }`}>
            <div className="animate-float-medium" style={{ animationDelay: '0.8s' }}>
              <div className="w-10 h-10 bg-amber-400 rounded-full shadow-md flex items-center justify-center border-2 border-white">
                <LayoutGrid className="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1d1d1f] tracking-tighter mb-8">
          ระบบเช็คชื่อ
        </h1>

        <div className="flex flex-col items-center animate-fade-in w-full">
          <button
            onClick={() => navigate('/login')}
            className="bg-[#1d1d1f] hover:bg-black text-white px-10 py-3.5 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg w-auto"
          >
            ลงชื่อเข้าใช้
          </button>
          <p className="mt-8 text-xl text-[#86868b] font-medium text-center max-w-xs leading-relaxed">
            พื้นที่ที่ดีที่สุดสำหรับจัดการ <br />
            <span className="text-[#1d1d1f] font-bold">เวลาเรียนและสถิติ</span> ของคุณ
          </p>
        </div>
      </div>
    </div>
  );
}