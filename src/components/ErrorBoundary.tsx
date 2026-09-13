import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Zain System ErrorBoundary]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen w-full bg-[#060c18] text-slate-100 flex items-center justify-center p-4 font-sans select-none"
          dir="rtl"
        >
          <div className="w-full max-w-md bg-[#08152b] border border-[#173054] rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-extrabold text-white">
              حدث خطأ غير متوقع في النظام
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              تم رصد مشكلة أثناء معالجة الصفحة. يمكنك النقر على الزر أدناه لإعادة تحميل النظام ومتابعة العمل بأمان دون فقدان بياناتك.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#060c18] border border-[#142642] text-[11px] text-slate-400 font-mono text-left max-h-24 overflow-auto dir-ltr">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(0,102,255,0.4)] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل النظام</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
