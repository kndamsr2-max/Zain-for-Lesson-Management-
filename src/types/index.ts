export type StudentStatus = 'نشط' | 'متوقف' | 'مؤجل';

export interface Student {
  id: string;
  code?: string;
  name: string;
  phone: string;
  groupId: string;
  groupName: string;
  course: string;
  subscriptionFee: number;
  paidAmount: number;
  remainingAmount: number;
  status: StudentStatus;
  notes: string;
  joinedDate: string;
}

export interface Group {
  id: string;
  name: string;
  course: string;
  days: string;
  time: string;
  fee: number;
  studentCount: number;
  notes: string;
}

export type AttendanceStatus = 'حاضر' | 'غائب' | 'متأخر';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export type PaymentMethod = 'نقدي' | 'فودافون كاش' | 'إنستاباي' | 'تحويل بنكي';

export interface PaymentRecord {
  id: string;
  receiptNumber?: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface LessonSession {
  id: string;
  groupId: string;
  groupName: string;
  course: string;
  day: string;
  date: string;
  time: string;
  studentCount: number;
  room?: string;
}

export type PageId =
  | 'dashboard'
  | 'students'
  | 'groups'
  | 'attendance'
  | 'payments'
  | 'schedule'
  | 'reports'
  | 'search'
  | 'settings'
  | 'ai-assistant';

export interface CenterSettings {
  id?: string;
  centerName: string;
  managerName: string;
  phone: string;
  contactInfo: string;
  logoUrl?: string;
  currency: string;
  academicYear?: string;
  notes?: string;
  updatedAt?: string;
}

export interface StaticLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}
