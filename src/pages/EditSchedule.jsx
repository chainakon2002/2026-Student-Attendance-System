import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { Save } from 'lucide-react'; // เพิ่มไอคอน Save

const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'];
const periods = [1, 2, 3, 4, 5, 6];
const termOptions = [
  { label: 'ภาคเรียนที่ 1/2568', value: '1-2568' },
  { label: 'ภาคเรียนที่ 2/2568', value: '2-2568' },
];

export default function EditSchedule() {
  const [term, setTerm] = useState('2-2568');
  const [schedule, setSchedule] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // เพิ่ม State สำหรับปุ่มโหลด

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

  const handleChange = (day, periodIndex, value) => {
    const updated = { ...schedule };
    if (!updated[day]) updated[day] = [];
    updated[day][periodIndex] = value;
    setSchedule(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await set(ref(db, `schedules/${term}`), schedule);
      // เปลี่ยนจาก alert ธรรมดา เป็นให้ปุ่มกลับมาสถานะเดิม
      setTimeout(() => {
        setIsSaving(false);
        alert('บันทึกตารางเรียนเรียบร้อยแล้ว');
      }, 500);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <div
      className={`p-2 md:p-4 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header สไตล์ Apple */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d1d1f] tracking-tight drop-shadow-sm mb-2">
            จัดตารางเรียน
          </h1>
          <p className="text-slate-500 font-medium">แก้ไขรายวิชาและชั้นเรียนในแต่ละคาบ</p>
        </div>

        {/* เลือกเทอม (Glass Dropdown) */}
        <div className="relative group w-full md:w-auto">
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full md:w-52 appearance-none px-6 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[#1d1d1f] font-bold tracking-tight focus:outline-none focus:bg-white/70 focus:ring-4 focus:ring-white/50 transition-all duration-300 cursor-pointer hover:bg-white/60 text-sm"
          >
            {termOptions.map((t) => (
              <option key={t.value} value={t.value} className="text-slate-800 font-medium">
                {t.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      {/* กล่องตาราง (Main Liquid Glass Container) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white/30 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-8">
        
        {/* เอฟเฟกต์สะท้อนแสงผิวกระจกด้านบน */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10 p-1 md:p-3">
          <table className="min-w-[900px] w-full text-center table-fixed border-collapse">
            <thead>
              <tr className="bg-white/40 backdrop-blur-md">
                <th className="border-b border-r border-white/50 p-4 w-28 rounded-tl-[2rem]">
                  <span className="font-extrabold text-[#1d1d1f] tracking-tight">วัน / คาบ</span>
                </th>
                {periods.map((p, idx) => (
                  <th key={p} className={`border-b border-white/50 p-4 w-32 ${idx !== periods.length - 1 ? 'border-r' : 'rounded-tr-[2rem]'}`}>
                    <span className="font-extrabold text-[#1d1d1f] tracking-tight">คาบ {p}</span>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {days.map((day, rowIndex) => (
                <tr key={day} className="transition-colors duration-300 hover:bg-white/10">
                  
                  {/* คอลัมน์ "วัน" */}
                  <td className={`border-b border-r border-white/40 p-4 font-extrabold tracking-tight text-[#1d1d1f] ${
                    rowIndex === days.length - 1 ? 'rounded-bl-[2rem] border-b-0' : ''
                  }`}>
                    {day}
                  </td>

                  {/* ช่องกรอกข้อมูล คาบ 1-6 */}
                  {periods.map((_, i) => {
                    const isLastCell = rowIndex === days.length - 1 && i === periods.length - 1;
                    return (
                      <td 
                        key={i} 
                        className={`p-2 align-middle ${
                          isLastCell ? 'border-none' : 'border-b border-r border-white/40'
                        } ${rowIndex === days.length - 1 && !isLastCell ? 'border-b-0' : ''}`}
                      >
                        {/* ช่อง Input แบบเจาะลึก (Inset Glass) */}
                        <input
                          type="text"
                          value={schedule?.[day]?.[i] || ''}
                          onChange={(e) => handleChange(day, i, e.target.value)}
                          placeholder="วิชา ชั้น"
                          className="w-full px-3 py-3 bg-white/40 border border-white/60 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)] text-sm font-semibold text-center hover:bg-white/60"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/20 font-bold transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save size={20} strokeWidth={2.5} />
          )}
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกตารางเรียน'}
        </button>
      </div>
    </div>
  );
}