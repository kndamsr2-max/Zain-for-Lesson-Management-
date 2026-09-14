/**
 * AI Assistant Service for Zain Education Center
 * (خدمة المساعد الذكي لنظام زين لإدارة الدروس والسناتر)
 *
 * Rules:
 * - Reads ONLY verified real data from memory/Supabase (Students, Groups, Payments, Attendance).
 * - Never hallucinates or fabricates financial/attendance facts.
 * - Clean Arabic response generation tailored to educational centers.
 * - Architecture: Ready for direct backend AI integration (Gemini server-side / Edge Function).
 * - ZERO client-side exposed secrets or API keys.
 */

import { Student, Group, PaymentRecord, AttendanceRecord } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
}

export const aiAssistantService = {
  /**
   * Process a question using real data fetched from Supabase.
   * Answers queries about students, groups, payments, debts, and attendance.
   */
  async askAssistant(
    question: string,
    context: {
      students: Student[];
      groups: Group[];
      payments: PaymentRecord[];
      attendance: AttendanceRecord[];
    }
  ): Promise<string> {
    const q = question.trim();
    if (!q) {
      return 'مرحباً بك! أنا مساعد زين الذكي لإدارة السنتر. يمكنك سؤالي عن الطلاب، المجموعات، المدفوعات، أو المبالغ المتبقية.';
    }

    const normQ = normalizeArabic(q);
    const { students, groups, payments, attendance } = context;

    // Simulate minor asynchronous processing
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 1. "مين الطلاب الموجودين؟" / "عدد الطلاب" / "قائمة الطلاب"
    if (
      normQ.includes('مين الطلاب') ||
      normQ.includes('قائمه الطلاب') ||
      normQ.includes('عدد الطلاب') ||
      normQ.includes('كل الطلاب')
    ) {
      if (students.length === 0) {
        return 'قاعدة البيانات لا تحتوي على أي طلاب مسجلين حتى الآن.';
      }
      const names = students.slice(0, 10).map((s, i) => `${i + 1}. ${s.name} (${s.groupName})`);
      const extra = students.length > 10 ? `\n... وباقي ${students.length - 10} طالب آخرين.` : '';
      return `إجمالي عدد الطلاب المسجلين حالياً هو ${students.length} طالب.\nإليك بعضهم:\n${names.join(
        '\n'
      )}${extra}`;
    }

    // 2. "مين في مجموعة كذا؟" / "مجموعة كذا"
    const matchedGroup = groups.find((g) => normQ.includes(normalizeArabic(g.name)));
    if (matchedGroup && (normQ.includes('مين في') || normQ.includes('طلاب') || normQ.includes('مجموعه'))) {
      const groupStudents = students.filter((s) => s.groupId === matchedGroup.id);
      if (groupStudents.length === 0) {
        return `مجموعة "${matchedGroup.name}" لا يوجد بها طلاب مسجلون حالياً. سعر الاشتراك هو ${matchedGroup.fee} ج.م ومواعيدها: ${matchedGroup.days} (${matchedGroup.time}).`;
      }
      const list = groupStudents.map((s, i) => `${i + 1}. ${s.name} - الهاتف: ${s.phone}`);
      return `مجموعة "${matchedGroup.name}" تضم (${groupStudents.length}) طالب:\n${list.join(
        '\n'
      )}\nمواعيد المجموعة: ${matchedGroup.days} (${matchedGroup.time}) - سعر الاشتراك: ${matchedGroup.fee} ج.م.`;
    }

    // 3. "مين عليه فلوس؟" / "مين عليه متبقي؟" / "المتبقي"
    if (
      normQ.includes('مين عليه فلوس') ||
      normQ.includes('مين عليه متبقي') ||
      normQ.includes('الديون') ||
      normQ.includes('المبالغ المتبقيه') ||
      normQ.includes('غير مسدد')
    ) {
      const dueStudents = students
        .map((s) => {
          const stPayments = payments.filter((p) => p.studentId === s.id);
          const paid = stPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
          const remaining = Math.max(0, (Number(s.subscriptionFee) || 0) - paid);
          return { student: s, paid, remaining };
        })
        .filter((item) => item.remaining > 0);

      if (dueStudents.length === 0) {
        return 'رائع! لا يوجد أي طالب عليه مبالغ متبقية، جميع الطلاب قاموا بسداد اشتراكاتهم بالكامل.';
      }

      const totalDues = dueStudents.reduce((acc, i) => acc + i.remaining, 0);
      const list = dueStudents.slice(0, 8).map(
        (i, idx) =>
          `${idx + 1}. ${i.student.name} (${i.student.groupName}): مطلوب سداد ${i.remaining} ج.م (مدفوع: ${i.paid} ج.م)`
      );
      const more = dueStudents.length > 8 ? `\n... وباقي ${dueStudents.length - 8} طلاب عليهم متبقي.` : '';
      return `يوجد (${dueStudents.length}) طالب عليهم مبالغ متبقية بإجمالي (${totalDues} ج.م):\n${list.join(
        '\n'
      )}${more}`;
    }

    // 4. "مين دفع؟" / "آخر المدفوعات" / "المقبوضات"
    if (
      normQ.includes('مين دفع') ||
      normQ.includes('اخر المدفوعات') ||
      normQ.includes('المقبوضات') ||
      normQ.includes('الدفعات')
    ) {
      if (payments.length === 0) {
        return 'لا توجد أي عمليات دفع مسجلة في النظام حتى الآن.';
      }
      const totalPaidOverall = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const recent = payments.slice(0, 5).map(
        (p, idx) =>
          `${idx + 1}. ${p.studentName}: دفع ${p.amount} ج.م بتكلفة (${p.paymentMethod}) بتاريخ ${p.date}`
      );
      return `إجمالي المقبوضات المسجلة في السنتر هو (${totalPaidOverall} ج.م) موزعة على (${payments.length}) عملية دفع.\nآخر العمليات:\n${recent.join(
        '\n'
      )}`;
    }

    // 5. Search for a specific student mentioned in the question: "فلان دفع كام؟", "فلان في مجموعة إيه؟", "فلان عليه كام؟"
    // Find best student match
    let foundStudent: Student | undefined;
    for (const st of students) {
      const normName = normalizeArabic(st.name);
      // Split name into parts to allow matching first name or full name
      const nameParts = normName.split(/\s+/);
      if (normQ.includes(normName)) {
        foundStudent = st;
        break;
      }
      // Check if at least 2 parts match or full name
      if (nameParts.length >= 2) {
        const firstTwo = nameParts.slice(0, 2).join(' ');
        if (normQ.includes(firstTwo)) {
          foundStudent = st;
          break;
        }
      }
    }

    if (foundStudent) {
      const stPayments = payments.filter((p) => p.studentId === foundStudent.id);
      const paid = stPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const fee = Number(foundStudent.subscriptionFee) || 0;
      const remaining = Math.max(0, fee - paid);
      const stAttendance = attendance.filter((a) => a.studentId === foundStudent.id);
      const present = stAttendance.filter((a) => a.status === 'حاضر').length;
      const absent = stAttendance.filter((a) => a.status === 'غائب').length;

      // Question: "فلان في مجموعة إيه؟"
      if (normQ.includes('مجموعه ايه') || normQ.includes('في انهي مجموعه') || normQ.includes('مجموعته')) {
        return `الطالب "${foundStudent.name}" مسجل في مجموعة: "${foundStudent.groupName || 'غير محدد'}" (الكورس: ${foundStudent.course || 'عام'}).`;
      }

      // Question: "فلان دفع كام؟"
      if (normQ.includes('دفع كام') || normQ.includes('سدد كام') || normQ.includes('مدفوعاته')) {
        return `الطالب "${foundStudent.name}" قام بسداد إجمالي (${paid} ج.م) عبر (${stPayments.length}) عملية دفع، والمتبقي عليه حالياً (${remaining} ج.م).`;
      }

      // Question: "فلان عليه كام؟"
      if (normQ.includes('عليه كام') || normQ.includes('باقي عليه') || normQ.includes('متبقي')) {
        return `المبلغ المتبقي المطلوب سداده من الطالب "${foundStudent.name}" هو (${remaining} ج.م) من أصل اشتراك قيمته (${fee} ج.م).`;
      }

      // General student summary: "هات بيانات الطالب فلان"
      return `بيانات الطالب "${foundStudent.name}":\n• المجموعة: ${foundStudent.groupName || '—'}\n• الكورس: ${foundStudent.course || '—'}\n• الهاتف: ${foundStudent.phone}\n• سعر الاشتراك: ${fee} ج.م\n• إجمالي المسدد: ${paid} ج.م\n• المتبقي: ${remaining} ج.م\n• الحضور: حاضر (${present}) - غائب (${absent})\n• الحالة: ${foundStudent.status}`;
    }

    // 6. Generic groups overview
    if (normQ.includes('المجموعات') || normQ.includes('المواعيد')) {
      if (groups.length === 0) {
        return 'لا توجد مجموعات دراسية مسجلة حالياً في السنتر.';
      }
      const gList = groups.map(
        (g, i) => `${i + 1}. ${g.name} (${g.course}) - مواعيدها: ${g.days} [${g.time}] - السعر: ${g.fee} ج.م`
      );
      return `قائمة المجموعات المتاحة (${groups.length} مجموعات):\n${gList.join('\n')}`;
    }

    // If query could not be matched with actual Supabase data:
    return `لم أعثر على بيانات تطابق سؤالك في قاعدة بيانات السنتر الحالية. يمكنك سؤالي بشكل محدد مثل:\n• "أحمد محمد في مجموعة إيه؟"\n• "أحمد محمد دفع كام؟"\n• "مين عليه فلوس؟"\n• "مين الطلاب الموجودين؟"\n• "مين دفع اليوم؟"`;
  },
};
