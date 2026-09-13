import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Sun,
  Moon,
  GraduationCap,
  BarChart3,
  Users,
  LogIn,
  Check,
  AlertCircle,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { ZainLogo } from '../components/ZainLogo';
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickFillSuccess, setQuickFillSuccess] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const trimmedUser = userId.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور للمتابعة');
      return;
    }

    // Realistic button loading feedback
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 450);
  };

  const handleQuickDemoFill = () => {
    setUserId('admin');
    setPassword('123456');
    setErrorMessage(null);
    setQuickFillSuccess(true);
    setTimeout(() => setQuickFillSuccess(false), 2500);
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#050c1a] text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* 1. BACKGROUND LAYER: Educational Lab Atmosphere + Deep Ambient Depth      */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep ambient radial glows - Controlled, rich color saturation */}
        <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-[#0052cc]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-[#0066ff]/8 rounded-full blur-2xl pointer-events-none" />

        {/* Right side architectural deep navy curves */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2">
          <svg
            className="absolute right-0 top-0 h-full w-full opacity-60"
            viewBox="0 0 700 900"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M 220,0 C 370,250 480,560 700,820 L 700,0 Z"
              fill="url(#navyArcGrad1)"
            />
            <path
              d="M 60,0 C 230,320 340,660 670,900 L 700,900 L 700,0 Z"
              fill="url(#navyArcGrad2)"
            />
            <path
              d="M 220,0 C 370,250 480,560 700,820"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            />
            <defs>
              <linearGradient id="navyArcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b2247" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#040a17" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="navyArcGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#103264" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#030814" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Left Side: Modern Computer Lab Vector Graphic Atmosphere */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1/2 lg:w-[50%]">
          <svg
            className="w-full h-full object-cover opacity-90"
            viewBox="0 0 900 950"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Wood desk gradient */}
              <linearGradient id="woodDeskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e231c" />
                <stop offset="50%" stopColor="#1e1612" />
                <stop offset="100%" stopColor="#120e0b" />
              </linearGradient>

              {/* Computer screen vibrant blue glow */}
              <linearGradient id="screenBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>

              {/* Book spine gradient */}
              <linearGradient id="bookBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f1f38" />
                <stop offset="30%" stopColor="#17345e" />
                <stop offset="70%" stopColor="#0f1f38" />
                <stop offset="100%" stopColor="#060e1a" />
              </linearGradient>

              {/* Neon strip glow */}
              <linearGradient id="neonStripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              {/* Ceiling light cone */}
              <radialGradient id="ceilingWarm" cx="30%" cy="0%" r="70%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.14" />
                <stop offset="60%" stopColor="#fef08a" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#050c18" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient ceiling warm lighting */}
            <rect x="0" y="0" width="900" height="950" fill="url(#ceilingWarm)" />

            {/* Back Wall with Modern Accent Panel */}
            <path d="M 0,0 L 500,0 L 520,620 L 0,620 Z" fill="#091426" />

            {/* Vertical Glowing Blue Neon Strip on Wall */}
            <rect x="180" y="0" width="6" height="380" fill="url(#neonStripGrad)" />
            <rect
              x="172"
              y="0"
              width="22"
              height="380"
              fill="#00f0ff"
              opacity="0.2"
              filter="blur(8px)"
            />

            {/* Wall English Typography (Better Skills A Brighter Future) */}
            <g opacity="0.45" fill="#94a3b8" fontFamily="sans-serif" fontWeight="800">
              <text x="60" y="140" fontSize="34">Better</text>
              <text x="60" y="180" fontSize="34">Skills</text>
              <text x="60" y="225" fontSize="32">A Brighter</text>
              <text x="60" y="270" fontSize="32">Future</text>
            </g>

            {/* Row of Computer Lab Desks (Perspective) */}
            <path
              d="M 0,600 L 680,620 L 720,950 L 0,950 Z"
              fill="url(#woodDeskGrad)"
              stroke="#3d2f24"
              strokeWidth="1"
            />
            {/* Subtle wood surface reflection */}
            <line
              x1="0"
              y1="605"
              x2="680"
              y2="625"
              stroke="#523e30"
              strokeWidth="2"
              opacity="0.6"
            />

            {/* Background Computer 3 (Furthest) */}
            <rect x="420" y="440" width="70" height="46" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect x="424" y="444" width="62" height="38" rx="2" fill="url(#screenBlueGrad)" opacity="0.75" />
            <path d="M 452,486 L 458,500 L 450,500 Z" fill="#1e293b" />
            {/* Chair 3 */}
            <rect x="430" y="480" width="50" height="60" rx="8" fill="#1e293b" opacity="0.65" />

            {/* Background Computer 2 (Middle) */}
            <rect x="290" y="420" width="95" height="62" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <rect x="294" y="424" width="87" height="54" rx="2" fill="url(#screenBlueGrad)" opacity="0.85" />
            <path d="M 334,482 L 342,504 L 330,504 Z" fill="#1e293b" />
            {/* Chair 2 */}
            <rect x="305" y="480" width="65" height="85" rx="10" fill="#0f172a" stroke="#1e293b" />

            {/* Foreground Computer 1 (Prominent) */}
            <rect x="110" y="390" width="130" height="85" rx="6" fill="#0a0f1d" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
            <rect x="115" y="395" width="120" height="75" rx="3" fill="url(#screenBlueGrad)" />
            {/* Screen tech graphics lines */}
            <path d="M 125,430 L 155,410 L 185,445 L 220,415" stroke="#7dd3fc" strokeWidth="2.5" fill="none" opacity="0.9" />
            <circle cx="155" cy="410" r="3.5" fill="#ffffff" />
            <circle cx="185" cy="445" r="3.5" fill="#ffffff" />
            {/* Monitor Stand */}
            <path d="M 170,475 L 170,505 L 155,515 L 185,515 Z" fill="#1e293b" />
            {/* Chair 1 */}
            <rect x="125" y="490" width="85" height="110" rx="14" fill="#0b1329" stroke="#1e293b" strokeWidth="2" />
            <path d="M 135,530 C 135,510 200,510 200,530 L 200,570 C 200,585 135,585 135,570 Z" fill="#0f172a" opacity="0.5" />

            {/* --- Foreground Left: Stack of 4 Hardcover Books --- */}
            {/* Book 4: Succeed (Bottom) */}
            <g transform="translate(40, 680)">
              <rect x="0" y="0" width="150" height="28" rx="3" fill="url(#bookBlueGrad)" stroke="#334155" strokeWidth="1" />
              <line x1="12" y1="2" x2="12" y2="26" stroke="#64748b" strokeWidth="1.5" />
              <line x1="138" y1="2" x2="138" y2="26" stroke="#64748b" strokeWidth="1.5" />
              <text x="75" y="19" fill="#cbd5e1" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1">
                Succeed
              </text>
            </g>

            {/* Book 3: Improve */}
            <g transform="translate(42, 652)">
              <rect x="0" y="0" width="146" height="28" rx="3" fill="url(#bookBlueGrad)" stroke="#334155" strokeWidth="1" />
              <line x1="12" y1="2" x2="12" y2="26" stroke="#64748b" strokeWidth="1.5" />
              <line x1="134" y1="2" x2="134" y2="26" stroke="#64748b" strokeWidth="1.5" />
              <text x="73" y="19" fill="#cbd5e1" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1">
                Improve
              </text>
            </g>

            {/* Book 2: Practice */}
            <g transform="translate(45, 624)">
              <rect x="0" y="0" width="140" height="28" rx="3" fill="url(#bookBlueGrad)" stroke="#334155" strokeWidth="1" />
              <line x1="12" y1="2" x2="12" y2="26" stroke="#64748b" strokeWidth="1.5" />
              <line x1="128" y1="2" x2="128" y2="26" stroke="#64748b" strokeWidth="1.5" />
              <text x="70" y="19" fill="#cbd5e1" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1">
                Practice
              </text>
            </g>

            {/* Book 1: Learn (Top) */}
            <g transform="translate(48, 596)">
              <rect x="0" y="0" width="134" height="28" rx="3" fill="url(#bookBlueGrad)" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
              <line x1="12" y1="2" x2="12" y2="26" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="122" y1="2" x2="122" y2="26" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="67" y="19" fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle" letterSpacing="1">
                Learn
              </text>
            </g>

            {/* Pen Holder next to books */}
            <g transform="translate(100, 750)">
              <rect x="0" y="0" width="36" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <line x1="10" y1="0" x2="2" y2="-25" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <line x1="18" y1="0" x2="18" y2="-30" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              <line x1="26" y1="0" x2="34" y2="-24" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEADER CONTROLS (Top-Right / Floating)                                  */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full px-5 sm:px-8 py-4 flex items-center justify-between sm:justify-end gap-4">
        {/* Mobile quick brand mark (visible only on small screens) */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0066ff]/20 border border-[#0066ff]/40 flex items-center justify-center text-sky-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">نظام زين</span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Supabase Connection Pill */}
          <button
            id="login-supabase-status-btn"
            type="button"
            onClick={() => setSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#081730] hover:bg-[#0c234a] border border-[#1b3660] hover:border-sky-500/50 text-xs font-bold text-slate-300 hover:text-sky-300 transition-all cursor-pointer shadow-xs"
            title="فحص الاتصال بقاعدة بيانات Supabase"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400' : 'bg-sky-400'
              }`}
            />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase متصل' : 'Supabase (النمط الآمن)'}
            </span>
          </button>

          {/* Quick Demo Fill Helper Pill */}
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081730] hover:bg-[#0c234a] border border-[#1b3660] hover:border-sky-500/50 text-xs font-semibold text-sky-300 transition-all active:scale-95 cursor-pointer shadow-xs"
            title="ملء بيانات الدخول التجريبية تلقائياً"
          >
            {quickFillSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">تم الملء</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>حساب تجريبي</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div
            id="language-select-btn"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#081730]/90 border border-[#1b3660] text-xs font-bold text-slate-200 select-none shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>العربية</span>
          </div>

          {/* Dark / Light Toggle Pill */}
          <button
            id="theme-toggle-pill"
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#081730]/90 border border-[#1b3660] hover:border-sky-500/50 shadow-xs cursor-pointer transition-all active:scale-95"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="تبديل وضع السطوع"
          >
            <Sun className={`w-3.5 h-3.5 transition-colors ${!isDarkMode ? 'text-amber-400' : 'text-slate-500'}`} />
            <div className="w-4 h-4 rounded bg-[#0066ff]/20 border border-[#0066ff]/40 flex items-center justify-center">
              <Moon className="w-2.5 h-2.5 text-sky-300" />
            </div>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE: Left Atmospheric Quotes + Right Solid Login Card       */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center lg:justify-between px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto w-full py-4 sm:py-6">
        {/* ------------------------------------------------------------- */}
        {/* Left Side Atmospheric Arabic Typography & Quotes              */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col justify-between h-[580px] w-[46%] pr-4 select-none">
          {/* Top Quote: العلم يمنحك فرصاً أكبر في الحياة */}
          <div className="text-right space-y-1">
            <h3 className="text-2xl xl:text-3xl font-extrabold text-slate-200 leading-snug">
              العلم
            </h3>
            <h3 className="text-2xl xl:text-3xl font-extrabold text-slate-100 leading-snug">
              يمنحك فرصاً
            </h3>
            <h3 className="text-2xl xl:text-3xl font-black text-white leading-snug">
              أكبر في الحياة
            </h3>
            {/* Cyan accent bar */}
            <div className="w-12 h-1 bg-gradient-to-l from-[#00f0ff] to-[#0066ff] rounded-full mt-3 shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
          </div>

          {/* Lower Quote: “مستقبل أفضل” يبدأ من هنا */}
          <div className="text-right space-y-1.5">
            <h4 className="text-3xl xl:text-4xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              “مستقبل أفضل”
            </h4>
            <p className="text-lg xl:text-xl font-bold text-sky-200">
              يبدأ من هنا
            </p>
            {/* Cyan accent bar */}
            <div className="w-12 h-1 bg-gradient-to-l from-[#00f0ff] to-[#0066ff] rounded-full mt-3 shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
          </div>

          {/* Bottom Copyright */}
          <div className="text-right text-xs text-slate-400 font-medium">
            <p className="text-slate-300 font-bold">نظام زين لإدارة الدروس والسناتر ©</p>
            <p className="text-slate-400 mt-0.5">جميع الحقوق محفوظة {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Right Side: Professional Enterprise Login Card               */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full max-w-[450px] lg:max-w-[470px]">
          <div
            id="login-glass-card"
            className="relative rounded-3xl p-6 sm:p-9 bg-[#07152b] border border-[#173054] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(0,102,255,0.12)] transition-all"
          >
            {/* Top inner subtle highlight rim */}
            <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent" />

            {/* Brand Logo & Titles */}
            <ZainLogo size="md" className="mb-5" />

            {/* Error Message Alert (if any) */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: رقم المستخدم / اسم المستخدم */}
              <div>
                <label
                  htmlFor="input-user-id"
                  className="block text-xs font-bold text-slate-200 mb-1.5 text-right"
                >
                  اسم المستخدم أو كود الدخول
                </label>
                <div className="group relative flex items-center bg-[#050e1d] border border-[#1c365e] hover:border-[#2b4e85] focus-within:border-[#0070f3] focus-within:ring-2 focus-within:ring-[#0070f3]/25 focus-within:bg-[#071326] rounded-xl px-3.5 py-3 transition-all">
                  <input
                    id="input-user-id"
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="مثال: admin أو ST-1001"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 pr-1 pl-2 focus:outline-none text-right font-semibold"
                  />
                  <User className="w-5 h-5 text-slate-400 group-focus-within:text-sky-400 shrink-0 mr-1 transition-colors" />
                </div>
              </div>

              {/* Field 2: كلمة المرور */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="input-password"
                    className="text-xs font-bold text-slate-200 text-right"
                  >
                    كلمة المرور
                  </label>
                  <button
                    id="link-forgot-password"
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs text-sky-400 hover:text-sky-300 active:text-sky-200 font-bold transition-colors cursor-pointer hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="group relative flex items-center bg-[#050e1d] border border-[#1c365e] hover:border-[#2b4e85] focus-within:border-[#0070f3] focus-within:ring-2 focus-within:ring-[#0070f3]/25 focus-within:bg-[#071326] rounded-xl px-3.5 py-3 transition-all">
                  {/* Eye Toggle on Left (in RTL) */}
                  <button
                    type="button"
                    id="btn-toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 active:scale-95 transition-all shrink-0 pl-1 cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 px-2 focus:outline-none text-right font-mono tracking-wider font-semibold"
                  />

                  {/* Lock Icon on Right (in RTL) */}
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-sky-400 shrink-0 mr-1 transition-colors" />
                </div>
              </div>

              {/* Row: تذكرني Checkbox */}
              <div className="flex items-center justify-start pt-0.5 pb-1">
                <label
                  htmlFor="remember-me-checkbox"
                  className="group flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                      rememberMe
                        ? 'bg-[#0066ff] border-[#0077ff] shadow-[0_0_8px_rgba(0,102,255,0.4)] text-white'
                        : 'border-[#22416f] bg-[#050e1d] group-hover:border-sky-400'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <input
                    id="remember-me-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="font-semibold">تذكر تسجيل دخولي على هذا الجهاز</span>
                </label>
              </div>

              {/* Primary Login Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0055ee] via-[#006ef0] to-[#0088ff] hover:from-[#004cd4] hover:to-[#0077ee] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,102,255,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_6px_22px_rgba(0,102,255,0.6)] active:translate-y-0.5 active:shadow-[0_2px_8px_rgba(0,102,255,0.35)] disabled:opacity-85 disabled:cursor-wait transition-all duration-150 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول للنظام</span>
                    <LogIn className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Three Highlights Row: إدارة سهلة (Right) - تقارير دقيقة (Center) - مجموعات منظمة (Left) */}
            <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-[#132744] text-center select-none">
              {/* Feature 1: إدارة سهلة */}
              <div className="flex flex-col items-center py-2 px-1 rounded-xl bg-[#050e1d]/70 border border-[#142947] hover:border-sky-500/40 hover:bg-[#081730] transition-all">
                <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 mb-1">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">إدارة سهلة</span>
              </div>

              {/* Feature 2: تقارير دقيقة */}
              <div className="flex flex-col items-center py-2 px-1 rounded-xl bg-[#050e1d]/70 border border-[#142947] hover:border-sky-500/40 hover:bg-[#081730] transition-all">
                <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 mb-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">تقارير دقيقة</span>
              </div>

              {/* Feature 3: مجموعات منظمة */}
              <div className="flex flex-col items-center py-2 px-1 rounded-xl bg-[#050e1d]/70 border border-[#142947] hover:border-sky-500/40 hover:bg-[#081730] transition-all">
                <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-200">مجموعات منظمة</span>
              </div>
            </div>

            {/* Bottom Motto Separator */}
            <div className="flex items-center justify-center gap-3 mt-5 pt-1 select-none">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#00f0ff]/40" />
              <span className="text-xs text-sky-300/80 font-bold">
                معاً نحو تعليم أفضل
              </span>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#00f0ff]/40" />
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. MOBILE FOOTER (Visible on small screens)                               */}
      {/* ========================================================================= */}
      <footer className="lg:hidden relative z-10 w-full py-4 text-center text-xs text-slate-400 select-none border-t border-[#0d1e38]">
        <p className="font-medium">زين لإدارة الدروس والسناتر © جميع الحقوق محفوظة</p>
      </footer>

      {/* ========================================================================= */}
      {/* 5. FORGOT PASSWORD MODAL (Enterprise Notice)                               */}
      {/* ========================================================================= */}
      {forgotModalOpen && (
        <div
          id="forgot-password-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            id="forgot-password-card"
            className="w-full max-w-sm rounded-2xl bg-[#08162e] border border-[#1a3966] p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#0066ff]/20 text-sky-400 border border-[#0066ff]/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">استعادة وتعيين كلمة المرور</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              في النسخة التجريبية الحالية، يمكنك تسجيل الدخول بالبيانات الافتراضية
              (<span className="text-sky-300 font-mono font-bold">admin / 123456</span>) أو الضغط مباشرة على زر
              <strong className="text-white"> "تسجيل الدخول" </strong>
              للوصول إلى لوحة التحكم فوراً.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  handleQuickDemoFill();
                  setForgotModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                تعبئة البيانات والدخول فوراً
              </button>
              <button
                id="btn-close-forgot-modal"
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="w-full py-2 rounded-xl bg-[#061022] hover:bg-[#091a38] text-slate-300 font-semibold text-xs border border-[#173359] transition-colors cursor-pointer"
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
