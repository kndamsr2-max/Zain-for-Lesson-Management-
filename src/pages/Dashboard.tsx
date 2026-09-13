import React, { useState } from 'react';
import {
  Users,
  Layers,
  GraduationCap,
  Wallet,
  PieChart,
  CalendarCheck,
  CreditCard,
  Clock,
  ChevronDown,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { PageId, Student, Group, PaymentRecord, LessonSession, AttendanceRecord } from '../types';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenAddStudent?: () => void;
  onOpenRecordPayment?: () => void;
  students?: Student[];
  groups?: Group[];
  payments?: PaymentRecord[];
  sessions?: LessonSession[];
  attendance?: AttendanceRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  students = [],
  groups = [],
  payments = [],
  sessions = [],
  attendance = [],
}) => {
  // Time filter for Quick Stats
  const [statsPeriod, setStatsPeriod] = useState('هذا الأسبوع');
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);

  // Dynamic real values derived directly from props
  const totalStudentsCount = students.length;
  const totalGroupsCount = groups.length;

  const effectiveSessions: LessonSession[] =
    sessions.length > 0
      ? sessions
      : groups.map((g) => ({
          id: `ses-${g.id}`,
          groupId: g.id,
          groupName: g.name,
          course: g.course,
          day: g.days,
          date: new Date().toISOString().split('T')[0],
          time: g.time,
          studentCount: g.studentCount,
        }));

  const todaySessionsCount = effectiveSessions.length;
  const totalPaymentsAmount = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalSubscriptions = students.reduce((acc, s) => acc + (Number(s.subscriptionFee) || 0), 0);
  const totalRemainingAmount = Math.max(0, totalSubscriptions - totalPaymentsAmount);

  // Real today's sessions data
  const dotColors = ['#00f0ff', '#10b981', '#f59e0b', '#a855f7', '#f43f5e'];
  const todaySessionsData = effectiveSessions.slice(0, 5).map((ses, idx) => ({
    id: ses.id || idx + 1,
    studentsCount: ses.studentCount || (students.filter((s) => s.groupId === ses.groupId).length) || 0,
    course: ses.course || 'غير محدد',
    groupName: ses.groupName || 'المجموعة',
    time: ses.time || '—',
    dotColor: dotColors[idx % dotColors.length],
  }));

  // Real recent payments data
  const avatarColors = [
    'bg-sky-500/20 text-sky-400 border-sky-400/30',
    'bg-emerald-500/20 text-emerald-400 border-emerald-400/30',
    'bg-rose-500/20 text-rose-400 border-rose-400/30',
    'bg-sky-500/20 text-sky-400 border-sky-400/30',
    'bg-amber-500/20 text-amber-400 border-amber-400/30',
  ];

  const recentPaymentsData = payments.slice(0, 5).map((pay, idx) => ({
    id: pay.id || idx + 1,
    studentName: pay.studentName || 'طالب',
    amount: String(pay.amount),
    date: pay.date,
    avatarColor: avatarColors[idx % avatarColors.length],
  }));

  // Dynamic Course Distribution Data
  const courseCounts: Record<string, number> = {};
  students.forEach((s) => {
    const c = s.course || 'عام';
    courseCounts[c] = (courseCounts[c] || 0) + 1;
  });

  const chartPalette = ['#00e5ff', '#10b981', '#6366f1', '#f43f5e', '#f59e0b'];
  const courseDistribution = Object.keys(courseCounts).length > 0
    ? Object.entries(courseCounts).map(([name, count], i) => ({
        name,
        pct: totalStudentsCount > 0 ? Math.round((count / totalStudentsCount) * 100) : 0,
        color: chartPalette[i % chartPalette.length],
      }))
    : groups.length > 0
    ? groups.slice(0, 5).map((g, i) => ({
        name: g.course || g.name,
        pct: Math.round(100 / Math.min(groups.length, 5)),
        color: chartPalette[i % chartPalette.length],
      }))
    : [{ name: 'لا توجد كورسات مسجلة', pct: 100, color: '#334155' }];

  // Dynamic Activity / Bar Stats: compute active sessions or payments distribution across days
  const daysOfWeek = ['السبت', 'الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const barData = daysOfWeek.map((day) => {
    // Count matching groups meeting on this day or sessions
    const matchingGroups = groups.filter((g) => g.days && g.days.includes(day)).length;
    const value = Math.max(matchingGroups * 5, 2);
    return {
      day,
      height: Math.min(value, 40),
      value: matchingGroups,
    };
  });

  // Important Events / Upcoming items
  const importantEvents = [
    {
      id: 1,
      title: groups.length > 0 ? `متابعة مجموعة ${groups[0].name}` : 'متابعة جدول المجموعات',
      date: new Date().toISOString().split('T')[0],
    },
    {
      id: 2,
      title: 'إغلاق تحصيل الاشتراكات للشهر',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    },
    {
      id: 3,
      title: 'مراجعة كشوفات الحضور الأسبوعية',
      date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    },
  ];

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. WELCOME BANNER                                                        */}
      {/* ========================================================================= */}
      <div
        id="dashboard-welcome-banner"
        className="relative rounded-2xl bg-[#08152b] border border-[#173054] p-5 sm:p-7 overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-right flex-1 min-w-[260px]">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              مرحباً بك في زين
            </h2>
            <h3 className="text-lg sm:text-xl font-bold text-slate-200 mt-1">
              لإدارة الدروس والسناتر
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 font-normal">
              كل ما تحتاجه لإدارة سنترك ومتابعة الطلاب والمدفوعات والحضور في مكان واحد
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-center text-center px-4">
            <p className="text-lg font-bold text-slate-200 leading-snug">العلم</p>
            <p className="text-lg font-bold text-slate-200 leading-snug">يمنحك فرصةً</p>
            <p className="text-lg font-bold text-slate-100 leading-snug">أكبر في الحياة</p>
            <div className="w-12 h-0.5 bg-sky-400 mt-2 shadow-[0_0_8px_#38bdf8]" />
          </div>

          <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-36 shrink-0 flex items-center justify-end">
            <svg
              className="w-full h-full"
              viewBox="0 0 320 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0b172a" />
                  <stop offset="30%" stopColor="#1e293b" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#034b75" />
                </linearGradient>
                <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="280" cy="30" r="45" fill="url(#lampGlow)" />
              <rect x="30" y="70" width="85" height="50" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <rect x="34" y="74" width="77" height="42" rx="2" fill="url(#laptopScreen)" />
              <path d="M 45,95 L 65,85 L 85,100 L 100,90" stroke="#7dd3fc" strokeWidth="1.5" fill="none" opacity="0.8" />
              <path d="M 20,120 L 125,120 L 120,126 L 25,126 Z" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

              <rect x="135" y="75" width="22" height="38" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <line x1="140" y1="75" x2="135" y2="55" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="146" y1="75" x2="146" y2="50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="152" y1="75" x2="158" y2="54" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

              <g transform="translate(180, 96)">
                <rect x="0" y="0" width="115" height="20" rx="2.5" fill="url(#bookGrad)" stroke="#334155" strokeWidth="0.8" />
                <line x1="8" y1="1" x2="8" y2="19" stroke="#64748b" strokeWidth="1" />
                <line x1="107" y1="1" x2="107" y2="19" stroke="#64748b" strokeWidth="1" />
                <text x="58" y="14" fill="#cbd5e1" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="0.5">
                  Succeed
                </text>
              </g>

              <g transform="translate(182, 74)">
                <rect x="0" y="0" width="111" height="20" rx="2.5" fill="url(#bookGrad)" stroke="#334155" strokeWidth="0.8" />
                <line x1="8" y1="1" x2="8" y2="19" stroke="#64748b" strokeWidth="1" />
                <line x1="103" y1="1" x2="103" y2="19" stroke="#64748b" strokeWidth="1" />
                <text x="56" y="14" fill="#cbd5e1" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="0.5">
                  Improve
                </text>
              </g>

              <g transform="translate(185, 52)">
                <rect x="0" y="0" width="105" height="20" rx="2.5" fill="url(#bookGrad)" stroke="#334155" strokeWidth="0.8" />
                <line x1="8" y1="1" x2="8" y2="19" stroke="#64748b" strokeWidth="1" />
                <line x1="97" y1="1" x2="97" y2="19" stroke="#64748b" strokeWidth="1" />
                <text x="53" y="14" fill="#cbd5e1" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="0.5">
                  Practice
                </text>
              </g>

              <g transform="translate(188, 30)">
                <rect x="0" y="0" width="99" height="20" rx="2.5" fill="url(#bookGrad)" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.6" />
                <line x1="8" y1="1" x2="8" y2="19" stroke="#94a3b8" strokeWidth="1" />
                <line x1="91" y1="1" x2="91" y2="19" stroke="#94a3b8" strokeWidth="1" />
                <text x="50" y="14" fill="#f8fafc" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="0.5">
                  Learn
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FIVE REAL-TIME METRIC CARDS ROW                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: إجمالي الطلاب */}
        <div
          id="stat-card-total-students"
          onClick={() => onNavigate('students')}
          className="relative rounded-2xl bg-[#08152b] border border-[#173054] p-4 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-[0_4px_20px_rgba(0,180,255,0.15)] transition-all cursor-pointer overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>

            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-300 block">
                إجمالي الطلاب
              </span>
              <span className="text-3xl font-extrabold text-white block mt-0.5 tracking-tight font-mono">
                {totalStudentsCount}
              </span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-sky-400 mt-1">
                <span>طالب مسجل</span>
              </div>
            </div>
          </div>

          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full" viewBox="0 0 160 30" fill="none" preserveAspectRatio="none">
              <path
                d="M 0,22 C 20,24 35,12 60,18 C 85,24 110,8 135,16 C 145,20 155,14 160,12"
                stroke="#00f0ff"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: المجموعات */}
        <div
          id="stat-card-total-groups"
          onClick={() => onNavigate('groups')}
          className="relative rounded-2xl bg-[#0c1329] border border-[#231b4e] p-4 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)] transition-all cursor-pointer overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>

            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-300 block">
                المجموعات
              </span>
              <span className="text-3xl font-extrabold text-white block mt-0.5 tracking-tight font-mono">
                {totalGroupsCount}
              </span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-purple-400 mt-1">
                <span>مجموعة نشطة</span>
              </div>
            </div>
          </div>

          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full" viewBox="0 0 160 30" fill="none" preserveAspectRatio="none">
              <path
                d="M 0,20 C 25,18 45,25 70,16 C 95,8 115,22 140,14 C 150,11 155,15 160,12"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: حصص ومواعيد */}
        <div
          id="stat-card-today-lessons"
          onClick={() => onNavigate('schedule')}
          className="relative rounded-2xl bg-[#081e24] border border-[#12383c] p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)] transition-all cursor-pointer overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-300 block">
                مواعيد الحصص
              </span>
              <span className="text-3xl font-extrabold text-white block mt-0.5 tracking-tight font-mono">
                {todaySessionsCount}
              </span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-400 mt-1">
                <span>موعد مجدول</span>
              </div>
            </div>
          </div>

          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full" viewBox="0 0 160 30" fill="none" preserveAspectRatio="none">
              <path
                d="M 0,22 C 30,25 50,10 75,17 C 100,24 125,10 145,15 C 152,17 156,12 160,10"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: إجمالي المدفوعات */}
        <div
          id="stat-card-total-payments"
          onClick={() => onNavigate('payments')}
          className="relative rounded-2xl bg-[#1c180e] border border-[#3b2e17] p-4 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-[0_4px_20px_rgba(245,158,11,0.15)] transition-all cursor-pointer overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>

            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-300 block">
                إجمالي المدفوعات
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white block mt-0.5 tracking-tight font-mono">
                {totalPaymentsAmount.toLocaleString('en-US')}
              </span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-400 mt-1">
                <span>ج.م محصلة</span>
              </div>
            </div>
          </div>

          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full" viewBox="0 0 160 30" fill="none" preserveAspectRatio="none">
              <path
                d="M 0,24 C 25,26 40,16 65,22 C 90,28 115,12 135,18 C 145,21 155,14 160,11"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Card 5: المبالغ المتبقية */}
        <div
          id="stat-card-total-remaining"
          onClick={() => onNavigate('payments')}
          className="relative rounded-2xl bg-[#200f1c] border border-[#3d182b] p-4 flex flex-col justify-between hover:border-rose-500/50 hover:shadow-[0_4px_20px_rgba(244,63,94,0.15)] transition-all cursor-pointer overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-400 flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5" />
            </div>

            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-300 block">
                المبالغ المتبقية
              </span>
              <span className="text-3xl font-extrabold text-white block mt-0.5 tracking-tight font-mono">
                {totalRemainingAmount.toLocaleString('en-US')}
              </span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-rose-400 mt-1">
                <span>ج.م للتحصيل</span>
              </div>
            </div>
          </div>

          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full" viewBox="0 0 160 30" fill="none" preserveAspectRatio="none">
              <path
                d="M 0,23 C 20,24 40,18 65,22 C 90,26 110,12 135,16 C 145,18 152,14 160,11"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO MAIN DATA TABLES (مواعيد الحصص + آخر المدفوعات)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* TABLE 1: حصص اليوم */}
        <div
          id="dashboard-today-sessions-card"
          className="rounded-2xl bg-[#08152b] border border-[#173054] p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-[#142642]">
            <button
              id="view-all-today-sessions-btn"
              type="button"
              onClick={() => onNavigate('schedule')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              عرض الجدول الكامل
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">حصص ومواعيد المجموعات</h3>
              <CalendarCheck className="w-4 h-4 text-sky-400" />
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-[#12233c]">
                  <th className="py-2.5 px-3 text-center">عدد الطلاب</th>
                  <th className="py-2.5 px-3">الكورس</th>
                  <th className="py-2.5 px-3">المجموعة</th>
                  <th className="py-2.5 px-3">الموعد</th>
                  <th className="py-2.5 px-1 w-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102038]">
                {todaySessionsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      لا توجد حصص مجدولة حالياً. يمكنك إضافة مجموعات أو مواعيد من صفحة الجدول.
                    </td>
                  </tr>
                ) : (
                  todaySessionsData.map((ses) => (
                    <tr
                      key={ses.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onNavigate('schedule')}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-200 font-mono">
                        {ses.studentsCount}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-200">{ses.course}</td>
                      <td className="py-3 px-3 text-slate-300 font-semibold">{ses.groupName}</td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{ses.time}</td>
                      <td className="py-3 px-1 text-center">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shadow-[0_0_6px_currentColor]"
                          style={{ backgroundColor: ses.dotColor, color: ses.dotColor }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLE 2: آخر المدفوعات */}
        <div
          id="dashboard-recent-payments-card"
          className="rounded-2xl bg-[#08152b] border border-[#173054] p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3.5 border-b border-[#142642]">
            <button
              id="view-all-recent-payments-btn"
              type="button"
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              عرض سجل المدفوعات
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">آخر المقبوضات</h3>
              <CreditCard className="w-4 h-4 text-sky-400" />
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-[#12233c]">
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3 text-center">المبلغ</th>
                  <th className="py-2.5 px-3">الطالب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102038]">
                {recentPaymentsData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      لا توجد مدفوعات مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  recentPaymentsData.map((pay) => (
                    <tr
                      key={pay.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => onNavigate('payments')}
                    >
                      <td className="py-3 px-3 text-slate-300 font-medium font-mono">{pay.date}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400 font-mono">
                        {pay.amount} ج.م
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${pay.avatarColor} shrink-0`}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-100">{pay.studentName}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM THREE CARDS (إحصائيات المجموعات + توزيع الكورسات + مواعيد مهمة) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: إحصائيات سريعة */}
        <div
          id="dashboard-quick-stats-card"
          className="rounded-2xl bg-[#08152b] border border-[#173054] p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#142642]">
            <div className="relative">
              <button
                type="button"
                id="btn-stats-period-filter"
                onClick={() => setStatsDropdownOpen(!statsDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#09152b] border border-[#1b3459] text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3 h-3 text-slate-400" />
                <span>{statsPeriod}</span>
              </button>

              {statsDropdownOpen && (
                <div className="absolute left-0 mt-1 w-28 bg-[#09152b] border border-[#1b3459] rounded-lg shadow-xl z-20 p-1 text-right text-xs">
                  {['هذا الأسبوع', 'الشهر الحالي', 'العام الحالي'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setStatsPeriod(opt);
                        setStatsDropdownOpen(false);
                      }}
                      className="px-2 py-1.5 hover:bg-slate-800 rounded text-slate-200 cursor-pointer"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">توزيع أيام الحصص</h4>
              <BarChart3 className="w-4 h-4 text-sky-400" />
            </div>
          </div>

          <div className="mt-4 pt-2">
            <div className="relative h-44 flex items-end justify-between px-2">
              <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-500 font-medium select-none pr-1">
                <span>40</span>
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>

              <div className="absolute inset-x-8 top-0 bottom-6 flex flex-col justify-between pointer-events-none opacity-15">
                <div className="border-b border-slate-600 w-full" />
                <div className="border-b border-slate-600 w-full" />
                <div className="border-b border-slate-600 w-full" />
                <div className="border-b border-slate-600 w-full" />
                <div className="border-b border-slate-600 w-full" />
              </div>

              <div className="w-full flex items-end justify-around pr-8 pl-1 pb-6 h-full">
                {barData.map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-2 group">
                    <div
                      className="relative w-5 sm:w-6 rounded-t-md bg-[#0066ff] bg-gradient-to-t from-[#0055ee] to-[#00d4ff] hover:from-[#0066ff] hover:to-[#55f0ff] transition-all shadow-[0_0_12px_rgba(0,180,255,0.3)] cursor-pointer"
                      style={{ height: `${(item.height / 40) * 125}px` }}
                      title={`${item.day}: ${item.value} مجموعة`}
                    />
                    <span className="text-[10px] text-slate-400 group-hover:text-sky-300 transition-colors">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: توزيع الطلاب على الكورسات */}
        <div
          id="dashboard-course-distribution-card"
          className="rounded-2xl bg-[#08152b] border border-[#173054] p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="pb-3 border-b border-[#142642] text-right">
            <h4 className="text-sm font-bold text-white">توزيع الطلاب على الكورسات</h4>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4">
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {courseDistribution.map((item, idx) => {
                  const accumulatedPct = courseDistribution
                    .slice(0, idx)
                    .reduce((sum, curr) => sum + curr.pct, 0);
                  const dashOffset = -((accumulatedPct / 100) * 282.7);
                  const dashLength = (item.pct / 100) * 282.7;

                  return (
                    <circle
                      key={item.name}
                      cx="60"
                      cy="60"
                      r="45"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="16"
                      strokeDasharray={`${dashLength} 282.7`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-white tracking-tight font-mono">
                  {totalStudentsCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">طالب</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-xs text-right">
              {courseDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-300 text-[11px] font-mono">{item.pct}%</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-200 text-[11px] truncate max-w-[100px]">{item.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: مواعيد مهمة */}
        <div
          id="dashboard-important-events-card"
          className="rounded-2xl bg-[#08152b] border border-[#173054] p-5 shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-end gap-2 pb-3 border-b border-[#142642]">
            <h4 className="text-sm font-bold text-white">مواعيد مهمة</h4>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>

          <div className="mt-3 space-y-2.5 flex-1 flex flex-col justify-center">
            {importantEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0a1832] border border-[#172e4f] hover:border-sky-500/40 transition-colors select-none"
              >
                <span className="text-xs font-medium text-slate-400 font-mono">{ev.date}</span>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-100">{ev.title}</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
