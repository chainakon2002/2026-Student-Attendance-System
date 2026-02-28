
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { Activity, CalendarDays, PieChart as PieIcon, LineChart as LineIcon } from "lucide-react";

// อัปเดตสีโทน Apple ให้ดูพรีเมียมขึ้น
const COLORS = {
  มา: "#34C759", // Apple Green
  สาย: "#FF9500", // Apple Orange
  ลา: "#5AC8FA", // Apple Light Blue
  ขาด: "#FF3B30", // Apple Red
};

const terms = [
  { value: "1_2568", label: "ภาคเรียน 1/2568" },
  { value: "2_2568", label: "ภาคเรียน 2/2568" },
  { value: "1_2569", label: "ภาคเรียน 1/2569" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ มา: 0, สาย: 0, ลา: 0, ขาด: 0 });
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [termChartData, setTermChartData] = useState([]);
  const [latestTerm, setLatestTerm] = useState({ value: "1_2569", label: "ภาคเรียน 1/2569" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkinsRef = ref(db, "checkins");
    onValue(checkinsRef, (snapshot) => {
      const data = snapshot.val() || {};

      // นับรวมสถิติรวมทั้งหมด
      const counts = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
      Object.values(data).forEach((dayObj) => {
        Object.values(dayObj).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (counts[status] !== undefined) {
                counts[status]++;
              }
            });
          });
        });
      });
      setStats(counts);

      // ========== สร้างข้อมูลกราฟรายสัปดาห์ (7 วันล่าสุด) ==========
      const daysSorted = Object.keys(data).sort((a, b) => (a < b ? 1 : -1)); 
      const last7Days = daysSorted.slice(0, 7).reverse(); 

      const weeklyData = last7Days.map((date) => {
        const dayData = data[date];
        const countsPerDay = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
        // ดึงเฉพาะวันที่และเดือนมาแสดงสั้นๆ เช่น 01-05
        const shortDate = date.substring(5); 
        
        Object.values(dayData).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (countsPerDay[status] !== undefined) countsPerDay[status]++;
            });
          });
        });
        return {
          date: shortDate,
          fullDate: date,
          ...countsPerDay,
        };
      });
      setWeeklyChartData(weeklyData);

      // ========== สร้างข้อมูลกราฟรายเดือน ==========
      const monthlyCounts = {};
      Object.entries(data).forEach(([date, dayData]) => {
        const month = date.slice(0, 7);
        if (!monthlyCounts[month]) {
          monthlyCounts[month] = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
        }
        Object.values(dayData).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (monthlyCounts[month][status] !== undefined) {
                monthlyCounts[month][status]++;
              }
            });
          });
        });
      });

      const monthlyData = Object.entries(monthlyCounts)
        .sort((a, b) => (a[0] > b[0] ? 1 : -1))
        .map(([month, counts]) => ({
          month,
          ...counts,
        }));
      setMonthlyChartData(monthlyData);

      // ========== สร้างข้อมูลกราฟรายภาคเรียน ==========
      // สำหรับกราฟ Pie (สัดส่วนรวมของเทอมล่าสุด)
      const termTotalCounts = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
      
      Object.entries(data).forEach(([date, dayData]) => {
        Object.values(dayData).forEach((periods) => {
          Object.values(periods).forEach((students) => {
            Object.values(students).forEach((status) => {
              if (termTotalCounts[status] !== undefined) {
                termTotalCounts[status]++;
              }
            });
          });
        });
      });

      // แปลงข้อมูลให้ Recharts อ่านได้
      const pieData = Object.entries(termTotalCounts)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
          name: key,
          value: value,
        }));
        
      setTermChartData(pieData);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // คอมโพเนนต์เล็กๆ สำหรับทำ Custom Tooltip กราฟให้ดูพรีเมียม
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`p-2 md:p-4 max-w-[1200px] mx-auto transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d1d1f] tracking-tight drop-shadow-sm flex items-center gap-3">
          <Activity className="text-blue-500 w-8 h-8 md:w-10 md:h-10" />
          ภาพรวมสถิติ
        </h1>
        <p className="text-slate-500 font-medium mt-1">สรุปข้อมูลการเข้าเรียน สาย ลา ขาด ทั้งหมดในระบบ</p>
      </div>

      {/* สรุปตัวเลขยอดรวม (Stat Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "มาเรียน", value: stats["มา"], color: "emerald", icon: "✓" },
          { label: "มาสาย", value: stats["สาย"], color: "orange", icon: "⏱" },
          { label: "ลาหยุด", value: stats["ลา"], color: "sky", icon: "✉" },
          { label: "ขาดเรียน", value: stats["ขาด"], color: "red", icon: "✕" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/40 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
            <div className={`text-${stat.color}-500 text-2xl mb-1 opacity-80`}>{stat.icon}</div>
            <div className={`text-4xl font-extrabold tracking-tighter text-${stat.color}-500 mb-1`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm font-bold text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ส่วนของกราฟ (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* คอลัมน์ซ้าย (Bar & Pie) */}
        <div className="flex flex-col gap-6">
          
          {/* กราฟแท่ง รายสัปดาห์ */}
          <div className="bg-white/30 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <CalendarDays size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">รายสัปดาห์ (7 วันล่าสุด)</h2>
            </div>
            
            {weeklyChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium">ไม่มีข้อมูลในสัปดาห์นี้</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Bar dataKey="มา" stackId="a" fill={COLORS["มา"]} radius={[0, 0, 4, 4]} barSize={20} />
                    <Bar dataKey="สาย" stackId="a" fill={COLORS["สาย"]} />
                    <Bar dataKey="ลา" stackId="a" fill={COLORS["ลา"]} />
                    <Bar dataKey="ขาด" stackId="a" fill={COLORS["ขาด"]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* กราฟวงกลม สัดส่วนเทอม */}
          <div className="bg-white/30 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                <PieIcon size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">สัดส่วนรวมทั้งหมด</h2>
            </div>
            
            {termChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium">ไม่มีข้อมูล</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={termChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {termChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* คอลัมน์ขวา (Line Chart กราฟเส้น) */}
        <div className="bg-white/30 backdrop-blur-2xl border border-white/70 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-full min-h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <LineIcon size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">แนวโน้มรายเดือน (ย้อนหลัง)</h2>
          </div>
          
          {monthlyChartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-slate-400 font-medium">ไม่มีข้อมูลย้อนหลัง</div>
          ) : (
            <div className="h-[400px] lg:h-[calc(100%-80px)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="มา" stroke={COLORS["มา"]} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="สาย" stroke={COLORS["สาย"]} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="ลา" stroke={COLORS["ลา"]} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="ขาด" stroke={COLORS["ขาด"]} strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   LineChart,
//   Line,
// } from "recharts";
// import { ref, onValue } from "firebase/database";
// import { db } from "../firebase";

// const COLORS = {
//   มา: "#4CAF50",
//   สาย: "#FF9800",
//   ลา: "#03A9F4",
//   ขาด: "#F44336",
// };

// const terms = [
//   { value: "1_2568", label: "ภาคเรียน 1/2568" },
//   { value: "2_2568", label: "ภาคเรียน 2/2568" },
//   { value: "1_2569", label: "ภาคเรียน 1/2569" },
// ];




// export default function Dashboard() {
//   const [stats, setStats] = useState({});
//   const [weeklyChartData, setWeeklyChartData] = useState([]);
//   const [monthlyChartData, setMonthlyChartData] = useState([]);
//   const [termChartData, setTermChartData] = useState([]);
//   const [latestTerm, setLatestTerm] = useState({ value: "1_2569", label: "ภาคเรียน 1/2569" });

//   useEffect(() => {
//     const checkinsRef = ref(db, "checkins");
//     onValue(checkinsRef, (snapshot) => {
//       const data = snapshot.val() || {};

//       // นับรวมสถิติรวมทั้งหมด (ไม่จำเป็นแต่เก็บไว้)
//       const counts = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
//       Object.values(data).forEach((dayObj) => {
//         Object.values(dayObj).forEach((periods) => {
//           Object.values(periods).forEach((students) => {
//             Object.values(students).forEach((status) => {
//               if (counts[status] !== undefined) {
//                 counts[status]++;
//               }
//             });
//           });
//         });
//       });
//       setStats(counts);

//       // ========== สร้างข้อมูลกราฟรายสัปดาห์ ==========
//       // สมมติว่า key วันที่เก็บแบบ '2023-05-21' และเราเอา 7 วันล่าสุด
//       const daysSorted = Object.keys(data).sort((a, b) => (a < b ? 1 : -1)); // ล่าสุดก่อน
//       const last7Days = daysSorted.slice(0, 7).reverse(); // กลับด้านให้เรียงจากเก่าถึงใหม่

//       const weeklyData = last7Days.map((date) => {
//         const dayData = data[date];
//         // รวมสถานะทั้งหมดในวันนั้น
//         const countsPerDay = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
//         Object.values(dayData).forEach((periods) => {
//           Object.values(periods).forEach((students) => {
//             Object.values(students).forEach((status) => {
//               if (countsPerDay[status] !== undefined) countsPerDay[status]++;
//             });
//           });
//         });
//         return {
//           date,
//           ...countsPerDay,
//         };
//       });
//       setWeeklyChartData(weeklyData);

    
//       const monthlyCounts = {};
//       Object.entries(data).forEach(([date, dayData]) => {
//         const month = date.slice(0, 7);
//         if (!monthlyCounts[month]) {
//           monthlyCounts[month] = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
//         }
//         Object.values(dayData).forEach((periods) => {
//           Object.values(periods).forEach((students) => {
//             Object.values(students).forEach((status) => {
//               if (monthlyCounts[month][status] !== undefined) {
//                 monthlyCounts[month][status]++;
//               }
//             });
//           });
//         });
//       });

//       const monthlyData = Object.entries(monthlyCounts)
//         .sort((a, b) => (a[0] > b[0] ? 1 : -1))
//         .map(([month, counts]) => ({
//           month,
//           ...counts,
//         }));
//       setMonthlyChartData(monthlyData);

//       // ========== สร้างข้อมูลกราฟรายภาคเรียน ==========
//       // สมมติ term format: '1_2568' '2_2568' โดยเอา term ที่ล่าสุด
//       // เราจะรวมข้อมูลตาม term (แค่เก็บรวมสถานะ)
//       const termCounts = {};
//       Object.entries(data).forEach(([date, dayData]) => {
//         // หา term จากเดือน ปี จากวันที่ (สมมติเดือน 5-10 ภาคเรียน 1, 11-4 ภาคเรียน 2)
//         const year = +date.slice(0, 4);
//         const month = +date.slice(5, 7);
//         let termNum = month >= 5 && month <= 10 ? 1 : 2;
//         const termKey = `${termNum}_${year}`;
//         if (!termCounts[termKey]) {
//           termCounts[termKey] = { มา: 0, สาย: 0, ลา: 0, ขาด: 0 };
//         }
//         Object.values(dayData).forEach((periods) => {
//           Object.values(periods).forEach((students) => {
//             Object.values(students).forEach((status) => {
//               if (termCounts[termKey][status] !== undefined) {
//                 termCounts[termKey][status]++;
//               }
//             });
//           });
//         });
//       });

//       // เอาภาคเรียนล่าสุด (มากสุดตามปี+เทอม)
//       const termKeys = Object.keys(termCounts).sort((a, b) => {
//         const [termA, yearA] = a.split("_").map(Number);
//         const [termB, yearB] = b.split("_").map(Number);
//         if (yearA !== yearB) return yearB - yearA;
//         return termB - termA;
//       });
//       const latest = termKeys[0] || "1_2569";
//       setLatestTerm(
//         terms.find((t) => t.value === latest) || { value: latest, label: `ภาคเรียน ${latest.replace("_", "/")}` }
//       );

//       // แปลงข้อมูล termCounts เป็น array สำหรับ pie chart
//       const termData = Object.entries(termCounts).map(([term, counts]) => ({
//         term,
//         ...counts,
//       }));
//       setTermChartData(termData);
//     });
//   }, []);


// const [isVisible, setIsVisible] = useState(false);

// useEffect(() => {
//   const timer = setTimeout(() => setIsVisible(true), 100); // รอ 100ms ก่อนโชว์
//   return () => clearTimeout(timer);
// }, []);


  
//   return (
//     <div
//   className={`p-4 max-w-[1100px] mx-auto transition-opacity transition-transform duration-700 ease-out ${
//     isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
//   }`}
// >

//       <h1 className="text-2xl font-bold text-blue-600 mb-6">แดชบอร์ดสถิติ</h1>
//       <div className="flex gap-6">
//         {/* ซ้าย */}
//         <div className="flex flex-col gap-6 flex-1">
//           {/* รายสัปดาห์ */}
//           <div className="border rounded-2xl p-4 bg-white shadow" style={{ minHeight: 280 }}>
//             <h2 className="text-xl font-semibold mb-3">รายสัปดาห์ (7 วันล่าสุด)</h2>
//             {weeklyChartData.length === 0 ? (
//               <p>ยังไม่มีข้อมูลรายสัปดาห์</p>
//             ) : (
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart
//                   data={weeklyChartData}
//                   margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="มา" stackId="a" fill={COLORS["มา"]} />
//                   <Bar dataKey="สาย" stackId="a" fill={COLORS["สาย"]} />
//                   <Bar dataKey="ลา" stackId="a" fill={COLORS["ลา"]} />
//                   <Bar dataKey="ขาด" stackId="a" fill={COLORS["ขาด"]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* ภาคเรียน */}
//           <div className="border rounded-2xl p-4 bg-white shadow" style={{ minHeight: 280 }}>
//             <h2 className="text-xl font-semibold mb-3">รายภาคเรียน ({latestTerm.label})</h2>
//             {termChartData.length === 0 ? (
//               <p>ยังไม่มีข้อมูลภาคเรียน</p>
//             ) : (
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie
//                     data={termChartData}
//                     dataKey={latestTerm.value}
//                     nameKey="term"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     label={({ name, percent }) =>
//                       `${name}: ${(percent * 100).toFixed(0)}%`
//                     }
//                   >
//                     {termChartData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={COLORS[entry[latestTerm.value]] || "#8884d8"}
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </div>

//         {/* ขวา */}
//         <div className="border rounded-2xl p-4 bg-white shadow flex-1" style={{ minHeight: 560 }}>
//           <h2 className="text-xl font-semibold mb-3">รายเดือน (ย้อนหลัง)</h2>
//           {monthlyChartData.length === 0 ? (
//             <p>ยังไม่มีข้อมูลรายเดือน</p>
//           ) : (
//             <ResponsiveContainer width="100%" height={500}>
//               <LineChart
//                 data={monthlyChartData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="มา" stroke={COLORS["มา"]} />
//                 <Line type="monotone" dataKey="สาย" stroke={COLORS["สาย"]} />
//                 <Line type="monotone" dataKey="ลา" stroke={COLORS["ลา"]} />
//                 <Line type="monotone" dataKey="ขาด" stroke={COLORS["ขาด"]} />
//               </LineChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


