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
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Music,
  BellRing,
} from 'lucide-react';
import { CenterSettings, StaticLink } from '../types';
import { soundService } from '../utils/soundService';
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
  const [activeTab, setActiveTab] = useState<'connection' | 'links' | 'center' | 'sounds'>('connection');

  // Audio settings state
  const [soundPrefs, setSoundPrefs] = useState(() => soundService.getPreferences());

  useEffect(() => {
    const handlePrefChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSoundPrefs({ ...customEvent.detail });
      }
    };
    window.addEventListener('zain-sound-preferences-changed', handlePrefChange);
    return () => window.removeEventListener('zain-sound-preferences-changed', handlePrefChange);
  }, []);

  const handleToggleSoundMaster = (enabled: boolean) => {
    soundService.setEnabled(enabled);
    setSoundPrefs((prev) => ({ ...prev, enabled }));
  };

  const handleToggleTouch = (touchEnabled: boolean) => {
    soundService.setTouchEnabled(touchEnabled);
    setSoundPrefs((prev) => ({ ...prev, touchEnabled }));
  };

  const handleToggleNav = (navigationEnabled: boolean) => {
    soundService.setNavigationEnabled(navigationEnabled);
    setSoundPrefs((prev) => ({ ...prev, navigationEnabled }));
  };

  const handleToggleNotif = (notificationsEnabled: boolean) => {
    soundService.setNotificationsEnabled(notificationsEnabled);
    setSoundPrefs((prev) => ({ ...prev, notificationsEnabled }));
  };

  const handleVolumeChange = (vol: number) => {
    soundService.setVolume(vol);
    setSoundPrefs((prev) => ({ ...prev, volume: vol }));
  };

  // Form states for Center Settings
  const [formData, setFormData] = useState<CenterSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Connection settings state
  const initialConfig = getCurrentConfig();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(initialConfig.url);
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState<string>(initialConfig.anonKey);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingConnection, setIsSavingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult | null>(null);

  // Static Links state
  const [staticLinks, setStaticLinks] = useState<StaticLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [linksNotice, setLinksNotice] = useState<string | null>(null);

  // Add/Edit link modal
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

  // Sync settings prop into formData
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  // Load static links
  const refreshLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const data = await staticLinksService.getAll();
      setStaticLinks(data);
    } catch {
      setLinksNotice('تعذر تحميل الروابط الثابتة من قاعدة البيانات.');
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    refreshLinks();
  }, []);

  const handleChange = (field: keyof CenterSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
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
        try {
          await onReloadAllData();
        } catch (e) {
          console.warn('Data reload failed', e);
        }
      }
    } else {
      setStatusMessage({
        text: `تم حفظ الإعدادات ولكن الاتصال لم ينجح: ${testRes.message}`,
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
      orderIndex: link.orderIndex || 0,
    });
    setLinkModalOpen(true);
  };

  const handleSaveLinkModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkFormData.title || !linkFormData.url) return;

    try {
      if (editingLink) {
        await staticLinksService.update(editingLink.id, linkFormData);
      } else {
        await staticLinksService.create(linkFormData);
      }
      setLinkModalOpen(false);
      await refreshLinks();
    } catch {
      alert('حدث خطأ أثناء حفظ الرابط. يرجى التأكد من اتصال قاعدة البيانات.');
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الرابط نهائياً؟')) {
      try {
        await staticLinksService.delete(id);
        await refreshLinks();
      } catch {
        alert('تعذر حذف الرابط من قاعدة البيانات.');
      }
    }
  };

  const handleToggleLinkActive = async (link: StaticLink) => {
    try {
      await staticLinksService.update(link.id, { isActive: !link.isActive });
      await refreshLinks();
    } catch {
      alert('تعذر تحديث حالة الرابط.');
    }
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <span>إعدادات النظام والاتصال</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إعدادات اتصال Supabase، الروابط الثابتة المخصصة، وبيانات المركز التعليمي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              isSupabaseConnected || connectionTestResult?.status === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {isSupabaseConnected || connectionTestResult?.status === 'connected'
              ? 'قاعدة البيانات متصلة'
              : 'اتصال غير مؤكد'}
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('connection')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'connection'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>بيانات المركز والنظام</span>
        </button>

        <button
          id="btn-tab-sounds"
          type="button"
          onClick={() => setActiveTab('sounds')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sounds'
              ? 'bg-[#0066ff] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>المؤثرات الصوتية</span>
        </button>
      </div>

      {statusMessage && (
        <div
          id="settings-status-alert"
          className={`p-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: إعدادات الاتصال بـ Supabase                                        */}
      {/* ========================================================================= */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#0066ff]" />
                <h3 className="text-sm font-bold text-slate-800">إعدادات الاتصال بقاعدة بيانات Supabase</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold">
                {initialConfig.isEnvConfigured ? 'Vercel Env: متوفرة' : 'Vercel Env: غير معينة'}
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Instructions box */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-[#0066ff] flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  <span>دليل إعداد الاتصال في بيئة الإنتاج (Vercel):</span>
                </p>
                <p className="leading-relaxed text-slate-600">
                  لضمان الاتصال التلقائي الدائم عند كل نشر، أضف المتغيرات التالية في لوحة تحكم Vercel (Project Settings &rarr; Environment Variables):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 font-mono text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                    <span className="text-slate-500">اسم المتغير: </span>
                    <strong className="text-[#0066ff]">VITE_SUPABASE_URL</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                    <span className="text-slate-500">اسم المتغير: </span>
                    <strong className="text-[#0066ff]">VITE_SUPABASE_ANON_KEY</strong>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 font-semibold pt-1">
                  * تنبيه أمني: استخدم فقط مفتاح <strong>Anon Key (Public)</strong> وممنوع نهائياً استخدام مفتاح Service Role Key في الواجهة.
                </p>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رابط مشروع Supabase (Supabase URL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-supabase-url"
                    type="url"
                    dir="ltr"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    مفتاح المشروع المجهول (Supabase Anon Key) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-supabase-anon-key"
                      type="password"
                      dir="ltr"
                      value={supabaseAnonKeyInput}
                      onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Connection Test Result Card */}
              {connectionTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    connectionTestResult.status === 'connected'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : connectionTestResult.status === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {connectionTestResult.status === 'connected' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>حالة الاتصال: {connectionTestResult.status === 'connected' ? 'متصل بنجاح' : connectionTestResult.status === 'error' ? 'خطأ في الاتصال' : 'غير مهيأ'}</span>
                    </span>
                    <span className="text-[11px] opacity-75 font-mono">{connectionTestResult.timestamp}</span>
                  </div>

                  <p className="leading-relaxed">{connectionTestResult.message}</p>

                  {connectionTestResult.latencyMs !== undefined && (
                    <div className="flex items-center gap-3 pt-1 text-[11px] opacity-80 font-mono">
                      <span>زمن الاستجابة: {connectionTestResult.latencyMs} مللي ثانية</span>
                      <span>الرابط: {connectionTestResult.projectUrl}</span>
                    </div>
                  )}

                  {connectionTestResult.errorDetail && (
                    <div className="p-2 bg-slate-100 rounded-lg text-[11px] font-mono text-rose-700 mt-2 break-all border border-rose-200">
                      {connectionTestResult.errorDetail}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  id="btn-test-supabase-connection"
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-[#0066ff] ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'جاري فحص الاتصال...' : 'اختبار الاتصال'}</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="btn-save-supabase-connection"
                    type="button"
                    onClick={handleSaveConnectionSettings}
                    disabled={isSavingConnection}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-[#0066ff]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">إدارة الروابط الثابتة والمهمة</h3>
                  <p className="text-xs text-slate-500">
                    روابط المنصات التعليمية، ملفات الدرايف، جروبات الواتساب، والروابط السريعة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshLinks}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingLinks ? 'animate-spin' : ''}`} />
                </button>
                <button
                  id="btn-add-static-link"
                  type="button"
                  onClick={handleOpenAddLink}
                  className="px-4 py-2 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة رابط جديد</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {linksNotice && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{linksNotice}</span>
                </div>
              )}

              {staticLinks.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <Link2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">لا توجد روابط ثابتة مسجلة بعد.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddLink}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0066ff] border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    أضف أول رابط للسنتر الآن
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staticLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`p-4 rounded-xl border transition-all ${
                        link.isActive
                          ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-blue-50 text-[#0066ff] text-[11px] font-mono font-bold flex items-center justify-center border border-blue-200">
                              {link.orderIndex}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {link.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                link.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {link.isActive ? 'مفعل' : 'مخفي'}
                            </span>
                          </div>

                          {link.description && (
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {link.description}
                            </p>
                          )}

                          <div className="pt-1">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#0066ff] hover:underline font-mono inline-flex items-center gap-1 truncate max-w-full"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditLink(link)}
                            title="تعديل الرابط"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0066ff] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(link.id)}
                            title="حذف الرابط"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#0066ff]" />
              <h3 className="text-sm font-bold text-slate-800">بيانات المركز التعليمي</h3>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المركز / السنتر <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-center-name"
                    type="text"
                    value={formData.centerName}
                    onChange={(e) => handleChange('centerName', e.target.value)}
                    placeholder="مثال: سنتر زين التعليمي"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المسؤول / المعلم الرئيسي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-manager-name"
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    placeholder="مثال: أ/ زين محمد"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رقم الهاتف والتواصل <span className="text-rose-500">*</span>
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
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white text-right font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    بيانات التواصل والعنوان
                  </label>
                  <div className="relative">
                    <input
                      id="settings-contact-info"
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => handleChange('contactInfo', e.target.value)}
                      placeholder="مثال: القاهرة - فرع الدقي"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Logo upload / preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شعار المركز (Logo)
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="شعار المركز"
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066ff] font-black text-xs">
                      ZAIN
                    </div>
                  )}
                  <div className="flex-1">
                    <label
                      htmlFor="logo-file-input"
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-200 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0066ff]" />
                      <span>تغيير الشعار من جهازك</span>
                    </label>
                    <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="block text-[11px] text-slate-500 mt-1">
                      يدعم صور PNG, JPG للاستخدام في الترويسة والتقارير والإيصالات
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-[#0066ff]" />
              <h3 className="text-sm font-bold text-slate-800">إعدادات النظام والعملة</h3>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    العملة المعتمدة <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="settings-currency"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                  >
                    <option value="ج.م">جنيه مصري (ج.م)</option>
                    <option value="ر.س">ريال سعودي (ر.س)</option>
                    <option value="د.إ">درهم إماراتي (د.إ)</option>
                    <option value="د.ك">دينار كويتي (د.ك)</option>
                    <option value="$">دولار أمريكي ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    العام الدراسي الحالي
                  </label>
                  <input
                    id="settings-academic-year"
                    type="text"
                    value={formData.academicYear || ''}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    placeholder={`مثال: ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات عامة وتذييل التقارير
                </label>
                <textarea
                  id="settings-notes"
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="ملاحظات تظهر في تذييل التقارير والإيصالات..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#0066ff]" />
                <h3 className="text-sm font-bold text-slate-800">بيانات حساب المستخدم</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                مسؤول النظام (Admin)
              </span>
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-800">حساب السنتر المسجل</p>
                <p className="text-xs text-[#0066ff] font-mono mt-0.5 font-bold">{currentUserEmail}</p>
              </div>

              <button
                id="btn-settings-logout"
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
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
              className="w-full sm:w-auto px-6 py-3 bg-[#0066ff] hover:bg-[#0055ee] disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري حفظ الإعدادات...' : 'حفظ بيانات المركز'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: المؤثرات الصوتية وأصوات التنبيه واللمس                               */}
      {/* ========================================================================= */}
      {activeTab === 'sounds' && (
        <div className="space-y-6" dir="rtl">
          {/* Main Master Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center">
                    <Volume2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-slate-800">
                    أصوات ومؤثرات النظام الصوتية
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl">
                  توليد نغمات موسيقية رقمية مدمجة عبر تقنية Web Audio API عالية النقاء، متوافقة كلياً بدون الحاجة لأي ملفات إنترنت خارجية.
                </p>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700">
                  {soundPrefs.enabled ? 'كافة الأصوات مفعلة' : 'الأصوات مكتومة بالكامل'}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleSoundMaster(!soundPrefs.enabled)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                    soundPrefs.enabled ? 'bg-[#0066ff]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                      soundPrefs.enabled ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-200/60 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    مستوى الصوت العام
                  </span>
                </div>
                <span className="text-xs font-black text-[#0066ff] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">
                  {Math.round((soundPrefs.volume ?? 0.3) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundPrefs.volume ?? 0.3}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  disabled={!soundPrefs.enabled}
                  className="w-full accent-[#0066ff] cursor-pointer disabled:opacity-40"
                />
                <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
              </div>
            </div>

            {/* Detailed Sound Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Touch & Click Sounds */}
              <div className="p-4 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-200 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleTouch(!soundPrefs.touchEnabled)}
                    disabled={!soundPrefs.enabled}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 ${
                      soundPrefs.touchEnabled && soundPrefs.enabled ? 'bg-[#0066ff]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform ${
                        soundPrefs.touchEnabled && soundPrefs.enabled ? 'translate-x-1' : 'translate-x-5.5'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">أصوات اللمس والنقر</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    نغمة رقيقة وخفيفة جداً تصدر تلقائياً عند لمس الأزرار والروابط وعناصر الإدخال.
                  </p>
                </div>
              </div>

              {/* Navigation Sounds */}
              <div className="p-4 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-200 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Music className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNav(!soundPrefs.navigationEnabled)}
                    disabled={!soundPrefs.enabled}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 ${
                      soundPrefs.navigationEnabled && soundPrefs.enabled ? 'bg-[#0066ff]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform ${
                        soundPrefs.navigationEnabled && soundPrefs.enabled ? 'translate-x-1' : 'translate-x-5.5'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">أصوات التنقل بين الشاشات</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    نغمة تبديل انسيابية وناعمة ترافق الانتقال بين القوائم وصفحات النظام الرئيسية.
                  </p>
                </div>
              </div>

              {/* Notification Sounds */}
              <div className="p-4 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-200 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotif(!soundPrefs.notificationsEnabled)}
                    disabled={!soundPrefs.enabled}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 ${
                      soundPrefs.notificationsEnabled && soundPrefs.enabled ? 'bg-[#0066ff]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform ${
                        soundPrefs.notificationsEnabled && soundPrefs.enabled ? 'translate-x-1' : 'translate-x-5.5'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">أصوات التنبيه والإشعارات</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    نغمات تنبيه واضحة ومميزة لحالات النجاح، حفظ البيانات، الدفعات، والتحذيرات.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sound Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                <span>منصة تجربة الأصوات الحية</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                انقر على أي من الأزرار التالية للاستماع المباشر للنغمة ومعاينتها:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Test Startup */}
              <button
                type="button"
                onClick={() => {
                  soundService.init();
                  soundService.playStartup();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-center transition-all cursor-pointer group flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Volume2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">فتح النظام</span>
                <span className="text-[10px] text-slate-500">نغمة الترحيب</span>
              </button>

              {/* Test Click */}
              <button
                type="button"
                onClick={() => soundService.playClick()}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-center transition-all cursor-pointer group flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">صوت اللمس</span>
                <span className="text-[10px] text-slate-500">نقرة ناعمة</span>
              </button>

              {/* Test Nav */}
              <button
                type="button"
                onClick={() => soundService.playNavigation()}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-center transition-all cursor-pointer group flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Music className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">صوت التنقل</span>
                <span className="text-[10px] text-slate-500">تبديل الشاشات</span>
              </button>

              {/* Test Notification */}
              <button
                type="button"
                onClick={() => soundService.playNotification('info')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-center transition-all cursor-pointer group flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BellRing className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">إشعار عادي</span>
                <span className="text-[10px] text-slate-500">تنبيه معلوماتي</span>
              </button>

              {/* Test Success */}
              <button
                type="button"
                onClick={() => soundService.playSuccess()}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-center transition-all cursor-pointer group flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">تأكيد ونجاح</span>
                <span className="text-[10px] text-slate-500">حفظ ودفعات</span>
              </button>

              {/* Test Warning / Error */}
              <button
                type="button"
                onClick={() => soundService.playNotification('error')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-center transition-all cursor-pointer group flex flex-col items-center gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">تنبيه خطأ</span>
                <span className="text-[10px] text-slate-500">تحذيرات النظام</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: إضافة / تعديل رابط ثابت                                            */}
      {/* ========================================================================= */}
      {linkModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none"
          dir="rtl"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 text-right space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#0066ff]" />
                <span>{editingLink ? 'تعديل الرابط الثابت' : 'إضافة رابط ثابت جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الرابط <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={linkFormData.title}
                  onChange={(e) => setLinkFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: مجلد ملخصات الكيمياء (Drive)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرابط (URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={linkFormData.url}
                  onChange={(e) => setLinkFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف اختياري
                </label>
                <input
                  type="text"
                  value={linkFormData.description}
                  onChange={(e) => setLinkFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="ملاحظات مختصرة حول الرابط..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ترتيب الظهور
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={linkFormData.orderIndex}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={linkFormData.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setLinkFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
                  >
                    <option value="active">مفعل (ظاهر)</option>
                    <option value="inactive">مخفي</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
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
