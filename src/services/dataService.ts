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
  CenterSettings,
  StaticLink,
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
  staticLinks: [] as StaticLink[],
  settings: {
    centerName: 'سنتر زين التعليمي',
    managerName: 'Miss Sharbat',
    phone: '01000000000',
    contactInfo: 'القاهرة - مصر',
    currency: 'ج.م',
    academicYear: `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`,
    notes: 'نظام إدارة متقدم للمراكز التعليمية والدروس الخصوصية',
  } as CenterSettings,
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

// ============================================================================
// 6. SETTINGS SERVICE (خدمات إعدادات المركز والنظام)
// ============================================================================
export const settingsService = {
  loadSettings: (): CenterSettings => {
    return memoryStore.settings;
  },

  persistSettings: (settings: CenterSettings): void => {
    memoryStore.settings = { ...settings };
  },

  async fetchSettings(): Promise<{ data: CenterSettings; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.settings, error: null };
    }

    try {
      // Query settings table in Supabase
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        // If settings table is protected or not accessible, retain operational state gracefully
        console.warn('[settingsService] fetchSettings notice:', error.message);
        return { data: memoryStore.settings, error: null };
      }

      if (data) {
        const mapped: CenterSettings = {
          id: data.id ? String(data.id) : undefined,
          centerName: data.center_name || data.centerName || data.name || memoryStore.settings.centerName,
          managerName: data.manager_name || data.managerName || memoryStore.settings.managerName,
          phone: data.phone || data.mobile || memoryStore.settings.phone,
          contactInfo: data.contact_info || data.address || memoryStore.settings.contactInfo,
          logoUrl: data.logo_url || data.logo || undefined,
          currency: data.currency || memoryStore.settings.currency,
          academicYear: data.academic_year || memoryStore.settings.academicYear,
          notes: data.notes || memoryStore.settings.notes,
          updatedAt: data.updated_at || data.created_at,
        };
        memoryStore.settings = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.settings, error: null };
    } catch (err: any) {
      console.warn('[settingsService] fetchSettings exception:', err);
      return { data: memoryStore.settings, error: null };
    }
  },

  async updateSettings(
    newSettings: CenterSettings
  ): Promise<{ data: CenterSettings; error: string | null }> {
    memoryStore.settings = { ...newSettings };

    if (!isSupabaseConfigured) {
      return { data: newSettings, error: null };
    }

    try {
      // Attempt upsert or update in existing settings table
      const payload: any = {
        center_name: newSettings.centerName,
        manager_name: newSettings.managerName,
        phone: newSettings.phone,
        contact_info: newSettings.contactInfo,
        currency: newSettings.currency,
        academic_year: newSettings.academicYear,
        notes: newSettings.notes,
        updated_at: new Date().toISOString(),
      };
      if (newSettings.id && isUUID(newSettings.id)) {
        payload.id = newSettings.id;
      }

      const { data, error } = await supabase
        .from('settings')
        .upsert(payload)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('[settingsService] updateSettings Supabase notice:', error.message);
        return {
          data: newSettings,
          error: error.message.includes('relation') || error.message.includes('does not exist')
            ? 'تم حفظ الإعدادات في الذاكرة التشغيلية، وسيتطلب ربطها بجدول settings تنفيذ مرحلة الـ SQL القادمة.'
            : `تنبيه من Supabase: ${error.message}`,
        };
      }

      if (data) {
        newSettings.id = String(data.id || newSettings.id);
      }

      return { data: newSettings, error: null };
    } catch (err: any) {
      return {
        data: newSettings,
        error: 'تعذر الاتصال بقاعدة البيانات لحفظ الإعدادات، تم الحفظ مؤقتاً.',
      };
    }
  },
};

