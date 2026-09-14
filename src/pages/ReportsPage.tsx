import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Layers,
  CheckSquare,
  CreditCard,
  Wallet,
  Printer,
  Search,
  Eye,
  Clock,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import { AttendanceRecord, Group, PaymentRecord, Student } from '../types';
import { exportToExcel, exportToWord, exportToPDF } from '../utils/exportUtils';

interface ReportsPageProps {
  students: Student[];
  groups: Group[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  onViewStudent?: (student: Student) => void;
  onOpenViewStudentsInGroup?: (group: Group) => void;
  onViewStudentAttendance?: (student: Student) => void;
  onOpenRecordPayment?: (student: Student) => void;
}

type ReportTab = 'students' | 'groups' | 'attendance' | 'payments' | 'remaining';

export const ReportsPage: React.FC<ReportsPageProps> = ({
  students,
  groups,
  payments,
  attendance,
  onViewStudent,
  onOpenViewStudentsInGroup,
  onViewStudentAttendance,
  onOpenRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('students');

  // Filters
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [selectedStudentForPayments, setSelectedStudentForPayments] = useState('');

  // --- Dynamic Financial Calculations from Live Data ---
  const getStudentFinancials = (student: Student) => {
    const studentPayments = payments.filter((p) => p.studentId === student.id);
    const paid = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const fee = Number(student.subscriptionFee) || 0;
    const remaining = Math.max(0, fee - paid);

    let subStatus = 'غير مسدد';
    if (paid >= fee && fee > 0) {
      subStatus = 'مسدد بالكامل';
    } else if (paid > 0) {
      subStatus = 'مسدد جزئياً';
    }

    return { paid, remaining, subStatus, fee };
  };

  // 1. Students Report Data
  const filteredStudents = students.filter((s) => {
    const matchGroup = !selectedGroupId || s.groupId === selectedGroupId;
    const matchSearch =
      !studentSearchTerm ||
      s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(studentSearchTerm));
    return matchGroup && matchSearch;
  });

  // 2. Attendance Summary Data
  const filteredAttendance = attendance.filter((r) => {
    const matchGroup = !selectedGroupId || r.groupId === selectedGroupId;
    const matchDate = !attendanceDate || r.date === attendanceDate;
    return matchGroup && matchDate;
  });

  const presentCount = filteredAttendance.filter((r) => r.status === 'حاضر').length;
  const absentCount = filteredAttendance.filter((r) => r.status === 'غائب').length;
  const lateCount = filteredAttendance.filter((r) => r.status === 'متأخر').length;
  const totalFilteredAtt = filteredAttendance.length;
  const attRate = totalFilteredAtt > 0 ? Math.round((presentCount / totalFilteredAtt) * 100) : 0;

  // Student Attendance Statistics
  const studentAttendanceSummary = students
    .filter((s) => !selectedGroupId || s.groupId === selectedGroupId)
    .map((s) => {
      const studentRecords = attendance.filter((r) => r.studentId === s.id);
      const pres = studentRecords.filter((r) => r.status === 'حاضر').length;
      const abs = studentRecords.filter((r) => r.status === 'غائب').length;
      const lat = studentRecords.filter((r) => r.status === 'متأخر').length;
      const total = pres + abs + lat;
      const rate = total > 0 ? Math.round((pres / total) * 100) : 0;
      return { student: s, present: pres, absent: abs, late: lat, total, rate };
    });

  // 3. Payments Summary Data
  const filteredPayments = payments.filter((p) => {
    const matchDate = !paymentDate || p.date === paymentDate;
    const matchMethod = !paymentMethodFilter || p.paymentMethod === paymentMethodFilter;
    const matchStudent = !selectedStudentForPayments || p.studentId === selectedStudentForPayments;
    return matchDate && matchMethod && matchStudent;
  });

  const filteredTotalPaid = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalRequiredOverall = students.reduce((sum, s) => sum + (Number(s.subscriptionFee) || 0), 0);
  const totalPaidOverall = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalRemainingOverall = Math.max(0, totalRequiredOverall - totalPaidOverall);

  // 4. Remaining Balances Data
  const studentsWithDues = students.filter((s) => {
    const { remaining } = getStudentFinancials(s);
    return remaining > 0;
  });

  const handlePrint = () => {
    window.print();
  };

  // Export handlers using utility
  const handleExportCurrentReport = (format: 'excel' | 'word' | 'pdf') => {
    let options: any;

    if (activeTab === 'students') {
      options = {
        title: 'تقرير الطلاب الشامل - سنتر زين',
        subtitle: 'بيانات الطلاب والاشتراكات',
        filename: 'تقرير_الطلاب_الشامل',
        columns: [
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المجموعة', key: 'group' },
          { header: 'الهاتف', key: 'phone' },
          { header: 'سعر الاشتراك', key: 'fee' },
          { header: 'المدفوع', key: 'paid' },
          { header: 'المتبقي', key: 'remaining' },
          { header: 'الحالة', key: 'status' },
        ],
        rows: filteredStudents.map((st) => {
          const fin = getStudentFinancials(st);
          return {
            name: st.name,
            group: st.groupName || '—',
            phone: st.phone,
            fee: `${st.subscriptionFee} ج.م`,
            paid: `${fin.paid} ج.م`,
            remaining: `${fin.remaining} ج.م`,
            status: st.status,
          };
        }),
      };
    } else if (activeTab === 'groups') {
      options = {
        title: 'تقرير المجموعات الدراسية - سنتر زين',
        subtitle: 'المجموعات والمواعيد والاشتراكات',
        filename: 'تقرير_المجموعات',
        columns: [
          { header: 'اسم المجموعة', key: 'name' },
          { header: 'المادة / الكورس', key: 'course' },
          { header: 'أيام الحصص', key: 'days' },
          { header: 'التوقيت', key: 'time' },
          { header: 'سعر الاشتراك', key: 'fee' },
          { header: 'عدد الطلاب', key: 'count' },
        ],
        rows: groups.map((g) => ({
          name: g.name,
          course: g.course,
          days: g.days,
          time: g.time,
          fee: `${g.fee} ج.م`,
          count: students.filter((s) => s.groupId === g.id).length,
        })),
      };
    } else if (activeTab === 'attendance') {
      options = {
        title: 'تقرير نسب الحضور والغياب - سنتر زين',
        subtitle: 'إحصائيات حضور الطلاب',
        filename: 'تقرير_الحضور_والغياب',
        columns: [
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المجموعة', key: 'group' },
          { header: 'عدد مرات الحضور', key: 'present' },
          { header: 'عدد مرات الغياب', key: 'absent' },
          { header: 'متأخر', key: 'late' },
          { header: 'نسبة الالتزام', key: 'rate' },
        ],
        rows: studentAttendanceSummary.map((s) => ({
          name: s.student.name,
          group: s.student.groupName || '—',
          present: s.present,
          absent: s.absent,
          late: s.late,
          rate: `${s.rate}%`,
        })),
      };
    } else if (activeTab === 'payments') {
      options = {
        title: 'تقرير المقبوضات المالية - سنتر زين',
        subtitle: 'سجل العمليات المالية المحصلة',
        filename: 'تقرير_المقبوضات',
        columns: [
          { header: 'رقم الإيصال', key: 'receipt' },
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المبلغ المسدد', key: 'amount' },
          { header: 'تاريخ الدفع', key: 'date' },
          { header: 'طريقة الدفع', key: 'method' },
        ],
        rows: filteredPayments.map((p) => ({
          receipt: p.receiptNumber || 'REC-' + p.id.slice(0, 6),
          name: p.studentName,
          amount: `${p.amount} ج.م`,
          date: p.date,
          method: p.paymentMethod,
        })),
      };
    } else {
      options = {
        title: 'تقرير المبالغ المتبقية والديون المستحقة - سنتر زين',
        subtitle: 'قائمة الطلاب المتبقي عليهم مبالغ اشتراك',
        filename: 'تقرير_المبالغ_المتبقية',
        columns: [
          { header: 'اسم الطالب', key: 'name' },
          { header: 'المجموعة', key: 'group' },
          { header: 'الهاتف', key: 'phone' },
          { header: 'قيمة الاشتراك', key: 'fee' },
          { header: 'المبلغ المدفوع', key: 'paid' },
          { header: 'المبلغ المتبقي', key: 'remaining' },
        ],
        rows: studentsWithDues.map((s) => {
          const fin = getStudentFinancials(s);
          return {
            name: s.name,
            group: s.groupName || '—',
            phone: s.phone,
            fee: `${fin.fee} ج.م`,
            paid: `${fin.paid} ج.م`,
            remaining: `${fin.remaining} ج.م`,
          };
        }),
      };
    }

    if (format === 'excel') exportToExcel(options);
    if (format === 'word') exportToWord(options);
    if (format === 'pdf') exportToPDF(options);
  };

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'تقرير الطلاب', icon: <Users className="w-4 h-4" /> },
    { id: 'groups', label: 'تقرير المجموعات', icon: <Layers className="w-4 h-4" /> },
    { id: 'attendance', label: 'تقرير الحضور والغياب', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'payments', label: 'تقرير المقبوضات المالية', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'remaining', label: 'المبالغ المتبقية والديون', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header section with Print Action & Export Formats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span>التقارير والإحصائيات الشاملة</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تقارير تفصيلية مستخرجة مباشرة من قاعدة بيانات السنتر للطلاب والمجموعات والحضور والمقبوضات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Dropdown / Format Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-export-excel-reports"
              type="button"
              onClick={() => handleExportCurrentReport('excel')}
              className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير التقرير الحالي إلى Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              id="btn-export-word-reports"
              type="button"
              onClick={() => handleExportCurrentReport('word')}
              className="px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير التقرير الحالي إلى Word"
            >
              <FileText className="w-3.5 h-3.5 text-[#0066ff]" />
              <span>Word</span>
            </button>
            <button
              id="btn-export-pdf-reports"
              type="button"
              onClick={() => handleExportCurrentReport('pdf')}
              className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير التقرير الحالي إلى PDF"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span>PDF</span>
            </button>
          </div>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#0066ff]" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Tabs list (5 reports) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`report-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0066ff] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'remaining' && studentsWithDues.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {studentsWithDues.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: تقرير الطلاب                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="تصفية باسم الطالب أو رقم الهاتف..."
                className="w-full pr-10 pl-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
              >
                <option value="">جميع المجموعات ({groups.length})</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي الطلاب المعروضين</span>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">{filteredStudents.length}</div>
              <span className="text-[11px] text-slate-400">من إجمالي {students.length} طالب</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">النشطون</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 font-mono">
                {filteredStudents.filter((s) => s.status === 'نشط').length}
              </div>
              <span className="text-[11px] text-emerald-600">منتظمون بالدراسة</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي المقبوضات</span>
              <div className="mt-2 text-xl font-black text-emerald-600 font-mono">
                {filteredStudents.reduce((sum, s) => sum + getStudentFinancials(s).paid, 0)} ج.م
              </div>
              <span className="text-[11px] text-slate-400">تم تحصيله</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي المتبقي</span>
              <div className="mt-2 text-xl font-black text-rose-600 font-mono">
                {filteredStudents.reduce((sum, s) => sum + getStudentFinancials(s).remaining, 0)} ج.م
              </div>
              <span className="text-[11px] text-rose-500">مستحق للتحصيل</span>
            </div>
          </div>

          {/* Students Detailed Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-700">
              <span>قائمة تفاصيل الطلاب والاشتراكات</span>
              <span className="text-slate-400 text-xs font-normal">
                اضغط على أي طالب لعرض ملفه والتقرير المالي الكامل
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">الطالب</th>
                    <th className="px-4 py-3.5">رقم الهاتف</th>
                    <th className="px-4 py-3.5">المجموعة</th>
                    <th className="px-4 py-3.5">قيمة الاشتراك</th>
                    <th className="px-4 py-3.5">المسدد</th>
                    <th className="px-4 py-3.5">المتبقي</th>
                    <th className="px-4 py-3.5">حالة الاشتراك</th>
                    <th className="px-4 py-3.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        لا يوجد طلاب مطابقون لمعايير البحث.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const fin = getStudentFinancials(s);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {s.code || 'ST-' + s.id.slice(0, 5)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-mono">
                            {s.phone}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            <div>{s.groupName || 'بدون مجموعة'}</div>
                            {s.course && <div className="text-xs text-[#0066ff]">{s.course}</div>}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700 font-mono font-bold">{fin.fee} ج.م</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                            {fin.paid} ج.م
                          </td>
                          <td
                            className={`px-4 py-3.5 font-bold font-mono ${
                              fin.remaining > 0 ? 'text-rose-600' : 'text-slate-400'
                            }`}
                          >
                            {fin.remaining} ج.م
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                fin.subStatus === 'مسدد بالكامل'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : fin.subStatus === 'مسدد جزئياً'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {fin.subStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {onViewStudent && (
                              <button
                                type="button"
                                onClick={() => onViewStudent(s)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0066ff] border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>عرض الملف</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: تقرير المجموعات                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((grp) => {
              const grpStudents = students.filter((s) => s.groupId === grp.id);
              const totalExpectedIncome = grpStudents.length * (Number(grp.fee) || 0);
              const collectedIncome = payments
                .filter((p) => grpStudents.some((s) => s.id === p.studentId))
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

              return (
                <div
                  key={grp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-800">{grp.name}</h3>
                        <span className="text-xs text-[#0066ff] font-bold">{grp.course}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0066ff] border border-blue-200 font-mono">
                        {grpStudents.length} طلاب
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>الأيام: <strong className="text-slate-800">{grp.days || 'غير محدد'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>الموعد: <strong className="text-slate-800 font-mono">{grp.time || '—'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>السعر: <strong className="text-emerald-600 font-mono">{grp.fee} ج.م / طالب</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">الدخل المتوقع:</span>
                      <span className="font-mono font-bold text-slate-800">{totalExpectedIncome} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">المحصل الفعلي:</span>
                      <span className="font-mono font-bold text-emerald-600">{collectedIncome} ج.م</span>
                    </div>

                    {onOpenViewStudentsInGroup && (
                      <button
                        type="button"
                        onClick={() => onOpenViewStudentsInGroup(grp)}
                        className="w-full mt-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#0066ff] border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>عرض طلاب المجموعة ({grpStudents.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: تقرير الحضور                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-1/2">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">اختيار المجموعة:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
              >
                <option value="">جميع المجموعات</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">تحديد التاريخ أو الفترة:</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                />
                {attendanceDate && (
                  <button
                    type="button"
                    onClick={() => setAttendanceDate('')}
                    className="px-3 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl"
                  >
                    الكل
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metric Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">معدل الحضور</span>
              <div className="mt-2 text-2xl font-black text-[#0066ff] font-mono">{attRate}%</div>
              <span className="text-[11px] text-slate-400">إجمالي {totalFilteredAtt} سجل</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي الحاضرين</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 font-mono">{presentCount}</div>
              <span className="text-[11px] text-emerald-600">حالة حضور</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي الغياب</span>
              <div className="mt-2 text-2xl font-black text-rose-600 font-mono">{absentCount}</div>
              <span className="text-[11px] text-rose-500">حالة غياب</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">إجمالي المتأخرين</span>
              <div className="mt-2 text-2xl font-black text-amber-600 font-mono">{lateCount}</div>
              <span className="text-[11px] text-amber-600">حالة تأخير</span>
            </div>
          </div>

          {/* Aggregated Student Attendance Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-700 flex items-center justify-between">
              <span>إجمالي حضور وغياب كل طالب</span>
              <span className="text-xs text-slate-400 font-normal">
                اضغط على زر السجل لعرض تفاصيل التواريخ
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">الطالب</th>
                    <th className="px-4 py-3.5">المجموعة</th>
                    <th className="px-4 py-3.5 text-center">حاضر</th>
                    <th className="px-4 py-3.5 text-center">غائب</th>
                    <th className="px-4 py-3.5 text-center">متأخر</th>
                    <th className="px-4 py-3.5 text-center">نسبة الحضور</th>
                    <th className="px-4 py-3.5 text-center">سجل الطالب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentAttendanceSummary.map((item) => (
                    <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">{item.student.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{item.student.groupName}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600 font-mono">
                        {item.present}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-rose-600 font-mono">
                        {item.absent}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-amber-600 font-mono">
                        {item.late}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-[#0066ff]">
                        {item.rate}%
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {onViewStudentAttendance && (
                          <button
                            type="button"
                            onClick={() => onViewStudentAttendance(item.student)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0066ff] border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>فتح السجل</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: تقرير المدفوعات والمقبوضات                                         */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">فلترة بالتاريخ:</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">طريقة الدفع:</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
              >
                <option value="">جميع طرق الدفع</option>
                <option value="نقدي">نقدي</option>
                <option value="فودافون كاش">فودافون كاش</option>
                <option value="إنستاباي">إنستاباي</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">تصفية حسب الطالب:</label>
              <select
                value={selectedStudentForPayments}
                onChange={(e) => setSelectedStudentForPayments(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
              >
                <option value="">جميع الطلاب</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500">إجمالي التحصيل المطابق</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 font-mono">
                {filteredTotalPaid} ج.م
              </div>
              <span className="text-xs text-slate-400">من إجمالي {totalPaidOverall} ج.م مسجل</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500">عدد العمليات المسجلة</span>
              <div className="mt-2 text-2xl font-black text-slate-800 font-mono">
                {filteredPayments.length}
              </div>
              <span className="text-xs text-slate-400">عملية دفع</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500">إجمالي المبالغ المتبقية بالسنتر</span>
              <div className="mt-2 text-2xl font-black text-rose-600 font-mono">
                {totalRemainingOverall} ج.م
              </div>
              <span className="text-xs text-rose-500">على {studentsWithDues.length} طلاب</span>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-700">
              سجل عمليات الدفع والتحصيل
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">التاريخ</th>
                    <th className="px-4 py-3.5">اسم الطالب</th>
                    <th className="px-4 py-3.5">المبلغ</th>
                    <th className="px-4 py-3.5">طريقة الدفع</th>
                    <th className="px-4 py-3.5">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">
                        لا توجد عمليات دفع مطابقة للفلتر المحدد.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-slate-500 text-xs">{p.date}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">{p.studentName}</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                          {p.amount} ج.م
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{p.paymentMethod}</td>
                        <td className="px-4 py-3.5 text-slate-500">{p.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: تقرير المبالغ المتبقية                                              */}
      {/* ========================================================================= */}
      {activeTab === 'remaining' && (
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block">
                إجمالي المبالغ والاشتراكات المتبقية على الطلاب
              </span>
              <div className="mt-2 text-3xl font-black text-rose-600 font-mono">
                {totalRemainingOverall} ج.م
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                مستحق على <strong className="text-slate-800 font-bold">{studentsWithDues.length}</strong> طالب
              </span>
            </div>
            <div className="text-xs text-slate-500 max-w-xs text-right leading-relaxed">
              هذا التقرير يوضح الطلاب الذين لم يكتمل سداد اشتراكاتهم بعد لمتابعة تحصيلها بسهولة.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 font-bold text-xs sm:text-sm text-slate-700">
              قائمة الطلاب الذين عليهم مبالغ متبقية
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">الطالب</th>
                    <th className="px-4 py-3.5">رقم الهاتف</th>
                    <th className="px-4 py-3.5">المجموعة</th>
                    <th className="px-4 py-3.5">قيمة الاشتراك</th>
                    <th className="px-4 py-3.5">المسدد</th>
                    <th className="px-4 py-3.5">المبلغ المتبقي</th>
                    <th className="px-4 py-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsWithDues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-emerald-600 font-bold">
                        جميع الطلاب مسددون بالكامل ولا توجد أي مبالغ متبقية!
                      </td>
                    </tr>
                  ) : (
                    studentsWithDues.map((s) => {
                      const fin = getStudentFinancials(s);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {s.code || 'ST-' + s.id.slice(0, 5)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-mono">
                            {s.phone}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">{s.groupName}</td>
                          <td className="px-4 py-3.5 text-slate-700 font-mono">{fin.fee} ج.م</td>
                          <td className="px-4 py-3.5 text-emerald-600 font-bold font-mono">
                            {fin.paid} ج.م
                          </td>
                          <td className="px-4 py-3.5 text-rose-600 font-bold font-mono">
                            {fin.remaining} ج.م
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {onOpenRecordPayment && (
                                <button
                                  type="button"
                                  onClick={() => onOpenRecordPayment(s)}
                                  className="px-3 py-1.5 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                  title="تسجيل دفعة جديدة"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>تحصيل</span>
                                </button>
                              )}
                              {onViewStudent && (
                                <button
                                  type="button"
                                  onClick={() => onViewStudent(s)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0066ff] border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="عرض الملف"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>الملف</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
