/**
 * Centralized Data / Service Layer for Zain Education Center Management System
 * (نظام زين لإدارة الدروس والسناتر - طبقة الخدمات وإدارة البيانات)
 *
 * Architecture & Design:
 * - Supabase is the SINGLE and PRIMARY source of truth.
 * - Dynamic calculations for financial remaining and payments.
 * - Full CRUD with error handling returning clear, descriptive Arabic messages.
 * - Multi-device synchronization supported with Realtime channels.
 */

import {
  Student,
  Group,
  PaymentRecord,
  AttendanceRecord,
  LessonSession,
  AttendanceStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { dbMapper } from './dbMapper';
import { generateUUID, isUUID } from '../utils/uuid';

// In-memory operational cache (starts clean, populated from Supabase)
let memoryStore = {
  students: [] as Student[],
  groups: [] as Group[],
  payments: [] as PaymentRecord[],
  attendance: [] as AttendanceRecord[],
  sessions: [] as LessonSession[],
};

// ============================================================================
// 1. STUDENTS SERVICE (خدمات إدارة الطلاب)
// ============================================================================
export const studentsService = {
  loadStudents: (): Student[] => {
    return memoryStore.students;
  },

  persistStudents: (students: Student[]): void => {
    memoryStore.students = [...students];
  },

  generateStudentCode: (existingStudents: Student[]): string => {
    const nextNum = 1000 + (existingStudents ? existingStudents.length : 0) + 1;
    return `ST-${nextNum}`;
  },

  /** Fetch all students from Supabase */
  async fetchStudents(): Promise<{ data: Student[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.students, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[studentsService] Supabase fetch error:', error.message);
        return {
          data: memoryStore.students,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): جدول الطلاب محمي بسياسات RLS في Supabase.'
            : `تعذر جلب الطلاب من قاعدة البيانات: ${error.message}`,
        };
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map((row) => dbMapper.toStudent(row));
        memoryStore.students = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.students, error: null };
    } catch (err: any) {
      console.warn('[studentsService] Exception fetching students:', err);
      return {
        data: memoryStore.students,
        error: 'حدث خطأ غير متوقع أثناء الاتصال بقاعدة البيانات لجلب الطلاب.',
      };
    }
  },

  /** Add a new student to Supabase */
  async insertStudent(
    student: Student
  ): Promise<{ data: Student | null; error: string | null }> {
    const validStudent: Student = {
      ...student,
      id: isUUID(student.id) ? student.id : generateUUID(),
    };

    memoryStore.students = [validStudent, ...memoryStore.students.filter((s) => s.id !== validStudent.id)];

    if (!isSupabaseConfigured) {
      return { data: validStudent, error: null };
    }

    try {
      const studentRow = dbMapper.toStudentRow(validStudent);
      const { data, error } = await supabase
        .from('students')
        .insert([studentRow])
        .select()
        .single();

      if (error) {
        console.warn('[studentsService] Insert error:', error.message);
        const isRls = error.message.includes('row-level security');
        return {
          data: validStudent,
          error: isRls
            ? 'خطأ صلاحيات (RLS): سياسة Row-Level Security تمنع الإضافة. يرجى السماح لـ anon/public في Supabase.'
            : `تعذر حفظ الطالب في Supabase: ${error.message}`,
        };
      }

      const inserted = data ? dbMapper.toStudent(data) : validStudent;
      memoryStore.students = [
        inserted,
        ...memoryStore.students.filter((s) => s.id !== validStudent.id && s.id !== inserted.id),
      ];
      return { data: inserted, error: null };
    } catch (err: any) {
      return {
        data: validStudent,
        error: 'تعذر الاتصال بـ Supabase لحفظ بيانات الطالب.',
      };
    }
  },

  /** Update an existing student */
  async updateStudent(
    id: string,
    updates: Partial<Student>
  ): Promise<{ data: Student | null; error: string | null }> {
    memoryStore.students = memoryStore.students.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );

    if (!isSupabaseConfigured) {
      const current = memoryStore.students.find((s) => s.id === id) || null;
      return { data: current, error: null };
    }

    try {
      const studentRow = dbMapper.toStudentRow(updates);
      const { data, error } = await supabase
        .from('students')
        .update(studentRow)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        return {
          data: null,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): لا يمكن تعديل الطالب بسبب سياسات الأمان في Supabase.'
            : `تعذر تحديث بيانات الطالب: ${error.message}`,
        };
      }

      const updated = data ? dbMapper.toStudent(data) : null;
      return { data: updated, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: 'تعذر الاتصال بـ Supabase لتحديث الطالب.',
      };
    }
  },

  /** Delete a student */
  async removeStudent(id: string): Promise<{ success: boolean; error: string | null }> {
    memoryStore.students = memoryStore.students.filter((s) => s.id !== id);

    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) {
        return {
          success: false,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): لا يمكن حذف الطالب بسبب سياسات الأمان في Supabase.'
            : `تعذر حذف الطالب: ${error.message}`,
        };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return {
        success: false,
        error: 'تعذر الاتصال بـ Supabase لحذف الطالب.',
      };
    }
  },

  /** Direct Supabase search across name, phone, code, and group */
  async searchStudents(
    query: string,
    groupId?: string
  ): Promise<{ data: Student[]; error: string | null }> {
    const trimmed = query.trim();

    if (!trimmed && !groupId) {
      return { data: memoryStore.students, error: null };
    }

    if (!isSupabaseConfigured) {
      const filtered = memoryStore.students.filter((s) => {
        const matchesTerm =
          !trimmed ||
          s.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          s.phone.includes(trimmed) ||
          s.groupName.toLowerCase().includes(trimmed.toLowerCase()) ||
          (s.code && s.code.toLowerCase().includes(trimmed.toLowerCase()));
        const matchesGroup = !groupId || s.groupId === groupId;
        return matchesTerm && matchesGroup;
      });
      return { data: filtered, error: null };
    }

    try {
      let req = supabase.from('students').select('*');

      if (groupId) {
        req = req.eq('group_id', groupId);
      }

      if (trimmed) {
        req = req.or(`name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%,code.ilike.%${trimmed}%`);
      }

      const { data, error } = await req;

      if (error) {
        console.warn('[studentsService.searchStudents] Fallback to local filter:', error.message);
        const filtered = memoryStore.students.filter((s) => {
          const matchesTerm =
            !trimmed ||
            s.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            s.phone.includes(trimmed) ||
            s.groupName.toLowerCase().includes(trimmed.toLowerCase()) ||
            (s.code && s.code.toLowerCase().includes(trimmed.toLowerCase()));
          const matchesGroup = !groupId || s.groupId === groupId;
          return matchesTerm && matchesGroup;
        });
        return { data: filtered, error: null };
      }

      const groupMap = new Map(memoryStore.groups.map((g) => [g.id, g.name]));
      const students: Student[] = (data || []).map((row) => ({
        ...dbMapper.toStudent(row),
        groupName: groupMap.get(row.group_id) || 'بدون مجموعة',
      }));

      // If user searched for group name, also include students whose group matches
      if (trimmed) {
        const matchingGroupIds = memoryStore.groups
          .filter((g) => g.name.toLowerCase().includes(trimmed.toLowerCase()))
          .map((g) => g.id);
        if (matchingGroupIds.length > 0) {
          const extra = memoryStore.students.filter(
            (s) => matchingGroupIds.includes(s.groupId) && !students.some((res) => res.id === s.id)
          );
          students.push(...extra);
        }
      }

      return { data: students, error: null };
    } catch (err: any) {
      return {
        data: memoryStore.students.filter((s) => !groupId || s.groupId === groupId),
        error: null,
      };
    }
  },
};

