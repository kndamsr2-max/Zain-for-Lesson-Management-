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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100">
              <Search className="w-5 h-5" />
            </div>
            <span>البحث الموحد عن الطلاب</span>
          </h2>
          {isSearchingDB && (
            <div className="flex items-center gap-1.5 text-xs text-[#0066ff] font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الاستعلام المباشر من قاعدة البيانات...</span>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
              className="w-full pr-10 pl-16 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold transition-colors cursor-pointer"
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
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white font-semibold"
            >
              <option value="">جميع المجموعات ({groups.length})</option>
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
        <span>
          نتائج البحث: <strong className="text-slate-800 font-black">{searchResults.length}</strong> طالب
          {(searchTerm || selectedGroup) && ' (مطابق للفلتر المحدد)'}
        </span>
        {(searchTerm || selectedGroup) && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-xs text-[#0066ff] hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إلغاء الفلترة</span>
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-xs">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">لم يتم العثور على أي نتائج مطابقة</p>
            <p className="text-xs text-slate-400 mt-1">
              تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح، أو جرب اختيار "جميع المجموعات"
            </p>
            {(searchTerm || selectedGroup) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-blue-50 text-[#0066ff] border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-[#0066ff] block mb-0.5">
                        {student.code || 'ST-' + student.id.slice(0, 6)}
                      </span>
                      <h3 className="text-base font-bold text-slate-800">
                        {student.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'نشط'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-800">{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.groupName || 'بدون مجموعة'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        المسدد: <strong className="text-emerald-600 font-mono font-bold">{fin.totalPaid} ج.م</strong> / المتبقي:{' '}
                        <strong className={`font-mono font-bold ${fin.remaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {fin.remaining} ج.م
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        حضور: <strong className="text-[#0066ff] font-mono font-bold">{att.present} من {att.total}</strong> ({att.rate}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewStudent(student)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#0066ff] border border-blue-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>الملف والتقرير</span>
                  </button>
                  <button
                    onClick={() => onOpenAttendanceHistory(student)}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
