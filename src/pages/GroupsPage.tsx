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
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header section with Add button */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Layers className="w-5 h-5" />
            </div>
            <span>إدارة المجموعات والصفوف</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تنظيم مجموعات الدروس، المواعيد، الأسعار، ومتابعة أعداد الطلاب المسجلين
          </p>
        </div>

        <button
          id="btn-add-group"
          onClick={onOpenAddGroup}
          className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مجموعة جديدة</span>
        </button>
      </div>

      {/* Search and Quick Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md relative">
          <input
            id="groups-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المجموعة أو المادة الدراسية..."
            className="w-full pr-10 pl-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="text-xs sm:text-sm font-bold text-slate-600 self-end sm:self-center">
          إجمالي المجموعات:{' '}
          <span className="text-[#0066ff] font-black">{filteredGroups.length}</span>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">لا توجد مجموعات مطابقة للبحث</p>
            <p className="text-xs text-slate-400 mt-1">أضف مجموعات دراسية جديدة لبدء تسجيل الطلاب وجداول الحصص.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">اسم المجموعة</th>
                  <th className="px-4 py-3.5">المادة / الكورس</th>
                  <th className="px-4 py-3.5">أيام الحصص</th>
                  <th className="px-4 py-3.5">التوقيت</th>
                  <th className="px-4 py-3.5">الاشتراك</th>
                  <th className="px-4 py-3.5 text-center">الطلاب</th>
                  <th className="px-4 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map((grp, idx) => (
                  <tr
                    key={grp.id}
                    id={`group-row-${grp.id}`}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {grp.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {grp.course}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{grp.days}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{grp.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                      {grp.fee} ج.م
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        id={`btn-group-students-badge-${grp.id}`}
                        onClick={() => onOpenViewStudents(grp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0066ff] hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        title="انقر لعرض طلاب المجموعة"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{grp.studentCount} طالب</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`btn-view-group-students-${grp.id}`}
                          onClick={() => onOpenViewStudents(grp)}
                          title="عرض طلاب المجموعة"
                          className="px-2.5 py-1 text-xs text-[#0066ff] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>الطلاب</span>
                        </button>
                        <button
                          id={`btn-edit-group-${grp.id}`}
                          onClick={() => onOpenEditGroup(grp)}
                          title="تعديل المجموعة"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          aria-label="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-group-${grp.id}`}
                          onClick={() => onRequestDeleteGroup(grp)}
                          title="حذف المجموعة"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
