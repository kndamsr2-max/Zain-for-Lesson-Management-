import React from 'react';
import { X, CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AttendanceRecord, Student } from '../types';

interface StudentAttendanceHistoryModalProps {
  isOpen: boolean;
  student: Student | null;
  attendanceRecords: AttendanceRecord[];
  onClose: () => void;
}

export const StudentAttendanceHistoryModal: React.FC<StudentAttendanceHistoryModalProps> = ({
  isOpen,
  student,
  attendanceRecords,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  const records = attendanceRecords.filter((r) => r.studentId === student.id);
  const presentCount = records.filter((r) => r.status === 'حاضر').length;
  const absentCount = records.filter((r) => r.status === 'غائب').length;
  const lateCount = records.filter((r) => r.status === 'متأخر').length;
  const total = records.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div
      id="attendance-history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="attendance-history-modal-box"
        className="w-full max-w-lg bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right flex flex-col max-h-[85vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142642] bg-[#0a1832] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                سجل حضور: {student.name}
              </h3>
              <p className="text-xs text-sky-400 font-medium">
                {student.groupName} ({student.course})
              </p>
            </div>
          </div>
          <button
            id="attendance-history-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary */}
        <div className="p-4 bg-[#09152b] border-b border-[#142642] shrink-0">
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-[#08152b] rounded-xl border border-[#1b3459]">
              <span className="text-slate-400 block text-[11px]">الحصص</span>
              <span className="font-bold text-white mt-1 block font-mono">{total}</span>
            </div>
            <div className="p-2 bg-[#08152b] rounded-xl border border-[#1b3459]">
              <span className="text-slate-400 block text-[11px]">حاضر</span>
              <span className="font-bold text-emerald-400 mt-1 block font-mono">{presentCount}</span>
            </div>
            <div className="p-2 bg-[#08152b] rounded-xl border border-[#1b3459]">
              <span className="text-slate-400 block text-[11px]">غائب</span>
              <span className="font-bold text-rose-400 mt-1 block font-mono">{absentCount}</span>
            </div>
            <div className="p-2 bg-[#08152b] rounded-xl border border-[#1b3459]">
              <span className="text-slate-400 block text-[11px]">متأخر</span>
              <span className="font-bold text-amber-400 mt-1 block font-mono">{lateCount}</span>
            </div>
            <div className="p-2 bg-[#08152b] rounded-xl border border-[#1b3459]">
              <span className="text-slate-400 block text-[11px]">الالتزام</span>
              <span className="font-bold text-sky-400 mt-1 block font-mono">{attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Attendance log table */}
        <div className="p-6 overflow-y-auto flex-1">
          {records.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لا توجد سجلات حضور مسجلة لهذا الطالب حتى الآن.
            </div>
          ) : (
            <div className="border border-[#173054] rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">التاريخ</th>
                    <th className="px-4 py-2.5">الحالة</th>
                    <th className="px-4 py-2.5">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {records.map((rec, index) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500 font-mono">{index + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-white font-mono">{rec.date}</td>
                      <td className="px-4 py-2.5">
                        {rec.status === 'حاضر' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            حاضر
                          </span>
                        ) : rec.status === 'متأخر' ? (
                          <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            متأخر
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            غائب
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-300">
                        {rec.notes ? rec.notes : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#142642] bg-[#0a1832] flex justify-end shrink-0">
          <button
            id="attendance-history-modal-close-bottom"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-[#09152b] hover:bg-[#122442] border border-[#1b3459] rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
