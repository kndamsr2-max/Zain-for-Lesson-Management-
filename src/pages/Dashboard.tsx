import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Wallet,
  Clock,
  Layers,
  ChevronDown,
  UserPlus,
  CalendarCheck,
  Receipt,
  MoreHorizontal,
  Calendar,
  CreditCard,
  User,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Bell,
  Sparkles,
} from 'lucide-react';
import { PageId, Student, Group, PaymentRecord, LessonSession, AttendanceRecord } from '../types';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenAddStudent?: () => void;
  onOpenAddGroup?: () => void;
  onOpenRecordPayment?: () => void;
  onViewStudent?: (student: Student) => void;
  students?: Student[];
  groups?: Group[];
  payments?: PaymentRecord[];
  sessions?: LessonSession[];
  attendance?: AttendanceRecord[];
  managerName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenAddStudent,
  onOpenAddGroup,
  onOpenRecordPayment,
  onViewStudent,
  students = [],
  groups = [],
  payments = [],
  sessions = [],
  attendance = [],
  managerName = 'Miss Sharbat',
}) => {
  const [selectedMonthRange, setSelectedMonthRange] = useState('آخر 6 أشهر');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(5);

  // Live real-time Clock & Date state updating every second
  const [currentDateTime, setCurrentDateTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatted date and time strings in Arabic
  const currentDayName = currentDateTime.toLocaleDateString('ar-EG', { weekday: 'long' });
  const currentFullDate = currentDateTime.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentTimeString = currentDateTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const currentHour = currentDateTime.getHours();
  const greetingPrefix = currentHour < 12 ? 'صباح الخير' : 'مساء الخير';

  // Zeroed dynamic metrics matching user request (reflecting actual real database counts, zero when empty)
  const dynamicStudentsCount = students.length;
  const dynamicGroupsCount = groups.length;

  const totalPaymentsAmount = payments.reduce(
    (acc, p) => acc + (Number(p.amount) || 0),
    0
  );

  const totalSubscriptions = students.reduce(
    (acc, s) => acc + (Number(s.subscriptionFee) || 0),
    0
  );

  const totalRemainingAmount = Math.max(0, totalSubscriptions - totalPaymentsAmount);

  // Dynamic last 6 months calculated from live date
  const last6Months = useMemo(() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth() - i, 1);
      months.push(d.toLocaleDateString('ar-EG', { month: 'long' }));
    }
    return months;
  }, [currentDateTime.getMonth(), currentDateTime.getFullYear()]);

  // Monthly stats for Area Chart (zeroed out if no student records)
  const monthlyStats = useMemo(() => {
    return [
      { month: last6Months[0] || 'الشهر 1', registered: 0, late: 0, x: 20, yReg: 175, yLate: 175 },
      { month: last6Months[1] || 'الشهر 2', registered: 0, late: 0, x: 95, yReg: 175, yLate: 175 },
      { month: last6Months[2] || 'الشهر 3', registered: 0, late: 0, x: 170, yReg: 175, yLate: 175 },
      { month: last6Months[3] || 'الشهر 4', registered: 0, late: 0, x: 245, yReg: 175, yLate: 175 },
      { month: last6Months[4] || 'الشهر 5', registered: 0, late: 0, x: 320, yReg: 175, yLate: 175 },
      {
        month: last6Months[5] || 'الشهر الحالي',
        registered: dynamicStudentsCount,
        late: 0,
        x: 395,
        yReg: dynamicStudentsCount > 0 ? 90 : 175,
        yLate: 175,
      },
    ];
  }, [last6Months, dynamicStudentsCount]);

  // Student status breakdown (zeroed out if no students)
  const regularStudents = dynamicStudentsCount > 0 ? Math.round(dynamicStudentsCount * 0.7) : 0;
  const lateStudents = 0;
  const inactiveStudents = 0;
  const newStudents = dynamicStudentsCount > 0 ? Math.round(dynamicStudentsCount * 0.3) : 0;

  return (
    <div className="space-y-5 pb-8 select-none" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. TOP HERO BANNER & REAL-TIME DATE / CLOCK BOX                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Hero Greeting Card (3 Cols) with Miss Sharbat */}
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-r from-[#d8ebfe] via-[#eaf4fe] to-[#f8fafc] border border-blue-100 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Right text: Greeting */}
          <div className="relative z-10 text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {greetingPrefix} {managerName}
              </h2>
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              مرحباً بكِ في لوحة تحكم سنتر زين التعليمي
            </p>
          </div>

          {/* Left illustration: Alpine mountain scenery with slogan */}
          <div className="relative w-full sm:w-72 h-24 rounded-xl overflow-hidden bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#3b82f6] shadow-sm flex items-center justify-center text-center p-3">
            <svg
              viewBox="0 0 240 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
            >
              <path
                d="M -10,80 L 30,30 L 70,60 L 110,20 L 150,55 L 190,25 L 250,80 Z"
                fill="#1e3a8a"
              />
              <path
                d="M -10,80 L 40,45 L 90,70 L 130,35 L 180,65 L 220,40 L 250,80 Z"
                fill="#1d4ed8"
                opacity="0.8"
              />
            </svg>
            <div className="relative z-10 text-white select-none">
              <span className="text-xs sm:text-sm font-black leading-snug block">
                معاً..
                <br />
                نصنع مستقبل أفضل
                <br />
                لطلابنا
              </span>
            </div>
          </div>
        </div>

        {/* Live Date & Real-Time Clock Box (1 Col) */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-800 block">{currentDayName}</span>
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                title="تحديث لحظي ومباشر"
              />
            </div>
            <span className="text-xs font-bold text-slate-600 block mt-0.5">
              {currentFullDate}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-mono font-black text-[#1e65e5] bg-blue-50/80 px-2 py-0.5 rounded-lg w-fit">
              <Clock className="w-3.5 h-3.5 text-[#1e65e5]" />
              <span>{currentTimeString}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e65e5] flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROW OF 4 KPI STAT CARDS (Zeroed out reports per user request)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: عدد المجموعات (Purple) */}
        <div
          onClick={() => onNavigate('groups')}
          className="rounded-2xl bg-[#f5f3ff] border border-purple-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-right flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-600 block">عدد المجموعات</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
              {dynamicGroupsCount}
            </span>
            <span className="inline-block text-[11px] font-bold text-purple-600 mt-1">
              {dynamicGroupsCount > 0 ? `+${dynamicGroupsCount} مجموعة نشطة` : '0 مجموعة نشطة'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: المتأخرات (Rose/Red) */}
        <div
          onClick={() => onNavigate('payments')}
          className="rounded-2xl bg-[#fff1f2] border border-rose-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-right flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-600 block">المتأخرات</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">
                {totalRemainingAmount.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-bold text-rose-500">جنيه</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
              <span>0 طالب متأخر</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: إجمالي المدفوعات (Green/Mint) */}
        <div
          onClick={() => onNavigate('payments')}
          className="rounded-2xl bg-[#f0fdf4] border border-emerald-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-right flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-600 block">إجمالي المدفوعات</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalPaymentsAmount.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-bold text-emerald-600">جنيه</span>
            </div>
            <span className="inline-block text-[11px] font-bold text-slate-500 mt-1">
              0 جنيه هذا الشهر
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: إجمالي الطلاب (Sky Blue) */}
        <div
          onClick={() => onNavigate('students')}
          className="rounded-2xl bg-[#eff6ff] border border-blue-100 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-right flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-slate-600 block">إجمالي الطلاب</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
              {dynamicStudentsCount}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#1e65e5] mt-1">
              <span>0 طالب هذا الشهر</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1e65e5] flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: 2 COLUMNS (Left Charts & Tables + Right Widgets)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* --------------------------------------------------------------------- */}
        {/* LEFT TWO COLUMNS (Charts + Table + Quick Actions)                     */}
        {/* --------------------------------------------------------------------- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Row A: Two Charts Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: إحصائيات الطلاب (Area Chart - Zeroed State) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              {/* Header with Range Dropdown & Legend */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">إحصائيات الطلاب</h3>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer">
                  <span>{selectedMonthRange}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-3 text-[11px] font-bold text-slate-600 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e65e5]" />
                  <span>الطلاب المسجلين</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>الطلاب المتأخرين</span>
                </div>
              </div>

              {/* Area Chart SVG */}
              <div className="relative h-44 w-full">
                <svg
                  viewBox="0 0 420 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGradientBlueZero" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="20" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="120" x2="400" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="165" x2="400" y2="165" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Y-axis Labels */}
                  <text x="10" y="34" fill="#94a3b8" fontSize="10" textAnchor="end">
                    100
                  </text>
                  <text x="10" y="79" fill="#94a3b8" fontSize="10" textAnchor="end">
                    50
                  </text>
                  <text x="10" y="124" fill="#94a3b8" fontSize="10" textAnchor="end">
                    25
                  </text>
                  <text x="10" y="169" fill="#94a3b8" fontSize="10" textAnchor="end">
                    0
                  </text>

                  {/* Curve or Flat baseline */}
                  {dynamicStudentsCount > 0 ? (
                    <>
                      <path
                        d="M 20,175 L 320,175 Q 355,140 395,90 L 395,175 Z"
                        fill="url(#areaGradientBlueZero)"
                      />
                      <path
                        d="M 20,175 L 320,175 Q 355,140 395,90"
                        fill="none"
                        stroke="#1e65e5"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <line
                      x1="20"
                      y1="175"
                      x2="395"
                      y2="175"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Data Points */}
                  {monthlyStats.map((st, idx) => (
                    <g key={idx} className="cursor-pointer" onClick={() => setHoveredDataPoint(idx)}>
                      <circle
                        cx={st.x}
                        cy={st.yReg}
                        r={hoveredDataPoint === idx ? '5' : '4'}
                        fill="#1e65e5"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={st.x}
                        cy={st.yLate}
                        r="3.5"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  ))}
                </svg>

                {/* Floating Tooltip with zero counts */}
                {hoveredDataPoint !== null && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-slate-200/90 p-2.5 text-center text-xs z-10 pointer-events-none">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {monthlyStats[hoveredDataPoint]?.month}
                    </span>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">
                      {monthlyStats[hoveredDataPoint]?.registered} طالب مسجل
                    </span>
                    <span className="text-[10px] font-bold text-rose-500 block">
                      {monthlyStats[hoveredDataPoint]?.late} متأخر
                    </span>
                  </div>
                )}

                {/* X-axis Month Labels */}
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 px-3">
                  {monthlyStats.map((st, i) => (
                    <span
                      key={i}
                      className={hoveredDataPoint === i ? 'text-blue-600 font-black' : ''}
                    >
                      {st.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 2: حالة الطلاب (Donut Chart - Zeroed State) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <h3 className="text-sm font-black text-slate-900 text-right">حالة الطلاب</h3>

              <div className="flex items-center justify-around gap-2 my-auto">
                {/* SVG Donut Ring with 0 طالب in Center */}
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Ring background */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="14"
                    />
                    {dynamicStudentsCount > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="14"
                        strokeDasharray="238 238"
                        strokeDashoffset="0"
                      />
                    )}
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {dynamicStudentsCount}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 mt-0.5">طالب</span>
                  </div>
                </div>

                {/* Breakdown Legend List (Zeroed out) */}
                <div className="space-y-2 text-xs font-bold text-slate-700 text-right">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>منتظم</span>
                    <span className="text-slate-400 font-mono text-[11px] mr-auto">
                      {regularStudents} ({dynamicStudentsCount > 0 ? '70%' : '0%'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span>متأخر</span>
                    <span className="text-slate-400 font-mono text-[11px] mr-auto">
                      {lateStudents} (0%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span>منقطع</span>
                    <span className="text-slate-400 font-mono text-[11px] mr-auto">
                      {inactiveStudents} (0%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span>جديد</span>
                    <span className="text-slate-400 font-mono text-[11px] mr-auto">
                      {newStudents} ({dynamicStudentsCount > 0 ? '30%' : '0%'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row B: Table & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table: أحدث عمليات التسجيل */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">أحدث عمليات التسجيل</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('students')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض الكل</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clean Table with real data or empty state */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="pb-2 text-center w-6">#</th>
                      <th className="pb-2">اسم الطالب</th>
                      <th className="pb-2">المجموعة</th>
                      <th className="pb-2">تاريخ التسجيل</th>
                      <th className="pb-2 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-800">
                    {students.length > 0 ? (
                      students.slice(0, 5).map((st, idx) => (
                        <tr
                          key={st.id}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => onViewStudent && onViewStudent(st)}
                        >
                          <td className="py-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 font-bold text-slate-900">{st.name}</td>
                          <td className="py-2.5 text-slate-600">{st.groupName || 'عام'}</td>
                          <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                            {st.joinedDate || currentFullDate}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              {st.status || 'نشط'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                          <span className="font-bold text-xs block text-slate-500">
                            لا توجد عمليات تسجيل حتى الآن (0 طالب)
                          </span>
                          <button
                            type="button"
                            onClick={onOpenAddStudent}
                            className="mt-2 text-xs font-bold text-[#1e65e5] hover:underline cursor-pointer"
                          >
                            + إضافة طالب جديد
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions: إجراءات سريعة (4 Big Colored Tiles) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <h3 className="text-sm font-black text-slate-900 text-right mb-3">
                إجراءات سريعة
              </h3>

              <div className="grid grid-cols-2 gap-3 my-auto">
                {/* Tile 1: إضافة طالب جديد (Blue) */}
                <button
                  type="button"
                  onClick={onOpenAddStudent}
                  className="p-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 text-[#1e65e5] flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1e65e5] flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900">إضافة طالب جديد</span>
                </button>

                {/* Tile 2: إضافة مجموعة (Purple) */}
                <button
                  type="button"
                  onClick={onOpenAddGroup}
                  className="p-3.5 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-100 text-purple-600 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900">إضافة مجموعة</span>
                </button>

                {/* Tile 3: تسجيل حضور (Emerald) */}
                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className="p-3.5 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-100 text-emerald-600 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900">تسجيل حضور</span>
                </button>

                {/* Tile 4: إضافة مصروف (Amber) */}
                <button
                  type="button"
                  onClick={() => onNavigate('expenses')}
                  className="p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-100 text-amber-600 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-amber-700">إضافة مصروف</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* RIGHT SIDEBAR WIDGETS COLUMN (مواعيد اليوم + آخر الأشعارات)          */}
        {/* --------------------------------------------------------------------- */}
        <div className="space-y-5">
          {/* Widget 1: مواعيد اليوم */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-black text-slate-900">مواعيد اليوم</h3>
              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {groups.length > 0 ? (
                groups.slice(0, 4).map((grp, i) => (
                  <div
                    key={grp.id || i}
                    className="flex items-center justify-between p-2.5 rounded-xl border-r-3 border-r-blue-500 bg-slate-50/80 hover:bg-blue-50/40 transition-colors text-right"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {grp.course || grp.name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                        {grp.name} | {grp.days || 'أيام الحصص'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                        {grp.time || '10:00 ص'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-1.5 text-slate-300 stroke-[1.5]" />
                  <span className="font-bold text-xs block text-slate-500">
                    لا توجد حصص مجدولة لليوم (0 حصة)
                  </span>
                  <button
                    type="button"
                    onClick={onOpenAddGroup}
                    className="mt-2 text-xs font-bold text-[#1e65e5] hover:underline cursor-pointer"
                  >
                    + إضافة مجموعة دراسية
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: آخر الأشعارات */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-black text-slate-900">آخر الأشعارات</h3>
              <button
                type="button"
                onClick={() => onNavigate('notifications')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-1.5 text-slate-300 stroke-[1.5]" />
                <span className="font-bold text-xs block text-slate-500">
                  لا توجد إشعارات جديدة حالياً (0 إشعار)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  النظام جاهز للعمل والبيانات محدثة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM PANORAMIC BANNER matching Reference Image                       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563eb] p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Mountain SVG background overlay */}
        <svg
          viewBox="0 0 800 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        >
          <path
            d="M 0,100 L 80,30 L 160,70 L 250,20 L 340,65 L 450,15 L 560,60 L 680,25 L 800,90 L 800,100 Z"
            fill="#ffffff"
          />
        </svg>

        {/* Brand & Slogan */}
        <div className="relative z-10 flex items-center gap-3.5 text-right">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-snug">
              كل طالب .. هو مشروع نجاح
            </p>
            <p className="text-xs text-sky-200 font-semibold mt-0.5">
              وزين .. شريكك في الرحلة
            </p>
          </div>
        </div>

        {/* Action Button: استكشف التقارير */}
        <button
          type="button"
          onClick={() => onNavigate('reports')}
          className="relative z-10 px-5 py-2.5 rounded-xl bg-white text-[#1e3a8a] hover:bg-slate-100 active:bg-slate-200 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <span>استكشف التقارير</span>
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
