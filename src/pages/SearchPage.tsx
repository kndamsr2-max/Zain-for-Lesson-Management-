import React, { useState } from 'react';
import {
  Search,
  Users,
  Phone,
  BookOpen,
  Wallet,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AttendanceRecord, Group, Student } from '../types';

interface SearchPageProps {
  students: Student[];
  groups: Group[];
  attendanceRecords: AttendanceRecord[];
  onViewStudent: (student: Student) => void;
  onOpenAttendanceHistory: (student: Student) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  students,
  groups,
  attendanceRecords,
  onViewStudent,
  onOpenAttendanceHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Search by name, phone, or group
  const searchResults = students.filter((student) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm =
      !term ||
      student.name.toLowerCase().includes(term) ||
      student.phone.includes(term) ||
      student.groupName.toLowerCase().includes(term);

    const matchesGroup = !selectedGroup || student.groupId === selectedGroup;

    return matchesTerm && matchesGroup;
  });

  const getAttendanceSummary = (studentId: string) => {
    const records = attendanceRecords.filter((r) => r.studentId === studentId);
    const present = records.filter((r) => r.status === 'حاضر').length;
    const total = records.length;
    return {
      present,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 100,
    };
  };

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
          <Search className="w-5 h-5 text-sky-400" />
          <span>البحث الموحد عن الطلاب</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ابحث عن أي طالب بالاسم، أو رقم الهاتف، أو اسم المجموعة لعرض ملفه وبياناته المالية والحضور فوراً
        </p>

        {/* Search controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <input
              id="unified-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="اكتب اسم الطالب، كوده، أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>

          <div>
            <select
              id="unified-group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
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
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>نتائج البحث: <strong className="text-white font-bold">{searchResults.length}</strong> طالب</span>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.length === 0 ? (
          <div className="col-span-full bg-[#08152b] rounded-2xl border border-[#173054] p-12 text-center text-slate-400">
            <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">لم يتم العثور على أي نتائج مطابقة</p>
          </div>
        ) : (
          searchResults.map((student) => {
            const att = getAttendanceSummary(student.id);

            return (
              <div
                key={student.id}
                className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl hover:border-sky-500/40 hover:shadow-[0_4px_20px_rgba(0,180,255,0.1)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-sky-400 block mb-0.5">
                        {student.code}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {student.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'نشط'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="dir-ltr text-right font-mono">{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{student.groupName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        المسدد: <strong className="text-emerald-400">{student.paidAmount}</strong> / المتبقي:{' '}
                        <strong className="text-rose-400">{student.remainingAmount} ج.م</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        حضور: <strong className="text-sky-400">{att.present} من {att.total}</strong> ({att.rate}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#142642] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewStudent(student)}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/25 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الملف الشخصي</span>
                  </button>
                  <button
                    onClick={() => onOpenAttendanceHistory(student)}
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#09152b] hover:bg-[#102242] text-slate-300 border border-[#1b3459] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="سجل الحضور"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>السجل</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
