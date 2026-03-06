import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'];

export default function Home() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({});
  
  // ล็อกค่าภาคเรียนไว้ที่ 2-2568 แบบไม่เปลี่ยนค่าแล้ว
  const [term] = useState('2-2568'); 
  const [isVisible, setIsVisible] = useState(false);

  const getTodayThai = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    if (dayIndex >= 1 && dayIndex <= 5) {
      return days[dayIndex - 1];
    }
    return null;
  };

  const todayThai = getTodayThai();

  useEffect(() => {
    const scheduleRef = ref(db, `schedules/${term}`);
    onValue(scheduleRef, (snapshot) => {
      setSchedule(snapshot.val() || {});
    });
  }, [term]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const renderCell = (day, i) => {
    const item = schedule?.[day]?.[i];
    let subject = 'ว่าง', className = '';
    
    if (typeof item === 'string') subject = item;
    else if (item) {
      subject = item.subject || 'ว่าง';
      className = item.class || '';
    }

    const isSubject = subject !== 'ว่าง';
    const canClick = isSubject && day === todayThai;

    return (
      <td
        key={i}
        className="border-b border-r border-white/40 p-2 align-middle h-20"
        onClick={() => {
          if (canClick) {
            navigate(`/checkin/${day}/${i + 1}`, { state: { subject, className } });
          }
        }}
      >
        {isSubject ? (
          <div 
            className={`mx-auto w-[95%] h-full flex flex-col justify-center items-center py-2 px-1 rounded-2xl border transition-all duration-300 ${
              canClick 
                ? 'bg-white/70 border-white shadow-[0_4px_10px_rgba(0,0,0,0.03)] text-blue-600 hover:bg-white hover:scale-105 hover:shadow-[0_8px_15px_rgba(37,99,235,0.1)] cursor-pointer' 
                : 'bg-white/20 border-white/50 text-[#1d1d1f] opacity-80'
            }`}
          >
            <span className={`font-extrabold tracking-tight ${canClick ? 'text-sm' : 'text-xs'}`}>
              {subject}
            </span>
            {className && (
              <span className={`mt-0.5 font-medium ${canClick ? 'text-xs text-blue-400' : 'text-[10px] text-slate-500'}`}>
                {className}
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400/50 text-sm font-medium tracking-wide">ว่าง</span>
        )}
      </td>
    );
  };

  return (
    <div
      className={`p-2 md:p-4 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-[#1d1d1f] tracking-tight mb-2 drop-shadow-sm">
        ตารางเรียน
      </h1>
      <p className="text-center text-slate-500 font-medium mb-8">คลิกที่วิชาเรียนของวันนี้เพื่อเช็คชื่อ</p>

      {/* ป้ายแสดงภาคเรียน (ตำแหน่งเดิมเป๊ะ แต่กดเลือกไม่ได้แล้ว) */}
      <div className="flex justify-end pr-2 mb-4">
        <div className="px-6 py-2.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-blue-600 font-extrabold tracking-tight text-sm cursor-default">
          ภาคเรียนที่ 2/2568
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] bg-white/30 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10 p-1">
          <table className="min-w-[800px] w-full text-center table-fixed border-collapse">
            <thead>
              <tr className="bg-white/40 backdrop-blur-md">
                <th className="border-b border-r border-white/50 p-4 w-28 rounded-tl-[2.2rem]">
                  <span className="font-extrabold text-[#1d1d1f] tracking-tight">วัน / คาบ</span>
                </th>
                {[1, 2, 3].map(num => (
                  <th key={num} className="border-b border-r border-white/50 p-3 w-32">
                    <div className="flex flex-col leading-tight">
                      <span className="font-extrabold text-[#1d1d1f] tracking-tight">คาบ {num}</span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">0{num+7}:30-0{num+8}:30</span>
                    </div>
                  </th>
                ))}
                
                <th className="border-b border-r border-white/50 p-3 w-28 bg-amber-50/40 backdrop-blur-sm">
                  <span className="font-extrabold text-amber-700/80 tracking-tight">พักกลางวัน</span>
                </th>

                {[4, 5, 6].map((num, idx) => (
                  <th key={num} className={`border-b border-white/50 p-3 w-32 ${idx !== 2 ? 'border-r' : 'rounded-tr-[2.2rem]'}`}>
                    <div className="flex flex-col leading-tight">
                      <span className="font-extrabold text-[#1d1d1f] tracking-tight">คาบ {num}</span>
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">{num+8}:30-{num+9}:30</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {days.map((day, rowIndex) => {
                const isToday = day === todayThai;
                
                return (
                  <tr key={day} className={`transition-colors duration-300 ${isToday ? 'bg-white/30' : 'hover:bg-white/10'}`}>
                    
                    <td className={`border-b border-r border-white/40 p-4 font-extrabold tracking-tight ${
                      isToday ? 'text-blue-600' : 'text-[#1d1d1f]'
                    } ${rowIndex === days.length - 1 ? 'rounded-bl-[2.2rem] border-b-0' : ''}`}>
                      <div className="flex items-center justify-center gap-2">
                        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                        {day}
                      </div>
                    </td>

                    {[0, 1, 2].map(i => renderCell(day, i))}

                    <td className={`border-b border-r border-white/40 p-2 bg-amber-50/20 ${rowIndex === days.length - 1 ? 'border-b-0' : ''}`}>
                      <div className="w-full h-full rounded-xl bg-white/20 border border-white/40 opacity-50"></div>
                    </td>

                    {[3, 4, 5].map((i, iIndex) => {
                       const isLastCell = rowIndex === days.length - 1 && iIndex === 2;
                       return (
                         <React.Fragment key={i}>
                           {React.cloneElement(renderCell(day, i), {
                             className: `p-2 align-middle h-20 ${
                               isLastCell ? 'border-none' : 'border-b border-r border-white/40'
                             } ${rowIndex === days.length - 1 && !isLastCell ? 'border-b-0' : ''}`
                           })}
                         </React.Fragment>
                       );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}