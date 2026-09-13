import React from 'react';
import {
  Home,
  Users,
  Layers,
  CalendarCheck,
  CreditCard,
  Calendar,
  BarChart3,
  Search,
  X,
  LogOut,
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
  const menuItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <Home className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'students',
      label: 'الطلاب',
      icon: <Users className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'groups',
      label: 'المجموعات',
      icon: <Layers className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'attendance',
      label: 'الحضور',
      icon: <CalendarCheck className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'payments',
      label: 'المدفوعات',
      icon: <CreditCard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'schedule',
      label: 'جدول الحصص',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'search',
      label: 'البحث',
      icon: <Search className="w-5 h-5 shrink-0" />,
    },
  ];

  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#060c18] text-slate-100 select-none border-r border-[#142642] overflow-y-auto">
      {/* Top Header: Zain Logo & Title matching Reference Image */}
      <div className="pt-6 pb-4 px-4 flex flex-col items-center text-center relative border-b border-[#112038]">
        {/* Mobile close button (only visible on mobile drawer) */}
        <button
          id="mobile-nav-close-btn"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="إغلاق القائمة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Emblem & Subtitle */}
        <ZainLogo size="sm" className="scale-95" />
      </div>

      {/* Navigation List Items */}
      <nav id="sidebar-nav-items" className="flex-1 px-3.5 py-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#0066ff] via-[#0077ff] to-[#0055dd] text-white shadow-[0_4px_20px_rgba(0,102,255,0.45)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0d1c35]'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Center Decorative Quote: “ معاً نحو تعليم أفضل ” matching Screenshot */}
      <div className="px-5 py-4 my-1 text-center select-none">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
          <span className="text-sky-400 text-base font-serif">“</span>
          <span>معاً نحو تعليم أفضل</span>
          <span className="text-sky-400 text-base font-serif">”</span>
        </div>
        <div className="w-12 h-0.5 bg-sky-400 mx-auto mt-2 shadow-[0_0_8px_#38bdf8] opacity-70" />
      </div>

      {/* Footer: Outline Emblem & Copyright 2025 matching Screenshot */}
      <div id="nav-footer-brand" className="p-4 border-t border-[#112038] text-center select-none bg-[#050a14]/60">
        <div className="flex items-center justify-center gap-2 mb-1 opacity-75">
          {/* Outline emblem in cyan line art */}
          <svg width="22" height="18" viewBox="0 0 160 130" fill="none" className="text-sky-400 stroke-current">
            <circle cx="80" cy="22" r="10.5" strokeWidth="6" />
            <path d="M 80,38 C 70,38 58,45 52,51 L 74,48 L 74,68 L 86,68 L 86,48 L 108,51 C 102,45 90,38 80,38 Z" strokeWidth="5" />
            <path d="M 78,82 C 60,76 38,68 28,52 C 26,62 30,76 44,88 C 55,97 68,98 77,95 Z" strokeWidth="5" />
            <path d="M 82,82 C 100,76 122,68 132,52 C 134,62 130,76 116,88 C 105,97 92,98 83,95 Z" strokeWidth="5" />
          </svg>
        </div>

        <p className="text-[11px] text-slate-400 leading-tight">
          جميع الحقوق محفوظة ©
        </p>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          زين لإدارة الدروس والسناتر 2025
        </p>

        {/* Subtle logout action */}
        {onLogout && (
          <button
            id="nav-logout-btn"
            type="button"
            onClick={onLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج (شاشة الدخول)</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar (LEFT Side matching Reference Image) */}
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
          className="lg:hidden fixed inset-0 z-50 flex bg-black/70 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            id="mobile-drawer-content"
            className="w-[270px] max-w-[85vw] h-full bg-[#060c18] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
