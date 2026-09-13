import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Layers,
  CheckSquare,
  CreditCard,
  Wallet,
  Printer,
} from 'lucide-react';
import { AttendanceRecord, Group, PaymentRecord, Student } from '../types';

interface ReportsPageProps {
  students: Student[];
  groups: Group[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
}

type ReportTab = 'students' | 'groups' | 'attendance' | 'payments' | 'remaining';

export const ReportsPage: React.FC<ReportsPageProps> = ({
  students,
  groups,
  payments,
  attendance,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('students');

  // Calculations for reports
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'نشط').length;
  const pausedStudents = students.filter((s) => s.status === 'متوقف').length;

  const totalPaid = payments.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalRemaining = students.reduce((acc, c) => acc + (c.remainingAmount || 0), 0);

  // Attendance rate
  const totalAttendanceRecords = attendance.length;
  const presentRecords = attendance.filter((a) => a.status === 'حاضر').length;
  const overallAttendanceRate =
    totalAttendanceRecords > 0
      ? Math.round((presentRecords / totalAttendanceRecords) * 100)
      : 100;

  // Payment methods breakdown
  const paymentMethodsSummary = payments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const handlePrint = () => {
    window.print();
  };

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
    { id: 'students', label: 'تقرير الطلاب', icon: <Users className="w-4 h-4" /> },
    { id: 'groups', label: 'تقرير المجموعات', icon: <Layers className="w-4 h-4" /> },
    { id: 'attendance', label: 'تقرير الحضور', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'payments', label: 'تقرير المدفوعات', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'remaining', label: 'تقرير المبالغ المتبقية', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section with Print Action */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>التقارير والإحصائيات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تقارير تحليلية شاملة للطلاب، المجموعات، نسب الحضور، والتحصيلات المالية
          </p>
        </div>

        <button
          id="btn-print-report"
          onClick={handlePrint}
          className="px-4 py-2 bg-[#09152b] hover:bg-[#112444] text-slate-200 border border-[#1b3459] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>طباعة التقرير الحالي</span>
        </button>
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
            </button>
          );
        })}
      </div>

      {/* Tab 1: تقرير الطلاب */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
              <span className="text-xs font-semibold text-slate-400">إجمالي الطلاب</span>
              <div className="mt-2 text-2xl font-bold text-white">{totalStudents}</div>
              <span className="text-[11px] text-slate-500">طالب مسجل في السنتر</span>
            </div>
            <div className="bg-[#081e24] p-4 rounded-2xl border border-[#12383c] shadow-xl">
              <span className="text-xs font-semibold text-emerald-300">الطلاب النشطون</span>
              <div className="mt-2 text-2xl font-bold text-emerald-400">{activeStudents}</div>
              <span className="text-[11px] text-emerald-500">منتظمون في الحضور</span>
            </div>
            <div className="bg-[#200f1c] p-4 rounded-2xl border border-[#3d182b] shadow-xl">
              <span className="text-xs font-semibold text-amber-300">المتوقفون أو المؤجلون</span>
              <div className="mt-2 text-2xl font-bold text-amber-400">{pausedStudents}</div>
              <span className="text-[11px] text-amber-500">بحاجة لمتابعة هاتفية</span>
            </div>
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white">
              قائمة تفصيلية بحالة جميع الطلاب
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">الطالب</th>
                    <th className="px-4 py-2.5">رقم الهاتف</th>
                    <th className="px-4 py-2.5">المجموعة</th>
                    <th className="px-4 py-2.5">الحالة</th>
                    <th className="px-4 py-2.5">تاريخ الانضمام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-bold text-white">{s.name}</td>
                      <td className="px-4 py-2.5 text-slate-300 font-mono dir-ltr text-right">{s.phone}</td>
                      <td className="px-4 py-2.5 text-slate-300">{s.groupName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'نشط' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{s.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: تقرير المجموعات */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map((grp) => (
              <div key={grp.id} className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl space-y-2">
                <div className="font-bold text-sm text-white">{grp.name}</div>
                <div className="text-xs text-sky-400 font-medium">{grp.course}</div>
                <div className="text-xs text-slate-400">{grp.days} ({grp.time})</div>
                <div className="pt-2 border-t border-[#142642] flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{grp.studentCount} طالب</span>
                  <span className="text-emerald-400">{grp.fee} ج.م / طالب</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: تقرير الحضور */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
              <span className="text-xs font-semibold text-slate-400">معدل الحضور العام</span>
              <div className="mt-2 text-2xl font-bold text-sky-400">{overallAttendanceRate}%</div>
              <span className="text-[11px] text-slate-500">بناءً على الحصص المسجلة</span>
            </div>
            <div className="bg-[#081e24] p-4 rounded-2xl border border-[#12383c] shadow-xl">
              <span className="text-xs font-semibold text-emerald-300">إجمالي الحضور المسجل</span>
              <div className="mt-2 text-2xl font-bold text-emerald-400">{presentRecords}</div>
              <span className="text-[11px] text-emerald-500">حالة حضور فعلية</span>
            </div>
            <div className="bg-[#200f1c] p-4 rounded-2xl border border-[#3d182b] shadow-xl">
              <span className="text-xs font-semibold text-rose-300">إجمالي الغياب المسجل</span>
              <div className="mt-2 text-2xl font-bold text-rose-400">
                {totalAttendanceRecords - presentRecords}
              </div>
              <span className="text-[11px] text-rose-500">حالة غياب</span>
            </div>
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white">
              آخر سجلات الحضور بالسنتر
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">التاريخ</th>
                    <th className="px-4 py-2.5">الطالب</th>
                    <th className="px-4 py-2.5">المجموعة</th>
                    <th className="px-4 py-2.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{a.date}</td>
                      <td className="px-4 py-2.5 font-bold text-white">{a.studentName}</td>
                      <td className="px-4 py-2.5 text-slate-300">{a.groupName}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'حاضر'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: تقرير المدفوعات */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#081e24] p-4 rounded-2xl border border-[#12383c] shadow-xl">
              <span className="text-xs font-semibold text-emerald-300">إجمالي التحصيل</span>
              <div className="mt-2 text-2xl font-bold text-emerald-400">{totalPaid} ج.م</div>
              <span className="text-[11px] text-slate-400">لكافة العمليات</span>
            </div>
            {Object.entries(paymentMethodsSummary).map(([method, sum]) => {
              const amountValue = Number(sum) || 0;
              return (
                <div key={method} className="bg-[#08152b] p-4 rounded-2xl border border-[#173054] shadow-xl">
                  <span className="text-xs font-semibold text-slate-400">{method}</span>
                  <div className="mt-2 text-xl font-bold text-white">{amountValue} ج.م</div>
                  <span className="text-[11px] text-emerald-400">
                    {Math.round((amountValue / (totalPaid || 1)) * 100)}% من الإجمالي
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white">
              قائمة المقبوضات والتحصيلات
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
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{p.date}</td>
                      <td className="px-4 py-2.5 font-bold text-white">{p.studentName}</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-400">{p.amount} ج.م</td>
                      <td className="px-4 py-2.5 text-slate-300">{p.paymentMethod}</td>
                      <td className="px-4 py-2.5 text-slate-400">{p.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: تقرير المبالغ المتبقية */}
      {activeTab === 'remaining' && (
        <div className="space-y-4">
          <div className="bg-[#200f1c] p-5 rounded-2xl border border-[#3d182b] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-rose-300 block">
                إجمالي الديون والمبالغ المتبقية على الطلاب
              </span>
              <div className="mt-1 text-3xl font-bold text-rose-400">
                {totalRemaining} ج.م
              </div>
            </div>
            <div className="text-xs text-slate-400 max-w-xs text-right">
              يوضح هذا التقرير جميع الطلاب الذين لديهم مبالغ متبقية على اشتراكاتهم لمتابعة تحصيلها.
            </div>
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] font-bold text-xs text-white">
              الطلاب المستحق عليهم مبالغ متبقية
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102038]">
                  {students
                    .filter((s) => s.remainingAmount > 0)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-bold text-white">{s.name}</td>
                        <td className="px-4 py-2.5 text-slate-300 font-mono dir-ltr text-right">{s.phone}</td>
                        <td className="px-4 py-2.5 text-slate-300">{s.groupName}</td>
                        <td className="px-4 py-2.5 text-slate-300">{s.subscriptionFee} ج.م</td>
                        <td className="px-4 py-2.5 text-emerald-400 font-bold">{s.paidAmount} ج.م</td>
                        <td className="px-4 py-2.5 font-bold text-rose-400">{s.remainingAmount} ج.م</td>
                      </tr>
                    ))}
                  {students.filter((s) => s.remainingAmount > 0).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-emerald-400 font-semibold">
                        جميع الطلاب مسددون بالكامل ولا توجد مبالغ متبقية.
                      </td>
                    </tr>
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
