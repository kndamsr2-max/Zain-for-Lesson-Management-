import React, { useState, useEffect } from 'react';
import { X, Layers, Save } from 'lucide-react';
import { Group } from '../types';

interface GroupFormModalProps {
  isOpen: boolean;
  groupToEdit: Group | null;
  onClose: () => void;
  onSave: (groupData: Omit<Group, 'id' | 'studentCount'> & { id?: string }) => void;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  groupToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [days, setDays] = useState('');
  const [time, setTime] = useState('');
  const [fee, setFee] = useState<number>(200);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setCourse(groupToEdit.course);
      setDays(groupToEdit.days);
      setTime(groupToEdit.time);
      setFee(groupToEdit.fee);
      setNotes(groupToEdit.notes || '');
      setErrorMessage('');
    } else {
      setName('');
      setCourse('');
      setDays('');
      setTime('');
      setFee(200);
      setNotes('');
      setErrorMessage('');
    }
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('يرجى كتابة اسم المجموعة');
      return;
    }
    if (!course.trim()) {
      setErrorMessage('يرجى كتابة المادة / الكورس');
      return;
    }
    if (!days.trim()) {
      setErrorMessage('يرجى تحديد أيام الحصة');
      return;
    }
    if (!time.trim()) {
      setErrorMessage('يرجى تحديد وقت الحصة');
      return;
    }

    onSave({
      id: groupToEdit ? groupToEdit.id : undefined,
      name: name.trim(),
      course: course.trim(),
      days: days.trim(),
      time: time.trim(),
      fee: Number(fee) || 0,
      notes: notes.trim(),
    });
  };

  return (
    <div
      id="group-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div
        id="group-form-modal-box"
        className="w-full max-w-lg bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl overflow-hidden text-right text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#142642] bg-[#0a1832]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {groupToEdit ? 'تعديل بيانات المجموعة' : 'إضافة مجموعة جديدة'}
            </h3>
          </div>
          <button
            id="group-form-close-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="group-form-error"
              className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم المجموعة <span className="text-rose-400">*</span>
            </label>
            <input
              id="group-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مجموعة الأوائل - تالتة ثانوي"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              الكورس / المادة <span className="text-rose-400">*</span>
            </label>
            <input
              id="group-course-input"
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="مثال: لغة عربية - ثانوية عامة"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الأيام <span className="text-rose-400">*</span>
              </label>
              <input
                id="group-days-input"
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="مثال: السبت والثلاثاء"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                وقت الحصة <span className="text-rose-400">*</span>
              </label>
              <input
                id="group-time-input"
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="مثال: 04:00 م - 06:00 م"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              سعر الاشتراك الشهري (ج.م)
            </label>
            <input
              id="group-fee-input"
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ملاحظات (القاعة / المقاعد / تنبيهات)
            </label>
            <textarea
              id="group-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: قاعة 1 بالدور الأول، أقصى سعة 20 طالب"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#142642]">
            <button
              id="group-form-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-[#09152b] hover:bg-[#122442] border border-[#1b3459] rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="group-form-save-btn"
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] rounded-xl transition-all flex items-center gap-2 shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{groupToEdit ? 'حفظ التعديلات' : 'إضافة المجموعة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
