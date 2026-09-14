import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  Sun,
  Moon,
  Minus,
  Square,
  X,
  Database,
  CheckCircle2,
  Clock,
  CreditCard,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { SupabaseStatusModal } from './SupabaseStatusModal';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { PageId } from '../types';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  onLogout?: () => void;
  onNavigate?: (page: PageId) => void;
  managerName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  searchTerm = '',
  onSearchChange,
  onSearchSubmit,
  onLogout,
  onNavigate,
  managerName = 'Miss Sharbat',
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'تم تسجيل دفعة جديدة من أحمد علي (350 ج.م)',
      time: 'منذ 10 دقائق',
      icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 2,
      title: 'إضافة طالب جديد مريم خالد في مجموعة الفيزياء',
      time: 'منذ 15 دقيقة',
      icon: <User className="w-4 h-4 text-[#1e65e5]" />,
    },
    {
      id: 3,
      title: 'تنبيه: 5 طلاب متأخرين في مجموعة الرياضيات - أ',
      time: 'منذ ساعتين',
      icon: <Clock className="w-4 h-4 text-rose-500" />,
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header
      id="main-topbar"
      className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-20 select-none"
      dir="rtl"
    >
      {/* ------------------------------------------------------------- */}
      {/* RIGHT SIDE (in RTL): Mobile Menu + Search Bar + Ctrl+K        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile menu toggle */}
        <button
          id="topbar-menu-toggle-btn"
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 lg:hidden cursor-pointer shrink-0"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Bar with Ctrl+K shortcut matching screenshot */}
        <div className="relative flex-1">
          <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1e65e5]/20 focus-within:border-[#1e65e5] border border-slate-200/80 rounded-xl px-3.5 py-2 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2.5" />
            <input
              id="topbar-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن طالب، مجموعة، دفعة، تقرير ..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none text-right font-medium"
            />
            {/* Ctrl + K Shortcut Pill */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-[10px] font-mono text-slate-400 font-bold mr-2 shrink-0">
              <span>Ctrl + K</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDE (in RTL): Theme Toggle + Notifications + User + Win */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Supabase Cloud Connection Status Badge */}
        <button
          type="button"
          onClick={() => setSupabaseModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          title="حالة اتصال قاعدة البيانات"
        >
          <Database className="w-3.5 h-3.5 text-[#1e65e5]" />
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured
                ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px]">
            {isSupabaseConfigured ? 'متصل' : 'قاعدة البيانات'}
          </span>
        </button>

        {/* Sun / Moon Theme Toggle Icon */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="تبديل المظهر النهاري / الليلي"
        >
          {isDarkMode ? (
            <Sun className="w-4.5 h-4.5 text-amber-500" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-600" />
          )}
        </button>

        {/* Notification Bell with Badge (3) */}
        <div className="relative">
          <button
            id="topbar-notifications-btn"
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label="التنبيهات"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className="absolute left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-4 z-50 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-black text-slate-900">آخر الإشعارات</span>
                <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">
                  تحديد الكل كمقروء
                </span>
              </div>
              <div className="mt-2 space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors flex items-start gap-2.5 cursor-pointer text-right"
                  >
                    <div className="mt-0.5">{n.icon}</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill: Avatar + "أحمد محمد" / "مدير النظام" */}
        <div className="relative">
          <button
            id="topbar-user-profile-btn"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-right"
          >
            <div className="w-8 h-8 rounded-full bg-[#1e65e5] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {managerName}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">
                مدير النظام
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              className="absolute left-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-2 z-50 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">{managerName}</span>
                <span className="text-[11px] text-slate-500 block">مدير النظام</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate && onNavigate('settings');
                }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إعدادات الحساب
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>تسجيل الخروج</span>
                  <LogOut className="w-3.5 h-3.5 rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Windows Frame Controls: — ▢ ✕ matching screenshot */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 mr-2 pr-2 border-r border-slate-200">
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="تصغير"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="تكبير"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Supabase Status Modal */}
      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </header>
  );
};
