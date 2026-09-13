import React, { useState, useEffect } from 'react';
import { X, CreditCard, Save } from 'lucide-react';
import { PaymentMethod, PaymentRecord, Student } from '../types';

interface PaymentFormModalProps {
  isOpen: boolean;
  students: Student[];
  preselectedStudentId?: string;
  onClose: () => void;
  onSave: (paymentData: Omit<PaymentRecord, 'id' | 'studentName'> & { studentName: string }) => void;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  students,
  preselectedStudentId,
  onClose,
  onSave,
}) => {
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدي');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      if (preselectedStudentId) {
        setStudentId(preselectedStudentId);
        const st = students.find((s) => s.id === preselectedStudentId);
        if (st && st.remainingAmount > 0) {
          setAmount(st.remainingAmount);
        } else {
          setAmount(100);
        }
      } else if (students.length > 0) {
        const first = students[0];
        setStudentId(first.id);
        setAmount(first.remainingAmount > 0 ? first.remainingAmount : 100);
      }
      setPaymentMethod('نقدي');
      setNotes('');
      setErrorMessage('');
    }
  }, [isOpen, preselectedStudentId, students]);

  if (!isOpen) return null;

  const currentSelectedStudent = students.find((s) => s.id === studentId);

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setStudentId(sId);
    const st = students.find((s) => s.id === sId);
    if (st && st.remainingAmount > 0) {
      setAmount(st.remainingAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setErrorMessage('يرجى اختيار الطالب');
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMessage('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!date) {
      setErrorMessage('يرجى تحديد تاريخ السداد');
      return;
    }

    const st = students.find((s) => s.id === studentId);
    const studentName = st ? st.name : 'غير محدد';

    onSave({
      studentId,
      studentName,
      amount: Number(amount),
      date,
      paymentMethod,
      notes: notes.trim(),
    });
  };

  return (
    <div
      id="payment-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="payment-form-modal-box"
        className="w-full max-w-lg bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142642] bg-[#0a1832]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">تسجيل دفعة جديدة</h3>
          </div>
          <button
            id="payment-form-close-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="payment-form-error"
              className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اختر الطالب <span className="text-rose-400">*</span>
            </label>
            <select
              id="payment-student-select"
              value={studentId}
              onChange={handleStudentSelect}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              required
            >
              <option value="">-- اختر الطالب --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#09152b] text-white">
                  {st.name} ({st.groupName} - متبقي {st.remainingAmount} ج.م)
                </option>
              ))}
            </select>
          </div>

          {/* Student current financial stats */}
          {currentSelectedStudent && (
            <div className="p-3.5 bg-[#0a1832] border border-[#172e4f] rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-sky-400 mb-1">
                حالة حساب: {currentSelectedStudent.name}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459]">
                  <span className="text-slate-400 block text-[11px]">إجمالي الاشتراك</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {currentSelectedStudent.subscriptionFee} ج.م
                  </span>
                </div>
                <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459]">
                  <span className="text-slate-400 block text-[11px]">إجمالي المدفوع</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    {currentSelectedStudent.paidAmount} ج.م
                  </span>
                </div>
                <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459]">
                  <span className="text-slate-400 block text-[11px]">المتبقي حالياً</span>
                  <span
                    className={`font-bold mt-0.5 block ${
                      currentSelectedStudent.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {currentSelectedStudent.remainingAmount} ج.م
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المبلغ المسدد (ج.م) <span className="text-rose-400">*</span>
              </label>
              <input
                id="payment-amount-input"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تاريخ الدفع <span className="text-rose-400">*</span>
              </label>
              <input
                id="payment-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              طريقة الدفع <span className="text-rose-400">*</span>
            </label>
            <select
              id="payment-method-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
            >
              <option value="نقدي" className="bg-[#09152b] text-white">نقدي (كاش في السنتر)</option>
              <option value="فودافون كاش" className="bg-[#09152b] text-white">فودافون كاش (Vodafone Cash)</option>
              <option value="إنستاباي" className="bg-[#09152b] text-white">إنستاباي (InstaPay)</option>
              <option value="تحويل بنكي" className="bg-[#09152b] text-white">تحويل بنكي</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ملاحظات (رقم العملية / الشهر / إيصال)
            </label>
            <textarea
              id="payment-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: سداد قسط شهر أكتوبر، أو رقم عملية التحويل..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#142642]">
            <button
              id="payment-form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-[#09152b] hover:bg-[#122442] border border-[#1b3459] rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="payment-form-save-btn"
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] rounded-xl transition-all flex items-center gap-2 shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الدفعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
