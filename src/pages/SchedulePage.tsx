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

  const filteredSessions = sessions.filter((s) => {
    return !selectedGroupFilter || s.groupId === selectedGroupFilter;
  });

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-sky-400" />
            <span>جدول الحصص القادمة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جدول أسبوعي تفصيلي بمواعيد المجموعات، القاعات، وأعداد الطلاب
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-[#09152b] border border-[#1b3459] p-1 rounded-xl">
          <button
            id="btn-schedule-view-cards"
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white shadow-[0_2px_10px_rgba(0,102,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            عرض بطاقات
          </button>
          <button
            id="btn-schedule-view-table"
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white shadow-[0_2px_10px_rgba(0,102,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            عرض جدول
          </button>
        </div>
      </div>

      {/* Filter by Group */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-4 shadow-xl">
        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            تصفية بالمجموعة
          </label>
          <select
            id="schedule-group-filter"
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
          >
            <option value="">جميع المجموعات</option>
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id} className="bg-[#09152b] text-white">
                {grp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Rendering: Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((ses) => (
            <div
              key={ses.id}
              className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl hover:border-sky-500/40 hover:shadow-[0_4px_20px_rgba(0,180,255,0.1)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="px-2.5 py-1 bg-sky-500/15 text-sky-300 rounded-lg text-xs font-bold border border-sky-400/20">
                    {ses.day}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>{ses.studentCount} طالب</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-3">
                  {ses.groupName}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ses.course}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#142642] flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{ses.time}</span>
                </div>
                {ses.room && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ses.room}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">اليوم</th>
                  <th className="px-4 py-3">الوقت</th>
                  <th className="px-4 py-3">المجموعة</th>
                  <th className="px-4 py-3">الكورس</th>
                  <th className="px-4 py-3">القاعة</th>
                  <th className="px-4 py-3 text-center">عدد الطلاب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102038] whitespace-nowrap">
                {filteredSessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-sky-400">
                      {ses.day}
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {ses.time}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {ses.groupName}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {ses.course}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {ses.room || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                        {ses.studentCount} طالب
                      </span>
                    </td>
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
