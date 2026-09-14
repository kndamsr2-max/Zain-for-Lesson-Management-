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
    const stPayments = payments.filter((p) => p.studentId === student.id);
    const paid = stPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const fee = Number(student.subscriptionFee) || 0;
    const remaining = Math.max(0, fee - paid);
    let subStatus: 'مسدد بالكامل' | 'مسدد جزئياً' | 'غير مسدد' | 'معفى' = 'غير مسدد';
    if (fee === 0) subStatus = 'معفى';
    else if (remaining === 0 && paid > 0) subStatus = 'مسدد بالكامل';
    else if (paid > 0 && remaining > 0) subStatus = 'مسدد جزئياً';
    else subStatus = 'غير مسدد';

    return { paid, fee, remaining, subStatus, paymentCount: stPayments.length };
  };

  const totalPaidOverall = payments.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const totalRemainingOverall = students.reduce((acc, s) => {
    const fin = getStudentFinancials(s);
    return acc + fin.remaining;
  }, 0);

  const studentsWithDues = students.filter((s) => getStudentFinancials(s).remaining > 0);

  // Filtered students for Tab 1
  const filteredStudents = students.filter((s) => {
    const matchesGroup = !selectedGroupId || s.groupId === selectedGroupId;
    const term = studentSearchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.phone.includes(term) ||
      (s.code && s.code.toLowerCase().includes(term));
    return matchesGroup && matchesSearch;
  });

  // Filtered attendance for Tab 3
  const filteredAttendance = attendance.filter((a) => {
    const matchesGroup = !selectedGroupId || a.groupId === selectedGroupId;
    const matchesDate = !attendanceDate || a.date === attendanceDate;
    return matchesGroup && matchesDate;
  });

  const totalFilteredAtt = filteredAttendance.length;
  const presentCount = filteredAttendance.filter((a) => a.status === 'حاضر').length;
  const absentCount = filteredAttendance.filter((a) => a.status === 'غائب').length;
  const lateCount = filteredAttendance.filter((a) => a.status === 'متأخر').length;
  const attRate = totalFilteredAtt > 0 ? Math.round((presentCount / totalFilteredAtt) * 100) : 100;

  // Student Attendance aggregated report
  const studentAttendanceSummary = students
    .filter((s) => !selectedGroupId || s.groupId === selectedGroupId)
    .map((st) => {
      const records = attendance.filter(
        (a) => a.studentId === st.id && (!attendanceDate || a.date === attendanceDate)
      );
      const pres = records.filter((r) => r.status === 'حاضر').length;
      const abs = records.filter((r) => r.status === 'غائب').length;
      const late = records.filter((r) => r.status === 'متأخر').length;
      const tot = records.length;
      const rate = tot > 0 ? Math.round((pres / tot) * 100) : 100;
      return {
        student: st,
        present: pres,
        absent: abs,
        late,
        total: tot,
        rate,
      };
    });

  // Filtered payments for Tab 4
  const filteredPayments = payments.filter((p) => {
    const matchesDate = !paymentDate || p.date === paymentDate;
    const matchesMethod = !paymentMethodFilter || p.paymentMethod === paymentMethodFilter;
    const matchesStudent =
      !selectedStudentForPayments || p.studentId === selectedStudentForPayments;
    return matchesDate && matchesMethod && matchesStudent;
  });

  const filteredTotalPaid = filteredPayments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );

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
        rows: studentsWithDues.map((st) => {
          const fin = getStudentFinancials(st);
          return {
            name: st.name,
            group: st.groupName || '—',
            phone: st.phone,
            fee: `${st.subscriptionFee} ج.م`,
            paid: `${fin.paid} ج.م`,
            remaining: `${fin.remaining} ج.م`,
          };
        }),
      };
    }

    if (format === 'excel') exportToExcel(options);
    else if (format === 'word') exportToWord(options);
    else exportToPDF(options);
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'تقرير الطلاب', icon: <Users className="w-4 h-4" /> },
    { id: 'groups', label: 'تقرير المجموعات', icon: <Layers className="w-4 h-4" /> },
    { id: 'attendance', label: 'تقرير الحضور والغياب', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'payments', label: 'تقرير المقبوضات', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'remaining', label: 'تقرير المبالغ المتبقية', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section with Print Action & Export Formats */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>التقارير والإحصائيات الشاملة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تقارير تفصيلية مستخرجة مباشرة من قاعدة بيانات السنتر للطلاب والمجموعات والحضور والمقبوضات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown / Format Buttons */}
          <div className="flex items-center gap-1.5 bg-[#09152b] p-1 rounded-xl border border-[#1b3459]">
            <button
              id="btn-export-excel-reports"
              type="button"
              onClick={() => handleExportCurrentReport('excel')}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير التقرير الحالي إلى Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              id="btn-export-word-reports"
              type="button"
              onClick={() => handleExportCurrentReport('word')}
              className="px-2.5 py-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير التقرير الحالي إلى Word"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word</span>
            </button>
            <button
              id="btn-export-pdf-reports"
              type="button"
              onClick={() => handleExportCurrentReport('pdf')}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="تصدير التقرير الحالي إلى PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#09152b] hover:bg-[#112444] text-slate-200 border border-[#1b3459] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Tabs list (5 reports) */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-2 shadow-xl flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`report-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white shadow-[0_2px_10px_rgba(0,102,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'remaining' && studentsWithDues.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300">
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
          <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="تصفية باسم الطالب أو رقم الهاتف..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="">جميع المجموعات ({groups.length})</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#09152b] text-white">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">إجمالي الطلاب المعروضين</span>
              <div className="mt-1 text-2xl font-bold text-white font-mono">{filteredStudents.length}</div>
              <span className="text-[10px] text-slate-500">من إجمالي {students.length} طالب</span>
            </div>
            <div className="bg-[#081e24] p-4 rounded-2xl border border-[#12383c] shadow-xl">
              <span className="text-[11px] font-semibold text-emerald-300 block">النشطون</span>
              <div className="mt-1 text-2xl font-bold text-emerald-400 font-mono">
                {filteredStudents.filter((s) => s.status === 'نشط').length}
              </div>
              <span className="text-[10px] text-emerald-500">منتظمون بالدراسة</span>
            </div>
            <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">إجمالي المقبوضات</span>
              <div className="mt-1 text-xl font-bold text-emerald-400 font-mono">
                {filteredStudents.reduce((sum, s) => sum + getStudentFinancials(s).paid, 0)} ج.م
              </div>
              <span className="text-[10px] text-slate-500">تم تحصيله</span>
            </div>
            <div className="bg-[#200f1c] p-4 rounded-2xl border border-[#3d182b] shadow-xl">
              <span className="text-[11px] font-semibold text-rose-300 block">إجمالي المتبقي</span>
              <div className="mt-1 text-xl font-bold text-rose-400 font-mono">
                {filteredStudents.reduce((sum, s) => sum + getStudentFinancials(s).remaining, 0)} ج.م
              </div>
              <span className="text-[10px] text-rose-400/70">مستحق للتحصيل</span>
            </div>
          </div>

          {/* Students Detailed Table */}
          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] flex items-center justify-between font-bold text-xs text-white">
              <span>قائمة تفاصيل الطلاب والاشتراكات</span>
              <span className="text-slate-400 text-[11px] font-normal">
                اضغط على أي طالب لعرض ملفه والتقرير المالي الكامل
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">الطالب</th>
                    <th className="px-4 py-2.5">رقم الهاتف</th>
                    <th className="px-4 py-2.5">المجموعة</th>
                    <th className="px-4 py-2.5">قيمة الاشتراك</th>
                    <th className="px-4 py-2.5">المسدد</th>
                    <th className="px-4 py-2.5">المتبقي</th>
                    <th className="px-4 py-2.5">حالة الاشتراك</th>
                    <th className="px-4 py-2.5 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        لا يوجد طلاب مطابقون لمعايير البحث.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const fin = getStudentFinancials(s);
                      return (
                        <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-sky-400 font-mono font-medium">
                              {s.code || 'ST-' + s.id.slice(0, 5)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-300 font-mono dir-ltr text-right">
                            {s.phone}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            <div>{s.groupName || 'بدون مجموعة'}</div>
                            {s.course && <div className="text-[10px] text-sky-400">{s.course}</div>}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300 font-mono">{fin.fee} ج.م</td>
                          <td className="px-4 py-2.5 font-bold text-emerald-400 font-mono">
                            {fin.paid} ج.م
                          </td>
                          <td
                            className={`px-4 py-2.5 font-bold font-mono ${
                              fin.remaining > 0 ? 'text-rose-400' : 'text-slate-500'
                            }`}
                          >
                            {fin.remaining} ج.م
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                fin.subStatus === 'مسدد بالكامل'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : fin.subStatus === 'مسدد جزئياً'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {fin.subStatus}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {onViewStudent && (
                              <button
                                type="button"
                                onClick={() => onViewStudent(s)}
                                className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3 h-3" />
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
                  className="bg-[#08152b] p-5 rounded-2xl border border-[#173054] shadow-xl flex flex-col justify-between space-y-3 hover:border-sky-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-white">{grp.name}</h3>
                        <span className="text-xs text-sky-400 font-medium">{grp.course}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono">
                        {grpStudents.length} طلاب
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>الأيام: <strong className="text-slate-200">{grp.days || 'غير محدد'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>الموعد: <strong className="text-slate-200">{grp.time || '—'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Wallet className="w-3.5 h-3.5 text-slate-500" />
                        <span>السعر: <strong className="text-emerald-400 font-mono">{grp.fee} ج.م / طالب</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#142642] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">الدخل المتوقع:</span>
                      <span className="font-mono font-bold text-white">{totalExpectedIncome} ج.م</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">المحصل الفعلي:</span>
                      <span className="font-mono font-bold text-emerald-400">{collectedIncome} ج.م</span>
                    </div>

                    {onOpenViewStudentsInGroup && (
                      <button
                        type="button"
                        onClick={() => onOpenViewStudentsInGroup(grp)}
                        className="w-full mt-2 py-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/25 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
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
          <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-1/2">
              <label className="text-[11px] text-slate-400 block mb-1">اختيار المجموعة:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="">جميع المجموعات</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#09152b] text-white">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="text-[11px] text-slate-400 block mb-1">تحديد التاريخ أو الفترة:</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                />
                {attendanceDate && (
                  <button
                    type="button"
                    onClick={() => setAttendanceDate('')}
                    className="px-2.5 py-2 text-xs bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                  >
                    الكل
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metric Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">معدل الحضور</span>
              <div className="mt-1 text-2xl font-bold text-sky-400 font-mono">{attRate}%</div>
              <span className="text-[10px] text-slate-500">إجمالي {totalFilteredAtt} سجل</span>
            </div>
            <div className="bg-[#081e24] p-4 rounded-2xl border border-[#12383c] shadow-xl">
              <span className="text-[11px] font-semibold text-emerald-300 block">إجمالي الحاضرين</span>
              <div className="mt-1 text-2xl font-bold text-emerald-400 font-mono">{presentCount}</div>
              <span className="text-[10px] text-emerald-500">حالة حضور</span>
            </div>
            <div className="bg-[#200f1c] p-4 rounded-2xl border border-[#3d182b] shadow-xl">
              <span className="text-[11px] font-semibold text-rose-300 block">إجمالي الغياب</span>
              <div className="mt-1 text-2xl font-bold text-rose-400 font-mono">{absentCount}</div>
              <span className="text-[10px] text-rose-500">حالة غياب</span>
            </div>
            <div className="bg-[#1f190c] p-4 rounded-2xl border border-[#3b2d15] shadow-xl">
              <span className="text-[11px] font-semibold text-amber-300 block">إجمالي المتأخرين</span>
              <div className="mt-1 text-2xl font-bold text-amber-400 font-mono">{lateCount}</div>
              <span className="text-[10px] text-amber-500">حالة تأخير</span>
            </div>
          </div>

          {/* Aggregated Student Attendance Summary Table */}
          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white flex items-center justify-between">
              <span>إجمالي حضور وغياب كل طالب</span>
              <span className="text-[11px] text-slate-400 font-normal">
                اضغط على زر السجل لعرض تفاصيل التواريخ
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">الطالب</th>
                    <th className="px-4 py-2.5">المجموعة</th>
                    <th className="px-4 py-2.5 text-center">حاضر</th>
                    <th className="px-4 py-2.5 text-center">غائب</th>
                    <th className="px-4 py-2.5 text-center">متأخر</th>
                    <th className="px-4 py-2.5 text-center">نسبة الحضور</th>
                    <th className="px-4 py-2.5 text-center">سجل الطالب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {studentAttendanceSummary.map((item) => (
                    <tr key={item.student.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-bold text-white">{item.student.name}</td>
                      <td className="px-4 py-2.5 text-slate-300">{item.student.groupName}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-emerald-400 font-mono">
                        {item.present}
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-rose-400 font-mono">
                        {item.absent}
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-amber-400 font-mono">
                        {item.late}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-sky-400">
                        {item.rate}%
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {onViewStudentAttendance && (
                          <button
                            type="button"
                            onClick={() => onViewStudentAttendance(item.student)}
                            className="px-2.5 py-1 bg-[#09152b] hover:bg-[#102242] text-slate-200 border border-[#1b3459] rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Clock className="w-3 h-3 text-sky-400" />
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
          <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">فلترة بالتاريخ:</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">طريقة الدفع:</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="">جميع طرق الدفع</option>
                <option value="نقدي">نقدي</option>
                <option value="فودافون كاش">فودافون كاش</option>
                <option value="إنستاباي">إنستاباي</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">تصفية حسب الطالب:</label>
              <select
                value={selectedStudentForPayments}
                onChange={(e) => setSelectedStudentForPayments(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="">جميع الطلاب</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#09152b] text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#081e24] p-4 rounded-2xl border border-[#12383c] shadow-xl">
              <span className="text-xs font-semibold text-emerald-300">إجمالي التحصيل المطابق</span>
              <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
                {filteredTotalPaid} ج.م
              </div>
              <span className="text-[11px] text-slate-400">من إجمالي {totalPaidOverall} ج.م مسجل</span>
            </div>

            <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
              <span className="text-xs font-semibold text-slate-400">عدد العمليات المسجلة</span>
              <div className="mt-2 text-2xl font-bold text-white font-mono">
                {filteredPayments.length}
              </div>
              <span className="text-[11px] text-slate-500">عملية دفع</span>
            </div>

            <div className="bg-[#200f1c] p-4 rounded-2xl border border-[#3d182b] shadow-xl">
              <span className="text-xs font-semibold text-rose-300">إجمالي المبالغ المتبقية بالسنتر</span>
              <div className="mt-2 text-2xl font-bold text-rose-400 font-mono">
                {totalRemainingOverall} ج.م
              </div>
              <span className="text-[11px] text-rose-500/70">على {studentsWithDues.length} طلاب</span>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white">
              سجل عمليات الدفع والتحصيل
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">التاريخ</th>
                    <th className="px-4 py-2.5">اسم الطالب</th>
                    <th className="px-4 py-2.5">المبلغ</th>
                    <th className="px-4 py-2.5">طريقة الدفع</th>
                    <th className="px-4 py-2.5">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        لا توجد عمليات دفع مطابقة للفلتر المحدد.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-mono text-slate-400">{p.date}</td>
                        <td className="px-4 py-2.5 font-bold text-white">{p.studentName}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-400 font-mono">
                          {p.amount} ج.م
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">{p.paymentMethod}</td>
                        <td className="px-4 py-2.5 text-slate-400">{p.notes || '—'}</td>
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
          <div className="bg-[#200f1c] p-5 rounded-2xl border border-[#3d182b] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-rose-300 block">
                إجمالي المبالغ والاشتراكات المتبقية على الطلاب
              </span>
              <div className="mt-1 text-3xl font-bold text-rose-400 font-mono">
                {totalRemainingOverall} ج.م
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                مستحق على <strong className="text-white">{studentsWithDues.length}</strong> طالب
              </span>
            </div>
            <div className="text-xs text-slate-400 max-w-xs text-right leading-relaxed">
              هذا التقرير يوضح الطلاب الذين لم يكتمل سداد اشتراكاتهم بعد لمتابعة تحصيلها بسهولة.
            </div>
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white">
              قائمة الطلاب الذين عليهم مبالغ متبقية
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">الطالب</th>
                    <th className="px-4 py-2.5">رقم الهاتف</th>
                    <th className="px-4 py-2.5">المجموعة</th>
                    <th className="px-4 py-2.5">قيمة الاشتراك</th>
                    <th className="px-4 py-2.5">المسدد</th>
                    <th className="px-4 py-2.5">المبلغ المتبقي</th>
                    <th className="px-4 py-2.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {studentsWithDues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-emerald-400 font-semibold">
                        جميع الطلاب مسددون بالكامل ولا توجد أي مبالغ متبقية!
                      </td>
                    </tr>
                  ) : (
                    studentsWithDues.map((s) => {
                      const fin = getStudentFinancials(s);
                      return (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5">
                            <span className="font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-sky-400 font-mono">
                              {s.code || 'ST-' + s.id.slice(0, 5)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-300 font-mono dir-ltr text-right">
                            {s.phone}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">{s.groupName}</td>
                          <td className="px-4 py-2.5 text-slate-300 font-mono">{fin.fee} ج.م</td>
                          <td className="px-4 py-2.5 text-emerald-400 font-bold font-mono">
                            {fin.paid} ج.م
                          </td>
                          <td className="px-4 py-2.5 text-rose-400 font-bold font-mono">
                            {fin.remaining} ج.م
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {onOpenRecordPayment && (
                                <button
                                  type="button"
                                  onClick={() => onOpenRecordPayment(s)}
                                  className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="تسجيل دفعة جديدة"
                                >
                                  <PlusCircle className="w-3 h-3" />
                                  <span>تحصيل</span>
                                </button>
                              )}
                              {onViewStudent && (
                                <button
                                  type="button"
                                  onClick={() => onViewStudent(s)}
                                  className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="عرض الملف"
                                >
                                  <Eye className="w-3 h-3" />
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
