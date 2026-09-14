import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Filter,
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
    <div className="space-y-6 select-none" dir="rtl">
      {/* Header section with Add button */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <span>سجل وإدارة الطلاب</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            عرض وتعديل ومتابعة بيانات الطلاب المسجلين والاشتراكات المالية والحضور
          </p>
        </div>

        <button
          id="btn-add-student"
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0055ee] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Search and Filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* Search by Name or Phone */}
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            البحث بالاسم أو رقم الهاتف
          </label>
          <div className="relative">
            <input
              id="students-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="اكتب اسم الطالب أو رقم الهاتف للبحث الفوري..."
              className="w-full pr-10 pl-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>
        </div>

        {/* Filter by Group */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            المجموعة الدراسية
          </label>
          <select
            id="students-filter-group"
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

        {/* Filter by Status */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            حالة الطالب
          </label>
          <select
            id="students-filter-status"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
          >
            <option value="">جميع الحالات</option>
            <option value="نشط">نشط</option>
            <option value="متوقف">متوقف</option>
            <option value="مؤجل">مؤجل</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs sm:text-sm font-bold text-slate-600">
            تم العثور على{' '}
            <span className="text-[#0066ff] font-black">{filteredStudents.length}</span>{' '}
            طالب
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">لا يوجد طلاب مطابقين للبحث</p>
            <p className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح أو أضف طالباً جديداً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                <tr>
                  <th className="px-4 py-3.5">كود الطالب</th>
                  <th className="px-4 py-3.5">اسم الطالب</th>
                  <th className="px-4 py-3.5">المجموعة</th>
                  <th className="px-4 py-3.5">رقم الهاتف</th>
                  <th className="px-4 py-3.5">المدفوع</th>
                  <th className="px-4 py-3.5">المتبقي</th>
                  <th className="px-4 py-3.5">الحالة</th>
                  <th className="px-4 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0066ff]">
                      {s.code}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {s.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {s.groupName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dir-ltr text-right font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.phone}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                      {s.paidAmount} ج.م
                    </td>
                    <td className="px-4 py-3.5 font-bold text-rose-600 font-mono">
                      {s.remainingAmount} ج.م
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          s.status === 'نشط'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.status === 'متوقف'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenViewModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0066ff] hover:bg-blue-50 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRequestDelete(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
