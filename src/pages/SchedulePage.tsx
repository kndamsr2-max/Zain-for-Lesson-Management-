import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { Group, LessonSession } from '../types';

interface SchedulePageProps {
  sessions: LessonSession[];
  groups: Group[];
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ sessions, groups }) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // If sessions table has records use them, otherwise derive schedule from groups
  const displaySessions: LessonSession[] =
    sessions.length > 0
      ? sessions
      : groups.map((g) => ({
          id: `ses-${g.id}`,
          groupId: g.id,
          groupName: g.name,
          course: g.course,
          day: g.days,
          date: new Date().toISOString().split('T')[0],
          time: g.time,
          studentCount: g.studentCount,
        }));

  const filteredSessions = displaySessions.filter((s) => {
    return !selectedGroupFilter || s.groupId === selectedGroupFilter;
  });

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100">
              <Calendar className="w-5 h-5" />
            </div>
            <span>جدول الحصص والمواعيد</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            جدول تفصيلي بمواعيد الحصص والمجموعات الدراسية وأعداد الطلاب المسجلين
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            id="btn-schedule-view-cards"
            onClick={() => setViewMode('cards')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-[#0066ff] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بطاقات المواعيد
          </button>
          <button
            id="btn-schedule-view-table"
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#0066ff] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جدول منظم
          </button>
        </div>
      </div>

      {/* Filter by group */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            تصفية بالمجموعة
          </label>
          <select
            id="schedule-filter-group"
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
          >
            <option value="">جميع المجموعات</option>
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs sm:text-sm font-bold text-slate-600">
          إجمالي الحصص المجدولة:{' '}
          <span className="text-[#0066ff] font-black">{filteredSessions.length}</span>
        </div>
      </div>

      {/* Grid or Table display */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-xs">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-600">لا توجد حصص مجدولة حالياً</p>
          <p className="text-xs text-slate-400 mt-1">تأكد من تسجيل مجموعات بأيام وتوقيتات محددة.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((ses) => (
            <div
              key={ses.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0066ff] border border-blue-200">
                    {ses.course || 'مادة عامة'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ses.time}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 mt-3">{ses.groupName}</h3>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>الأيام: <strong className="text-slate-800">{ses.day}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>عدد الطلاب: <strong className="text-slate-800 font-mono">{ses.studentCount || 0} طالب</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold">الحصة مستمرة أسبوعياً</span>
                <span className="font-mono text-slate-400 text-[11px]">{ses.date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">المجموعة</th>
                  <th className="px-4 py-3.5">المادة</th>
                  <th className="px-4 py-3.5">أيام الحصة</th>
                  <th className="px-4 py-3.5">التوقيت</th>
                  <th className="px-4 py-3.5 text-center">الطلاب</th>
                  <th className="px-4 py-3.5">التاريخ المجدول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((ses, idx) => (
                  <tr key={ses.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{ses.groupName}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{ses.course}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{ses.day}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-bold font-mono">{ses.time}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#0066ff] font-mono">
                      {ses.studentCount || 0}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{ses.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
