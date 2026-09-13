import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Group, Student } from '../types';

interface StudentFormModalProps {
  isOpen: boolean;
  studentToEdit: Student | null;
  groups: Group[];
  onClose: () => void;
  onSave: (studentData: Omit<Student, 'id' | 'remainingAmount' | 'joinedDate'> & { id?: string }) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  studentToEdit,
  groups,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('');
  const [course, setCourse] = useState('');
  const [subscriptionFee, setSubscriptionFee] = useState<number>(200);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [status, setStatus] = useState<'نشط' | 'متوقف' | 'مؤجل'>('نشط');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setPhone(studentToEdit.phone);
      setGroupId(studentToEdit.groupId);
      setCourse(studentToEdit.course);
      setSubscriptionFee(studentToEdit.subscriptionFee);
      setPaidAmount(studentToEdit.paidAmount);
      setStatus(studentToEdit.status);
      setNotes(studentToEdit.notes || '');
      setErrorMessage('');
    } else {
      setName('');
      setPhone('');
      const defaultGroup = groups.length > 0 ? groups[0] : null;
      if (defaultGroup) {
        setGroupId(defaultGroup.id);
        setCourse(defaultGroup.course);
        setSubscriptionFee(defaultGroup.fee);
      } else {
        setGroupId('');
        setCourse('');
        setSubscriptionFee(200);
      }
      setPaidAmount(0);
      setStatus('نشط');
      setNotes('');
      setErrorMessage('');
    }
  }, [studentToEdit, isOpen, groups]);

  if (!isOpen) return null;

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setGroupId(selectedId);
    const foundGroup = groups.find((g) => g.id === selectedId);
    if (foundGroup) {
      setCourse(foundGroup.course);
      setSubscriptionFee(foundGroup.fee);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالب');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف');
      return;
    }

    if (!groupId) {
      setErrorMessage('يرجى اختيار مجموعة للدرس');
      return;
    }

    const selectedGroup = groups.find((g) => g.id === groupId);

    onSave({
      id: studentToEdit ? studentToEdit.id : undefined,
      code: studentToEdit ? studentToEdit.code : undefined,
      name: name.trim(),
      phone: phone.trim(),
      groupId,
      groupName: selectedGroup ? selectedGroup.name : '',
      course: course.trim() || (selectedGroup ? selectedGroup.course : 'عام'),
      subscriptionFee: Number(subscriptionFee) || 0,
      paidAmount: Number(paidAmount) || 0,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <div
      id="student-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="student-form-modal-box"
        className="w-full max-w-lg bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142642] bg-[#0a1832]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {studentToEdit ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}
            </h3>
          </div>
          <button
            id="student-form-close-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="student-form-error"
              className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم الطالب <span className="text-rose-400">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد محمد علي"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الهاتف <span className="text-rose-400">*</span>
              </label>
              <input
                id="student-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 text-left"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                حالة الطالب
              </label>
              <select
                id="student-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="نشط" className="bg-[#09152b] text-white">نشط</option>
                <option value="متوقف" className="bg-[#09152b] text-white">متوقف</option>
                <option value="مؤجل" className="bg-[#09152b] text-white">مؤجل</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المجموعة <span className="text-rose-400">*</span>
              </label>
              <select
                id="student-group-select"
                value={groupId}
                onChange={handleGroupChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                required
              >
                <option value="">-- اختر مجموعة --</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id} className="bg-[#09152b] text-white">
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المادة / الكورس
              </label>
              <input
                id="student-course-input"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="اسم الكورس"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                قيمة الاشتراك (ج.م)
              </label>
              <input
                id="student-fee-input"
                type="number"
                min="0"
                value={subscriptionFee}
                onChange={(e) => setSubscriptionFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المبلغ المدفوع (ج.م)
              </label>
              <input
                id="student-paid-input"
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Quick Balance Preview */}
          <div className="p-3 bg-[#0a1832] border border-[#172e4f] rounded-xl flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>المبلغ المتبقي:</span>
            <span className={subscriptionFee - paidAmount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {Math.max(0, subscriptionFee - paidAmount)} ج.م
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ملاحظات
            </label>
            <textarea
              id="student-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات تخص الطالب أو السداد..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#142642]">
            <button
              id="student-form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-[#09152b] hover:bg-[#122442] border border-[#1b3459] rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="student-form-save-btn"
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] rounded-xl transition-all flex items-center gap-2 shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
