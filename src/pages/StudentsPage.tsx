import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
} from 'lucide-react';
import { Group, Student } from '../types';

interface StudentsPageProps {
  students: Student[];
  groups: Group[];
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
  onOpenViewModal: (student: Student) => void;
  onRequestDelete: (student: Student) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  students,
  groups,
  onOpenAddModal,
  onOpenEditModal,
  onOpenViewModal,
  onRequestDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Filter students based on search (name or phone) and selected filters
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term));

    const matchesGroup =
      !selectedGroupFilter || s.groupId === selectedGroupFilter;

    const matchesStatus =
      !selectedStatusFilter || s.status === selectedStatusFilter;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Header section with Add button */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-400" />
            <span>إدارة الطلاب</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            عرض وتعديل ومتابعة بيانات الطلاب المسجلين والاشتراكات المالية
          </p>
        </div>

        <button
          id="btn-add-student"
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Search and Filters bar */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-4 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search by Name or Phone */}
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            البحث بالاسم أو رقم الهاتف
          </label>
          <div className="relative">
            <input
              id="students-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="اكتب اسم الطالب أو رقم الهاتف..."
              className="w-full pr-9 pl-3.5 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Filter by Group */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            تصفية بالمجموعة
          </label>
          <select
            id="students-filter-group"
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

        {/* Filter by Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            الحالة
          </label>
          <select
            id="students-filter-status"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
          >
            <option value="">جميع الحالات</option>
            <option value="نشط" className="bg-[#09152b] text-white">نشط</option>
            <option value="متوقف" className="bg-[#09152b] text-white">متوقف</option>
            <option value="مؤجل" className="bg-[#09152b] text-white">مؤجل</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#142642] flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-400">
            تم العثور على{' '}
            <span className="text-white font-bold">{filteredStudents.length}</span>{' '}
            طالب
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">لا يوجد طلاب مطابقين للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold">
                <tr>
                  <th className="px-4 py-3">كود الطالب</th>
                  <th className="px-4 py-3">اسم الطالب</th>
                  <th className="px-4 py-3">المجموعة</th>
                  <th className="px-4 py-3">رقم الهاتف</th>
                  <th className="px-4 py-3">المدفوع</th>
                  <th className="px-4 py-3">المتبقي</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102038]">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sky-400">
                      {s.code}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {s.groupName}
                    </td>
                    <td className="px-4 py-3 text-slate-300 dir-ltr text-right">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{s.phone}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      {s.paidAmount} ج.م
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-400">
                      {s.remainingAmount} ج.م
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'نشط'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : s.status === 'متوقف'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenViewModal(s)}
                          className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(s)}
                          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRequestDelete(s)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="حذف"
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
