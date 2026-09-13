import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Wallet,
  TrendingUp,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';
import { PaymentRecord, Student } from '../types';

interface PaymentsPageProps {
  payments: PaymentRecord[];
  students: Student[];
  onOpenRecordPayment: () => void;
  onEditPayment?: (payment: PaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  payments,
  students,
  onOpenRecordPayment,
  onEditPayment,
  onDeletePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Overall calculations dynamically derived from students and payments
  const totalSubscriptions = students.reduce(
    (acc, curr) => acc + (Number(curr.subscriptionFee) || 0),
    0
  );
  const totalPaid = payments.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );
  const totalRemaining = Math.max(0, totalSubscriptions - totalPaid);

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      p.studentName.toLowerCase().includes(term) ||
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(term)) ||
      (p.notes && p.notes.toLowerCase().includes(term));

    const matchesMethod = !methodFilter || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleDelete = (paymentId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الدفعة المالية؟ سيتم تحديث حساب الطالب والمتبقي تلقائياً.')) {
      if (onDeletePayment) {
        onDeletePayment(paymentId);
      }
    }
  };

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section with Add Button */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-sky-400" />
            <span>إدارة الحسابات والمدفوعات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل مدفوعات الطلاب ومتابعة الأقساط والمبالغ المتبقية للسنتر
          </p>
        </div>

        <button
          id="btn-record-payment"
          onClick={onOpenRecordPayment}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تسجيل دفعة جديدة</span>
        </button>
      </div>

      {/* 3 Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Subscriptions Required */}
        <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الاشتراكات المطلوبة</span>
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono">
            {totalSubscriptions}{' '}
            <span className="text-xs font-normal text-slate-400">ج.م</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-[#081e24] rounded-2xl border border-[#12383c] p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">إجمالي المبالغ المحصلة</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono">
            {totalPaid}{' '}
            <span className="text-xs font-normal text-slate-400">ج.م</span>
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-[#200f1c] rounded-2xl border border-[#3d182b] p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">المبالغ المتبقية للتحصيل</span>
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-400 font-mono">
            {totalRemaining}{' '}
            <span className="text-xs font-normal text-slate-400">ج.م</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-4 shadow-xl flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            id="payments-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الطالب، رقم الإيصال، أو البيان..."
            className="w-full pr-9 pl-3.5 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="w-full md:w-56">
          <select
            id="payments-filter-method"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
          >
            <option value="">جميع طرق الدفع</option>
            <option value="نقدي" className="bg-[#09152b] text-white">نقدي (كاش)</option>
            <option value="فودافون كاش" className="bg-[#09152b] text-white">فودافون كاش</option>
            <option value="إنستاباي" className="bg-[#09152b] text-white">إنستاباي (InstaPay)</option>
            <option value="تحويل بنكي" className="bg-[#09152b] text-white">تحويل بنكي</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#142642] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            سجل المقبوضات التاريخية ({filteredPayments.length} عملية مسجلة)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="payments-data-table" className="w-full text-right text-xs">
            <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">رقم الإيصال</th>
                <th className="px-4 py-3">اسم الطالب</th>
                <th className="px-4 py-3">المبلغ المدفوع</th>
                <th className="px-4 py-3">تاريخ الدفع</th>
                <th className="px-4 py-3">طريقة الدفع</th>
                <th className="px-4 py-3">ملاحظات وبيان</th>
                {(onEditPayment || onDeletePayment) && (
                  <th className="px-4 py-3 text-center">إجراءات</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102038] whitespace-nowrap">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    لا توجد مدفوعات مسجلة حتى الآن في السنتر.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} id={`payment-row-${p.id}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-sky-400 font-bold">
                      {p.receiptNumber || ('REC-' + p.id.slice(0, 6))}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {p.studentName}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 text-sm font-mono">
                      {p.amount} ج.م
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium font-mono">
                      {p.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {p.notes || '—'}
                    </td>
                    {(onEditPayment || onDeletePayment) && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {onEditPayment && (
                            <button
                              id={`btn-edit-payment-${p.id}`}
                              onClick={() => onEditPayment(p)}
                              className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                              title="تعديل الدفعة"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeletePayment && (
                            <button
                              id={`btn-delete-payment-${p.id}`}
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="حذف الدفعة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
