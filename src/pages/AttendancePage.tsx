import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  Save,
  Clock,
  Users,
} from 'lucide-react';
import { AttendanceRecord, Group, Student } from '../types';

interface AttendancePageProps {
  groups: Group[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (
    groupId: string,
    date: string,
    records: { studentId: string; status: 'حاضر' | 'غائب' }[]
  ) => void;
  onViewStudentHistory: (student: Student) => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  groups,
  students,
  attendanceRecords,
  onSaveAttendance,
  onViewStudentHistory,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups.length > 0 ? groups[0].id : ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Status mapping: { [studentId]: 'حاضر' | 'غائب' }
  const [attendanceState, setAttendanceState] = useState<Record<string, 'حاضر' | 'غائب'>>({});

  // Group students
  const groupStudents = students.filter((s) => s.groupId === selectedGroupId);

  // Sync state when group or date changes
  useEffect(() => {
    const existing = attendanceRecords.filter(
      (r) => r.groupId === selectedGroupId && r.date === selectedDate
    );
    const newState: Record<string, 'حاضر' | 'غائب'> = {};

    groupStudents.forEach((student) => {
      const match = existing.find((r) => r.studentId === student.id);
      newState[student.id] = match ? match.status : 'حاضر'; // default to حاضر
    });

    setAttendanceState(newState);
  }, [selectedGroupId, selectedDate, students, attendanceRecords]);

  const handleStatusChange = (studentId: string, status: 'حاضر' | 'غائب') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: 'حاضر' | 'غائب') => {
    const updated: Record<string, 'حاضر' | 'غائب'> = {};
    groupStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceState(updated);
  };

  const handleSave = () => {
    if (!selectedGroupId) return;
    const records = groupStudents.map((s) => ({
      studentId: s.id,
      status: attendanceState[s.id] || 'حاضر',
    }));
    onSaveAttendance(selectedGroupId, selectedDate, records);
  };

  // Stats calculation
  const presentCount = Object.values(attendanceState).filter((st) => st === 'حاضر').length;
  const absentCount = Object.values(attendanceState).filter((st) => st === 'غائب').length;

  return (
    <div className="space-y-5 select-none" dir="rtl">
      {/* Page Header */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span>تسجيل حضور وغياب الطلاب</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل الحصة اليومية وحفظ السجلات ومتابعة التزام الطلاب
          </p>
        </div>

        <button
          id="btn-save-attendance-top"
          onClick={handleSave}
          disabled={groupStudents.length === 0}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_2px_14px_rgba(0,102,255,0.35)] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ كشف الحضور</span>
        </button>
      </div>

      {/* Top Filter Selection: اختيار المجموعة + اختيار التاريخ */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-400" />
            <span>اختيار المجموعة</span>
          </label>
          <select
            id="attendance-group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
          >
            {groups.map((grp) => (
              <option key={grp.id} value={grp.id} className="bg-[#09152b] text-white">
                {grp.name} ({grp.course})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>اختيار التاريخ</span>
          </label>
          <input
            id="attendance-date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#09152b] text-slate-100 border border-[#1b3459] rounded-xl focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Attendance Table Card */}
      <div className="bg-[#08152b] rounded-2xl border border-[#173054] shadow-xl overflow-hidden">
        {/* Controls and Counters */}
        <div className="p-4 border-b border-[#142642] flex flex-wrap items-center justify-between gap-3 bg-[#0a1832]">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">عدد الطلاب بالحصّة:</span>
              <span className="font-bold text-white">{groupStudents.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">حاضر:</span>
              <span className="font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {presentCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400">غائب:</span>
              <span className="font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                {absentCount}
              </span>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-mark-all-present"
              type="button"
              onClick={() => handleMarkAll('حاضر')}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
            >
              تحديد الكل حاضر
            </button>
            <button
              id="btn-mark-all-absent"
              type="button"
              onClick={() => handleMarkAll('غائب')}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
            >
              تحديد الكل غائب
            </button>
          </div>
        </div>

        {/* Student list: | الطالب | حاضر | غائب | + سجل الحضور */}
        <div className="overflow-x-auto">
          <table id="attendance-table" className="w-full text-right text-xs">
            <thead className="bg-[#0a1832] text-slate-400 border-b border-[#142642] font-semibold whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">اسم الطالب</th>
                <th className="px-4 py-3">رقم الهاتف</th>
                <th className="px-4 py-3 text-center">حاضر</th>
                <th className="px-4 py-3 text-center">غائب</th>
                <th className="px-4 py-3 text-center">سجل حضور الطالب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102038]">
              {groupStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    لا يوجد طلاب مسجلين في هذه المجموعة حتى الآن.
                  </td>
                </tr>
              ) : (
                groupStudents.map((student, idx) => {
                  const currentStatus = attendanceState[student.id] || 'حاضر';
                  const isPresent = currentStatus === 'حاضر';
                  const isAbsent = currentStatus === 'غائب';

                  return (
                    <tr
                      key={student.id}
                      id={`attendance-row-${student.id}`}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isAbsent ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300 dir-ltr text-right">
                        {student.phone}
                      </td>

                      {/* حاضر Option */}
                      <td className="px-4 py-3 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={isPresent}
                            onChange={() => handleStatusChange(student.id, 'حاضر')}
                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 border-slate-700 bg-slate-900"
                          />
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isPresent
                                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                : 'text-slate-400 hover:text-emerald-300'
                            }`}
                          >
                            حاضر
                          </span>
                        </label>
                      </td>

                      {/* غائب Option */}
                      <td className="px-4 py-3 text-center">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={isAbsent}
                            onChange={() => handleStatusChange(student.id, 'غائب')}
                            className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-slate-700 bg-slate-900"
                          />
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isAbsent
                                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                                : 'text-slate-400 hover:text-rose-300'
                            }`}
                          >
                            غائب
                          </span>
                        </label>
                      </td>

                      {/* سجل الحضور */}
                      <td className="px-4 py-3 text-center">
                        <button
                          id={`btn-student-attendance-log-${student.id}`}
                          onClick={() => onViewStudentHistory(student)}
                          className="text-xs text-sky-400 hover:bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>سجل الطالب</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer save action */}
        <div className="p-4 border-t border-[#142642] bg-[#09152b] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            تأكد من اختيار التاريخ والمجموعة بدقة قبل الحفظ.
          </span>
          <button
            id="btn-save-attendance-bottom"
            onClick={handleSave}
            disabled={groupStudents.length === 0}
            className="px-5 py-2 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#0077ff] hover:to-[#0066ff] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-[0_2px_12px_rgba(0,102,255,0.35)] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الحضور</span>
          </button>
        </div>
      </div>
    </div>
  );
};
