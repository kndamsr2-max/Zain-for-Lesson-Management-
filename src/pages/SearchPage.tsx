import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  Phone,
  BookOpen,
  Wallet,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { AttendanceRecord, Group, PaymentRecord, Student } from '../types';
import { studentsService } from '../services/dataService';

interface SearchPageProps {
  students: Student[];
  groups: Group[];
  payments?: PaymentRecord[];
  attendanceRecords: AttendanceRecord[];
  initialSearchTerm?: string;
  onViewStudent: (student: Student) => void;
  onOpenAttendanceHistory: (student: Student) => void;
}

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, ''); // strip tashkeel/diacritics
}

export const SearchPage: React.FC<SearchPageProps> = ({
  students,
  groups,
  payments = [],
  attendanceRecords,
  initialSearchTerm = '',
  onViewStudent,
  onOpenAttendanceHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const [dbResults, setDbResults] = useState<Student[] | null>(null);

  // Sync when initialSearchTerm changes from TopBar
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Debounced direct Supabase search with race condition prevention
  const searchTimeoutRef = useRef<any>(null);
  const searchSeqRef = useRef<number>(0);
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term && !selectedGroup) {
      setDbResults(null);
      setIsSearchingDB(false);
      return;
    }

    setIsSearchingDB(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const currentSeq = ++searchSeqRef.current;

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await studentsService.searchStudents(term, selectedGroup || undefined);
        if (currentSeq === searchSeqRef.current) {
          if (res.data) {
            setDbResults(res.data);
          }
        }
      } catch (err) {
        console.warn('DB Search notice:', err);
      } finally {
        if (currentSeq === searchSeqRef.current) {
          setIsSearchingDB(false);
        }
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedGroup]);

  // Display results: prefer DB results if available, otherwise filter current memory students
  const activeStudentsList = dbResults !== null ? dbResults : students;

  const searchResults = activeStudentsList.filter((student) => {
    const rawTerm = searchTerm.trim();
    if (!rawTerm && !selectedGroup) return true;

    const normTerm = normalizeArabic(rawTerm);
    const normName = normalizeArabic(student.name);
    const normGroup = normalizeArabic(student.groupName);
    const normCode = normalizeArabic(student.code || '');

    const matchesTerm =
      !rawTerm ||
      normName.includes(normTerm) ||
      student.phone.includes(rawTerm) ||
      normCode.includes(normTerm) ||
      normGroup.includes(normTerm);

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

  const getFinancialSummary = (student: Student) => {
    const stPayments = payments.filter((p) => p.studentId === student.id);
    const totalPaid = stPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const fee = Number(student.subscriptionFee) || 0;
    const remaining = Math.max(0, fee - totalPaid);
    return {
      fee,
      totalPaid,
      remaining,
    };
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedGroup('');
    setDbResults(null);
  };

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <Search className="w-5 h-5 text-sky-400" />
            <span>البحث الموحد عن الطلاب</span>
          </h2>
          {isSearchingDB && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الاستعلام المباشر من Supabase...</span>
            </div>
          )}
        </div>
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
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                مسح
              </button>
            )}
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
        <span>
          نتائج البحث: <strong className="text-white font-bold">{searchResults.length}</strong> طالب
          {(searchTerm || selectedGroup) && ' (مطابق للفلتر المحدد)'}
        </span>
        {(searchTerm || selectedGroup) && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إلغاء الفلترة</span>
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.length === 0 ? (
          <div className="col-span-full bg-[#08152b] rounded-2xl border border-[#173054] p-12 text-center text-slate-400">
            <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-200">لم يتم العثور على أي نتائج مطابقة</p>
            <p className="text-xs text-slate-400 mt-1">
              تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو جرب اختيار "جميع المجموعات"
            </p>
            {(searchTerm || selectedGroup) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold hover:bg-sky-500/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط البحث</span>
              </button>
            )}
          </div>
        ) : (
          searchResults.map((student) => {
            const att = getAttendanceSummary(student.id);
            const fin = getFinancialSummary(student);

            return (
              <div
                key={student.id}
                className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl hover:border-sky-500/40 hover:shadow-[0_4px_20px_rgba(0,180,255,0.1)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-sky-400 block mb-0.5">
                        {student.code || 'ST-' + student.id.slice(0, 6)}
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
                        المسدد: <strong className="text-emerald-400">{fin.totalPaid} ج.م</strong> / المتبقي:{' '}
                        <strong className={fin.remaining > 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {fin.remaining} ج.م
                        </strong>
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
                    <span>الملف والتقرير</span>
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