// ============================================================================
// 2. GROUPS SERVICE (خدمات إدارة المجموعات والكورسات)
// ============================================================================
export const groupsService = {
  loadGroups: (): Group[] => {
    return memoryStore.groups;
  },

  persistGroups: (groups: Group[]): void => {
    memoryStore.groups = [...groups];
  },

  async fetchGroups(): Promise<{ data: Group[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.groups, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[groupsService] Fetch error:', error.message);
        return {
          data: memoryStore.groups,
          error: `تعذر جلب المجموعات: ${error.message}`,
        };
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map((row) => dbMapper.toGroup(row));
        memoryStore.groups = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.groups, error: null };
    } catch (err: any) {
      return {
        data: memoryStore.groups,
        error: 'حدث خطأ في الاتصال بقاعدة البيانات لجلب المجموعات.',
      };
    }
  },

  async insertGroup(
    group: Group
  ): Promise<{ data: Group | null; error: string | null }> {
    const validGroup: Group = {
      ...group,
      id: isUUID(group.id) ? group.id : generateUUID(),
    };

    memoryStore.groups = [validGroup, ...memoryStore.groups.filter((g) => g.id !== validGroup.id)];

    if (!isSupabaseConfigured) return { data: validGroup, error: null };

    try {
      const groupRow = dbMapper.toGroupRow(validGroup);
      const { data, error } = await supabase
        .from('groups')
        .insert([groupRow])
        .select()
        .single();

      if (error) {
        return {
          data: validGroup,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): لا يمكن إضافة المجموعة بسبب سياسات الأمان في Supabase.'
            : `تعذر إضافة المجموعة في Supabase: ${error.message}`,
        };
      }

      const inserted = data ? dbMapper.toGroup(data) : validGroup;
      memoryStore.groups = [
        inserted,
        ...memoryStore.groups.filter((g) => g.id !== validGroup.id && g.id !== inserted.id),
      ];
      return { data: inserted, error: null };
    } catch (err: any) {
      return {
        data: validGroup,
        error: 'تعذر الاتصال بقاعدة البيانات لإضافة المجموعة.',
      };
    }
  },

  async updateGroup(
    id: string,
    updates: Partial<Group>
  ): Promise<{ success: boolean; error: string | null }> {
    memoryStore.groups = memoryStore.groups.map((g) =>
      g.id === id ? { ...g, ...updates } : g
    );

    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const groupRow = dbMapper.toGroupRow(updates);
      const { error } = await supabase
        .from('groups')
        .update(groupRow)
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `تعذر تحديث بيانات المجموعة: ${error.message}`,
        };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return {
        success: false,
        error: 'تعذر الاتصال بقاعدة البيانات لتحديث المجموعة.',
      };
    }
  },

  async removeGroup(id: string): Promise<{ success: boolean; error: string | null }> {
    memoryStore.groups = memoryStore.groups.filter((g) => g.id !== id);

    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) {
        return {
          success: false,
          error: `تعذر حذف المجموعة: ${error.message}`,
        };
      }
      return { success: true, error: null };
    } catch (err: any) {
      return {
        success: false,
        error: 'تعذر الاتصال بقاعدة البيانات لحذف المجموعة.',
      };
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

  async fetchPayments(): Promise<{ data: PaymentRecord[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.payments, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: memoryStore.payments,
          error: `تعذر جلب المدفوعات: ${error.message}`,
        };
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map((row) => dbMapper.toPayment(row));
        memoryStore.payments = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.payments, error: null };
    } catch (err: any) {
      return {
        data: memoryStore.payments,
        error: 'تعذر الاتصال بقاعدة البيانات لجلب المدفوعات.',
      };
    }
  },

  async insertPayment(
    payment: PaymentRecord
  ): Promise<{ data: PaymentRecord | null; error: string | null }> {
    const validPayment: PaymentRecord = {
      ...payment,
      id: isUUID(payment.id) ? payment.id : generateUUID(),
      receiptNumber: payment.receiptNumber || ('REC-' + Math.floor(100000 + Math.random() * 900000)),
    };

    memoryStore.payments = [validPayment, ...memoryStore.payments.filter((p) => p.id !== validPayment.id)];

    if (!isSupabaseConfigured) return { data: validPayment, error: null };

    try {
      const paymentRow = dbMapper.toPaymentRow(validPayment);
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentRow])
        .select()
        .single();

      if (error) {
        return {
          data: validPayment,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): يرجى تفعيل السماح بالإدراج لجدول payments في Supabase.'
            : `تعذر حفظ الدفعة: ${error.message}`,
        };
      }

      const inserted = data ? dbMapper.toPayment(data) : validPayment;
      memoryStore.payments = [
        inserted,
        ...memoryStore.payments.filter((p) => p.id !== validPayment.id && p.id !== inserted.id),
      ];
      return { data: inserted, error: null };
    } catch (err: any) {
      return {
        data: validPayment,
        error: 'تعذر الاتصال بقاعدة البيانات لتسجيل الدفعة.',
      };
    }
  },

  async updatePayment(
    id: string,
    updates: Partial<PaymentRecord>
  ): Promise<{ data: PaymentRecord | null; error: string | null }> {
    memoryStore.payments = memoryStore.payments.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );

    if (!isSupabaseConfigured) {
      const current = memoryStore.payments.find((p) => p.id === id) || null;
      return { data: current, error: null };
    }

    try {
      const paymentRow = dbMapper.toPaymentRow(updates);
      const { data, error } = await supabase
        .from('payments')
        .update(paymentRow)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        return {
          data: null,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): لا تملك الصلاحية لتعديل الدفعة في Supabase.'
            : `تعذر تعديل الدفعة: ${error.message}`,
        };
      }

      const updated = data ? dbMapper.toPayment(data) : null;
      return { data: updated, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: 'تعذر الاتصال بقاعدة البيانات لتعديل الدفعة.',
      };
    }
  },

  async removePayment(id: string): Promise<{ success: boolean; error: string | null }> {
    memoryStore.payments = memoryStore.payments.filter((p) => p.id !== id);

    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) {
        return {
          success: false,
          error: error.message.includes('row-level security')
            ? 'خطأ صلاحيات (RLS): لا تملك الصلاحية لحذف الدفعة في Supabase.'
            : `تعذر حذف الدفعة: ${error.message}`,
        };
      }
      return { success: true, error: null };
    } catch (err: any) {
      return {
        success: false,
        error: 'تعذر الاتصال بقاعدة البيانات لحذف الدفعة.',
      };
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

  async fetchAttendance(): Promise<{ data: AttendanceRecord[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.attendance, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: memoryStore.attendance,
          error: `تعذر جلب سجلات الحضور: ${error.message}`,
        };
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map((row) => dbMapper.toAttendance(row));
        memoryStore.attendance = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.attendance, error: null };
    } catch (err: any) {
      return {
        data: memoryStore.attendance,
        error: 'تعذر الاتصال بقاعدة البيانات لجلب سجلات الحضور.',
      };
    }
  },

  /**
   * Save or update attendance batch:
   * Prevents recording duplicates for the same student, group, and date.
   * If a record already exists, updates its status and notes.
   */
  async saveAttendanceBatch(
    groupId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ): Promise<{ success: boolean; error: string | null }> {
    // Optimistically update memory store
    const updatedLocal: AttendanceRecord[] = records.map((r) => {
      const existing = memoryStore.attendance.find(
        (a) => a.studentId === r.studentId && a.groupId === groupId && a.date === date
      );
      return {
        id: existing ? existing.id : generateUUID(),
        studentId: r.studentId,
        studentName: '',
        groupId,
        groupName: '',
        date,
        status: r.status,
        notes: r.notes,
      };
    });

    const updatedIds = new Set(updatedLocal.map((u) => u.id));
    memoryStore.attendance = [
      ...updatedLocal,
      ...memoryStore.attendance.filter(
        (a) => !(a.groupId === groupId && a.date === date) && !updatedIds.has(a.id)
      ),
    ];

    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      // 1. Fetch existing attendance records for this group and date
      const { data: existingRows, error: fetchErr } = await supabase
        .from('attendance')
        .select('id, student_id')
        .eq('group_id', groupId)
        .eq('date', date);

      if (fetchErr) {
        console.warn('[attendanceService] Error checking existing records:', fetchErr);
      }

      const existingMap = new Map<string, string>();
      if (existingRows) {
        existingRows.forEach((row) => existingMap.set(row.student_id, row.id));
      }

      const updatesToRun: Promise<any>[] = [];
      const insertsToRun: any[] = [];

      for (const r of records) {
        if (!isUUID(r.studentId)) continue;
        const existingId = existingMap.get(r.studentId);
        if (existingId) {
          updatesToRun.push(
            Promise.resolve(
              supabase
                .from('attendance')
                .update({ status: r.status, notes: r.notes || null })
                .eq('id', existingId)
            )
          );
        } else {
          insertsToRun.push({
            id: generateUUID(),
            student_id: r.studentId,
            group_id: groupId,
            date,
            status: r.status,
            notes: r.notes || null,
          });
        }
      }

      if (insertsToRun.length > 0) {
        const { error: insErr } = await supabase.from('attendance').insert(insertsToRun);
        if (insErr) {
          return {
            success: false,
            error: insErr.message.includes('row-level security')
              ? 'خطأ صلاحيات (RLS): لا يمكن حفظ كشف الحضور بسبب سياسات الأمان في Supabase.'
              : `تعذر حفظ الحضور: ${insErr.message}`,
          };
        }
      }

      if (updatesToRun.length > 0) {
        const results = await Promise.all(updatesToRun);
        const firstErr = results.find((res) => res.error);
        if (firstErr && firstErr.error) {
          return {
            success: false,
            error: `تعذر تحديث بعض سجلات الحضور: ${firstErr.error.message}`,
          };
        }
      }

      return { success: true, error: null };
    } catch (err: any) {
      return {
        success: false,
        error: 'تعذر الاتصال بقاعدة البيانات لحفظ الحضور.',
      };
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

  async fetchSessions(): Promise<{ data: LessonSession[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.sessions, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: memoryStore.sessions,
          error: `تعذر جلب مواعيد الحصص: ${error.message}`,
        };
      }

      if (data && Array.isArray(data)) {
        const mapped = data.map((row) => dbMapper.toSession(row));
        memoryStore.sessions = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.sessions, error: null };
    } catch (err: any) {
      return {
        data: memoryStore.sessions,
        error: 'تعذر الاتصال بقاعدة البيانات لجلب الحصص.',
      };
    }
  },
};
