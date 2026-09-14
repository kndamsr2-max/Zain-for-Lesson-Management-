import React from 'react';
import {
  Home,
  User,
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  Bell,
  UserCheck,
  Settings,
  Crown,
  Sparkles,
  LogOut,
  X,
  Receipt,
} from 'lucide-react';
import { PageId } from '../types';
import { ZainLogo } from './ZainLogo';

interface NavigationProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  studentCount?: number;
  groupCount?: number;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onSelectPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
}) => {
  const primaryMenuItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <Home className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'students',
      label: 'الطلاب',
      icon: <User className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'groups',
      label: 'المجموعات',
      icon: <Users className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'attendance',
      label: 'الحضور',
      icon: <CalendarCheck className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'payments',
      label: 'المدفوعات',
      icon: <CreditCard className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'expenses',
      label: 'المصاريف',
      icon: <Receipt className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'schedule',
      label: 'الجدول الدراسي',
      icon: <CalendarDays className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'exams',
      label: 'الامتحانات',
      icon: <ClipboardCheck className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: <TrendingUp className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'notifications',
      label: 'الرسائل والإشعارات',
      icon: <Bell className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: <UserCheck className="w-4.5 h-4.5 shrink-0" />,
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: <Settings className="w-4.5 h-4.5 shrink-0" />,
    },
  ];

  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#081022] text-slate-100 select-none border-r border-[#142347] overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-800">
      {/* Top Header: 3D Graduation Cap Logo matching Screenshot */}
      <div className="pt-5 pb-4 px-4 flex flex-col items-center text-center relative border-b border-[#142347]/80">
        {/* Mobile close button */}
        <button
          id="mobile-nav-close-btn"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-3 left-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="إغلاق القائمة"
        >
          <X className="w-5 h-5" />
        </button>

        <ZainLogo />
      </div>

      {/* Main Nav Items List */}
      <nav id="sidebar-nav-items" className="flex-1 px-3 py-3 space-y-1">
        {primaryMenuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#1e65e5] text-white shadow-[0_4px_16px_rgba(30,101,229,0.45)]'
                  : 'text-slate-300 hover:text-white hover:bg-[#111f3d]'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {/* AI Assistant Navigation Item */}
        <button
          id="nav-item-ai-assistant"
          onClick={() => handleNavClick('ai-assistant')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer mt-1 ${
            currentPage === 'ai-assistant'
              ? 'bg-[#1e65e5] text-white shadow-[0_4px_16px_rgba(30,101,229,0.45)]'
              : 'text-slate-300 hover:text-white hover:bg-[#111f3d]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-[#c084fc]">
              <Sparkles className="w-4.5 h-4.5 shrink-0" />
            </span>
            <span className="tracking-wide">المساعد الذكي</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-[#c084fc] animate-pulse" />
        </button>
      </nav>

      {/* Golden Crown Badge: "مع زين .. إدارة أسهل .. نتائج أفضل" */}
      <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-r from-[#17254a] to-[#121c38] border border-[#2a3f75]/60 shadow-md flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
          <Crown className="w-4.5 h-4.5 fill-amber-300/30" />
        </div>
        <div className="text-right">
          <div className="text-xs font-black text-white leading-tight">مع زين ..</div>
          <div className="text-[10px] text-slate-300 font-semibold mt-0.5">
            إدارة أسهل .. نتائج أفضل
          </div>
        </div>
      </div>

      {/* Scenic Desk Photo Card at Bottom matching Screenshot */}
      <div className="mx-3 mb-2 rounded-2xl overflow-hidden border border-[#1d2d54] bg-[#0c162e] relative shadow-lg">
        {/* Visual Office Desk Background */}
        <div className="h-24 w-full relative bg-gradient-to-t from-[#060b17] via-[#0d172e] to-[#152347] overflow-hidden flex items-end justify-center">
          {/* Desk surface line */}
          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#1b120c] to-[#301f16]" />
          {/* Laptop display glowing in dark */}
          <div className="absolute bottom-4 left-6 w-14 h-9 bg-slate-900 rounded-xs border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center">
            <div className="w-10 h-6 bg-sky-950/80 rounded-2xs flex flex-col p-1 gap-0.5">
              <div className="w-full h-1 bg-sky-400/60 rounded-xs" />
              <div className="w-2/3 h-1 bg-sky-400/40 rounded-xs" />
            </div>
          </div>
          {/* Coffee Mug */}
          <div className="absolute bottom-3 right-8 w-4 h-5 rounded-xs bg-slate-800 border border-slate-700" />
          {/* Dim ambient window lamp */}
          <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_18px_8px_rgba(251,191,36,0.3)]" />
        </div>

        {/* Motivational Educational Quote */}
        <div className="p-3 text-center bg-[#070e20] border-t border-[#16254a]">
          <p className="text-[11px] font-bold text-slate-200 leading-relaxed">
            التعليم ليس إعداداً للحياة ..
            <br />
            بل هو الحياة نفسها
          </p>
          <span className="block text-[10px] text-slate-400 font-medium mt-1">
            جون ديوي
          </span>
        </div>
      </div>

      {/* Footer: Version and Logout matching Screenshot */}
      <div
        id="nav-footer-brand"
        className="px-4 py-2.5 border-t border-[#142347] flex items-center justify-between text-xs text-slate-400 bg-[#050a16] relative z-10"
      >
        <span className="font-mono text-[11px] text-slate-400 font-semibold">Zein v1.0.0</span>

        {onLogout && (
          <button
            id="nav-logout-btn"
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer text-xs font-semibold"
          >
            <span>خروج</span>
            <LogOut className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (LEFT Side matching Reference Screenshot) */}
      <aside
        id="desktop-sidebar"
        className="hidden lg:block w-[260px] h-screen fixed top-0 left-0 z-30 shadow-2xl"
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-backdrop"
          className="lg:hidden fixed inset-0 z-50 flex bg-black/70 backdrop-blur-xs justify-start"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            id="mobile-drawer-content"
            className="w-[270px] max-w-[85vw] h-full bg-[#081022] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
