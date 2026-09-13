import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      id="app-notification-toast"
      dir="rtl"
      className={`fixed top-5 left-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 ${
        isSuccess
          ? 'bg-[#081b28]/95 border-emerald-500/40 text-emerald-200 shadow-[0_4px_25px_rgba(16,185,129,0.2)]'
          : isError
          ? 'bg-[#1e0e15]/95 border-rose-500/40 text-rose-200 shadow-[0_4px_25px_rgba(244,63,94,0.2)]'
          : 'bg-[#08152b]/95 border-sky-500/40 text-sky-200 shadow-[0_4px_25px_rgba(14,165,233,0.2)]'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      )}
      <span className="text-xs sm:text-sm font-semibold">{message}</span>
      <button
        id="notification-close-btn"
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors mr-2 cursor-pointer"
        aria-label="إغلاق التنبيه"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
