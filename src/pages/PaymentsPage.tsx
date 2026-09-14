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
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Download,
} from 'lucide-react';
import { PaymentRecord, Student } from '../types';
import { exportToExcel, exportToWord, exportToPDF } from '../utils/exportUtils';

interface PaymentsPageProps {
  payments: PaymentRecord[];
  students: Student[];
  onOpenRecordPayment: (preselectedStudent?: Student) => void;
  onEditPayment?: (payment: PaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
  onViewStudent?: (student: Student) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  payments,
  students,
  onOpenRecordPayment,
  onEditPayment,
  onDeletePayment,
  onViewStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'history'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // 1. Dynamic calculation for student dues and payment status
  const studentPaymentSummaries = students.map((st) => {
    const stPayments = payments.filter((p) => p.studentId === st.id);
    const totalPaid = stPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const requiredAmount = Number(st.subscriptionFee) || 0;
    const remaining = Math.max(0, requiredAmount - totalPaid);

    let status: 'مدفوع' | 'غير مدفوع' | 'مدفوع جزئيًا';
    if (totalPaid >= requiredAmount && requiredAmount > 0) {
      status = 'مدفوع';
    } else if (totalPaid > 0 && remaining > 0) {
      status = 'مدفوع جزئيًا';
    } else {
      status = 'غير مدفوع';
    }

    return {
      student: st,
      requiredAmount,
      totalPaid,
      remaining,
      status,
      paymentCount: stPayments.length,
      lastPaymentDate: stPayments.length > 0 ? stPayments[0].date : '—',
    };
  });

  // Overall totals
  const totalRequired = studentPaymentSummaries.reduce((sum, item) => sum + item.requiredAmount, 0);
  const totalPaidOverall = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalRemainingOverall = Math.max(0, totalRequired - totalPaidOverall);

  // Filter students
  const filteredStudents = studentPaymentSummaries.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      item.student.name.toLowerCase().includes(term) ||
      (item.student.groupName && item.student.groupName.toLowerCase().includes(term)) ||
      item.student.phone.includes(term) ||
      (item.student.code && item.student.code.toLowerCase().includes(term));

    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter history
  const filteredHistory = payments.filter((p) => {
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
    if (
      window.confirm(
        'هل أنت متأكد من رغبتك في حذف هذه العملية؟ سيتم تحديث حساب الطالب والمتبقي تلقائياً.'
      )
    ) {
      if (onDeletePayment) {
        onDeletePayment(paymentId);
      }
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    if (activeTab === 'students') {
      exportToExcel({
        title: 'كشف حسابات واشتراكات الطلاب - سنتر زين',
        subtitle: 'المبالغ المطلوبة والمسددة والمتبقية لكل طالب',
        filename: 'كشف_اشتراكات_الطلاب',
        columns: [
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المجموعة', key: 'group' },
          { header: 'الهاتف', key: 'phone' },
          { header: 'المبلغ المطلوب', key: 'required' },
          { header: 'المبلغ المدفوع', key: 'paid' },
          { header: 'المتبقي', key: 'remaining' },
          { header: 'حالة الدفع', key: 'status' },
        ],
        rows: filteredStudents.map((i) => ({
          name: i.student.name,
          group: i.student.groupName || '—',
          phone: i.student.phone,
          required: `${i.requiredAmount} ج.م`,
          paid: `${i.totalPaid} ج.م`,
          remaining: `${i.remaining} ج.م`,
          status: i.status,
        })),
        summary: [
          { label: 'إجمالي الاشتراكات المطلوبة', value: `${totalRequired} ج.م` },
          { label: 'إجمالي المحصل', value: `${totalPaidOverall} ج.م` },
          { label: 'إجمالي المتبقي للتحصيل', value: `${totalRemainingOverall} ج.م` },
        ],
      });
    } else {
      exportToExcel({
        title: 'سجل المقبوضات والمدفوعات التاريخية - سنتر زين',
        subtitle: 'جميع العمليات المالية المحصلة',
        filename: 'سجل_المقبوضات_التاريخية',
        columns: [
          { header: 'رقم الإيصال', key: 'receipt' },
          { header: 'اسم الطالب', key: 'student' },
          { header: 'المبلغ المسدد', key: 'amount' },
          { header: 'تاريخ الدفع', key: 'date' },
          { header: 'طريقة الدفع', key: 'method' },
          { header: 'ملاحظات وبيان', key: 'notes' },
        ],
        rows: filteredHistory.map((p) => ({
          receipt: p.receiptNumber || 'REC-' + p.id.slice(0, 6),
          student: p.studentName,
          amount: `${p.amount} ج.م`,
          date: p.date,
          method: p.paymentMethod,
          notes: p.notes || '—',
        })),
        summary: [
          { label: 'عدد العمليات المسجلة', value: filteredHistory.length },
          { label: 'إجمالي المقبوضات', value: `${totalPaidOverall} ج.م` },
        ],
      });
    }
  };

  const handleExportWord = () => {
    if (activeTab === 'students') {
      exportToWord({
        title: 'كشف حسابات واشتراكات الطلاب - سنتر زين',
        subtitle: 'المبالغ المطلوبة والمسددة والمتبقية',
        filename: 'كشف_اشتراكات_الطلاب',
        columns: [
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المجموعة', key: 'group' },
          { header: 'الهاتف', key: 'phone' },
          { header: 'المبلغ المطلوب', key: 'required' },
          { header: 'المبلغ المدفوع', key: 'paid' },
          { header: 'المتبقي', key: 'remaining' },
          { header: 'حالة الدفع', key: 'status' },
        ],
        rows: filteredStudents.map((i) => ({
          name: i.student.name,
          group: i.student.groupName || '—',
          phone: i.student.phone,
          required: `${i.requiredAmount} ج.م`,
          paid: `${i.totalPaid} ج.م`,
          remaining: `${i.remaining} ج.م`,
          status: i.status,
        })),
        summary: [
          { label: 'إجمالي الاشتراكات المطلوبة', value: `${totalRequired} ج.م` },
          { label: 'إجمالي المحصل', value: `${totalPaidOverall} ج.م` },
          { label: 'إجمالي المتبقي', value: `${totalRemainingOverall} ج.م` },
        ],
      });
    } else {
      exportToWord({
        title: 'سجل المقبوضات والمدفوعات التاريخية',
        subtitle: 'سجل العمليات المالية المحصلة',
        filename: 'سجل_المقبوضات',
        columns: [
          { header: 'رقم الإيصال', key: 'receipt' },
          { header: 'اسم الطالب', key: 'student' },
          { header: 'المبلغ المسدد', key: 'amount' },
          { header: 'تاريخ الدفع', key: 'date' },
          { header: 'طريقة الدفع', key: 'method' },
        ],
        rows: filteredHistory.map((p) => ({
          receipt: p.receiptNumber || 'REC-' + p.id.slice(0, 6),
          student: p.studentName,
          amount: `${p.amount} ج.م`,
          date: p.date,
          method: p.paymentMethod,
        })),
      });
    }
  };

  const handleExportPDF = () => {
    if (activeTab === 'students') {
      exportToPDF({
        title: 'كشف حسابات واشتراكات الطلاب - سنتر زين',
        subtitle: 'المبالغ المطلوبة والمسددة والمتبقية',
        filename: 'كشف_اشتراكات_الطلاب',
        columns: [
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المجموعة', key: 'group' },
          { header: 'الهاتف', key: 'phone' },
          { header: 'المطلوب', key: 'required' },
          { header: 'المدفوع', key: 'paid' },
          { header: 'المتبقي', key: 'remaining' },
          { header: 'الحالة', key: 'status' },
        ],
        rows: filteredStudents.map((i) => ({
          name: i.student.name,
          group: i.student.groupName || '—',
          phone: i.student.phone,
          required: `${i.requiredAmount} ج.م`,
          paid: `${i.totalPaid} ج.م`,
          remaining: `${i.remaining} ج.م`,
          status: i.status,
        })),
        summary: [
          { label: 'إجمالي الاشتراكات المطلوبة', value: `${totalRequired} ج.م` },
          { label: 'إجمالي المحصل', value: `${totalPaidOverall} ج.م` },
          { label: 'إجمالي المتبقي', value: `${totalRemainingOverall} ج.م` },
        ],
      });
    } else {
      exportToPDF({
        title: 'سجل المقبوضات والمدفوعات التاريخية',
        subtitle: 'سجل العمليات المالية',
        filename: 'سجل_المقبوضات',
        columns: [
          { header: 'رقم الإيصال', key: 'receipt' },
          { header: 'اسم الطالب', key: 'student' },
          { header: 'المبلغ', key: 'amount' },
          { header: 'تاريخ الدفع', key: 'date' },
          { header: 'طريقة الدفع', key: 'method' },
        ],
        rows: filteredHistory.map((p) => ({
          receipt: p.receiptNumber || 'REC-' + p.id.slice(0, 6),
          student: p.studentName,
          amount: `${p.amount} ج.م`,
          date: p.date,
          method: p.paymentMethod,
        })),
      });
    }
  };

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section with Add Button & Export Buttons */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-sky-400" />
            <span>إدارة الحسابات والمدفوعات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة حالة دفع كل طالب (مدفوع، غير مدفوع، مدفوع جزئيًا)، وتسجيل المقبوضات الفورية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Buttons */}
          <div className="flex items-center gap-1.5 bg-[#09152b] p-1 rounded-xl border border-[#1b3459]">
            <button
              id="btn-export-excel-payments"
              type="button"
              onClick={handleExportExcel}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير إلى Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              id="btn-export-word-payments"
              type="button"
              onClick={handleExportWord}
              className="px-2.5 py-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير إلى Word"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word</span>
            </button>
            <button
              id="btn-export-pdf-payments"
              type="button"
              onClick={handleExportPDF}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير إلى PDF / طباعة"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>

          <button
            id="btn-record-payment"
            onClick={() => onOpenRecordPayment()}
            className="px-4 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل دفعة</span>
          </button>
        </div>
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
            {totalRequired} <span className="text-xs font-normal text-slate-400">ج.م</span>
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
            {totalPaidOverall} <span className="text-xs font-normal text-slate-400">ج.م</span>
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
            {totalRemainingOverall} <span className="text-xs font-normal text-slate-400">ج.م</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection: Students Status vs Payment History */}
      <div className="flex items-center gap-2 border-b border-[#142642] pb-1">
        <button
          id="tab-payment-students"
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>كشف حسابات الطلاب ({students.length})</span>
        </button>

        <button
          id="tab-payment-history"
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>سجل المقبوضات التاريخية ({payments.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-4 shadow-xl flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            id="payments-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'students'
                ? 'بحث باسم الطالب، المجموعة، أو رقم الهاتف...'
                : 'بحث باسم الطالب، رقم الإيصال، أو البيان...'
            }
            className="w-full pr-9 pl-3.5 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {activeTab === 'students' ? (
          <div className="w-full md:w-56">
            <select
              id="payments-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
            >
              <option value="">جميع حالات الدفع</option>
              <option value="مدفوع" className="bg-[#09152b] text-white">مدفوع بالكامل</option>
              <option value="مدفوع جزئيًا" className="bg-[#09152b] text-white">مدفوع جزئيًا</option>
              <option value="غير مدفوع" className="bg-[#09152b] text-white">غير مدفوع</option>
            </select>
          </div>
        ) : (
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: كشف حسابات الطلاب مع زر "دفع" لكل طالب                             */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#142642] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              حسابات الطلاب والاشتراكات ({filteredStudents.length} طالب)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="payments-students-table" className="w-full text-right text-xs">
              <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">اسم الطالب</th>
                  <th className="px-4 py-3">المجموعة</th>
                  <th className="px-4 py-3">المبلغ المطلوب</th>
                  <th className="px-4 py-3">المبلغ المدفوع</th>
                  <th className="px-4 py-3">المتبقي</th>
                  <th className="px-4 py-3">حالة الدفع</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102038] whitespace-nowrap">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      لا يوجد طلاب مطابقون للبحث.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item) => (
                    <tr
                      key={item.student.id}
                      id={`student-payment-row-${item.student.id}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-white text-sm">{item.student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.student.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {item.student.groupName || '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-white font-mono">
                        {item.requiredAmount} ج.م
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-400 font-mono">
                        {item.totalPaid} ج.م
                      </td>
                      <td className="px-4 py-3 font-bold font-mono">
                        <span
                          className={item.remaining > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}
                        >
                          {item.remaining} ج.م
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            item.status === 'مدفوع'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'مدفوع جزئيًا'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.status === 'مدفوع' && <CheckCircle2 className="w-3 h-3" />}
                          {item.status === 'مدفوع جزئيًا' && <AlertCircle className="w-3 h-3" />}
                          {item.status === 'غير مدفوع' && <Clock className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-pay-for-${item.student.id}`}
                            type="button"
                            onClick={() => onOpenRecordPayment(item.student)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>دفع</span>
                          </button>

                          {onViewStudent && (
                            <button
                              id={`btn-view-student-payment-${item.student.id}`}
                              type="button"
                              onClick={() => onViewStudent(item.student)}
                              className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                              title="عرض تفاصيل حساب الطالب"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: سجل المقبوضات التاريخية                                             */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#142642] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              سجل المقبوضات التاريخية ({filteredHistory.length} عملية مسجلة)
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
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      لا توجد مدفوعات مسجلة حتى الآن في السنتر.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((p) => (
                    <tr
                      key={p.id}
                      id={`payment-row-${p.id}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sky-400 font-bold">
                        {p.receiptNumber || 'REC-' + p.id.slice(0, 6)}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">{p.studentName}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400 text-sm font-mono">
                        {p.amount} ج.م
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-medium font-mono">{p.date}</td>
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
      )}
    </div>
  );
};
