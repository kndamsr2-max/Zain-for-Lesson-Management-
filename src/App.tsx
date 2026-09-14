import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { PageId, Student, Group, PaymentRecord, LessonSession, AttendanceRecord, AttendanceStatus, CenterSettings } from './types';
import { generateUUID } from './utils/uuid';
import {
  studentsService,
  groupsService,
  paymentsService,
  attendanceService,
  sessionsService,
  settingsService,
} from './services/dataService';
import { setupRealtimeSync } from './services/realtimeService';
import { dbMapper } from './services/dbMapper';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { Navigation } from './components/Navigation';
import { Notification } from './components/Notification';
import { ConfirmModal } from './components/ConfirmModal';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { GroupFormModal } from './components/GroupFormModal';
import { GroupStudentsModal } from './components/GroupStudentsModal';
import { PaymentFormModal } from './components/PaymentFormModal';
import { StudentAttendanceHistoryModal } from './components/StudentAttendanceHistoryModal';

import { Dashboard } from './pages/Dashboard';
import { StudentsPage } from './pages/StudentsPage';
import { GroupsPage } from './pages/GroupsPage';
import { AttendancePage } from './pages/AttendancePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SchedulePage } from './pages/SchedulePage';
import { ReportsPage } from './pages/ReportsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { LinksPage } from './pages/LinksPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoginPage } from './pages/LoginPage';
import { TopBar } from './components/TopBar';
import { soundService } from './utils/soundService';

