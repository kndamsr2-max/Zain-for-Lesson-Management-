import React from 'react';
import { X, User, Phone, BookOpen, Wallet, CheckCircle, Clock } from 'lucide-react';
import { Student } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onOpenAttendanceHistory: (student: Student) => void;
  onOpenPaymentModal?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onOpenAttendanceHistory,
}) => {
  if (!student) return null;

  return (
    <div
      id="student-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="student-detail-modal-box"
        className="w-full max-w-md bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#142642] bg-[#0a1832]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{student.name}</h3>
              <p className="text-xs text-sky-400 font-mono font-medium">{student.code || ('ST-' + student.id.replace('std-', '100'))}</p>
            </div>
          </div>
          <button
            id="student-detail-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#09152b] border border-[#1b3459] rounded-xl">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                رقم الهاتف
              </span>
              <span className="font-bold text-white dir-ltr inline-block" dir="ltr">
                {student.phone}
              </span>
            </div>

            <div className="p-3 bg-[#09152b] border border-[#1b3459] rounded-xl">
              <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                حالة القيد
              </span>
              <span
                className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  student.status === 'نشط'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {student.status}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#09152b] border border-[#1b3459] rounded-xl space-y-2">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                المجموعة والكورس
              </span>
              <p className="font-bold text-white">{student.groupName}</p>
              <p className="text-xs text-sky-400 mt-0.5">{student.course}</p>
            </div>
          </div>

          {/* Financial summary */}
          <div className="p-3.5 border border-[#172e4f] rounded-xl bg-[#0a1832]">
            <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-sky-400" />
              الوضع المالي للطالب
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459]">
                <span className="text-slate-400 block text-[11px]">الاشتراك</span>
                <span className="font-bold text-white mt-1 block">{student.subscriptionFee} ج.م</span>
              </div>
              <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459]">
                <span className="text-slate-400 block text-[11px]">المدفوع</span>
                <span className="font-bold text-emerald-400 mt-1 block">{student.paidAmount} ج.م</span>
              </div>
              <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459]">
                <span className="text-slate-400 block text-[11px]">المتبقي</span>
                <span className={`font-bold mt-1 block ${student.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {student.remainingAmount} ج.م
                </span>
              </div>
            </div>
          </div>

          {student.notes && (
            <div className="p-3 bg-[#09152b] border border-[#1b3459] rounded-xl text-xs">
              <span className="font-bold text-sky-400 block mb-1">ملاحظات:</span>
              <p className="text-slate-300 leading-relaxed">{student.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#142642]">
            <button
              id="student-detail-attendance-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenAttendanceHistory(student);
              }}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              عرض سجل حضور الطالب
            </button>
            <button
              id="student-detail-close-btn-bottom"
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-[#09152b] hover:bg-[#122442] border border-[#1b3459] rounded-xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
