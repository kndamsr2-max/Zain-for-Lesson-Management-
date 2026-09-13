import React, { useState } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
} from 'lucide-react';
import { SupabaseStatusModal } from './SupabaseStatusModal';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  searchTerm = '',
  onSearchChange,
  onSearchSubmit,
  onLogout,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'بدء مجموعة جديدة (أوفيس)',
      time: 'منذ ساعتين',
      icon: <Clock className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 2,
      title: 'تسجيل دفعة جديدة من الطالب أحمد محمد (300 ج.م)',
      time: 'منذ 3 ساعات',
      icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 3,
      title: 'تم تسجيل حضور 12 طالب في المجموعة الأولى',
      time: 'اليوم 09:30 ص',
      icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />,
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
      className="sticky top-0 z-20 w-full h-16 bg-[#060c18]/90 backdrop-blur-md border-b border-[#142642] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* LEFT AREA: Hamburger Menu + Search Bar                         */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-md">
        {/* Hamburger Menu Toggle (Mobile & Tablet) */}
        <button
          id="topbar-menu-toggle-btn"
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Matching Reference Image) */}
        <div className="relative w-full max-w-[320px] sm:max-w-sm">
          <div className="flex items-center bg-[#09152b] border border-[#1b3459] rounded-xl px-3.5 py-1.5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all">
            <input
              id="topbar-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن طالب أو مجموعة ..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none text-right pr-1"
            />
            <button
              id="topbar-search-btn"
              type="button"
              onClick={onSearchSubmit}
              className="p-1 text-slate-400 hover:text-sky-400 transition-colors shrink-0"
              title="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT AREA: Theme Toggle + Bell Notification + User Profile    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Supabase Database Connection Status Indicator */}
        <button
          id="topbar-supabase-status-btn"
          type="button"
          onClick={() => setSupabaseModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#09152b] border border-[#1b3459] hover:border-sky-500/50 text-[11px] font-bold text-slate-300 hover:text-sky-300 transition-colors cursor-pointer select-none"
          title="فحص الاتصال بقاعدة بيانات Supabase"
        >
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isSupabaseConfigured ? 'Supabase متصل' : 'Supabase (النمط الآمن)'}
          </span>
        </button>

        {/* Theme Toggle Pill (Sun & Moon) */}
        <div
          id="topbar-theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#09152b] border border-[#1b3459] hover:border-sky-500/40 transition-colors cursor-pointer"
          title="تبديل وضع العرض"
        >
          <Sun className={`w-3.5 h-3.5 transition-colors ${!isDarkMode ? 'text-amber-400' : 'text-slate-400'}`} />
          <div className="w-4 h-4 rounded-full bg-sky-500/20 border border-sky-400/50 flex items-center justify-center">
            <Moon className="w-2.5 h-2.5 text-sky-300" />
          </div>
        </div>

        {/* Notifications Bell with Counter Badge "3" */}
        <div className="relative">
          <button
            id="topbar-notifications-btn"
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors focus:outline-none"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="w-5 h-5" />
            {/* Red Badge with "3" matching screenshot */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs border border-[#060c18]">
              3
            </span>
          </button>

          {/* Notifications Dropdown Popup */}
          {notificationsOpen && (
            <div
              id="topbar-notifications-dropdown"
              className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 rounded-2xl bg-[#09152b] border border-[#1b3459] shadow-2xl p-4 z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#142642]">
                <h4 className="text-sm font-bold text-white">التنبيهات والإشعارات</h4>
                <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  3 جديدة
                </span>
              </div>
              <div className="divide-y divide-[#142642] mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start gap-3 hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0 mt-0.5">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 leading-snug">{n.title}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <div
            id="topbar-user-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer select-none"
          >
            {/* User Greeting Text */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] text-slate-400 leading-none">مرحباً</span>
              <span className="text-xs font-bold text-white mt-0.5 leading-none">مدير النظام</span>
            </div>

            {/* Circular Avatar (Light Blue Circle with User Silhouette matching screenshot) */}
            <div className="w-8 h-8 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center font-bold shadow-xs">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Down Chevron */}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              id="topbar-profile-dropdown"
              className="absolute left-0 mt-2 w-48 rounded-xl bg-[#09152b] border border-[#1b3459] shadow-2xl p-2 z-50 text-right animate-in fade-in duration-150"
            >
              <div className="px-3 py-2 border-b border-[#142642]">
                <p className="text-xs font-bold text-white">مدير النظام</p>
                <p className="text-[10px] text-sky-400">صلاحيات كاملة</p>
              </div>

              {onLogout && (
                <button
                  id="topbar-logout-btn"
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-right"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Supabase Connection Test & Diagnostics Modal */}
      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </header>
  );
};
