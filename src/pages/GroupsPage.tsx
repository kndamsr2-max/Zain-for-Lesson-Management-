import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Users,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  Eye,
  Search,
} from 'lucide-react';
import { Group } from '../types';

interface GroupsPageProps {
  groups: Group[];
  onOpenAddGroup: () => void;
  onOpenEditGroup: (group: Group) => void;
  onOpenViewStudents: (group: Group) => void;
  onRequestDeleteGroup: (group: Group) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({
  groups,
  onOpenAddGroup,
  onOpenEditGroup,
  onOpenViewStudents,
  onRequestDeleteGroup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter((g) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      g.name.toLowerCase().includes(term) ||
      g.course.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section with Add button */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>إدارة المجموعات والصفوف</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تنظيم مجموعات الدروس، المواعيد، الأسعار، ومتابعة أعداد الطلاب المسجلين
          </p>
        </div>

        <button
          id="btn-add-group"
          onClick={onOpenAddGroup}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مجموعة جديدة</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-4 shadow-xl">
        <div className="max-w-md relative">
          <input
            id="groups-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المجموعة أو الكورس..."
            className="w-full pr-9 pl-3.5 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#142642] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            إجمالي المجموعات:{' '}
            <span className="text-white font-bold">{filteredGroups.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table id="groups-data-table" className="w-full text-right text-xs">
            <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">اسم المجموعة</th>
                <th className="px-4 py-3">الكورس</th>
                <th className="px-4 py-3">الأيام</th>
                <th className="px-4 py-3">وقت الحصة</th>
                <th className="px-4 py-3">سعر الاشتراك</th>
                <th className="px-4 py-3 text-center">عدد الطلاب</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102038] whitespace-nowrap">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    لا توجد مجموعات مطابقة
                  </td>
                </tr>
              ) : (
                filteredGroups.map((grp, idx) => (
                  <tr
                    key={grp.id}
                    id={`group-row-${grp.id}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {grp.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">
                      {grp.course}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{grp.days}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{grp.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {grp.fee} ج.م
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        id={`btn-group-students-badge-${grp.id}`}
                        onClick={() => onOpenViewStudents(grp)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-400/30 transition-colors cursor-pointer"
                        title="انقر لعرض طلاب المجموعة"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{grp.studentCount} طالب</span>
                      </button>
                    </td>
                    {/* Actions: View students - Edit - Delete */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`btn-view-group-students-${grp.id}`}
                          onClick={() => onOpenViewStudents(grp)}
                          title="عرض طلاب المجموعة"
                          className="px-2.5 py-1 text-xs text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 rounded-lg border border-sky-500/30 transition-colors font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>الطلاب</span>
                        </button>
                        <button
                          id={`btn-edit-group-${grp.id}`}
                          onClick={() => onOpenEditGroup(grp)}
                          title="تعديل المجموعة"
                          className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          aria-label="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-group-${grp.id}`}
                          onClick={() => onRequestDeleteGroup(grp)}
                          title="حذف المجموعة"
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
