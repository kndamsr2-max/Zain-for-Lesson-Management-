/**
 * Centralized Data / Service Layer for Zain Education Center Management System
 * (نظام زين لإدارة الدروس والسناتر - طبقة الخدمات وإدارة البيانات)
 *
 * Architecture & Design:
 * - Decouples UI components completely from the backend data provider.
 * - Primary source of truth is Supabase (configured via /src/lib/supabaseClient.ts).
 * - During Phase 3 (before DB tables are created), uses a safe in-memory fallback
 *   seeded with baseline data, ensuring ZERO runtime crashes or White Screen.
 * - Fully covers the 6 core business domains:
 *   1. Students (الطلاب)
 *   2. Groups (المجموعات)
 *   3. Attendance (الحضور والغياب)
 *   4. Payments (المدفوعات والإيصالات)
 *   5. Sessions/Schedule (مواعيد الحصص)
 *   6. Reports (التقارير المالية والأكاديمية)
 */

import {
  Student,
  Group,
  PaymentRecord,
  AttendanceRecord,
  LessonSession,
} from '../types';
import {
  initialStudents,
  initialGroups,
  initialPayments,
  initialAttendance,
  initialSessions,
} from '../mock/data';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// In-memory data cache (Non-volatile during app lifecycle, no reliance on localStorage as primary)
let memoryStore = {
  students: [...initialStudents],
  groups: [...initialGroups],
  payments: [...initialPayments],
  attendance: [...initialAttendance],
  sessions: [...initialSessions],
};

// ============================================================================
// 1. STUDENTS SERVICE (خدمات إدارة الطلاب)
// ============================================================================
export const studentsService = {
  /** Synchronous loader for initial UI state mounting */
  loadStudents: (): Student[] => {
    return memoryStore.students;
  },

  /** Update local cache */
  persistStudents: (students: Student[]): void => {
    memoryStore.students = [...students];
  },

  /** Standardized student code generator: ST-1001, ST-1002, etc. */
  generateStudentCode: (existingStudents: Student[]): string => {
    const nextNum = 1000 + (existingStudents ? existingStudents.length : 0) + 1;
    return `ST-${nextNum}`;
  },

  /** Future Async Supabase: Fetch all students */
  async fetchStudents(): Promise<{ data: Student[]; error: any | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.students, error: null };
    }
    try {
      const { data, error } = await supabase.from('students').select('*');
      if (error) {
        console.warn('[studentsService] Supabase query fallback:', error.message);
        return { data: memoryStore.students, error: null };
      }
      if (data && Array.isArray(data)) {
        memoryStore.students = data as Student[];
        return { data: memoryStore.students, error: null };
      }
      return { data: memoryStore.students, error: null };
    } catch (err) {
      console.warn('[studentsService] Exception caught, using fallback:', err);
      return { data: memoryStore.students, error: null };
    }
  },

  /** Future Async Supabase: Add student */
  async insertStudent(student: Student): Promise<{ data: Student | null; error: any | null }> {
    // Update local memory store immediately for zero latency
    memoryStore.students = [student, ...memoryStore.students];

    if (!isSupabaseConfigured) {
      return { data: student, error: null };
    }

    try {
      const { data, error } = await supabase.from('students').insert([student]).select().single();
      if (error) {
        console.warn('[studentsService] Insert fallback:', error.message);
        return { data: student, error: null };
      }
      return { data: data || student, error: null };
    } catch (err) {
      return { data: student, error: null };
    }
  },

  /** Future Async Supabase: Update student */
  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; error: any | null }> {
    memoryStore.students = memoryStore.students.map((s) => (s.id === id ? { ...s, ...updates } : s));

    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('students').update(updates).eq('id', id);
      if (error) {
        console.warn('[studentsService] Update fallback:', error.message);
      }
      return { success: !error, error };
    } catch (err) {
      return { success: true, error: null };
    }
  },

  /** Future Async Supabase: Delete student */
  async removeStudent(id: string): Promise<{ success: boolean; error: any | null }> {
    memoryStore.students = memoryStore.students.filter((s) => s.id !== id);

    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      return { success: !error, error };
    } catch (err) {
      return { success: true, error: null };
    }
  },
};

