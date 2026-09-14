import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
  Users,
  BarChart3,
  ShieldCheck,
  Zap,
  LogIn,
  Check,
  AlertCircle,
  Loader2,
  Database,
  QrCode,
  Minus,
  Square,
  X,
  Sparkles,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { SupabaseStatusModal } from '../components/SupabaseStatusModal';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Form State
  const [userId, setUserId] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = userId.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور للمتابعة');
      return;
    }

    // Verify credentials
    const validUsers = ['admin', 'zain', 'teacher', 'director', 'manager', 'st-1001'];
    const isValidUser = validUsers.includes(trimmedUser) || trimmedUser.startsWith('st-');
    const isValidPass =
      trimmedPass === '123456' || trimmedPass === 'admin123' || trimmedPass === 'zain2026';

    if (!isValidUser || !isValidPass) {
      setErrorMessage(
        'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى استخدام بيانات الدخول المعتمدة (admin / 123456).'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 400);
  };

  const handleQuickFill = () => {
    setUserId('admin');
    setPassword('123456');
    setErrorMessage(null);
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#0a1120] text-slate-800 flex flex-col justify-between overflow-x-hidden font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* 1. DESKTOP WINDOW TITLE BAR & APP CONTROLS (Top-Right like screenshot)   */}
      {/* ========================================================================= */}
      <div className="relative z-40 w-full px-5 pt-3 pb-1 flex items-center justify-between pointer-events-auto">
        {/* Left header: Subtle Database Status & Demo helper */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSupabaseModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title="فحص الاتصال بقاعدة بيانات Supabase"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-sky-400'
              }`}
            />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'قاعدة البيانات متصلة' : 'سحابة Supabase'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleQuickFill}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[11px] font-semibold text-sky-300 hover:text-sky-200 transition-all cursor-pointer shadow-xs"
            title="تعبئة بيانات الحساب المعتمد (admin / 123456)"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">بيانات تجريبية</span>
          </button>
        </div>

        {/* Right header: Language Pill + Desktop Window Controls (— ▢ ✕) matching Screenshot */}
        <div className="flex items-center gap-3">
          {/* Language Selector Pill in Dark Glass matching Screenshot */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/65 hover:bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-slate-100 shadow-xs cursor-pointer transition-all">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>العربية</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Windows Frame Controls */}
          <div className="flex items-center gap-1 text-slate-300">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              title="تصغير"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              title="تكبير"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rose-500/25 hover:text-rose-400 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REALISTIC BACKGROUND SCENERY (Executive Educational Office Twilight)   */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Atmospheric Navy Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080e1d] via-[#0a1428] to-[#060b16]" />

        {/* Ceiling Warm Ambient Pendant Lights */}
        <div className="absolute top-2 left-1/4 w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_40px_18px_rgba(251,191,36,0.3)]" />
        <div className="absolute top-6 left-1/2 w-2.5 h-2.5 rounded-full bg-amber-100 shadow-[0_0_35px_15px_rgba(251,191,36,0.2)]" />
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-gradient-to-b from-sky-400/10 via-amber-200/5 to-transparent blur-3xl" />

        {/* Wall Plaque in Background: "Better Students Brighter Futures" */}
        <div className="absolute top-24 left-[28%] text-left opacity-35 select-none hidden 2xl:block">
          <div className="px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/40 backdrop-blur-xs">
            <span className="block text-[13px] font-extrabold uppercase tracking-widest text-slate-300 leading-tight">
              Better
              <br />
              Students
              <br />
              Brighter
              <br />
              Futures
            </span>
          </div>
        </div>

        {/* Background Bokeh / Lighting Spheres */}
        <div className="absolute top-36 left-1/3 w-32 h-32 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-52 right-1/3 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-28 right-16 w-36 h-36 rounded-full bg-amber-300/10 blur-2xl" />

        {/* Executive Polished Wooden Desk Surface in foreground */}
        <div className="absolute bottom-0 inset-x-0 h-[220px] bg-gradient-to-t from-[#140d08] via-[#241710] to-[#342217] border-t border-[#4d3322]/60 shadow-2xl">
          {/* Wood grain sheen and edge light reflection */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#8a5d3b]/50 to-transparent" />
          <div className="absolute top-1 inset-x-0 h-14 bg-gradient-to-b from-[#5c3e2c]/35 to-transparent" />

          {/* Ceramic Black Coffee Mug with white Zain Graduation Cap & "زين" */}
          <div className="absolute bottom-16 left-[22%] sm:left-[24%] hidden md:flex w-18 h-20 rounded-2xl bg-gradient-to-br from-[#242426] via-[#161618] to-[#0a0a0c] border border-slate-700/60 shadow-[0_12px_28px_rgba(0,0,0,0.85)] flex-col items-center justify-center">
            {/* Mug Rim Highlight */}
            <div className="absolute top-1 inset-x-2 h-2 rounded-full bg-[#35353a]/80 border-t border-slate-500/50" />
            {/* Logo printed on mug */}
            <div className="relative mt-2 flex flex-col items-center">
              {/* Mini cap */}
              <div className="w-3.5 h-2.5 mb-0.5">
                <svg viewBox="0 0 100 80" fill="none" className="w-full h-full">
                  <path d="M 50,14 L 88,34 L 50,54 L 12,34 Z" fill="#38bdf8" />
                  <path d="M 28,44 Q 50,60 72,44 L 72,54 Q 50,70 28,54 Z" fill="#0284c7" />
                </svg>
              </div>
              <span className="text-xs font-black text-white tracking-wider drop-shadow-xs">
                زين
              </span>
            </div>
            {/* Mug Handle */}
            <div className="absolute -left-2.5 top-4 w-3.5 h-11 rounded-l-xl border-2 border-slate-700/70 bg-[#161618]" />
          </div>

          {/* Stack of 4 Hardcover Textbooks: Learn, Plan, Achieve, A Brighter Future */}
          <div className="absolute bottom-8 left-[30%] sm:left-[32%] hidden lg:flex w-40 flex-col gap-1 select-none">
            {/* Book 1: Learn */}
            <div className="h-7 rounded-sm bg-[#1e293b] border border-slate-600/70 shadow-md flex items-center justify-between px-3 text-[10px] font-bold text-slate-200 tracking-wider">
              <span>Learn</span>
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            {/* Book 2: Plan */}
            <div className="h-7 rounded-sm bg-[#1e1b4b] border border-indigo-700/60 shadow-md flex items-center justify-between px-3 text-[10px] font-bold text-indigo-200 tracking-wider">
              <span>Plan</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
            {/* Book 3: Achieve */}
            <div className="h-7 rounded-sm bg-[#064e3b] border border-emerald-700/60 shadow-md flex items-center justify-between px-3 text-[10px] font-bold text-emerald-200 tracking-wider">
              <span>Achieve</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            {/* Book 4: A Brighter Future */}
            <div className="h-8 rounded-sm bg-[#0f172a] border border-slate-700 shadow-lg flex items-center justify-between px-3 text-[10px] font-bold text-sky-300 tracking-wider">
              <span>A Brighter Future</span>
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
          </div>

          {/* Spiral Wire Notebook + Sleek Pen with handwritten text */}
          <div className="absolute bottom-6 left-[8%] sm:left-[10%] hidden xl:block w-44 h-24 rounded-lg bg-[#faf8f5] shadow-xl border border-stone-300 -rotate-2 p-2.5">
            <div className="space-y-1">
              <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                معاً ..
              </span>
              <span className="block text-[11px] font-bold text-[#1e65e5] leading-tight">
                نصنع مستقبل أفضل
              </span>
              <div className="h-1 bg-stone-200 rounded w-full mt-1" />
              <div className="h-1 bg-stone-200 rounded w-4/5" />
            </div>
            {/* Wire Binding top edge */}
            <div className="absolute -top-1 inset-x-2 flex justify-between">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1.5 h-2.5 rounded-full bg-slate-600 border border-slate-800" />
              ))}
            </div>
            {/* Sleek Pen lying on notebook */}
            <div className="absolute -bottom-1 -right-3 w-22 h-2 rounded-full bg-slate-900 border border-slate-600 shadow-sm rotate-12" />
          </div>

          {/* Modern Slim Laptop on Desk */}
          <div className="absolute bottom-4 left-[44%] hidden 2xl:block w-44 h-28 select-none">
            {/* Laptop Display */}
            <div className="w-40 h-24 mx-auto rounded-t-lg bg-slate-900 border border-slate-700 p-1 shadow-2xl relative overflow-hidden">
              <div className="w-full h-full rounded-sm bg-[#0a1529] p-1.5 flex flex-col justify-between border border-sky-500/20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-rose-400" />
                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[6px] font-mono text-sky-400 font-bold">ZEIN DASHBOARD</span>
                </div>
                <div className="flex items-end gap-1 h-8 px-1">
                  <div className="w-2 h-3 bg-sky-500/60 rounded-xs" />
                  <div className="w-2 h-6 bg-blue-500 rounded-xs" />
                  <div className="w-2 h-4 bg-sky-400/80 rounded-xs" />
                  <div className="w-2 h-7 bg-sky-300 rounded-xs" />
                  <div className="w-2 h-5 bg-indigo-500 rounded-xs" />
                </div>
              </div>
            </div>
            {/* Laptop Base */}
            <div className="w-44 h-2.5 -mt-0.5 rounded-b-md bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 shadow-lg border-t border-slate-500 flex items-center justify-center">
              <div className="w-8 h-0.5 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Bottom Right Soft Curved Wave Accent matching screenshot */}
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-gradient-to-tr from-sky-400/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE: 3 DISTINCT AREAS (Left Branding, Center Card, Right)   */}
      {/* ========================================================================= */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-3 sm:py-5">
        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 mx-auto">
          
          {/* ===================================================================== */}
          {/* 1. LEFT SIDE — BRANDING & MARKETING (~40% on Desktop)                 */}
          {/* ===================================================================== */}
          <div className="w-full lg:w-[38%] xl:w-[40%] flex flex-col justify-between py-2 text-right select-none order-2 lg:order-1">
            {/* Top Branding Block */}
            <div>
              {/* Zain Logo with 3D Cyan-Blue Graduation Cap */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <svg
                    width="44"
                    height="40"
                    viewBox="0 0 100 90"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_4px_12px_rgba(56,189,248,0.5)]"
                  >
                    <path
                      d="M 28,44 Q 50,60 72,44 L 72,56 Q 50,72 28,56 Z"
                      fill="#0284c7"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 50,14 L 88,34 L 50,54 L 12,34 Z"
                      fill="url(#capTopGradLeft)"
                      stroke="#bae6fd"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 12,34 L 50,14 L 88,34"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeOpacity="0.9"
                    />
                    <path
                      d="M 50,34 Q 68,38 72,54"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="72" cy="56" r="3.5" fill="#0284c7" />
                    <defs>
                      <linearGradient id="capTopGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#1e65e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex flex-col items-start">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                      زين
                    </h2>
                    <span className="text-[10px] font-black tracking-[0.3em] text-sky-400 font-mono">
                      Z E I N
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-1">
                    نظام إدارة السناتر التعليمية
                  </span>
                </div>
              </div>

              {/* Big Typography matching screenshot */}
              <div className="mt-7">
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white leading-[1.25] tracking-tight">
                  مستقبل التعليم
                  <br />
                  <span>يبدأ </span>
                  <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
                    من هنا ..
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-2.5">
                  إدارة أسهل .. نتائج أفضل .. مع زين
                </p>
              </div>

              {/* 4 Feature Bullet Points with Icons matching screenshot */}
              <div className="mt-6 space-y-3 max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    إدارة الطلاب والمجموعات
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    متابعة المدفوعات والمصروفات
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    تقارير دقيقة وفورية
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    جدول دراسي مرن
                  </span>
                </div>
              </div>

              {/* Philosophical Educational Quote */}
              <div className="mt-7 pr-3 border-r-2 border-sky-500/50">
                <p className="text-xs sm:text-sm font-semibold text-slate-300 italic leading-relaxed">
                  "التعليم ليس إعداداً للحياة
                  <br />
                  بل هو الحياة نفسها"
                </p>
              </div>
            </div>

            {/* Bottom Left Version & Copyright */}
            <div className="mt-8 text-slate-400 text-[11px] font-mono select-none">
              <span className="block font-bold text-slate-300">Zein v1.0.0</span>
              <span className="block text-slate-500 text-[10px] mt-0.5">
                جميع الحقوق محفوظة {new Date().getFullYear()} ©
              </span>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 2. CENTER — GRAND LOGIN CARD (~40% on Desktop, Focal Point)          */}
          {/* ===================================================================== */}
          <div
            id="login-main-card"
            className="w-full sm:w-[480px] lg:w-[40%] xl:w-[42%] max-w-[540px] bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6),0_12px_36px_rgba(0,0,0,0.25)] border border-white/95 relative animate-in zoom-in-95 duration-200 select-none order-1 lg:order-2 shrink-0"
          >
            {/* ----------------------------------------------------------------- */}
            {/* Card Top: 3D Graduation Cap + Z E I N Branding + Center Title     */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col items-center text-center">
              {/* 3D Cyan-Blue Graduation Cap Logo + زين */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative shrink-0">
                  <svg
                    width="48"
                    height="42"
                    viewBox="0 0 100 90"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_6px_14px_rgba(30,101,229,0.45)]"
                  >
                    <path
                      d="M 28,44 Q 50,60 72,44 L 72,56 Q 50,72 28,56 Z"
                      fill="#0369a1"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 50,14 L 88,34 L 50,54 L 12,34 Z"
                      fill="url(#capTopGradLoginCenter)"
                      stroke="#e0f2fe"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 12,34 L 50,14 L 88,34"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                    />
                    <path
                      d="M 50,34 Q 68,38 72,54"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="72" cy="56" r="3.5" fill="#0284c7" />
                    <defs>
                      <linearGradient id="capTopGradLoginCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="45%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#1e65e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex flex-col items-start">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                    زين
                  </h3>
                  <span className="text-[10px] font-black tracking-[0.35em] text-slate-800 mr-0.5 mt-1 font-mono">
                    Z E I N
                  </span>
                </div>
              </div>

              {/* Sub-titles matching reference image */}
              <h4 className="text-base sm:text-lg font-black text-slate-900 mt-3">
                نظام إدارة السناتر التعليمية
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                كل ما تحتاجه .. في مكان واحد
              </p>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Middle Inset Form Box matching screenshot                        */}
            {/* ----------------------------------------------------------------- */}
            <div className="mt-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="text-center mb-4">
                <h5 className="text-lg sm:text-xl font-black text-slate-900">
                  تسجيل الدخول
                </h5>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    مرحباً بك مجدداً
                  </span>
                  <span className="text-sm">👋</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  سجل دخولك للمتابعة إلى حسابك
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Field: اسم المستخدم */}
                <div className="relative flex items-center bg-slate-50/70 border border-slate-200/90 focus-within:border-[#1e65e5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e65e5]/20 rounded-xl px-3.5 py-2.5 transition-all">
                  <User className="w-4 h-4 text-slate-400 shrink-0 ml-2.5" />
                  <input
                    id="input-user-name"
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="اسم المستخدم"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 font-semibold text-right outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Field: كلمة المرور */}
                <div className="relative flex items-center bg-slate-50/70 border border-slate-200/90 focus-within:border-[#1e65e5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e65e5]/20 rounded-xl px-3.5 py-2.5 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 ml-2.5" />
                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="كلمة المرور"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-900 font-semibold text-right outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-hidden mr-2 cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Controls Row: تذكرني + نسيت كلمة المرور ؟ */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold">
                    <input
                      id="checkbox-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        rememberMe
                          ? 'bg-[#1e65e5] border-[#1e65e5] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>تذكرني</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="font-bold text-[#1e65e5] hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور ؟
                  </button>
                </div>

                {/* Primary Button: دخول */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-[#1e65e5] hover:bg-[#1a57c5] active:bg-[#1648a3] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحقق والدخول...</span>
                    </>
                  ) : (
                    <>
                      <span>دخول</span>
                      <LogIn className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>

                {/* Divider with "أو" */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-slate-200" />
                  <span className="absolute px-3 bg-white text-xs font-bold text-slate-400">
                    أو
                  </span>
                </div>

                {/* Secondary Option: دخول عبر QR */}
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="w-full bg-[#edf4fe] hover:bg-[#e2edfd] border border-blue-100/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-center gap-3 transition-colors cursor-pointer text-right"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#d9e9fd] text-[#1e65e5] flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                      دخول عبر QR
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight mt-0.5">
                      امسح الكود من تطبيق الجوال
                    </span>
                  </div>
                </button>
              </form>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Card Bottom Slogan matching reference image                       */}
            {/* ----------------------------------------------------------------- */}
            <div className="mt-4 text-center">
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                "كل طالب .. قصة نجاح .. ونحن جزء منها"
              </p>
              {/* Electric blue horizontal underline pill */}
              <div className="w-12 h-1 bg-[#1e65e5] rounded-full mx-auto mt-2 shadow-xs" />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. RIGHT SIDE — 4 FLOATING DARK GLASS FEATURE CARDS (~18% on Desktop) */}
          {/* ===================================================================== */}
          <div className="w-full lg:w-[18%] xl:w-[20%] flex flex-col items-center justify-between gap-4 py-2 select-none order-3">
            {/* 4 Vertical Feature Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 w-full max-w-xs lg:max-w-none">
              {/* Card 1: إدارة الطلاب بسهولة */}
              <div className="bg-slate-900/65 hover:bg-slate-900/85 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-102">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-[#38bdf8] flex items-center justify-center mb-2 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  إدارة الطلاب
                </h5>
                <span className="text-[11px] font-medium text-slate-300 mt-0.5">
                  بسهولة
                </span>
              </div>

              {/* Card 2: تقارير دقيقة وفورية */}
              <div className="bg-slate-900/65 hover:bg-slate-900/85 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-102">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-[#38bdf8] flex items-center justify-center mb-2 shadow-xs">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  تقارير دقيقة
                </h5>
                <span className="text-[11px] font-medium text-slate-300 mt-0.5">
                  وفورية
                </span>
              </div>

              {/* Card 3: بياناتك آمنة ودائماً */}
              <div className="bg-slate-900/65 hover:bg-slate-900/85 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-102">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-[#38bdf8] flex items-center justify-center mb-2 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  بياناتك آمنة
                </h5>
                <span className="text-[11px] font-medium text-slate-300 mt-0.5">
                  ودائماً
                </span>
              </div>

              {/* Card 4: دعم سريع عند الحاجة */}
              <div className="bg-slate-900/65 hover:bg-slate-900/85 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-102">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-[#38bdf8] flex items-center justify-center mb-2 shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-white leading-tight">
                  دعم سريع
                </h5>
                <span className="text-[11px] font-medium text-slate-300 mt-0.5">
                  عند الحاجة
                </span>
              </div>
            </div>

            {/* Bottom Right Slogan matching screenshot: معاً .. نصنع مستقبلاً أفضل */}
            <div className="mt-3 select-none text-right w-full flex flex-col items-end">
              <p className="text-slate-200 font-bold text-xs sm:text-sm leading-snug">
                معاً ..
                <br />
                نصنع مستقبل أفضل
              </p>
              {/* Blue curved swoosh line */}
              <svg width="100" height="12" viewBox="0 0 120 14" fill="none" className="mt-1">
                <path
                  d="M 2 10 Q 55 2 118 6"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Empty bottom bar spacer to balance layout */}
      <div className="h-4 relative z-10" />

      {/* ========================================================================= */}
      {/* 4. MODALS: FORGOT PASSWORD & QR QUICK LOGIN & SUPABASE DIAGNOSTICS        */}
      {/* ========================================================================= */}
      {/* QR Code Quick Login Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e65e5] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              الدخول السريع عبر رمز QR
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              افتح تطبيق زين من هاتفك المحمول، وقم بمسح هذا الرمز للدخول الفوري دون كتابة كلمة المرور.
            </p>

            {/* Generated QR Placeholder */}
            <div className="w-48 h-48 mx-auto bg-slate-50 border-2 border-dashed border-[#1e65e5]/40 rounded-2xl p-3 flex flex-col items-center justify-center">
              <div className="grid grid-cols-4 gap-2 w-32 h-32 p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      i % 2 === 0 || i === 5 || i === 10
                        ? 'bg-slate-900'
                        : 'bg-blue-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">
                كود جلسة آمن #ZAIN-8891
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setQrModalOpen(false);
                  onLoginSuccess();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1e65e5] hover:bg-[#1a57c5] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                تأكيد الدخول الفوري
              </button>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e65e5] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              استعادة كلمة المرور
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              يمكنك الدخول مباشرة باستخدام الحساب المعتمد:
              <br />
              اسم المستخدم:{' '}
              <span className="text-[#1e65e5] font-mono font-bold">admin</span>
              <br />
              كلمة المرور:{' '}
              <span className="text-[#1e65e5] font-mono font-bold">123456</span>
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  handleQuickFill();
                  setForgotModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#1e65e5] hover:bg-[#1a57c5] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                تعبئة البيانات والدخول فوراً
              </button>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Connection Test & Diagnostics Modal */}
      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
};
