import React, { useState } from 'react';
import {
  Send,
  Bell,
  MessageCircle,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { Student, Group } from '../types';

interface NotificationsPageProps {
  students: Student[];
  groups: Group[];
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  students,
  groups,
}) => {
  const [targetType, setTargetType] = useState<'all' | 'group' | 'student'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [messageTemplate, setMessageTemplate] = useState<string>('reminder');
  const [customMessage, setCustomMessage] = useState<string>(
    'نود تذكيركم بموعد الحصة القادمة في سنتر زين التعليمي غداً في تمام الساعة 04:00 مساءً.'
  );
  const [sentLogs, setSentLogs] = useState([
    {
      id: 1,
      target: 'مجموعة الأوائل (علمي)',
      text: 'تذكير بموعد امتحان نصف الشهر لمادة الرياضيات القادم.',
      channel: 'واتساب',
      time: 'منذ ساعتين',
      status: 'تم الإرسال بنجاح (8 أولياء أمور)',
    },
    {
      id: 2,
      target: 'علي محمود (ولي الأمر)',
      text: 'إشعار استحقاق سداد الاشتراك الشهري للمجموعة.',
      channel: 'واتساب',
      time: 'أمس 06:30 م',
      status: 'تم التسليم',
    },
    {
      id: 3,
      target: 'جميع طلاب تالتة ثانوي',
      text: 'تعديل موعد حصة الفيزياء ليوم السبت بدلاً من الجمعة.',
      channel: 'رسالة نصية SMS',
      time: 'منذ 3 أيام',
      status: 'تم الإرسال لـ 45 طالب',
    },
  ]);

  const [sendSuccess, setSendSuccess] = useState(false);

  const handleTemplateChange = (tmpl: string) => {
    setMessageTemplate(tmpl);
    if (tmpl === 'reminder') {
      setCustomMessage('نود تذكيركم بموعد الحصة القادمة في سنتر زين التعليمي غداً.');
    } else if (tmpl === 'fees') {
      setCustomMessage('تذكير ودي بسداد القسط أو الاشتراك الشهري المستحق، شاكرين تعاونكم معنا.');
    } else if (tmpl === 'absence') {
      setCustomMessage('نحيطكم علماً بغياب الطالب اليوم عن موعد الحصة المحددة، نرجو الاطمئنان عليه.');
    } else if (tmpl === 'exam') {
      setCustomMessage('نود إعلامكم بتفوق الطالب في الاختبار الأخير وحصوله على درجة ممتازة، كل التوفيق!');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    let targetLabel = 'جميع الطلاب';
    if (targetType === 'group') {
      const g = groups.find((x) => x.id === selectedGroup);
      targetLabel = g ? g.name : 'مجموعة محددة';
    } else if (targetType === 'student') {
      const s = students.find((x) => x.id === selectedStudent);
      targetLabel = s ? s.name : 'طالب محدد';
    }

    const newLog = {
      id: Date.now(),
      target: targetLabel,
      text: customMessage,
      channel: 'واتساب',
      time: 'الآن',
      status: 'تم الإرسال بنجاح',
    };

    setSentLogs([newLog, ...sentLogs]);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e65e5] flex items-center justify-center border border-blue-100">
              <Send className="w-5 h-5" />
            </div>
            <span>إرسال الرسائل والتنبيهات للأولياء</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إرسال إشعارات الحضور، المواعيد، تنبيهات المستحقات، ودرجات الامتحانات عبر الواتساب والرسائل
          </p>
        </div>
      </div>

      {sendSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم إرسال الرسائل للأولياء بنجاح وبشكل فوري!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 text-right">
            إنشاء رسالة جديدة
          </h3>

          <form onSubmit={handleSendMessage} className="space-y-4">
            {/* Target selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                الجهة المستهدفة:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    targetType === 'all'
                      ? 'bg-[#1e65e5] text-white border-[#1e65e5]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  جميع الطلاب
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('group')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    targetType === 'group'
                      ? 'bg-[#1e65e5] text-white border-[#1e65e5]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  مجموعة معينة
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('student')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    targetType === 'student'
                      ? 'bg-[#1e65e5] text-white border-[#1e65e5]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  طالب محدد
                </button>
              </div>
            </div>

            {/* Sub-selectors */}
            {targetType === 'group' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر المجموعة:
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1e65e5]"
                >
                  <option value="">-- اختر مجموعة --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.course})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الطالب:
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1e65e5]"
                >
                  <option value="">-- اختر طالباً --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ready Templates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                قوالب رسائل جاهزة:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('reminder')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    messageTemplate === 'reminder'
                      ? 'bg-blue-50 text-[#1e65e5] border-blue-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  تذكير بالموعد
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('fees')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    messageTemplate === 'fees'
                      ? 'bg-blue-50 text-[#1e65e5] border-blue-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  تذكير بالسداد
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('absence')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    messageTemplate === 'absence'
                      ? 'bg-blue-50 text-[#1e65e5] border-blue-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  إشعار غياب
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('exam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    messageTemplate === 'exam'
                      ? 'bg-blue-50 text-[#1e65e5] border-blue-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  نتيجة اختبار
                </button>
              </div>
            </div>

            {/* Custom Message Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نص الرسالة:
              </label>
              <textarea
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="اكتب الرسالة هنا..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:border-[#1e65e5]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1e65e5] hover:bg-[#1a57c5] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>إرسال الرسالة الآن عبر الواتساب</span>
            </button>
          </form>
        </div>

        {/* Logs Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">سجل الإشعارات المرسلة</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1e65e5] text-[10px] font-bold border border-blue-100">
                مباشر
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {sentLogs.map((log) => (
                <div key={log.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{log.target}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{log.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400">({log.channel})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center font-medium">
            يتم ربط الرسائل تلقائياً برقم هاتف ولي أمر الطالب وتنسيق الرسالة بصيغة مهذبة واحترافية.
          </div>
        </div>
      </div>
    </div>
  );
};