// ============================================================================
// 7. STATIC LINKS SERVICE (خدمات إدارة الروابط الثابتة)
// ============================================================================
export const staticLinksService = {
  loadStaticLinks: (): StaticLink[] => {
    return memoryStore.staticLinks;
  },

  persistStaticLinks: (links: StaticLink[]): void => {
    memoryStore.staticLinks = [...links];
  },

  async fetchStaticLinks(): Promise<{ data: StaticLink[]; error: string | null; needsMigration?: boolean }> {
    if (!isSupabaseConfigured) {
      return { data: memoryStore.staticLinks, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('static_links')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        const isMissingTable =
          error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('relation');

        if (isMissingTable) {
          return {
            data: memoryStore.staticLinks,
            error: 'جدول الروابط الثابتة غير موجود بقاعدة البيانات بعد.',
            needsMigration: true,
          };
        }

        console.warn('[staticLinksService] fetchStaticLinks notice:', error.message);
        return { data: memoryStore.staticLinks, error: error.message };
      }

      if (data) {
        const mapped: StaticLink[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          isActive: item.is_active !== undefined ? Boolean(item.is_active) : true,
          orderIndex: Number(item.order_index || 0),
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
        memoryStore.staticLinks = mapped;
        return { data: mapped, error: null };
      }

      return { data: memoryStore.staticLinks, error: null };
    } catch (err: any) {
      return { data: memoryStore.staticLinks, error: err?.message || 'خطأ أثناء جلب الروابط الثابتة' };
    }
  },

  async createStaticLink(
    linkData: Omit<StaticLink, 'id'>
  ): Promise<{ data: StaticLink | null; error: string | null; needsMigration?: boolean }> {
    const newId = generateUUID();
    const newLink: StaticLink = {
      ...linkData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      memoryStore.staticLinks.push(newLink);
      return { data: newLink, error: null };
    }

    try {
      const payload: any = {
        id: newId,
        title: newLink.title,
        url: newLink.url,
        description: newLink.description || null,
        is_active: newLink.isActive,
        order_index: newLink.orderIndex,
        created_at: newLink.createdAt,
        updated_at: newLink.updatedAt,
      };

      const { data, error } = await supabase
        .from('static_links')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        const isMissingTable =
          error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('relation');

        memoryStore.staticLinks.push(newLink);
        return {
          data: newLink,
          error: isMissingTable
            ? 'تم حفظ الرابط مؤقتاً بالذاكرة؛ يلزم تنفيذ SQL المرحلة التالية لإنشاء جدول static_links في Supabase.'
            : `تنبيه: ${error.message}`,
          needsMigration: isMissingTable,
        };
      }

      const created: StaticLink = data
        ? {
            id: String(data.id),
            title: data.title,
            url: data.url,
            description: data.description || '',
            isActive: Boolean(data.is_active),
            orderIndex: Number(data.order_index || 0),
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : newLink;

      memoryStore.staticLinks.push(created);
      return { data: created, error: null };
    } catch (err: any) {
      memoryStore.staticLinks.push(newLink);
      return { data: newLink, error: 'تعذر الاتصال بقاعدة البيانات، تم الحفظ مؤقتاً.' };
    }
  },

  async updateStaticLink(
    id: string,
    updates: Partial<Omit<StaticLink, 'id'>>
  ): Promise<{ data: StaticLink | null; error: string | null; needsMigration?: boolean }> {
    const existingIndex = memoryStore.staticLinks.findIndex((l) => l.id === id);
    if (existingIndex >= 0) {
      memoryStore.staticLinks[existingIndex] = {
        ...memoryStore.staticLinks[existingIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }

    if (!isSupabaseConfigured) {
      return {
        data: existingIndex >= 0 ? memoryStore.staticLinks[existingIndex] : null,
        error: null,
      };
    }

    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.url !== undefined) payload.url = updates.url;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.orderIndex !== undefined) payload.order_index = updates.orderIndex;

      const { data, error } = await supabase
        .from('static_links')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        const isMissingTable =
          error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('relation');

        return {
          data: existingIndex >= 0 ? memoryStore.staticLinks[existingIndex] : null,
          error: isMissingTable
            ? 'تم تعديل الرابط مؤقتاً؛ يلزم تشغيل SQL لإنشاء جدول static_links في Supabase.'
            : error.message,
          needsMigration: isMissingTable,
        };
      }

      return {
        data: existingIndex >= 0 ? memoryStore.staticLinks[existingIndex] : null,
        error: null,
      };
    } catch (err: any) {
      return {
        data: existingIndex >= 0 ? memoryStore.staticLinks[existingIndex] : null,
        error: 'تعذر الاتصال بقاعدة البيانات أثناء التحديث.',
      };
    }
  },

  async deleteStaticLink(id: string): Promise<{ success: boolean; error: string | null }> {
    memoryStore.staticLinks = memoryStore.staticLinks.filter((l) => l.id !== id);

    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('static_links').delete().eq('id', id);
      if (error) {
        console.warn('[staticLinksService] delete notice:', error.message);
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: true, error: null };
    }
  },

  // Aliases for compatibility across pages
  async fetchLinks(): Promise<StaticLink[]> {
    const res = await this.fetchStaticLinks();
    return res.data || [];
  },
  async getAll(): Promise<StaticLink[]> {
    const res = await this.fetchStaticLinks();
    return res.data || [];
  },
  async addLink(linkData: Omit<StaticLink, 'id'>): Promise<{ success: boolean; link?: StaticLink; message?: string }> {
    const res = await this.createStaticLink(linkData);
    return {
      success: !res.error && !!res.data,
      link: res.data || undefined,
      message: res.error || undefined,
    };
  },
  async create(linkData: Omit<StaticLink, 'id'>): Promise<{ data: StaticLink | null; error: string | null }> {
    return this.createStaticLink(linkData);
  },
  async update(id: string, updates: Partial<Omit<StaticLink, 'id'>>): Promise<{ data: StaticLink | null; error: string | null }> {
    return this.updateStaticLink(id, updates);
  },
  async deleteLink(id: string): Promise<{ success: boolean; error: string | null }> {
    return this.deleteStaticLink(id);
  },
  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    return this.deleteStaticLink(id);
  },
};
