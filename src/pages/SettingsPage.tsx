import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Settings as SettingsIcon,
  Save,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Coins,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  Upload,
  Database,
  Link2,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  Server,
  AlertTriangle,
  ArrowUpDown,
  X,
  Radio,
} from 'lucide-react';
import { CenterSettings, StaticLink } from '../types';
import {
  checkSupabaseConnection,
  ConnectionTestResult,
  getCurrentConfig,
  reconfigureSupabaseClient,
  validateSupabaseCredentials,
  isSupabaseConfigured as globalIsConfigured,
} from '../lib/supabaseClient';
import { staticLinksService } from '../services/dataService';

interface SettingsPageProps {
  settings: CenterSettings;
  onSaveSettings: (settings: CenterSettings) => Promise<{ success: boolean; message?: string }>;
  onLogout: () => void;
  currentUserEmail?: string;
  isSupabaseConnected: boolean;
  onReloadAllData?: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onLogout,
  currentUserEmail = 'admin@zain-center.edu',
  isSupabaseConnected,
  onReloadAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'center' | 'connection' | 'links'>('connection');
  const [formData, setFormData] = useState<CenterSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Connection settings state
  const initialConfig = getCurrentConfig();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(initialConfig.url);
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(initialConfig.anonKey);
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingConnection, setIsSavingConnection] = useState(false);

  // Static Links state
  const [staticLinks, setStaticLinks] = useState<StaticLink[]>(() =>
    staticLinksService.loadStaticLinks()
  );
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [linksNotice, setLinksNotice] = useState<string | null>(null);

  // Modal / Form state for Static Links
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<StaticLink | null>(null);
  const [linkFormData, setLinkFormData] = useState<{
    title: string;
    url: string;
    description: string;
    isActive: boolean;
    orderIndex: number;
  }>({
    title: '',
    url: '',
    description: '',
    isActive: true,
    orderIndex: 0,
  });

  // Load static links from database on mount or tab change
  const refreshLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const res = await staticLinksService.fetchStaticLinks();
      setStaticLinks(res.data);
      if (res.needsMigration) {
        setLinksNotice(
          'تنبيه: جدول "static_links" يحتاج إلى تنفيذ الـ SQL في Supabase ليتم حفظ الروابط دائماً في السحاب.'
        );
      } else {
        setLinksNotice(null);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    refreshLinks();
  }, []);

  // Quick initial test of current connection
  useEffect(() => {
    const runQuickCheck = async () => {
      const res = await checkSupabaseConnection();
      setConnectionTestResult(res);
    };
    runQuickCheck();
  }, []);

  const handleChange = (field: keyof CenterSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          handleChange('logoUrl', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await onSaveSettings(formData);
      if (res.success) {
        setStatusMessage({
          text: res.message || 'تم حفظ جميع الإعدادات بنجاح في Supabase.',
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: res.message || 'حدث خطأ أثناء حفظ الإعدادات.',
          type: 'error',
        });
      }
    } catch {
      setStatusMessage({
        text: 'تعذر الاتصال بقاعدة البيانات لحفظ التعديلات.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Connection Testing & Saving
  // --------------------------------------------------------------------------
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    const validation = validateSupabaseCredentials(supabaseUrlInput, supabaseAnonKeyInput);
    if (!validation.isValid) {
      setConnectionTestResult({
        status: 'unconfigured',
        message: validation.reason || 'بيانات الاتصال غير مكتملة.',
        isConfigured: false,
        projectUrl: supabaseUrlInput,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
      });
      setIsTestingConnection(false);
      return;
    }

    try {
      const result = await checkSupabaseConnection(supabaseUrlInput, supabaseAnonKeyInput);
      setConnectionTestResult(result);
    } catch (err: any) {
      setConnectionTestResult({
        status: 'error',
        message: `تعذر الاتصال بـ Supabase: ${err?.message || 'خطأ غير متوقع'}`,
        isConfigured: true,
        projectUrl: supabaseUrlInput,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConnectionSettings = async () => {
    setIsSavingConnection(true);

    const validation = validateSupabaseCredentials(supabaseUrlInput, supabaseAnonKeyInput);
    if (!validation.isValid) {
      setStatusMessage({
        text: validation.reason || 'يرجى إدخال رابط Supabase ومفتاح Anon Key بشكل صحيح.',
        type: 'error',
      });
      setIsSavingConnection(false);
      return;
    }

    const applied = reconfigureSupabaseClient(supabaseUrlInput, supabaseAnonKeyInput);
    if (!applied) {
      setStatusMessage({
        text: 'تعذر تهيئة عميل Supabase بالبيانات المدخلة.',
        type: 'error',
      });
      setIsSavingConnection(false);
      return;
    }

    // Retest connection live
    const testRes = await checkSupabaseConnection();
    setConnectionTestResult(testRes);

    if (testRes.status === 'connected') {
      setStatusMessage({
        text: 'تم تطبيق إعدادات الاتصال بنجاح والاتصال بـ Supabase نشط الآن!',
        type: 'success',
      });

      // Reload all app data from Supabase live
      if (onReloadAllData) {
        await onReloadAllData();
      }
      refreshLinks();
    } else {
      setStatusMessage({
        text: `تم حفظ الإعدادات لكن الاتصال واجه تنبيهاً: ${testRes.message}`,
        type: 'error',
      });
    }

    setIsSavingConnection(false);
  };

  // --------------------------------------------------------------------------
  // Static Links Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddLink = () => {
    setEditingLink(null);
    setLinkFormData({
      title: '',
      url: '',
      description: '',
      isActive: true,
      orderIndex: staticLinks.length + 1,
    });
    setLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: StaticLink) => {
    setEditingLink(link);
    setLinkFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      isActive: link.isActive,
      orderIndex: link.orderIndex,
    });
    setLinkModalOpen(true);
  };

  const handleSaveLinkModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkFormData.title.trim() || !linkFormData.url.trim()) return;

    if (editingLink) {
      const res = await staticLinksService.updateStaticLink(editingLink.id, {
        title: linkFormData.title.trim(),
        url: linkFormData.url.trim(),
        description: linkFormData.description.trim(),
        isActive: linkFormData.isActive,
        orderIndex: linkFormData.orderIndex,
      });
      if (res.needsMigration) {
        setLinksNotice(
          'تم تحديث الرابط. تنبيه: يلزم تنفيذ SQL في Supabase لضمان بقائه بعد تحديث السيرفر.'
        );
      }
    } else {
      const res = await staticLinksService.createStaticLink({
        title: linkFormData.title.trim(),
        url: linkFormData.url.trim(),
        description: linkFormData.description.trim(),
        isActive: linkFormData.isActive,
        orderIndex: linkFormData.orderIndex,
      });
      if (res.needsMigration) {
        setLinksNotice(
          'تم حفظ الرابط. تنبيه: يلزم تنفيذ SQL في Supabase لضمان بقائه بعد تحديث السيرفر.'
        );
      }
    }

    setLinkModalOpen(false);
    refreshLinks();
  };

  const handleDeleteLink = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
      await staticLinksService.deleteStaticLink(id);
      refreshLinks();
    }
  };

  const handleToggleLinkActive = async (link: StaticLink) => {
    await staticLinksService.updateStaticLink(link.id, {
      isActive: !link.isActive,
    });
    refreshLinks();
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-sky-400" />
            <span>لوحة الإعدادات والربط السحابي</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إعدادات اتصال Supabase، الروابط الثابتة المخصصة، وبيانات المركز التعليمي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              isSupabaseConnected || connectionTestResult?.status === 'connected'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {isSupabaseConnected || connectionTestResult?.status === 'connected'
              ? 'Supabase متصل'
              : 'اتصال غير مؤكد'}
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#08152b] rounded-2xl border border-[#173054] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('connection')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'connection'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1c38]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>إعدادات الاتصال</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'links'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1c38]'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>الروابط الثابتة ({staticLinks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('center')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'center'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1c38]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>بيانات المركز والنظام</span>
        </button>
      </div>

      {statusMessage && (
        <div
          id="settings-status-alert"
          className={`p-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/20 border-rose-500/30 text-rose-200'
              : 'bg-sky-500/20 border-sky-500/30 text-sky-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: إعدادات الاتصال بـ Supabase                                        */}
      {/* ========================================================================= */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] bg-[#0a1832] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">إعدادات الاتصال بقاعدة بيانات Supabase</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {initialConfig.isEnvConfigured ? 'Vercel Env: متوفرة' : 'Vercel Env: غير معينة'}
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Instructions box */}
              <div className="p-4 rounded-xl bg-[#060c18] border border-[#173054] text-xs text-slate-300 space-y-2">
                <p className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  <span>دليل إعداد الاتصال في بيئة الإنتاج (Vercel):</span>
                </p>
                <p className="leading-relaxed text-slate-400">
                  لضمان الاتصال التلقائي الدائم عند كل نشر، أضف المتغيرات التالية في لوحة تحكم Vercel (Project Settings &rarr; Environment Variables):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                  <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459] text-sky-300">
                    <span className="text-slate-400">اسم المتغير: </span>
                    <strong className="text-white">VITE_SUPABASE_URL</strong>
                  </div>
                  <div className="p-2 bg-[#09152b] rounded-lg border border-[#1b3459] text-sky-300">
                    <span className="text-slate-400">اسم المتغير: </span>
                    <strong className="text-white">VITE_SUPABASE_ANON_KEY</strong>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/90 pt-1">
                  * تنبيه أمني: استخدم فقط مفتاح <strong>Anon Key (Public)</strong> وممنوع نهائياً وضع مفتاح Service Role Key.
                </p>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    رابط مشروع Supabase (Supabase URL) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="input-supabase-url"
                    type="url"
                    dir="ltr"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مفتاح المشروع المجهول (Supabase Anon Key) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-supabase-anon-key"
                      type="password"
                      dir="ltr"
                      value={supabaseAnonKeyInput}
                      onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Connection Test Result Card */}
              {connectionTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    connectionTestResult.status === 'connected'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : connectionTestResult.status === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {connectionTestResult.status === 'connected' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span>حالة الاتصال: {connectionTestResult.status === 'connected' ? 'متصل بنجاح' : connectionTestResult.status === 'error' ? 'خطأ في الاتصال' : 'غير مهيأ'}</span>
                    </span>
                    <span className="text-[11px] opacity-75">{connectionTestResult.timestamp}</span>
                  </div>

                  <p className="leading-relaxed">{connectionTestResult.message}</p>

                  {connectionTestResult.latencyMs !== undefined && (
                    <div className="flex items-center gap-3 pt-1 text-[11px] opacity-80">
                      <span>زمن الاستجابة: {connectionTestResult.latencyMs} مللي ثانية</span>
                      <span>الرابط: {connectionTestResult.projectUrl}</span>
                    </div>
                  )}

                  {connectionTestResult.errorDetail && (
                    <div className="p-2 bg-black/40 rounded-lg text-[11px] font-mono text-rose-400 mt-2 break-all">
                      {connectionTestResult.errorDetail}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#142642]">
                <button
                  id="btn-test-supabase-connection"
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#112444] hover:bg-[#183360] text-sky-300 border border-sky-500/30 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'جاري فحص الاتصال...' : 'اختبار الاتصال'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="btn-save-supabase-connection"
                    type="button"
                    onClick={handleSaveConnectionSettings}
                    disabled={isSavingConnection}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingConnection ? 'جاري الحفظ والتطبيق...' : 'حفظ وتفعيل الاتصال'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: إدارة الروابط الثابتة (Static Links)                                */}
      {/* ========================================================================= */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] bg-[#0a1832] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">إدارة الروابط الثابتة والمهمة</h3>
                  <p className="text-[11px] text-slate-400">
                    روابط المنصات التعليمية، ملفات الدرايف، جروبات الواتساب، والروابط السريعة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshLinks}
                  className="p-2 bg-[#112444] hover:bg-[#183360] text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingLinks ? 'animate-spin' : ''}`} />
                </button>
                <button
                  id="btn-add-static-link"
                  type="button"
                  onClick={handleOpenAddLink}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة رابط جديد</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {linksNotice && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{linksNotice}</span>
                </div>
              )}

              {staticLinks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#060c18] border border-[#142642] space-y-3">
                  <Link2 className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">لا توجد روابط ثابتة مسجلة بعد.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddLink}
                    className="px-4 py-2 bg-[#112444] hover:bg-[#183360] text-sky-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    أضف أول رابط للسنتر الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {staticLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-4 rounded-xl border transition-all ${
                        link.isActive
                          ? 'bg-[#09152b] border-[#1b3459] hover:border-sky-500/40'
                          : 'bg-[#07101f]/60 border-[#142642] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-400 text-[11px] font-mono flex items-center justify-center border border-sky-500/20">
                              {link.orderIndex}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {link.title}
                            </h4>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                link.isActive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {link.isActive ? 'مفعل' : 'مخفي'}
                            </span>
                          </div>

                          {link.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {link.description}
                            </p>
                          )}

                          <div className="pt-1">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-400 hover:text-sky-300 font-mono inline-flex items-center gap-1 hover:underline truncate max-w-full"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{link.url}</span>
                            </a>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleLinkActive(link)}
                            title={link.isActive ? 'إخفاء الرابط' : 'تفعيل الرابط'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#112444] transition-colors cursor-pointer"
                          >
                            {link.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditLink(link)}
                            title="تعديل الرابط"
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-[#112444] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(link.id)}
                            title="حذف الرابط"
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: بيانات المركز التعليمي                                             */}
      {/* ========================================================================= */}
      {activeTab === 'center' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] bg-[#0a1832] flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">بيانات المركز التعليمي</h3>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اسم المركز / السنتر <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="settings-center-name"
                    type="text"
                    value={formData.centerName}
                    onChange={(e) => handleChange('centerName', e.target.value)}
                    placeholder="مثال: سنتر زين التعليمي"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اسم المسؤول / المعلم الرئيسي <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="settings-manager-name"
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    placeholder="مثال: أ/ زين محمد"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    رقم الهاتف والتواصل <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="settings-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="مثال: 01000000000"
                      dir="ltr"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 text-right font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    بيانات التواصل والعنوان
                  </label>
                  <div className="relative">
                    <input
                      id="settings-contact-info"
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => handleChange('contactInfo', e.target.value)}
                      placeholder="مثال: القاهرة - فرع الدقي"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Logo upload / preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  شعار المركز (Logo)
                </label>
                <div className="flex items-center gap-4 p-3 bg-[#09152b] border border-[#1b3459] rounded-xl">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="شعار المركز"
                      className="w-12 h-12 rounded-xl object-contain bg-[#060c18] border border-[#142642]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#060c18] border border-[#142642] flex items-center justify-center text-sky-400 font-bold text-xs">
                      ZAIN
                    </div>
                  )}
                  <div className="flex-1">
                    <label
                      htmlFor="logo-file-input"
                      className="px-3 py-1.5 bg-[#112444] hover:bg-[#16305a] text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors border border-[#1b3459]"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>تغيير الشعار من جهازك</span>
                    </label>
                    <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="block text-[11px] text-slate-400 mt-1">
                      يدعم صور PNG, JPG للاستخدام في الترويسة والتقارير
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] bg-[#0a1832] flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">إعدادات النظام والعملة</h3>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    العملة المعتمدة <span className="text-rose-400">*</span>
                  </label>
                  <select
                    id="settings-currency"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="ج.م">جنيه مصري (ج.م)</option>
                    <option value="ر.س">ريال سعودي (ر.س)</option>
                    <option value="د.إ">درهم إماراتي (د.إ)</option>
                    <option value="د.ك">دينار كويتي (د.ك)</option>
                    <option value="$">دولار أمريكي ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    العام الدراسي الحالي
                  </label>
                  <input
                    id="settings-academic-year"
                    type="text"
                    value={formData.academicYear || ''}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    placeholder="مثال: 2025 - 2026"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ملاحظات عامة وتذييل التقارير
                </label>
                <textarea
                  id="settings-notes"
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="ملاحظات تظهر في تذييل التقارير والإيصالات..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#142642] bg-[#0a1832] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">بيانات حساب المستخدم</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                مسؤول النظام (Admin)
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">حساب السنتر المسجل</p>
                <p className="text-xs text-sky-400 font-mono mt-0.5">{currentUserEmail}</p>
              </div>

              <button
                id="btn-settings-logout"
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="btn-save-settings"
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري حفظ الإعدادات...' : 'حفظ بيانات المركز'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: إضافة / تعديل رابط ثابت                                            */}
      {/* ========================================================================= */}
      {linkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
          dir="rtl"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-[#08152b] border border-[#1b365f] p-6 text-right space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#142847]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky-400" />
                <span>{editingLink ? 'تعديل الرابط الثابت' : 'إضافة رابط ثابت جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم الرابط <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkFormData.title}
                  onChange={(e) => setLinkFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: مجلد ملخصات الكيمياء (Drive)"
                  className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الرابط (URL) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={linkFormData.url}
                  onChange={(e) => setLinkFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  وصف اختياري
                </label>
                <input
                  type="text"
                  value={linkFormData.description}
                  onChange={(e) => setLinkFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="ملاحظات مختصرة حول الرابط..."
                  className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ترتيب الظهور
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={linkFormData.orderIndex}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={linkFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))
                    }
                    className="w-full px-3 py-2 text-xs bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="active">مفعل (ظاهر)</option>
                    <option value="inactive">مخفي</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#142642]">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {editingLink ? 'تحديث الرابط' : 'إضافة الرابط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
