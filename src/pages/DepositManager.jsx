import React, { useEffect, useState } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';
import { Wallet, History, Printer, X, PlusCircle, UserCircle2 } from 'lucide-react'; // นำเข้าไอคอนเพื่อความแพง

// --- อัปเกรด Modal เป็นสไตล์ White Liquid Glass ---
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
      {/* พื้นหลังเบลอ (Backdrop) */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>
      
      {/* ตัวกล่อง Modal (Glass Panel) */}
      <div className="relative bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 md:p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto transform transition-all animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default function DepositPage() {
  const [students, setStudents] = useState({});
  const [deposits, setDeposits] = useState({});
  const [studentTotals, setStudentTotals] = useState({});
  const [selectedStudentKey, setSelectedStudentKey] = useState(null);
  const [modalType, setModalType] = useState(null); 
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      setStudents(snapshot.val() || {});
    });
  }, []);

  useEffect(() => {
    const depositsRef = ref(db, 'deposits');
    onValue(depositsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDeposits(data);

      const totals = {};
      Object.entries(data).forEach(([stuKey, records]) => {
        totals[stuKey] = Object.values(records).reduce(
          (sum, r) => sum + Number(r.amount || 0),
          0
        );
      });
      setStudentTotals(totals);
    });
  }, []);

  useEffect(() => {
    if (!selectedStudentKey) {
      setHistoryList([]);
      return;
    }
    const studentDeposits = deposits[selectedStudentKey] || {};
    const list = Object.entries(studentDeposits)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setHistoryList(list);
  }, [selectedStudentKey, deposits]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  const handleDeposit = () => {
    if (!selectedStudentKey) return alert('กรุณาเลือกนักเรียน');
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');

    const newDeposit = {
      amount: Number(amount),
      note: note.trim() || '-',
      date: new Date().toISOString().slice(0, 10),
    };

    push(ref(db, `deposits/${selectedStudentKey}`), newDeposit);
    setAmount('');
    setNote('');
    setModalType(null);
  };

  const handlePrintReceipt = (deposit) => {
    if (!deposit) return;
    const doc = new jsPDF();
    const student = students[selectedStudentKey] || {};

    doc.setFontSize(18);
    doc.text('Receipt', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Student Name: ${student.name || '-'}`, 20, 40);
    doc.text(`Grade: ${student.grade || '-'}`, 20, 50);
    doc.text(`Date: ${deposit.date}`, 20, 60);
    doc.text(`Amount: ${deposit.amount} THB`, 20, 70);
    doc.text(`Note: ${deposit.note}`, 20, 80);
    doc.text('Thank you', 105, 100, null, null, 'center');
    doc.save(`receipt_${selectedStudentKey}_${deposit.date}.pdf`);
  };

  // แบ่งและเรียงลำดับชั้นเรียน ป.1 -> ป.6
  const studentsByGrade = Object.entries(students).reduce((acc, [key, s]) => {
    if (!acc[s.grade]) acc[s.grade] = [];
    acc[s.grade].push({ key, ...s });
    return acc;
  }, {});
  const sortedGrades = Object.keys(studentsByGrade).sort((a, b) => a.localeCompare(b));

  return (
    <div
      className={`p-2 md:p-4 max-w-6xl mx-auto transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header สไตล์ Apple */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d1d1f] tracking-tight drop-shadow-sm mb-2">
          ระบบฝากเงิน
        </h1>
        <p className="text-slate-500 font-medium">จัดการยอดฝากเงินและดูประวัติการทำรายการของนักเรียน</p>
      </div>

      {sortedGrades.length === 0 && (
        <div className="text-center py-20 bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm">
           <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
           <p className="text-xl font-bold text-slate-500">ยังไม่มีข้อมูลนักเรียนในระบบ</p>
        </div>
      )}

      {sortedGrades.map((grade) => {
        const stuList = studentsByGrade[grade];
        return (
          <div key={grade} className="mb-10">
            {/* หัวข้อชั้นเรียน */}
            <div className="flex items-center gap-3 mb-4 pl-2">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">ชั้น {grade}</h2>
            </div>

            {/* ตารางสไตล์ Glassmorphism */}
            <div className="overflow-x-auto rounded-[2rem] bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-2">
              <table className="w-full min-w-[700px] table-auto border-collapse text-left">
                <thead>
                  <tr className="bg-white/40 backdrop-blur-md border-b border-white/60">
                    <th className="px-5 py-4 font-extrabold text-[#1d1d1f] tracking-tight rounded-tl-3xl w-1/3">ชื่อนักเรียน</th>
                    <th className="px-5 py-4 font-extrabold text-[#1d1d1f] tracking-tight text-center">ยอดสะสม (บาท)</th>
                    <th className="px-5 py-4 font-extrabold text-[#1d1d1f] tracking-tight text-right rounded-tr-3xl">จัดการทำรายการ</th>
                  </tr>
                </thead>
                <tbody>
                  {stuList.map(({ key, name }) => {
                    const total = studentTotals[key] || 0;
                    return (
                      <tr key={key} className="hover:bg-white/40 transition-colors border-b border-white/40 last:border-0 group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                             <UserCircle2 className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                             <span className="font-bold text-slate-800 text-lg">{name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-xl font-extrabold tracking-tight ${total > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {total.toLocaleString()} 
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudentKey(key);
                                setModalType('deposit');
                                setAmount('');
                                setNote('');
                              }}
                              className="flex items-center gap-2 bg-white/60 hover:bg-emerald-50 text-emerald-600 border border-emerald-100 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-sm"
                            >
                              <PlusCircle size={16} /> ฝากเงิน
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentKey(key);
                                setModalType('history');
                              }}
                              className="flex items-center gap-2 bg-white/60 hover:bg-blue-50 text-blue-600 border border-blue-100 hover:border-blue-300 px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-sm"
                            >
                              <History size={16} /> ประวัติ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* ================= MODAL: ฝากเงิน ================= */}
      <Modal
        isOpen={modalType === 'deposit' && selectedStudentKey}
        onClose={() => setModalType(null)}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-emerald-200">
            <Wallet size={32} />
          </div>
          <h3 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">ทำรายการฝากเงิน</h3>
          <p className="text-slate-500 mt-1 font-medium">
            {students[selectedStudentKey]?.name} (ชั้น {students[selectedStudentKey]?.grade})
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5 pl-1">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/60 border border-slate-200 p-4 rounded-2xl text-slate-800 text-lg font-bold placeholder:text-slate-300 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5 pl-1">หมายเหตุ (ถ้ามี)</label>
            <input
              type="text"
              placeholder="เช่น ค่าขนม, ฝากประจำ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white/60 border border-slate-200 p-3.5 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setModalType(null)}
            className="flex-1 bg-slate-100 text-slate-600 font-bold px-4 py-3.5 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDeposit}
            className="flex-1 bg-emerald-500 text-white font-bold px-4 py-3.5 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
          >
            ยืนยันการฝากเงิน
          </button>
        </div>
      </Modal>

      {/* ================= MODAL: ประวัติการฝาก ================= */}
      <Modal
        isOpen={modalType === 'history' && selectedStudentKey}
        onClose={() => setModalType(null)}
      >
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">ประวัติการทำรายการ</h3>
          <p className="text-slate-500 mt-1 font-medium">
            {students[selectedStudentKey]?.name}
          </p>
        </div>

        {historyList.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium">ยังไม่มีประวัติการทำรายการ</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-bold text-slate-700 text-sm">วันที่</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-sm text-right">จำนวน (บาท)</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-sm text-center">พิมพ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{dep.date}</div>
                      <div className="text-xs text-slate-500 mt-0.5 max-w-[120px] truncate" title={dep.note}>{dep.note}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        +{dep.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePrintReceipt(dep)}
                        className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
                        title="พิมพ์ใบเสร็จ"
                      >
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}