export default function App() {
  // Authentication State with persistent browser session across refreshes
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('zain_auth_session') === 'true';
    } catch {
      return false;
    }
  });

  const handleLoginSuccess = useCallback(() => {
    try {
      sessionStorage.setItem('zain_auth_session', 'true');
    } catch {
      // ignore
    }
    setIsLoggedIn(true);
    soundService.init();
    soundService.playStartup();
    showNotification('تم تسجيل الدخول بنجاح إلى نظام زين لإدارة الدروس والسناتر');
  }, []);

  const handleLogout = useCallback(() => {
    try {
      sessionStorage.removeItem('zain_auth_session');
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
    showNotification('تم تسجيل الخروج بنجاح', 'info');
  }, []);

  // Active Navigation
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topBarSearchTerm, setTopBarSearchTerm] = useState('');

  const handleNavigate = useCallback((page: PageId) => {
    setCurrentPage((prev) => {
      if (prev !== page) {
        soundService.playNavigation();
      }
      return page;
    });
    setMobileMenuOpen(false);
  }, []);

  // Core Data State (Loaded safely with initial memory baseline, then synced via Supabase)
  const [students, setStudents] = useState<Student[]>(() => studentsService.loadStudents());
  const [groups, setGroups] = useState<Group[]>(() => groupsService.loadGroups());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => paymentsService.loadPayments());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => attendanceService.loadAttendance());
  const [sessions, setSessions] = useState<LessonSession[]>(() => sessionsService.loadSessions());
  const [centerSettings, setCenterSettings] = useState<CenterSettings>(() => settingsService.loadSettings());

  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Request Sequence Counter to prevent async race conditions
  const fetchRequestIdRef = useRef<number>(0);

  // Notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    soundService.playNotification(type);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Modals Management
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [viewStudentModalOpen, setViewStudentModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

  const [groupStudentsModalOpen, setGroupStudentsModalOpen] = useState(false);
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState<Group | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<PaymentRecord | null>(null);
  const [preselectedStudentForPayment, setPreselectedStudentForPayment] = useState<string | undefined>(undefined);

  const [attendanceHistoryModalOpen, setAttendanceHistoryModalOpen] = useState(false);
  const [studentForAttendanceHistory, setStudentForAttendanceHistory] = useState<Student | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Central Initial Data Fetch from Supabase with race condition protection
  const loadAllDataFromSupabase = useCallback(async (silent = false) => {
    const currentRequestId = ++fetchRequestIdRef.current;
    if (!silent) setIsLoading(true);
    try {
      const [studentsRes, groupsRes, paymentsRes, attendanceRes, sessionsRes, settingsRes] = await Promise.all([
        studentsService.fetchStudents(),
        groupsService.fetchGroups(),
        paymentsService.fetchPayments(),
        attendanceService.fetchAttendance(),
        sessionsService.fetchSessions(),
        settingsService.fetchSettings(),
      ]);

      // Guard against race condition: ignore stale response if a newer fetch was initiated
      if (currentRequestId !== fetchRequestIdRef.current) {
        return;
      }

      if (studentsRes.data) setStudents(studentsRes.data);
      if (groupsRes.data) setGroups(groupsRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (attendanceRes.data) setAttendance(attendanceRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (settingsRes.data) setCenterSettings(settingsRes.data);

      // Report any error non-blockingly with Arabic notification
      const errors = [
        studentsRes.error,
        groupsRes.error,
        paymentsRes.error,
        attendanceRes.error,
        sessionsRes.error,
      ].filter(Boolean);

      if (errors.length > 0 && isSupabaseConfigured) {
        setSyncError(errors[0] || 'تعذر الاتصال بـ Supabase');
      } else {
        setSyncError(null);
      }
    } catch {
      if (currentRequestId === fetchRequestIdRef.current) {
        setSyncError('تعذر جلب البيانات من الخادم، يرجى التحقق من اتصال الإنترنت.');
      }
    } finally {
      if (currentRequestId === fetchRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch on login / mount and setup unified Realtime multi-table sync
  useEffect(() => {
    if (!isLoggedIn) return;

    // Load fresh data immediately upon login / reload
    loadAllDataFromSupabase();

    const handleOnline = () => {
      showNotification('تمت استعادة الاتصال بالإنترنت، جاري تحديث البيانات تلقائياً...', 'info');
      loadAllDataFromSupabase(true);
    };

    const handleOffline = () => {
      setSyncError('انقطع الاتصال بالإنترنت. سيتم تحديث البيانات تلقائياً عند عودة الاتصال.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup unified Supabase Realtime multi-table sync across all devices
    const cleanupRealtime = setupRealtimeSync({
      onStudentsChange: (payload) => {
        if (payload.eventType === 'INSERT') {
          const raw = payload.newRecord;
          if (!raw) return;
          const student = dbMapper.toStudent(raw);
          setStudents((prev) => {
            const exists = prev.some((s) => s.id === student.id);
            if (exists) {
              return prev.map((s) => (s.id === student.id ? { ...s, ...student } : s));
            }
            return [student, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const raw = payload.newRecord;
          if (!raw) return;
          const student = dbMapper.toStudent(raw);
          setStudents((prev) =>
            prev.map((s) =>
              s.id === student.id
                ? { ...s, ...student, groupName: student.groupName || s.groupName }
                : s
            )
          );
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.oldRecord?.id;
          if (deletedId) {
            setStudents((prev) => prev.filter((s) => s.id !== deletedId));
          }
        }
      },

      onGroupsChange: (payload) => {
        if (payload.eventType === 'INSERT') {
          const raw = payload.newRecord;
          if (!raw) return;
          const group = dbMapper.toGroup(raw);
          setGroups((prev) => {
            const exists = prev.some((g) => g.id === group.id);
            if (exists) {
              return prev.map((g) => (g.id === group.id ? group : g));
            }
            return [...prev, group];
          });
        } else if (payload.eventType === 'UPDATE') {
          const raw = payload.newRecord;
          if (!raw) return;
          const group = dbMapper.toGroup(raw);
          setGroups((prev) => prev.map((g) => (g.id === group.id ? group : g)));
          // Cascade group updates to students
          setStudents((prev) =>
            prev.map((s) =>
              s.groupId === group.id
                ? { ...s, groupName: group.name, course: group.course }
                : s
            )
          );
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.oldRecord?.id;
          if (deletedId) {
            setGroups((prev) => prev.filter((g) => g.id !== deletedId));
          }
        }
      },

      onPaymentsChange: (payload) => {
        if (payload.eventType === 'INSERT') {
          const raw = payload.newRecord;
          if (!raw) return;
          const payment = dbMapper.toPayment(raw);
          setPayments((prev) => {
            const exists = prev.some((p) => p.id === payment.id);
            if (exists) {
              return prev.map((p) => (p.id === payment.id ? payment : p));
            }
            return [payment, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const raw = payload.newRecord;
          if (!raw) return;
          const payment = dbMapper.toPayment(raw);
          setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.oldRecord?.id;
          if (deletedId) {
            setPayments((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      },

      onAttendanceChange: (payload) => {
        if (payload.eventType === 'INSERT') {
          const raw = payload.newRecord;
          if (!raw) return;
          const att = dbMapper.toAttendance(raw);
          setAttendance((prev) => {
            const exists = prev.some((a) => a.id === att.id);
            if (exists) {
              return prev.map((a) => (a.id === att.id ? att : a));
            }
            return [att, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const raw = payload.newRecord;
          if (!raw) return;
          const att = dbMapper.toAttendance(raw);
          setAttendance((prev) => prev.map((a) => (a.id === att.id ? att : a)));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.oldRecord?.id;
          if (deletedId) {
            setAttendance((prev) => prev.filter((a) => a.id !== deletedId));
          }
        }
      },

      onSessionsChange: (payload) => {
        if (payload.eventType === 'INSERT') {
          const raw = payload.newRecord;
          if (!raw) return;
          const ses = dbMapper.toSession(raw);
          setSessions((prev) => {
            const exists = prev.some((s) => s.id === ses.id);
            if (exists) {
              return prev.map((s) => (s.id === ses.id ? ses : s));
            }
            return [ses, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const raw = payload.newRecord;
          if (!raw) return;
          const ses = dbMapper.toSession(raw);
          setSessions((prev) => prev.map((s) => (s.id === ses.id ? ses : s)));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.oldRecord?.id;
          if (deletedId) {
            setSessions((prev) => prev.filter((s) => s.id !== deletedId));
          }
        }
      },

      onStatusChange: (status, message) => {
        if (status === 'CONNECTED') {
          setSyncError(null);
        } else if (status === 'DISCONNECTED') {
          setSyncError(message || 'انقطع اتصال المزامنة اللحظية مع الخادم');
        }
      },
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupRealtime();
    };
  }, [isLoggedIn, loadAllDataFromSupabase]);

  // --- Student Handlers ---
  const handleSaveStudent = async (
    data: Omit<Student, 'id' | 'remainingAmount' | 'joinedDate'> & { id?: string }
  ) => {
    const remaining = Math.max(0, data.subscriptionFee - data.paidAmount);

    if (data.id) {
      // Edit existing student
      const studentId = data.id;
      const updates: Partial<Student> = {
        name: data.name,
        phone: data.phone,
        groupId: data.groupId,
        groupName: data.groupName,
        course: data.course,
        subscriptionFee: data.subscriptionFee,
        paidAmount: data.paidAmount,
        remainingAmount: remaining,
        status: data.status,
        notes: data.notes,
      };

      // Optimistic UI update
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
      );

      // Async DB call
      const res = await studentsService.updateStudent(studentId, updates);
      if (res.error) {
        showNotification(res.error, 'error');
        loadAllDataFromSupabase(true);
      } else {
        showNotification(`تم تحديث بيانات الطالب "${data.name}" بنجاح`);
      }
    } else {
      // Add new student with standard valid UUID
      const newId = generateUUID();
      const today = new Date().toISOString().split('T')[0];
      const newStudent: Student = {
        id: newId,
        code: data.code || studentsService.generateStudentCode(students),
        name: data.name,
        phone: data.phone,
        groupId: data.groupId,
        groupName: data.groupName,
        course: data.course,
        subscriptionFee: data.subscriptionFee,
        paidAmount: data.paidAmount,
        remainingAmount: remaining,
        status: data.status,
        notes: data.notes,
        joinedDate: today,
      };

      // Optimistic UI update
      setStudents((prev) => [newStudent, ...prev]);

      // If initial payment made, record it
      if (data.paidAmount > 0) {
        const newPay: PaymentRecord = {
          id: generateUUID(),
          studentId: newId,
          studentName: data.name,
          amount: data.paidAmount,
          date: today,
          paymentMethod: 'نقدي',
          notes: 'دفعة أولى عند التسجيل',
        };
        setPayments((prev) => [newPay, ...prev]);
        paymentsService.insertPayment(newPay);
      }

      // Update group student count
      setGroups((prev) =>
        prev.map((g) =>
          g.id === data.groupId ? { ...g, studentCount: g.studentCount + 1 } : g
        )
      );
      const targetGroup = groups.find((g) => g.id === data.groupId);
      if (targetGroup) {
        groupsService.updateGroup(targetGroup.id, {
          studentCount: targetGroup.studentCount + 1,
        });
      }

      // Async DB call
      const res = await studentsService.insertStudent(newStudent);
      if (res.error) {
        showNotification(res.error, 'error');
        loadAllDataFromSupabase(true);
      } else {
        showNotification(`تمت إضافة الطالب "${data.name}" بنجاح`);
      }
    }

    setStudentModalOpen(false);
    setStudentToEdit(null);
  };

  const handleDeleteStudentRequest = (student: Student) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف الطالب',
      message: `هل أنت متأكد من رغبتك في حذف الطالب "${student.name}" من النظام؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: async () => {
        // Optimistic UI update
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        setGroups((prev) =>
          prev.map((g) =>
            g.id === student.groupId
              ? { ...g, studentCount: Math.max(0, g.studentCount - 1) }
              : g
          )
        );
        closeConfirmModal();

        // Async DB call
        const res = await studentsService.removeStudent(student.id);
        if (res.error) {
          showNotification(res.error, 'error');
          loadAllDataFromSupabase(true);
        } else {
          showNotification(`تم حذف الطالب "${student.name}" بنجاح`, 'info');
        }

        // Update group count in DB
        const group = groups.find((g) => g.id === student.groupId);
        if (group) {
          groupsService.updateGroup(group.id, {
            studentCount: Math.max(0, group.studentCount - 1),
          });
        }
      },
    });
  };

  // --- Group Handlers ---
  const handleSaveGroup = async (
    data: Omit<Group, 'id' | 'studentCount'> & { id?: string }
  ) => {
    if (data.id) {
      const groupId = data.id;
      const updates: Partial<Group> = {
        name: data.name,
        course: data.course,
        days: data.days,
        time: data.time,
        fee: data.fee,
        notes: data.notes,
      };

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.groupId === groupId
            ? { ...s, groupName: data.name, course: data.course }
            : s
        )
      );

      const res = await groupsService.updateGroup(groupId, updates);
      if (res.error) {
        showNotification(res.error, 'error');
        loadAllDataFromSupabase(true);
      } else {
        showNotification(`تم تحديث المجموعة "${data.name}" بنجاح`);
      }
    } else {
      const newGroup: Group = {
        id: generateUUID(),
        name: data.name,
        course: data.course,
        days: data.days,
        time: data.time,
        fee: data.fee,
        studentCount: 0,
        notes: data.notes,
      };

      setGroups((prev) => [...prev, newGroup]);

      const res = await groupsService.insertGroup(newGroup);
      if (res.error) {
        showNotification(res.error, 'error');
        loadAllDataFromSupabase(true);
      } else {
        showNotification(`تمت إضافة المجموعة "${data.name}" بنجاح`);
      }
    }

    setGroupModalOpen(false);
    setGroupToEdit(null);
  };

  const handleDeleteGroupRequest = (group: Group) => {
    const studentCountInGroup = students.filter((s) => s.groupId === group.id).length;
    const warning =
      studentCountInGroup > 0
        ? ` تنبيه: يوجد ${studentCountInGroup} طالب مسجل بهذه المجموعة!`
        : '';

    setConfirmModal({
      isOpen: true,
      title: 'حذف المجموعة',
      message: `هل أنت متأكد من رغبتك في حذف مجموعة "${group.name}"؟${warning}`,
      onConfirm: async () => {
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
        closeConfirmModal();

        const res = await groupsService.removeGroup(group.id);
        if (res.error) {
          showNotification(res.error, 'error');
          loadAllDataFromSupabase(true);
        } else {
          showNotification(`تم حذف المجموعة "${group.name}" بنجاح`, 'info');
        }
      },
    });
  };

  // --- Attendance Handlers ---
  const handleSaveAttendance = async (
    groupId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    const group = groups.find((g) => g.id === groupId);
    const groupName = group ? group.name : '';

    const newRecords: AttendanceRecord[] = records.map((rec) => {
      const st = students.find((s) => s.id === rec.studentId);
      return {
        id: generateUUID(),
        studentId: rec.studentId,
        studentName: st ? st.name : '',
        groupId,
        groupName,
        date,
        status: rec.status,
        notes: rec.notes,
      };
    });

    // Optimistic UI update
    setAttendance((prev) => {
      const otherRecords = prev.filter(
        (r) => !(r.groupId === groupId && r.date === date)
      );
      return [...otherRecords, ...newRecords];
    });

    // Async DB Call
    const res = await attendanceService.saveAttendanceBatch(groupId, date, records);
    if (res.error) {
      showNotification(res.error, 'error');
      loadAllDataFromSupabase(true);
    } else {
      showNotification(`تم حفظ كشف الحضور لتاريخ ${date} بنجاح`);
    }
  };

  // --- Payment Handlers ---
  const handleOpenEditPayment = (payment: PaymentRecord) => {
    setPaymentToEdit(payment);
    setPreselectedStudentForPayment(payment.studentId);
    setPaymentModalOpen(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;
    setConfirmModal({
      isOpen: true,
      title: 'حذف دفعة مسجلة',
      message: `هل أنت متأكد من حذف الدفعة بقيمة ${payment.amount} ج.م للطالب "${payment.studentName}"؟`,
      onConfirm: async () => {
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));

        // Deduct payment from student's paidAmount and recalculate remaining
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === payment.studentId) {
              const newPaid = Math.max(0, s.paidAmount - payment.amount);
              const newRemaining = Math.max(0, s.subscriptionFee - newPaid);
              studentsService.updateStudent(s.id, {
                paidAmount: newPaid,
                remainingAmount: newRemaining,
              });
              return {
                ...s,
                paidAmount: newPaid,
                remainingAmount: newRemaining,
              };
            }
            return s;
          })
        );

        closeConfirmModal();
        showNotification('تم حذف الدفعة بنجاح');
        const res = await paymentsService.removePayment(paymentId);
        if (res.error) {
          showNotification(res.error, 'error');
          loadAllDataFromSupabase(true);
        }
      },
    });
  };

  const handleSavePayment = async (paymentData: {
    studentId: string;
    studentName: string;
    amount: number;
    date: string;
    paymentMethod: any;
    notes: string;
    id?: string;
  }) => {
    if (paymentData.id) {
      // Edit mode: calculate difference from previous payment amount
      const oldPayment = payments.find((p) => p.id === paymentData.id);
      const oldAmount = oldPayment ? Number(oldPayment.amount) || 0 : 0;
      const diff = Number(paymentData.amount) - oldAmount;

      const updatedPayment: PaymentRecord = {
        id: paymentData.id,
        studentId: paymentData.studentId,
        studentName: paymentData.studentName,
        amount: paymentData.amount,
        date: paymentData.date,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
      };

      setPayments((prev) =>
        prev.map((p) => (p.id === paymentData.id ? updatedPayment : p))
      );

      // Reflect change immediately on student's financial status
      if (diff !== 0) {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === paymentData.studentId) {
              const newPaid = Math.max(0, s.paidAmount + diff);
              const newRemaining = Math.max(0, s.subscriptionFee - newPaid);
              studentsService.updateStudent(s.id, {
                paidAmount: newPaid,
                remainingAmount: newRemaining,
              });
              return {
                ...s,
                paidAmount: newPaid,
                remainingAmount: newRemaining,
              };
            }
            return s;
          })
        );
      }

      setPaymentModalOpen(false);
      setPaymentToEdit(null);

      const res = await paymentsService.updatePayment(paymentData.id, updatedPayment);
      if (res.error) {
        showNotification(res.error, 'error');
        loadAllDataFromSupabase(true);
      } else {
        showNotification(`تم تعديل الدفعة للطالب "${paymentData.studentName}" بنجاح`);
      }
      return;
    }

    // New payment mode
    const newPayment: PaymentRecord = {
      id: generateUUID(),
      studentId: paymentData.studentId,
      studentName: paymentData.studentName,
      amount: paymentData.amount,
      date: paymentData.date,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
    };

    // Optimistic update
    setPayments((prev) => [newPayment, ...prev]);

    let updatedPaid = 0;
    let updatedRemaining = 0;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === paymentData.studentId) {
          const newPaid = s.paidAmount + paymentData.amount;
          const newRemaining = Math.max(0, s.subscriptionFee - newPaid);
          updatedPaid = newPaid;
          updatedRemaining = newRemaining;
          return {
            ...s,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
          };
        }
        return s;
      })
    );

    setPaymentModalOpen(false);
    setPaymentToEdit(null);

    // Save payment to DB
    const res = await paymentsService.insertPayment(newPayment);
    if (res.error) {
      showNotification(res.error, 'error');
      loadAllDataFromSupabase(true);
    } else {
      showNotification(
        `تم تسجيل دفعة بقيمة ${paymentData.amount} ج.م للطالب "${paymentData.studentName}" بنجاح`
      );
    }

    // Sync student dues to DB
    if (paymentData.studentId) {
      studentsService.updateStudent(paymentData.studentId, {
        paidAmount: updatedPaid,
        remainingAmount: updatedRemaining,
      });
    }
  };

  // Switch student attendance history modal
  const handleOpenAttendanceHistory = (student: Student) => {
    setStudentForAttendanceHistory(student);
    setAttendanceHistoryModalOpen(true);
  };

  // Save Settings handler
  const handleSaveSettings = async (
    newSettings: CenterSettings
  ): Promise<{ success: boolean; message?: string }> => {
    setCenterSettings(newSettings);
    const res = await settingsService.updateSettings(newSettings);
    if (res.error) {
      showNotification(res.error, 'info');
      return { success: true, message: res.error };
    }
    showNotification('تم حفظ إعدادات السنتر بنجاح في Supabase', 'success');
    return { success: true, message: 'تم حفظ الإعدادات بنجاح في Supabase.' };
  };

  // If user is not logged in, display the dedicated Login Page matching the reference design
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Navigation: Desktop Sidebar (Right side matching Reference Image) + Mobile Drawer */}
      <Navigation
        currentPage={currentPage}
        onSelectPage={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        studentCount={students.length}
        groupCount={groups.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area (offset left for 260px sidebar on desktop matching reference image) */}
      <div className="lg:ml-[260px] flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
        {/* Sticky TopBar matching Reference Image */}
        <TopBar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchTerm={topBarSearchTerm}
          onSearchChange={setTopBarSearchTerm}
          onSearchSubmit={() => {
            if (topBarSearchTerm.trim()) {
              handleNavigate('search');
            }
          }}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          managerName={centerSettings.managerName || 'Miss Sharbat'}
        />

        {/* Global Supabase Sync & Loading Bar */}
        {isLoading && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-[#0066ff]">
            <div className="flex items-center gap-2 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0066ff]" />
              <span>جاري مزامنة وتحديث البيانات مع Supabase...</span>
            </div>
          </div>
        )}

        {syncError && !isLoading && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              type="button"
              onClick={() => loadAllDataFromSupabase()}
              className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1500px] w-full mx-auto">
          {/* Page Routing */}
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setStudentModalOpen(true);
              }}
              onOpenAddGroup={() => {
                setGroupToEdit(null);
                setGroupModalOpen(true);
              }}
              onOpenRecordPayment={() => {
                setPreselectedStudentForPayment(undefined);
                setPaymentModalOpen(true);
              }}
              onViewStudent={(student) => {
                setStudentToView(student);
                setViewStudentModalOpen(true);
              }}
              students={students}
              groups={groups}
              payments={payments}
              sessions={sessions}
              attendance={attendance}
              managerName={centerSettings.managerName || 'Miss Sharbat'}
            />
          )}

          {currentPage === 'students' && (
            <StudentsPage
              students={students}
              groups={groups}
              onOpenAddModal={() => {
                setStudentToEdit(null);
                setStudentModalOpen(true);
              }}
              onOpenEditModal={(student) => {
                setStudentToEdit(student);
                setStudentModalOpen(true);
              }}
              onOpenViewModal={(student) => {
                setStudentToView(student);
                setViewStudentModalOpen(true);
              }}
              onRequestDelete={handleDeleteStudentRequest}
            />
          )}

          {currentPage === 'groups' && (
            <GroupsPage
              groups={groups}
              onOpenAddGroup={() => {
                setGroupToEdit(null);
                setGroupModalOpen(true);
              }}
              onOpenEditGroup={(group) => {
                setGroupToEdit(group);
                setGroupModalOpen(true);
              }}
              onOpenViewStudents={(group) => {
                setSelectedGroupForStudents(group);
                setGroupStudentsModalOpen(true);
              }}
              onRequestDeleteGroup={handleDeleteGroupRequest}
            />
          )}

          {currentPage === 'attendance' && (
            <AttendancePage
              groups={groups}
              students={students}
              attendanceRecords={attendance}
              onSaveAttendance={handleSaveAttendance}
              onViewStudentHistory={handleOpenAttendanceHistory}
            />
          )}

          {currentPage === 'payments' && (
            <PaymentsPage
              payments={payments}
              students={students}
              onOpenRecordPayment={(preselectedStudent) => {
                setPreselectedStudentForPayment(preselectedStudent ? preselectedStudent.id : undefined);
                setPaymentToEdit(null);
                setPaymentModalOpen(true);
              }}
              onEditPayment={handleOpenEditPayment}
              onDeletePayment={handleDeletePayment}
              onViewStudent={(student) => {
                setStudentToView(student);
                setViewStudentModalOpen(true);
              }}
            />
          )}

          {currentPage === 'expenses' && (
            <ExpensesPage />
          )}

          {currentPage === 'notifications' && (
            <NotificationsPage students={students} groups={groups} />
          )}

          {currentPage === 'schedule' && (
            <SchedulePage sessions={sessions} groups={groups} />
          )}

          {currentPage === 'exams' && (
            <SchedulePage sessions={sessions} groups={groups} />
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              students={students}
              groups={groups}
              payments={payments}
              attendance={attendance}
              onViewStudent={(student) => {
                setStudentToView(student);
                setViewStudentModalOpen(true);
              }}
              onOpenViewStudentsInGroup={(group) => {
                setSelectedGroupForStudents(group);
                setGroupStudentsModalOpen(true);
              }}
              onViewStudentAttendance={handleOpenAttendanceHistory}
              onOpenRecordPayment={(student) => {
                setPreselectedStudentForPayment(student.id);
                setPaymentToEdit(null);
                setPaymentModalOpen(true);
              }}
            />
          )}

          {currentPage === 'search' && (
            <SearchPage
              students={students}
              groups={groups}
              payments={payments}
              attendanceRecords={attendance}
              initialSearchTerm={topBarSearchTerm}
              onViewStudent={(student) => {
                setStudentToView(student);
                setViewStudentModalOpen(true);
              }}
              onOpenAttendanceHistory={handleOpenAttendanceHistory}
            />
          )}

          {currentPage === 'ai-assistant' && (
            <AIAssistantPage
              students={students}
              groups={groups}
              payments={payments}
              attendance={attendance}
            />
          )}

          {currentPage === 'users' && (
            <UsersPage />
          )}

          {currentPage === 'links' && (
            <LinksPage />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={centerSettings}
              onSaveSettings={handleSaveSettings}
              onLogout={handleLogout}
              isSupabaseConnected={isSupabaseConfigured}
              onReloadAllData={loadAllDataFromSupabase}
            />
          )}
        </main>
      </div>

      {/* Modals Container */}
      <StudentFormModal
        isOpen={studentModalOpen}
        studentToEdit={studentToEdit}
        groups={groups}
        onClose={() => {
          setStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
      />

      <StudentDetailModal
        student={studentToView}
        payments={payments}
        attendanceRecords={attendance}
        onClose={() => {
          setViewStudentModalOpen(false);
          setStudentToView(null);
        }}
        onOpenAttendanceHistory={handleOpenAttendanceHistory}
        onOpenPaymentModal={(st) => {
          setPreselectedStudentForPayment(st.id);
          setPaymentToEdit(null);
          setPaymentModalOpen(true);
        }}
        onEditPayment={handleOpenEditPayment}
        onDeletePayment={handleDeletePayment}
      />

      <GroupFormModal
        isOpen={groupModalOpen}
        groupToEdit={groupToEdit}
        onClose={() => {
          setGroupModalOpen(false);
          setGroupToEdit(null);
        }}
        onSave={handleSaveGroup}
      />

      <GroupStudentsModal
        isOpen={groupStudentsModalOpen}
        group={selectedGroupForStudents}
        students={students}
        onClose={() => {
          setGroupStudentsModalOpen(false);
          setSelectedGroupForStudents(null);
        }}
        onViewStudent={(student) => {
          setStudentToView(student);
          setViewStudentModalOpen(true);
        }}
      />

      <PaymentFormModal
        isOpen={paymentModalOpen}
        students={students}
        preselectedStudentId={preselectedStudentForPayment}
        paymentToEdit={paymentToEdit}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentToEdit(null);
          setPreselectedStudentForPayment(undefined);
        }}
        onSave={handleSavePayment}
      />

      <StudentAttendanceHistoryModal
        isOpen={attendanceHistoryModalOpen}
        student={studentForAttendanceHistory}
        attendanceRecords={attendance}
        onClose={() => {
          setAttendanceHistoryModalOpen(false);
          setStudentForAttendanceHistory(null);
        }}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}
