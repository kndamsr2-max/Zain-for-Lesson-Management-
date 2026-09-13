import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onCancel}
      dir="rtl"
    >
      <div
        id="confirm-modal-box"
        className="w-full max-w-md bg-[#08152b] rounded-2xl border border-[#173054] shadow-2xl p-6 text-right text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#142642]">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 bg-[#09152b] hover:bg-[#122442] border border-[#1b3459] rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            id="confirm-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 rounded-xl transition-all shadow-[0_2px_14px_rgba(244,63,94,0.35)] cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