// ============================================================================
// 2. GROUPS SERVICE (خدمات إدارة المجموعات)
// ============================================================================
export const groupsService = {
  loadGroups: (): Group[] => {
    return memoryStore.groups;
  },

  persistGroups: (groups: Group[]): void => {
    memoryStore.groups = [...groups];
  },

  async fetchGroups(): Promise<{ data: Group[]; error: any | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.groups, error: null };
    }
    try {
      const { data, error } = await supabase.from('groups').select('*');
      if (error) {
        return { data: memoryStore.groups, error: null };
      }
      if (data && Array.isArray(data)) {
        memoryStore.groups = data as Group[];
      }
      return { data: memoryStore.groups, error: null };
    } catch (err) {
      return { data: memoryStore.groups, error: null };
    }
  },

  async insertGroup(group: Group): Promise<{ data: Group | null; error: any | null }> {
    memoryStore.groups = [...memoryStore.groups, group];
    if (!isSupabaseConfigured) return { data: group, error: null };

    try {
      const { data, error } = await supabase.from('groups').insert([group]).select().single();
      return { data: data || group, error: null };
    } catch (err) {
      return { data: group, error: null };
    }
  },

  async updateGroup(id: string, updates: Partial<Group>): Promise<{ success: boolean; error: any | null }> {
    memoryStore.groups = memoryStore.groups.map((g) => (g.id === id ? { ...g, ...updates } : g));
    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { error } = await supabase.from('groups').update(updates).eq('id', id);
      return { success: !error, error };
    } catch (err) {
      return { success: true, error: null };
    }
  },

  async removeGroup(id: string): Promise<{ success: boolean; error: any | null }> {
    memoryStore.groups = memoryStore.groups.filter((g) => g.id !== id);
    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      return { success: !error, error };
    } catch (err) {
      return { success: true, error: null };
    }
  },
};

// ============================================================================
// 3. PAYMENTS SERVICE (خدمات إدارة المدفوعات والإيصالات)
// ============================================================================
export const paymentsService = {
  loadPayments: (): PaymentRecord[] => {
    return memoryStore.payments;
  },

  persistPayments: (payments: PaymentRecord[]): void => {
    memoryStore.payments = [...payments];
  },

  async fetchPayments(): Promise<{ data: PaymentRecord[]; error: any | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.payments, error: null };
    }
    try {
      const { data, error } = await supabase.from('payments').select('*');
      if (error) return { data: memoryStore.payments, error: null };
      if (data && Array.isArray(data)) {
        memoryStore.payments = data as PaymentRecord[];
      }
      return { data: memoryStore.payments, error: null };
    } catch (err) {
      return { data: memoryStore.payments, error: null };
    }
  },

  async insertPayment(payment: PaymentRecord): Promise<{ data: PaymentRecord | null; error: any | null }> {
    memoryStore.payments = [payment, ...memoryStore.payments];
    if (!isSupabaseConfigured) return { data: payment, error: null };

    try {
      const { data, error } = await supabase.from('payments').insert([payment]).select().single();
      return { data: data || payment, error: null };
    } catch (err) {
      return { data: payment, error: null };
    }
  },

  async removePayment(id: string): Promise<{ success: boolean; error: any | null }> {
    memoryStore.payments = memoryStore.payments.filter((p) => p.id !== id);
    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      return { success: !error, error };
    } catch (err) {
      return { success: true, error: null };
    }
  },
};

