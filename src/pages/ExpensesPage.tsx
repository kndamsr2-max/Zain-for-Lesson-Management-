import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  title: string;
  category: 'إيجار' | 'مطبوعات وكتب' | 'فواتير وكهرباء' | 'مستحقات معلمين' | 'نظافة وضيافة' | 'أخرى';
  amount: number;
  date: string;
  notes?: string;
}

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: 'exp-1',
      title: 'إيجار مقر السنتر الرئيسي',
      category: 'إيجار',
      amount: 8500,
      date: new Date().toISOString().split('T')[0],
      notes: 'تم الدفع نقداً لمالك العقار مع إيصال',
    },
    {
      id: 'exp-2',
      title: 'طباعة مذكرات دراسية (300 نسخة)',
      category: 'مطبوعات وكتب',
      amount: 3200,
      date: new Date().toISOString().split('T')[0],
      notes: 'مطبعة الأهرام للطباعة الرقمية',
    },
    {
      id: 'exp-3',
      title: 'فاتورة الكهرباء وشحن العدادات',
      category: 'فواتير وكهرباء',
      amount: 1450,
      date: new Date().toISOString().split('T')[0],
      notes: 'عداد قاعات المحاضرات 1 و 2',
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseItem['category']>('مطبوعات وكتب');
  const [newNotes, setNewNotes] = useState('');

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses =
    filterCategory === 'all'
      ? expenses
      : expenses.filter((e) => e.category === filterCategory);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const newItem: ExpenseItem = {
      id: 'exp-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      amount: Number(newAmount),
      date: new Date().toISOString().split('T')[0],
      notes: newNotes.trim() || undefined,
    };

    setExpenses([newItem, ...expenses]);
    setNewTitle('');
    setNewAmount('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Receipt className="w-5 h-5" />
            </div>
            <span>إدارة المصروفات التشغيلية</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تسجيل ومتابعة كافة تكاليف السنتر (إيجار، مطبوعات، فواتير، ومستحقات معلمين)
          </p>
        </div>

        <button
          id="btn-add-expense"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#1e65e5] hover:bg-[#1a57c5] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل مصروف جديد</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500">إجمالي المصروفات</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {totalExpenses.toLocaleString()} <span className="text-xs text-slate-500 font-sans">ج.م</span>
          </h3>
          <span className="text-xs text-rose-600 font-bold block mt-1">سجل التكاليف المعتمد</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500">عدد بنود الصرف</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {expenses.length} <span className="text-xs text-slate-500 font-sans">بند</span>
          </h3>
          <span className="text-xs text-blue-600 font-bold block mt-1">خلال الشهر الحالي</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500">متوسط الصرف للبند</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString() : 0}{' '}
            <span className="text-xs text-slate-500 font-sans">ج.م</span>
          </h3>
          <span className="text-xs text-emerald-600 font-bold block mt-1">معدل الانضباط المالي</span>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">تصفية حسب التصنيف:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1e65e5]"
            >
              <option value="all">جميع التصنيفات</option>
              <option value="إيجار">إيجار</option>
              <option value="مطبوعات وكتب">مطبوعات وكتب</option>
              <option value="فواتير وكهرباء">فواتير وكهرباء</option>
              <option value="مستحقات معلمين">مستحقات معلمين</option>
              <option value="نظافة وضيافة">نظافة وضيافة</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            عرض {filteredExpenses.length} من أصل {expenses.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold pb-2">
                <th className="py-2.5 px-3">البند / البيان</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">المبلغ</th>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">ملاحظات</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredExpenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{item.title}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-600">
                    {item.amount.toLocaleString()} ج.م
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{item.date}</td>
                  <td className="py-3 px-3 text-slate-500">{item.notes || '—'}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف المصروف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4 text-right">
              تسجيل مصروف جديد
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  بيان المصروف *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: صيانة التكييف بالقاعة الكبرى"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1e65e5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                    المبلغ (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#1e65e5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                    التصنيف *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1e65e5]"
                  >
                    <option value="إيجار">إيجار</option>
                    <option value="مطبوعات وكتب">مطبوعات وكتب</option>
                    <option value="فواتير وكهرباء">فواتير وكهرباء</option>
                    <option value="مستحقات معلمين">مستحقات معلمين</option>
                    <option value="نظافة وضيافة">نظافة وضيافة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  ملاحظات أو رقم الإيصال
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="أي تفاصيل إضافية..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#1e65e5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e65e5] hover:bg-[#1a57c5] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
