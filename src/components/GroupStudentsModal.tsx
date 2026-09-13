import React from 'react';
import { X, Users } from 'lucide-react';
import { Group, Student } from '../types';

interface GroupStudentsModalProps {
  isOpen: boolean;
  group: Group | null;
  students: Student[];
  onClose: () => void;
  onViewStudent: (student: Student) => void;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  group,
  students,
  onClose,
  onViewStudent,
}) => {
  if (!isOpen || !group) return null;

  const groupStudents = students.filter((s) => s.groupId === group.id);

  return (
    <div
      id="group-students-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="group-students-modal-box"
        className="w-full max-w-2xl bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right flex flex-col max-h-[85vh] text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142642] bg-[#0a1832] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                طلاب: {group.name}
              </h3>
              <p className="text-xs text-sky-400 font-medium">
                {group.course} • {groupStudents.length} طالب مسجل
              </p>
            </div>
          </div>
          <button
            id="group-students-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1">
          {groupStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              لا يوجد طلاب مسجلين في هذه المجموعة حالياً.
            </div>
          ) : (
            <div className="border border-[#173054] rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">اسم الطالب</th>
                    <th className="px-4 py-2.5">رقم الهاتف</th>
                    <th className="px-4 py-2.5">المسدد</th>
                    <th className="px-4 py-2.5">المتبقي</th>
                    <th className="px-4 py-2.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {groupStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-white">{s.name}</td>
                      <td className="px-4 py-2.5 text-slate-300 dir-ltr text-right font-mono" dir="ltr">{s.phone}</td>
                      <td className="px-4 py-2.5 text-emerald-400 font-bold">{s.paidAmount} ج.م</td>
                      <td className="px-4 py-2.5">
                        <span className={s.remainingAmount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                          {s.remainingAmount} ج.م
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          id={`group-student-view-${s.id}`}
                          onClick={() => {
                            onClose();
                            onViewStudent(s);
                          }}
                          className="px-2.5 py-1 text-xs text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 rounded-lg border border-sky-400/30 transition-colors font-bold cursor-pointer"
                        >
                          عرض الملف
                        </button>
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
            id="group-students-close-btn-bottom"
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
