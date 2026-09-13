import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  BookOpen,
  Wallet,
  CheckCircle,
  Clock,
  CreditCard,
  PlusCircle,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AttendanceRecord, PaymentRecord, Student } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  payments?: PaymentRecord[];
  attendanceRecords?: AttendanceRecord[];
  onClose: () => void;
  onOpenAttendanceHistory: (student: Student) => void;
  onOpenPaymentModal?: (student: Student) => void;
  onEditPayment?: (payment: PaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  payments = [],
  attendanceRecords = [],
  onClose,
  onOpenAttendanceHistory,
  onOpenPaymentModal,
  onEditPayment,
  onDeletePayment,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'payments' | 'attendance'>('financial');

  if (!student) return null;

  // Dynamic calculations directly from payments
  const studentPayments = payments.filter((p) => p.studentId === student.id);
  const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalFee = Number(student.subscriptionFee || 0);
  const remaining = Math.max(0, totalFee - totalPaid);

  // Dynamic calculations from attendance
  const studentAttendance = attendanceRecords.filter((r) => r.studentId === student.id);
  const presentCount = studentAttendance.filter((r) => r.status === 'حاضر').length;
  const absentCount = studentAttendance.filter((r) => r.status === 'غائب').length;
  const lateCount = studentAttendance.filter((r) => r.status === 'متأخر').length;

  return (
    <div
      id="student-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="student-detail-modal-box"
        className="w-full max-w-2xl bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142642] bg-[#0a1832] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{student.name}</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    student.status === 'نشط'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-sky-400 font-mono font-medium mt-0.5">
                {student.code || 'ST-' + student.id.slice(0, 6)}
              </p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#142642] bg-[#08152b] px-6 pt-2 shrink-0">
          <button
            id="tab-student-financial"
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'financial'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>الحساب المالي والمجموعة</span>
          </button>
          <button
            id="tab-student-payments"
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>سجل المدفوعات ({studentPayments.length})</span>
          </button>
          <button
            id="tab-student-attendance"
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'attendance'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل الحضور ({studentAttendance.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {/* TAB 1: Financial & Group Info */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              {/* Group & Course */}
              <div className="p-4 bg-[#09152b] border border-[#1b3459] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    المجموعة والكورس
                  </span>
                  <p className="font-bold text-white text-sm">{student.groupName || 'غير محدد'}</p>
                  <p className="text-xs text-sky-400 mt-0.5">{student.course || '—'}</p>
                </div>

                <div className="text-left">
                  <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5 justify-end">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    رقم الهاتف
                  </span>
                  <span className="font-bold text-white dir-ltr inline-block font-mono" dir="ltr">
                    {student.phone}
                  </span>
                </div>
              </div>

              {/* Real Financial Status Box */}
              <div className="p-4 border border-[#172e4f] rounded-xl bg-[#0a1832] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-sky-400" />
                    الوضع المالي المحسوب من الدفعات الفعلية
                  </h4>
                  {onOpenPaymentModal && (
                    <button
                      id="btn-add-payment-for-student"
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPaymentModal(student);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>تسجيل دفعة للطالب</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#09152b] rounded-xl border border-[#1b3459]">
                    <span className="text-slate-400 block text-[11px]">إجمالي السعر / الاشتراك</span>
                    <span className="font-bold text-white mt-1 block text-base font-mono">
                      {totalFee} <span className="text-xs font-normal text-slate-400">ج.م</span>
                    </span>
                  </div>
                  <div className="p-3 bg-[#09152b] rounded-xl border border-[#12383c]">
                    <span className="text-emerald-300 block text-[11px]">إجمالي المدفوع</span>
                    <span className="font-bold text-emerald-400 mt-1 block text-base font-mono">
                      {totalPaid} <span className="text-xs font-normal text-emerald-600">ج.م</span>
                    </span>
                  </div>
                  <div className="p-3 bg-[#09152b] rounded-xl border border-[#3d182b]">
                    <span className="text-rose-300 block text-[11px]">المتبقي للتحصيل</span>
                    <span
                      className={`font-bold mt-1 block text-base font-mono ${
                        remaining > 0 ? 'text-rose-400' : 'text-slate-500'
                      }`}
                    >
                      {remaining} <span className="text-xs font-normal text-slate-400">ج.م</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance quick summary */}
              <div className="p-4 bg-[#09152b] border border-[#1b3459] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">ملخص الحضور:</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-400 font-bold">حاضر: {presentCount}</span>
                    <span className="text-rose-400 font-bold">غائب: {absentCount}</span>
                    <span className="text-amber-400 font-bold">متأخر: {lateCount}</span>
                  </div>
                </div>
                <button
                  id="btn-goto-attendance-tab"
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  عرض سجل الحضور الكامل
                </button>
              </div>

              {/* Notes */}
              {student.notes && (
                <div className="p-3 bg-[#09152b] border border-[#1b3459] rounded-xl text-xs">
                  <span className="font-bold text-sky-400 block mb-1">ملاحظات الطالب:</span>
                  <p className="text-slate-300 leading-relaxed">{student.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Payments History */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  سجل مدفوعات الطالب ({studentPayments.length} عمليات)
                </span>
                {onOpenPaymentModal && (
                  <button
                    id="btn-add-payment-tab"
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPaymentModal(student);
                    }}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>دفعة جديدة</span>
                  </button>
                )}
              </div>

              {studentPayments.length === 0 ? (
                <div className="p-8 text-center bg-[#09152b] rounded-xl border border-[#1b3459] text-slate-400">
                  لا توجد أي دفعات مسجلة لهذا الطالب حتى الآن.
                </div>
              ) : (
                <div className="border border-[#173054] rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">رقم الإيصال</th>
                        <th className="px-3 py-2.5">المبلغ</th>
                        <th className="px-3 py-2.5">التاريخ</th>
                        <th className="px-3 py-2.5">طريقة الدفع</th>
                        <th className="px-3 py-2.5">البيان / ملاحظات</th>
                        {(onEditPayment || onDeletePayment) && (
                          <th className="px-3 py-2.5 text-center">إجراءات</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#102038]">
                      {studentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-3 py-2.5 font-mono text-sky-400 font-bold">
                            {p.receiptNumber || 'REC-' + p.id.slice(0, 5)}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-emerald-400 font-mono">
                            {p.amount} ج.م
                          </td>
                          <td className="px-3 py-2.5 text-slate-300 font-mono">{p.date}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-400">{p.notes || '—'}</td>
                          {(onEditPayment || onDeletePayment) && (
                            <td className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {onEditPayment && (
                                  <button
                                    id={`btn-edit-student-pay-${p.id}`}
                                    onClick={() => {
                                      onClose();
                                      onEditPayment(p);
                                    }}
                                    className="p-1 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors cursor-pointer"
                                    title="تعديل الدفعة"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onDeletePayment && (
                                  <button
                                    id={`btn-del-student-pay-${p.id}`}
                                    onClick={() => onDeletePayment(p.id)}
                                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                    title="حذف الدفعة"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Attendance History */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  سجل حضور الطالب ({studentAttendance.length} حصة)
                </span>
                <button
                  id="btn-full-attendance-history"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAttendanceHistory(student);
                  }}
                  className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
                >
                  فتح بطاقة الحضور الموسعة
                </button>
              </div>

              {studentAttendance.length === 0 ? (
                <div className="p-8 text-center bg-[#09152b] rounded-xl border border-[#1b3459] text-slate-400">
                  لا توجد أي سجلات حضور مسجلة لهذا الطالب حتى الآن.
                </div>
              ) : (
                <div className="border border-[#173054] rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                      <tr>
                        <th className="px-3 py-2.5">#</th>
                        <th className="px-3 py-2.5">التاريخ</th>
                        <th className="px-3 py-2.5">الحالة</th>
                        <th className="px-3 py-2.5">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#102038]">
                      {studentAttendance.map((rec, idx) => (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-3 py-2.5 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-bold text-white font-mono">{rec.date}</td>
                          <td className="px-3 py-2.5">
                            {rec.status === 'حاضر' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                حاضر
                              </span>
                            ) : rec.status === 'متأخر' ? (
                              <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full font-bold border border-amber-500/30 text-[10px]">
                                <Clock className="w-3 h-3" />
                                متأخر
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full font-bold border border-rose-500/30 text-[10px]">
                                <XCircle className="w-3 h-3" />
                                غائب
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-slate-300">{rec.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#142642] bg-[#0a1832] shrink-0">
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
            <span>عرض سجل حضور الطالب</span>
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
  );
};