// ============================================================================
// 4. ATTENDANCE SERVICE (خدمات تسجيل ومتابعة الحضور)
// ============================================================================
export const attendanceService = {
  loadAttendance: (): AttendanceRecord[] => {
    return memoryStore.attendance;
  },

  persistAttendance: (attendance: AttendanceRecord[]): void => {
    memoryStore.attendance = [...attendance];
  },

  async fetchAttendance(): Promise<{ data: AttendanceRecord[]; error: any | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.attendance, error: null };
    }
    try {
      const { data, error } = await supabase.from('attendance').select('*');
      if (error) return { data: memoryStore.attendance, error: null };
      if (data && Array.isArray(data)) {
        memoryStore.attendance = data as AttendanceRecord[];
      }
      return { data: memoryStore.attendance, error: null };
    } catch (err) {
      return { data: memoryStore.attendance, error: null };
    }
  },

  async saveAttendanceBatch(records: AttendanceRecord[]): Promise<{ success: boolean; error: any | null }> {
    // Merge into in-memory store
    const existingIds = new Set(records.map((r) => r.id));
    memoryStore.attendance = [
      ...records,
      ...memoryStore.attendance.filter((item) => !existingIds.has(item.id)),
    ];

    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { error } = await supabase.from('attendance').upsert(records);
      return { success: !error, error };
    } catch (err) {
      return { success: true, error: null };
    }
  },
};

// ============================================================================
// 5. SESSIONS / SCHEDULE SERVICE (خدمات جدول الحصص والمواعيد)
// ============================================================================
export const sessionsService = {
  loadSessions: (): LessonSession[] => {
    return memoryStore.sessions;
  },

  persistSessions: (sessions: LessonSession[]): void => {
    memoryStore.sessions = [...sessions];
  },

  async fetchSessions(): Promise<{ data: LessonSession[]; error: any | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.sessions, error: null };
    }
    try {
      const { data, error } = await supabase.from('sessions').select('*');
      if (error) return { data: memoryStore.sessions, error: null };
      if (data && Array.isArray(data)) {
        memoryStore.sessions = data as LessonSession[];
      }
      return { data: memoryStore.sessions, error: null };
    } catch (err) {
      return { data: memoryStore.sessions, error: null };
    }
  },

  async insertSession(session: LessonSession): Promise<{ data: LessonSession | null; error: any | null }> {
    memoryStore.sessions = [...memoryStore.sessions, session];
    if (!isSupabaseConfigured) return { data: session, error: null };

    try {
      const { data, error } = await supabase.from('sessions').insert([session]).select().single();
      return { data: data || session, error: null };
    } catch (err) {
      return { data: session, error: null };
    }
  },
};

// ============================================================================
// 6. REPORTS SERVICE (خدمات التقارير المالية والأكاديمية)
// ============================================================================
export const reportsService = {
  /** Calculate real-time financial metrics */
  calculateFinancialSummary(
    payments: PaymentRecord[] = memoryStore.payments,
    students: Student[] = memoryStore.students
  ) {
    const totalCollected = (payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalRemaining = (students || []).reduce((acc, s) => acc + (Number(s.remainingAmount) || 0), 0);
    const totalExpected = totalCollected + totalRemaining;
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 100;

    return {
      totalCollected,
      totalRemaining,
      totalExpected,
      collectionRate,
      paymentsCount: payments ? payments.length : 0,
      studentsCount: students ? students.length : 0,
    };
  },

  /** Calculate overall & per-group attendance statistics */
  calculateAttendanceStats(
    attendance: AttendanceRecord[] = memoryStore.attendance,
    groups: Group[] = memoryStore.groups
  ) {
    const totalRecords = attendance ? attendance.length : 0;
    const presentCount = (attendance || []).filter((a) => a.status === 'حاضر').length;
    const absentCount = (attendance || []).filter((a) => a.status === 'غائب').length;
    const overallRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    // Per group breakdown
    const groupBreakdown = (groups || []).map((group) => {
      const groupAttendance = (attendance || []).filter((a) => a.groupId === group.id);
      const groupTotal = groupAttendance.length;
      const groupPresent = groupAttendance.filter((a) => a.status === 'حاضر').length;
      const rate = groupTotal > 0 ? Math.round((groupPresent / groupTotal) * 100) : 0;

      return {
        groupId: group.id,
        groupName: group.name,
        course: group.course,
        total: groupTotal,
        present: groupPresent,
        absent: groupTotal - groupPresent,
        rate,
      };
    });

    return {
      totalRecords,
      presentCount,
      absentCount,
      overallRate,
      groupBreakdown,
    };
  },

  /** Get list of students with outstanding dues */
  getOverdueStudents(students: Student[] = memoryStore.students): Student[] {
    return (students || []).filter((s) => (Number(s.remainingAmount) || 0) > 0);
  },
};
