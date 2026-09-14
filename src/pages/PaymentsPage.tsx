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
      paymentsCount: stPayments.length,
      lastPaymentDate: stPayments.length > 0 ? stPayments[0].date : '—',
    };
  });

  // Filter students tab
  const filteredStudents = studentPaymentSummaries.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      item.student.name.toLowerCase().includes(term) ||
      (item.student.groupName && item.student.groupName.toLowerCase().includes(term)) ||
      (item.student.phone && item.student.phone.includes(term));

    const matchesStatus = !statusFilter || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter history tab
  const filteredHistory = payments.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (p.studentName && p.studentName.toLowerCase().includes(term)) ||
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(term)) ||
      (p.notes && p.notes.toLowerCase().includes(term));

    const matchesMethod = !methodFilter || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Totals calculations
  const totalRequired = students.reduce((acc, st) => acc + (Number(st.subscriptionFee) || 0), 0);
  const totalPaidOverall = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalRemainingOverall = Math.max(0, totalRequired - totalPaidOverall);

  const handleDelete = (paymentId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإيصال المالي؟')) {
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
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header section with Add Button & Export Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <CreditCard className="w-5 h-5" />
            </div>
            <span>إدارة الحسابات والمدفوعات</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            متابعة حالة دفع كل طالب، الاستحقاقات الشهرية، وتسجيل المقبوضات الفورية مع إصدار إيصالات رسمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-export-excel-payments"
              type="button"
              onClick={handleExportExcel}
              className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير إلى Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              id="btn-export-word-payments"
              type="button"
              onClick={handleExportWord}
              className="px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير إلى Word"
            >
              <FileText className="w-3.5 h-3.5 text-[#0066ff]" />
              <span>Word</span>
            </button>
            <button
              id="btn-export-pdf-payments"
              type="button"
              onClick={handleExportPDF}
              className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير إلى PDF / طباعة"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF</span>
            </button>
          </div>

          <button
            id="btn-record-payment"
            onClick={() => onOpenRecordPayment()}
            className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل دفعة جديدة</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Subscriptions Required */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الاشتراكات المطلوبة</span>
            <div className="p-2.5 bg-blue-50 text-[#0066ff] rounded-xl border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
            {totalRequired.toLocaleString('en-US')}{' '}
            <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المبالغ المحصلة</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 font-mono">
            {totalPaidOverall.toLocaleString('en-US')}{' '}
            <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المبالغ المتبقية للتحصيل</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600 font-mono">
            {totalRemainingOverall.toLocaleString('en-US')}{' '}
            <span className="text-xs font-bold text-slate-400">ج.م</span>
          </div>
        </div>
      </div>

      {/* Tabs Selection: Students Status vs Payment History */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          id="tab-payment-students"
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>كشف حسابات واشتراكات الطلاب ({students.length})</span>
        </button>

        <button
          id="tab-payment-history"
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#0066ff] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>سجل المقبوضات التاريخية ({payments.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-3">
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
            className="w-full pr-10 pl-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        {activeTab === 'students' ? (
          <div className="w-full md:w-56">
            <select
              id="payments-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
            >
              <option value="">جميع حالات الدفع</option>
              <option value="مدفوع">مدفوع بالكامل</option>
              <option value="مدفوع جزئيًا">مدفوع جزئيًا</option>
              <option value="غير مدفوع">غير مدفوع</option>
            </select>
          </div>
        ) : (
          <div className="w-full md:w-56">
            <select
              id="payments-filter-method"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
            >
              <option value="">جميع طرق الدفع</option>
              <option value="نقدي">نقدي (كاش)</option>
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="انستا باي">انستا باي (InstaPay)</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: كشف حسابات الطلاب                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              كشف حسابات الطلاب ({filteredStudents.length} طالب)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="students-payments-table" className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3.5">اسم الطالب</th>
                  <th className="px-4 py-3.5">المجموعة</th>
                  <th className="px-4 py-3.5">المبلغ المطلوب</th>
                  <th className="px-4 py-3.5">المدفوع</th>
                  <th className="px-4 py-3.5">المتبقي</th>
                  <th className="px-4 py-3.5">حالة الدفع</th>
                  <th className="px-4 py-3.5">عدد الدفعات</th>
                  <th className="px-4 py-3.5 text-center">إجراءات التحصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      لا يوجد طلاب يطابقون خيارات البحث المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item) => (
                    <tr
                      key={item.student.id}
                      id={`student-payment-row-${item.student.id}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {item.student.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {item.student.groupName || '—'}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">
                        {item.requiredAmount} ج.م
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-600">
                        {item.totalPaid} ج.م
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-rose-600">
                        {item.remaining} ج.م
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.status === 'مدفوع'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'مدفوع جزئيًا'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-bold">
                        {item.paymentsCount} دفعات
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-collect-from-student-${item.student.id}`}
                            type="button"
                            onClick={() => onOpenRecordPayment(item.student)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0066ff] hover:bg-[#0055ee] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>تحصيل</span>
                          </button>

                          {onViewStudent && (
                            <button
                              id={`btn-view-student-payment-${item.student.id}`}
                              type="button"
                              onClick={() => onViewStudent(item.student)}
                              className="p-1.5 text-slate-500 hover:text-[#0066ff] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              سجل المقبوضات التاريخية ({filteredHistory.length} عملية مسجلة)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="payments-data-table" className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3.5">رقم الإيصال</th>
                  <th className="px-4 py-3.5">اسم الطالب</th>
                  <th className="px-4 py-3.5">المبلغ المدفوع</th>
                  <th className="px-4 py-3.5">تاريخ الدفع</th>
                  <th className="px-4 py-3.5">طريقة الدفع</th>
                  <th className="px-4 py-3.5">ملاحظات وبيان</th>
                  {(onEditPayment || onDeletePayment) && (
                    <th className="px-4 py-3.5 text-center">إجراءات</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 whitespace-nowrap">
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
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-[#0066ff] font-bold">
                        {p.receiptNumber || 'REC-' + p.id.slice(0, 6)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{p.studentName}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                        {p.amount} ج.م
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{p.date}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0066ff] border border-blue-200">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                        {p.notes || '—'}
                      </td>
                      {(onEditPayment || onDeletePayment) && (
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {onEditPayment && (
                              <button
                                id={`btn-edit-payment-${p.id}`}
                                onClick={() => onEditPayment(p)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="تعديل الدفعة"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {onDeletePayment && (
                              <button
                                id={`btn-delete-payment-${p.id}`}
                                onClick={() => handleDelete(p.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
