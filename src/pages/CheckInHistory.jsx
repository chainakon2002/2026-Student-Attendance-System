import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { CalendarDays, Users, X, Clock, ClipboardCheck, UserCircle2, Download } from 'lucide-react';
import * as XLSX from 'xlsx'; // เพิ่ม Import XLSX

export default function CheckInHistory() {
  const [history, setHistory] = useState({});
  const [students, setStudents] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // โหลดประวัติการเช็คชื่อ
  useEffect(() => {
    const refPath = ref(db, 'checkins');
    onValue(refPath, (snapshot) => {
      const data = snapshot.val() || {};
      setHistory(data);
    });
  }, []);

  // โหลดข้อมูลนักเรียน
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStudents(data);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const extractMonth = (dateStr) => dateStr.slice(0, 7);

  const monthOptions = Array.from(
    new Set(Object.keys(history).map(extractMonth))
  ).sort((a, b) => new Date(b) - new Date(a)); 

  const formatThaiMonth = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiYear = year + 543;
    return `${thaiMonths[month - 1]} ${thaiYear}`;
  };

  const getStudentHistory = () => {
    const data = {};
    Object.entries(history).forEach(([date, days]) => {
      if (selectedMonth && extractMonth(date) !== selectedMonth) return;

      Object.entries(days).forEach(([day, periods]) => {
        Object.entries(periods).forEach(([period, studentsInPeriod]) => {
          Object.entries(studentsInPeriod).forEach(([studentId, status]) => {
            if (!data[studentId]) data[studentId] = [];
            data[studentId].push({ date, day, period, status });
          });
        });
      });
    });
    return data;
  };

  // ================= เพิ่มฟังก์ชัน Export Excel =================
  const exportToExcel = () => {
    const studentHistory = getStudentHistory();
    const exportData = [];

    // วนลูปรายชื่อนักเรียนทั้งหมดที่มีในระบบ เพื่อสรุปยอด
    Object.keys(students).forEach(studentId => {
      const student = students[studentId];
      const records = studentHistory[studentId] || []; // ดึงประวัติ ถ้าไม่มีให้เป็น array ว่าง

      let present = 0, late = 0, leave = 0, absent = 0;

      // นับสถิติ
      records.forEach(r => {
        if (['มา', 'มาเรียน', 'ปกติ', 'present'].includes(r.status)) present++;
        else if (['สาย', 'late'].includes(r.status)) late++;
        else if (['ลา', 'ลากิจ', 'ลาป่วย', 'leave'].includes(r.status)) leave++;
        else if (['ขาด', 'ขาดเรียน', 'absent'].includes(r.status)) absent++;
      });

      exportData.push({
        'รหัสนักเรียน': student.studentId || studentId,
        'ชื่อ-นามสกุล': student.name || 'ไม่ระบุ',
        'ชั้นเรียน': student.grade || 'ไม่ระบุ',
        'มาเรียน (ครั้ง)': present,
        'มาสาย (ครั้ง)': late,
        'ลา (ครั้ง)': leave,
        'ขาดเรียน (ครั้ง)': absent,
        'รวมคาบทั้งหมด': present + late + leave + absent
      });
    });

    // เรียงลำดับตามชั้นเรียน และ ชื่อ
    exportData.sort((a, b) => {
      if (a['ชั้นเรียน'] === b['ชั้นเรียน']) {
        return a['ชื่อ-นามสกุล'].localeCompare(b['ชื่อ-นามสกุล']);
      }
      return a['ชั้นเรียน'].localeCompare(b['ชั้นเรียน']);
    });

    // สร้าง Workbook และ Worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "สรุปการเข้าเรียน");

    // ตั้งชื่อไฟล์ตามเดือนที่เลือก หรือตั้งเป็น All ถ้าไม่ได้เลือกเดือน
    const fileName = selectedMonth 
      ? `สรุปการเข้าเรียน_${formatThaiMonth(selectedMonth).replace(' ', '_')}.xlsx` 
      : `สรุปการเข้าเรียน_ทั้งหมด.xlsx`;

    // ดาวน์โหลดไฟล์
    XLSX.writeFile(workbook, fileName);
  };
  // =======================================================

  const renderStatusBadge = (status) => {
    let colorClass = "bg-slate-100 text-slate-600 border-slate-200"; 
    if (['มา', 'มาเรียน', 'ปกติ', 'present'].includes(status)) {
      colorClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
    } else if (['ขาด', 'ขาดเรียน', 'absent'].includes(status)) {
      colorClass = "bg-red-50 text-red-600 border-red-200";
    } else if (['ลา', 'ลากิจ', 'ลาป่วย', 'leave'].includes(status)) {
      colorClass = "bg-yellow-50 text-yellow-600 border-yellow-200";
    } else if (['สาย', 'late'].includes(status)) {
      colorClass = "bg-orange-50 text-orange-600 border-orange-200";
    }

    return (
      <span className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold tracking-wide shadow-sm ${colorClass}`}>
        {status}
      </span>
    );
  };

  const filteredHistory = Object.entries(history)
    .filter(([date]) => !selectedMonth || extractMonth(date) === selectedMonth)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]));

  return (
    <div
      className={`p-2 md:p-4 max-w-6xl mx-auto transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d1d1f] tracking-tight drop-shadow-sm mb-2">
            ประวัติการเช็คชื่อ
          </h1>
          <p className="text-slate-500 font-medium">ดูบันทึกการเข้าเรียนย้อนหลัง และสรุปประวัติรายบุคคล</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* ตัวกรองเดือน */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-48 appearance-none px-5 py-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[#1d1d1f] font-bold focus:outline-none focus:bg-white/70 focus:ring-4 focus:ring-white/50 transition-all duration-300 cursor-pointer text-sm"
            >
              <option value="" className="text-slate-500">-- ทุกเดือน --</option>
              {monthOptions.map((month) => (
                <option key={month} value={month} className="text-slate-800 font-medium">
                  {formatThaiMonth(month)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* ปุ่มสรุปรายบุคคล */}
            <button
              onClick={() => setShowStudentModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 font-bold transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
            >
              <Users size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">สรุปรายบุคคล</span>
              <span className="sm:hidden">สรุป</span>
            </button>

            {/* ปุ่ม Export Excel (สีเขียวสไตล์ Apple) */}
            <button
              onClick={exportToExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 font-bold transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
            >
              <Download size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">ส่งออก Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main History List */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm">
            <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-500">ไม่มีข้อมูลการเช็คชื่อในเดือนนี้</p>
          </div>
        ) : (
          filteredHistory.map(([date, days]) => (
            <div key={date} className="bg-white/40 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all hover:bg-white/50">
              
              <div className="flex items-center gap-3 mb-6 border-b border-white/60 pb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <CalendarDays size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">
                  วันที่: {date}
                </h2>
              </div>

              <div className="space-y-6">
                {Object.entries(days).map(([day, periods]) => (
                  <div key={day} className="bg-white/50 rounded-2xl p-5 border border-white/60 shadow-sm">
                    <h3 className="font-extrabold text-blue-600 text-lg mb-4 flex items-center gap-2">
                      <Clock size={18} /> {day}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(periods).map(([period, records]) => (
                        <div key={period} className="bg-white/60 border border-white/80 rounded-xl p-4 shadow-sm">
                          <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-200/50 pb-2">
                            คาบที่ {period.replace('period', '')}
                          </h4>
                          <ul className="space-y-2.5">
                            {Object.entries(records).map(([studentId, status]) => {
                              const student = students[studentId];
                              const name = student ? student.name : studentId;
                              const grade = student?.grade || '';

                              return (
                                <li key={studentId} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    <span className="font-bold text-slate-700">{name}</span>
                                    {grade && <span className="text-xs text-slate-400 font-medium">({grade})</span>}
                                  </div>
                                  {renderStatusBadge(status)}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal ประวัตินักเรียนรายบุคคล คงเดิม... */}
      {showStudentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => setShowStudentModal(false)}
          ></div>
          
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 md:p-8 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in">
            
            <button
              onClick={() => setShowStudentModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors z-10"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <div className="mb-6 flex-shrink-0">
              <h2 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">สรุปประวัติรายบุคคล</h2>
              <p className="text-slate-500 font-medium mt-1">ประวัติการเข้าเรียนแยกตามชั้นเรียนและนักเรียน</p>
            </div>

            <div className="overflow-y-auto pr-2 pb-4 space-y-8 flex-grow custom-scrollbar">
              {Object.entries(
                Object.entries(getStudentHistory()).reduce((acc, [studentId, records]) => {
                  const student = students[studentId];
                  const grade = student?.grade || 'ไม่ระบุชั้น';
                  if (!acc[grade]) acc[grade] = [];
                  acc[grade].push({ studentId, records });
                  return acc;
                }, {})
              )
                .sort((a, b) => a[0].localeCompare(b[0])) 
                .map(([grade, studentList]) => (
                  <div key={grade} className="bg-white/50 border border-white/80 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                      <h3 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">ชั้น {grade}</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {studentList.map(({ studentId, records }) => {
                        const student = students[studentId];
                        const name = student?.name || studentId;

                        return (
                          <div key={studentId} className="bg-white/60 border border-white/60 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <h4 className="font-extrabold text-blue-600 flex items-center gap-2 mb-3 border-b border-white pb-2">
                              <UserCircle2 size={18} /> {name}
                            </h4>
                            <ul className="space-y-2">
                              {records
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .map((r, idx) => (
                                  <li key={idx} className="flex justify-between items-center text-sm bg-white/40 px-3 py-2 rounded-xl">
                                    <div className="text-slate-600 font-medium">
                                      {r.date} <span className="text-slate-400">({r.day})</span> - คาบ {r.period.replace('period', '')}
                                    </div>
                                    {renderStatusBadge(r.status)}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}