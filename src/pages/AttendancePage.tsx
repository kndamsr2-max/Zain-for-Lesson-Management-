import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  Save,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Group, Student } from '../types';

interface AttendancePageProps {
  groups: Group[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (
    groupId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus }[]
  ) => void;
  onViewStudentHistory: (student: Student) => void;
  isLoading?: boolean;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  groups,
  students,
  attendanceRecords,
  onSaveAttendance,
  onViewStudentHistory,
  isLoading = false,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups.length > 0 ? groups[0].id : ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Update selectedGroupId if groups change and current is empty or invalid
  useEffect(() => {
    if (groups.length > 0 && (!selectedGroupId || !groups.find((g) => g.id === selectedGroupId))) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Status mapping: { [studentId]: 'حاضر' | 'غائب' | 'متأخر' }
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});

  // Group students dynamically from real students state
  const groupStudents = students.filter((s) => s.groupId === selectedGroupId);

  // Sync state when group or date changes: load existing recorded attendance from Supabase records
  useEffect(() => {
    const existing = attendanceRecords.filter(
      (r) => r.groupId === selectedGroupId && r.date === selectedDate
    );
    const newState: Record<string, AttendanceStatus> = {};

    if (existing.length > 0) {
      existing.forEach((r) => {
        newState[r.studentId] = r.status;
      });
    } else {
      // Default to 'حاضر' for all current students
      groupStudents.forEach((s) => {
        newState[s.id] = 'حاضر';
      });
    }

    setAttendanceState(newState);
  }, [selectedGroupId, selectedDate, attendanceRecords, students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newState: Record<string, AttendanceStatus> = {};
    groupStudents.forEach((s) => {
      newState[s.id] = status;
    });
    setAttendanceState(newState);
  };

  const handleSave = () => {
    if (!selectedGroupId) return;
    const records = groupStudents.map((s) => ({
      studentId: s.id,
      status: attendanceState[s.id] || 'حاضر',
    }));
    onSaveAttendance(selectedGroupId, selectedDate, records);
  };

  // Compute counters
  const presentCount = groupStudents.filter((s) => (attendanceState[s.id] || 'حاضر') === 'حاضر').length;
  const absentCount = groupStudents.filter((s) => attendanceState[s.id] === 'غائب').length;
  const lateCount = groupStudents.filter((s) => attendanceState[s.id] === 'متأخر').length;

  const isAlreadyRecorded = attendanceRecords.some(
    (r) => r.groupId === selectedGroupId && r.date === selectedDate
  );

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span>تسجيل حضور وغياب الطلاب</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تسجيل الحصة اليومية وحفظ السجلات في Supabase مع منع التكرار وإمكانية التعديل
          </p>
        </div>

        <button
          id="btn-save-attendance-top"
          onClick={handleSave}
          disabled={groupStudents.length === 0 || isLoading}
          className="px-5 py-2.5 bg-[#0066ff] hover:bg-[#0055ee] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isAlreadyRecorded ? 'تحديث كشف الحضور' : 'حفظ كشف الحضور'}</span>
        </button>
      </div>

      {/* Notice if already recorded for date */}
      {isAlreadyRecorded && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-900 flex items-center gap-2 font-medium">
          <Clock className="w-4 h-4 text-[#0066ff] shrink-0" />
          <span>
            يوجد كشف حضور مسجل مسبقاً لهذه المجموعة بتاريخ {selectedDate}. يمكنك تعديل حالة أي طالب والضغط على حفظ لتحديث الكشف.
          </span>
        </div>
      )}

      {/* Top Filter Selection: اختيار المجموعة + اختيار التاريخ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0066ff]" />
            <span>اختيار المجموعة</span>
          </label>
          {groups.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">لا توجد مجموعات مسجلة في النظام.</div>
          ) : (
            <select
              id="attendance-group-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
            >
              {groups.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({grp.course})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0066ff]" />
            <span>اختيار التاريخ</span>
          </label>
          <input
            id="attendance-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0066ff] focus:bg-white"
          />
        </div>
      </div>

      {/* Attendance Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls and Counters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>طلاب الحصّة:</span>
              <span className="text-slate-900 font-black">{groupStudents.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-700">حاضر:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {presentCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-700">غائب:</span>
              <span className="font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                {absentCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700">متأخر:</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {lateCount}
              </span>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-mark-all-present"
              type="button"
              onClick={() => handleMarkAll('حاضر')}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              تحديد الكل حاضر
            </button>
            <button
              id="btn-mark-all-absent"
              type="button"
              onClick={() => handleMarkAll('غائب')}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-lg transition-colors cursor-pointer"
            >
              تحديد الكل غائب
            </button>
            <button
              id="btn-mark-all-late"
              type="button"
              onClick={() => handleMarkAll('متأخر')}
              className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              تحديد الكل متأخر
            </button>
          </div>
        </div>

        {/* Student list */}
        <div className="overflow-x-auto">
          <table id="attendance-table" className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold whitespace-nowrap">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">اسم الطالب</th>
                <th className="px-4 py-3.5">رقم الهاتف</th>
                <th className="px-4 py-3.5 text-center">حاضر</th>
                <th className="px-4 py-3.5 text-center">غائب</th>
                <th className="px-4 py-3.5 text-center">متأخر</th>
                <th className="px-4 py-3.5 text-center">سجل الطالب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن.
                  </td>
                </tr>
              ) : (
                groupStudents.map((student, idx) => {
                  const currentStatus = attendanceState[student.id] || 'حاضر';
                  const isPresent = currentStatus === 'حاضر';
                  const isAbsent = currentStatus === 'غائب';
                  const isLate = currentStatus === 'متأخر';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{student.name}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono text-xs">{student.phone}</td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'حاضر')}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'
                          }`}
                          title="حاضر"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'غائب')}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isAbsent
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-700'
                          }`}
                          title="غائب"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'متأخر')}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            isLate
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-700'
                          }`}
                          title="متأخر"
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onViewStudentHistory(student)}
                          className="px-3 py-1.5 text-xs text-[#0066ff] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors font-bold cursor-pointer"
                        >
                          سجل الحضور
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
