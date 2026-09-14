import React, { useState, useEffect } from 'react';
import {
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Globe,
  Share2,
} from 'lucide-react';
import { StaticLink } from '../types';
import { staticLinksService } from '../services/dataService';

export const LinksPage: React.FC = () => {
  const [links, setLinks] = useState<StaticLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    const data = await staticLinksService.fetchLinks();
    setLinks(data);
    setLoading(false);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const res = await staticLinksService.addLink({
      title: newTitle.trim(),
      url: finalUrl,
      description: newDesc.trim(),
      isActive: true,
      orderIndex: links.length + 1,
    });

    if (res.success && res.link) {
      setLinks((prev) => [...prev, res.link!]);
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
      setShowAddForm(false);
      setMsg({ text: 'تمت إضافة الرابط بنجاح', type: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ text: res.message || 'تعذر إضافة الرابط', type: 'error' });
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الرابط؟')) return;
    const res = await staticLinksService.deleteLink(id);
    if (res.success) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setMsg({ text: 'تم حذف الرابط بنجاح', type: 'success' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <Link2 className="w-6 h-6 text-[#0066ff]" />
            <h1 className="text-xl sm:text-2xl font-black">الروابط السريعة والموارد</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة روابط المنصات التعليمية، ملفات ومستندات السنتر، وقنوات التواصل
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066ff] hover:bg-[#0055ee] text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إلغاء' : 'إضافة رابط جديد'}</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add Link Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddLink}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4"
        >
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">إضافة رابط جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الرابط *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: قناة التيليجرام للسنتر"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0066ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرابط الإلكتروني (URL) *</label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://t.me/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono text-left focus:outline-none focus:border-[#0066ff]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف مختصر (اختياري)</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="شرح بسيط لمحتوى الرابط"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0066ff] hover:bg-[#0055ee] text-white text-xs font-bold shadow-xs transition-colors"
            >
              حفظ الرابط
            </button>
          </div>
        </form>
      )}

      {/* Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
            <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold text-sm">لا توجد روابط مسجلة حتى الآن</p>
            <p className="text-slate-400 text-xs mt-1">
              انقر على «إضافة رابط جديد» لحفظ روابط المجموعات والموارد التعليمية
            </p>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-[#0066ff] rounded-lg hover:bg-blue-50 transition-colors"
                      title="فتح الرابط"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-3">{link.title}</h3>
                {link.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{link.description}</p>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate font-mono max-w-[180px]" dir="ltr">
                  {link.url.replace(/^https?:\/\//, '')}
                </span>
                <span className="text-emerald-600 font-semibold">متاح</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
