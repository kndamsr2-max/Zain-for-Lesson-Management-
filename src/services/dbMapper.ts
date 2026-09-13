/**
 * Database Mapper & Transformer
 * Converts Supabase real database schema representations (snake_case)
 * to frontend domain models and vice versa.
 */

import { Student, Group, AttendanceRecord, PaymentRecord, LessonSession, AttendanceStatus, PaymentMethod } from '../types';
import { isUUID } from '../utils/uuid';

export const dbMapper = {
  // --- Student Mapping ---
  toStudent(row: any): Student {
    const subscriptionFee = Number(row.total_price ?? row.subscription_fee ?? row.subscriptionFee ?? 0);
    const paidAmount = Number(row.paid_amount ?? row.paidAmount ?? 0);
    const remainingAmount =
      row.remaining_amount !== undefined
        ? Number(row.remaining_amount)
        : row.remainingAmount !== undefined
        ? Number(row.remainingAmount)
        : Math.max(0, subscriptionFee - paidAmount);

    return {
      id: String(row.id || ''),
      code: row.code || undefined,
      name: String(row.name || ''),
      phone: String(row.phone || ''),
      groupId: String(row.group_id ?? row.groupId ?? ''),
      groupName: String(row.group_name ?? row.groupName ?? ''),
      course: String(row.course || ''),
      subscriptionFee,
      paidAmount,
      remainingAmount,
      status: row.status || 'نشط',
      notes: String(row.notes || ''),
      joinedDate: String(row.created_at ? row.created_at.split('T')[0] : (row.joined_date ?? new Date().toISOString().split('T')[0])),
    };
  },

  toStudentRow(student: Partial<Student>): any {
    const row: any = {};
    if (student.id && isUUID(student.id)) row.id = student.id;
    if (student.name !== undefined) row.name = student.name;
    if (student.phone !== undefined) {
      row.phone = student.phone;
      row.parent_phone = student.phone;
    }
    if (student.groupId !== undefined && isUUID(student.groupId)) {
      row.group_id = student.groupId;
    }
    if (student.course !== undefined) row.course = student.course;
    if (student.subscriptionFee !== undefined) row.total_price = Number(student.subscriptionFee);
    if (student.paidAmount !== undefined) row.paid_amount = Number(student.paidAmount);
    if (student.remainingAmount !== undefined) row.remaining_amount = Number(student.remainingAmount);
    if (student.status !== undefined) row.status = student.status;
    if (student.notes !== undefined) row.notes = student.notes;
    return row;
  },

  // --- Group Mapping ---
  toGroup(row: any): Group {
    const daysStr = Array.isArray(row.days) ? row.days.join('، ') : String(row.days || '');
    let timeStr = '';
    if (row.start_time) {
      timeStr = row.end_time ? `${row.start_time} - ${row.end_time}` : row.start_time;
    } else {
      timeStr = String(row.time || '');
    }

    return {
      id: String(row.id || ''),
      name: String(row.name || ''),
      course: String(row.course || ''),
      days: daysStr,
      time: timeStr,
      fee: Number(row.price ?? row.fee ?? 0),
      studentCount: Number(row.student_count ?? row.studentCount ?? 0),
      notes: String(row.notes || ''),
    };
  },

  toGroupRow(group: Partial<Group>): any {
    const row: any = {};
    if (group.id && isUUID(group.id)) row.id = group.id;
    if (group.name !== undefined) row.name = group.name;
    if (group.course !== undefined) row.course = group.course;

    if (group.days !== undefined) {
      if (Array.isArray(group.days)) {
        row.days = group.days;
      } else if (typeof group.days === 'string') {
        const parts = group.days.split(/[،,و\s]+/).map((s) => s.trim()).filter(Boolean);
        row.days = parts.length > 0 ? parts : [group.days];
      }
    }

    if (group.time !== undefined) {
      if (group.time.includes('-')) {
        const [st, et] = group.time.split('-').map((s) => s.trim());
        row.start_time = st;
        row.end_time = et;
      } else {
        row.start_time = group.time;
        row.end_time = '';
      }
    }

    if (group.fee !== undefined) row.price = Number(group.fee);
    if (group.notes !== undefined) row.notes = group.notes;
    return row;
  },

  // --- Attendance Mapping ---
  toAttendance(row: any): AttendanceRecord {
    const rawStatus = row.status;
    const status: AttendanceStatus =
      rawStatus === 'غائب' ? 'غائب' : rawStatus === 'متأخر' ? 'متأخر' : 'حاضر';

    return {
      id: String(row.id || ''),
      studentId: String(row.student_id ?? row.studentId ?? ''),
      studentName: String(row.student_name ?? row.studentName ?? ''),
      groupId: String(row.group_id ?? row.groupId ?? ''),
      groupName: String(row.group_name ?? row.groupName ?? ''),
      date: String(row.date || new Date().toISOString().split('T')[0]),
      status,
      notes: row.notes || undefined,
    };
  },

  toAttendanceRow(record: Partial<AttendanceRecord>): any {
    const row: any = {};
    if (record.id && isUUID(record.id)) row.id = record.id;
    if (record.studentId !== undefined && isUUID(record.studentId)) row.student_id = record.studentId;
    if (record.groupId !== undefined && isUUID(record.groupId)) row.group_id = record.groupId;
    if (record.date !== undefined) row.date = record.date;
    if (record.status !== undefined) row.status = record.status;
    if (record.notes !== undefined) row.notes = record.notes;
    return row;
  },

  // --- Payment Mapping ---
  toPayment(row: any): PaymentRecord {
    return {
      id: String(row.id || ''),
      receiptNumber: row.receipt_number || ('REC-' + String(row.id || '').slice(0, 6)),
      studentId: String(row.student_id ?? row.studentId ?? ''),
      studentName: String(row.student_name ?? row.studentName ?? ''),
      amount: Number(row.amount ?? 0),
      date: String(row.payment_date ?? row.date ?? new Date().toISOString().split('T')[0]),
      paymentMethod: (row.method ?? row.payment_method ?? row.paymentMethod ?? 'نقدي') as PaymentMethod,
      notes: String(row.notes || ''),
    };
  },

  toPaymentRow(payment: Partial<PaymentRecord>): any {
    const row: any = {};
    if (payment.id && isUUID(payment.id)) row.id = payment.id;
    if (payment.receiptNumber !== undefined) row.receipt_number = payment.receiptNumber;
    if (payment.studentId !== undefined && isUUID(payment.studentId)) row.student_id = payment.studentId;
    if (payment.amount !== undefined) row.amount = Number(payment.amount);
    if (payment.date !== undefined) row.payment_date = payment.date;
    if (payment.paymentMethod !== undefined) row.method = payment.paymentMethod;
    if (payment.notes !== undefined) row.notes = payment.notes;
    return row;
  },

  // --- Session Mapping ---
  toSession(row: any): LessonSession {
    let timeStr = '';
    if (row.start_time) {
      timeStr = row.end_time ? `${row.start_time} - ${row.end_time}` : row.start_time;
    } else {
      timeStr = String(row.time || '');
    }

    return {
      id: String(row.id || ''),
      groupId: String(row.group_id ?? row.groupId ?? ''),
      groupName: String(row.group_name ?? row.groupName ?? ''),
      course: String(row.course || ''),
      day: String(row.day_of_week ?? row.day ?? ''),
      date: String(row.date || ''),
      time: timeStr,
      studentCount: Number(row.student_count ?? row.studentCount ?? 0),
      room: row.room || undefined,
    };
  },

  toSessionRow(session: Partial<LessonSession>): any {
    const row: any = {};
    if (session.id && isUUID(session.id)) row.id = session.id;
    if (session.groupId !== undefined && isUUID(session.groupId)) row.group_id = session.groupId;
    if (session.day !== undefined) row.day_of_week = session.day;
    if (session.room !== undefined) row.room = session.room;
    if ((session as any).notes !== undefined) row.notes = (session as any).notes;
    return row;
  },
};
