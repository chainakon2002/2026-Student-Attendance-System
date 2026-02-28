import React, { useEffect, useState } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { Dialog } from '@headlessui/react';
import { Edit3, Trash2, Plus, UserPlus } from "lucide-react";

export default function StudentManager() {
  const [students, setStudents] = useState({});
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [editKey, setEditKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  const openModal = (student = null, key = null) => {
    if (student) {
      setStudentId(student.studentId);
      setName(student.name);
      setGrade(student.grade);
      setEditKey(key);
    } else {
      setStudentId('');
      setName('');
      setGrade('');
      setEditKey(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStudentId('');
    setName('');
    setGrade('');
    setEditKey(null);
  };

  const handleAddOrUpdate = () => {
    if (!studentId.trim() || !name.trim() || !grade.trim()) return alert('กรุณากรอกข้อมูลให้ครบ');

    const studentData = {
      studentId: studentId.trim(),
      name: name.trim(),
      grade: grade.trim(),
    };

    if (editKey) {
      update(ref(db, `students/${editKey}`), studentData);
    } else {
      push(ref(db, 'students'), studentData);
    }

    closeModal();
  };

  const handleDelete = (key) => {
    if (window.confirm('ต้องการลบชื่อนักเรียนนี้ใช่หรือไม่?')) {
      remove(ref(db, `students/${key}`));
    }
  };

  // จัดกลุ่มนักเรียนและเรียงลำดับชั้น (ป.1 -> ป.6)
  const groupedStudents = Object.entries(
    Object.groupBy(Object.entries(students), ([_, s]) => s.grade || 'ไม่ระบุ')
  ).sort(([gradeA], [gradeB]) => gradeA.localeCompare(gradeB));

  return (
    <div
      className={`p-2 md:p-4 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1d1d1f] tracking-tight drop-shadow-sm">
            จัดการนักเรียน
          </h1>
          <p className="text-slate-500 font-medium mt-1">เพิ่ม ลบ หรือแก้ไขข้อมูลนักเรียนในระบบ</p>
        </div>
        
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} strokeWidth={2.5} />
          เพิ่มนักเรียนใหม่
        </button>
      </div>

      {/* Student List (แบ่งกลุ่มตามชั้น) */}
      <div className="space-y-8">
        {groupedStudents.length > 0 ? (
          groupedStudents.map(([grade, studentList]) => (
            <div 
              key={grade} 
              className="bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-[2rem] p-6 transition-all duration-300 hover:bg-white/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-3 mb-5 pl-2">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">ชั้น {grade}</h2>
                <span className="text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {studentList.length} คน
                </span>
              </div>

              <div className="space-y-3">
                {studentList.map(([key, student]) => (
                  <div 
                    key={key} 
                    className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/50 hover:bg-white/80 border border-white/80 p-4 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* ไอคอน Avatar จำลอง */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#1d1d1f] text-lg tracking-tight">
                          {student.name}
                        </div>
                        <div className="text-slate-500 text-sm font-medium mt-0.5">
                          รหัสประจำตัว: <span className="text-slate-700">{student.studentId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => openModal(student, key)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 px-4 bg-white/60 hover:bg-yellow-50 text-yellow-600 border border-yellow-100 hover:border-yellow-300 rounded-xl transition-colors font-semibold text-sm shadow-sm"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="sm:hidden">แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(key)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 p-2.5 px-4 bg-white/60 hover:bg-red-50 text-red-500 border border-red-100 hover:border-red-300 rounded-xl transition-colors font-semibold text-sm shadow-sm"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sm:hidden">ลบ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // กรณีไม่มีนักเรียนเลย
          <div className="flex flex-col items-center justify-center py-20 bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm text-center">
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-4 border border-white shadow-inner">
              <UserPlus className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-700">ยังไม่มีข้อมูลนักเรียน</h3>
            <p className="text-slate-500 mt-2">คลิกที่ปุ่ม "เพิ่มนักเรียนใหม่" เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>

      {/* Modal สไตล์ Liquid Glass */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-[100]">
        {/* พื้นหลังเบลอ (Backdrop) */}
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] transform transition-all animate-fade-in">
            <Dialog.Title className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight mb-6 text-center">
              {editKey ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 pl-1">รหัสประจำตัว</label>
                <input
                  type="text"
                  placeholder="เช่น 65001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-white/60 border border-slate-200 p-3.5 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 pl-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  placeholder="เช่น ด.ช. ใจดี เรียนเก่ง"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/60 border border-slate-200 p-3.5 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5 pl-1">ระดับชั้น</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-white/60 border border-slate-200 p-3.5 rounded-2xl text-slate-800 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)] cursor-pointer appearance-none"
                >
                  <option value="" className="text-slate-400">-- เลือกระดับชั้น --</option>
                  <option value="ป.1">ป.1</option>
                  <option value="ป.2">ป.2</option>
                  <option value="ป.3">ป.3</option>
                  <option value="ป.4">ป.4</option>
                  <option value="ป.5">ป.5</option>
                  <option value="ป.6">ป.6</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold px-4 py-3.5 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleAddOrUpdate}
                  className="flex-1 bg-blue-600 text-white font-bold px-4 py-3.5 rounded-2xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  {editKey ? 'บันทึกการแก้ไข' : 'เพิ่มลงระบบ'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}