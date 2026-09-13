import React, { useState, useEffect } from 'react';
import { PageId, Student, Group, PaymentRecord, LessonSession, AttendanceRecord } from './types';
import {
  studentsService,
  groupsService,
  paymentsService,
  attendanceService,
  sessionsService,
} from './services/dataService';
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
import { LoginPage } from './pages/LoginPage';
import { TopBar } from './components/TopBar';

export default function App() {
  // Authentication State: Default to false to showcase the enhanced professional Login Page
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Active Navigation
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topBarSearchTerm, setTopBarSearchTerm] = useState('');

  // Core Data State (Loaded safely via data service layer)
  const [students, setStudents] = useState<Student[]>(() => studentsService.loadStudents());
  const [groups, setGroups] = useState<Group[]>(() => groupsService.loadGroups());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => paymentsService.loadPayments());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => attendanceService.loadAttendance());
  const [sessions, setSessions] = useState<LessonSession[]>(() => sessionsService.loadSessions());

  // Synchronize data persistence safely
  useEffect(() => {
    studentsService.persistStudents(students);
  }, [students]);

  useEffect(() => {
    groupsService.persistGroups(groups);
  }, [groups]);

  useEffect(() => {
    paymentsService.persistPayments(payments);
  }, [payments]);

  useEffect(() => {
    attendanceService.persistAttendance(attendance);
  }, [attendance]);

  // Notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
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

  // --- Student Handlers ---
  const handleSaveStudent = (
    data: Omit<Student, 'id' | 'remainingAmount' | 'joinedDate'> & { id?: string }
  ) => {
    const remaining = Math.max(0, data.subscriptionFee - data.paidAmount);

    if (data.id) {
      // Edit existing
      setStudents((prev) =>
        prev.map((s) =>
          s.id === data.id
            ? {
                ...s,
                code: s.code || data.code || ('ST-' + s.id.replace('std-', '100')),
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
              }
            : s
        )
      );
      showNotification(`تم تحديث بيانات الطالب "${data.name}" بنجاح`);
    } else {
      // Add new
      const newId = 'std-' + (Date.now() % 100000);
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

      setStudents((prev) => [newStudent, ...prev]);

      // If initial payment made, record it
      if (data.paidAmount > 0) {
        const newPay: PaymentRecord = {
          id: 'pay-' + Date.now(),
          studentId: newId,
          studentName: data.name,
          amount: data.paidAmount,
          date: today,
          paymentMethod: 'نقدي',
          notes: 'دفعة أولى عند التسجيل',
        };
        setPayments((prev) => [newPay, ...prev]);
      }

      // Update group student count
      setGroups((prev) =>
        prev.map((g) =>
          g.id === data.groupId ? { ...g, studentCount: g.studentCount + 1 } : g
        )
      );

      showNotification(`تمت إضافة الطالب "${data.name}" بنجاح`);
    }

    setStudentModalOpen(false);
    setStudentToEdit(null);
  };

  const handleDeleteStudentRequest = (student: Student) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف الطالب',
      message: `هل أنت متأكد من رغبتك في حذف الطالب "${student.name}" من النظام؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        // Update group count
        setGroups((prev) =>
          prev.map((g) =>
            g.id === student.groupId
              ? { ...g, studentCount: Math.max(0, g.studentCount - 1) }
              : g
          )
        );
        closeConfirmModal();
        showNotification(`تم حذف الطالب "${student.name}" بنجاح`, 'info');
      },
    });
  };

  // --- Group Handlers ---
  const handleSaveGroup = (
    data: Omit<Group, 'id' | 'studentCount'> & { id?: string }
  ) => {
    if (data.id) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === data.id
            ? {
                ...g,
                name: data.name,
                course: data.course,
                days: data.days,
                time: data.time,
                fee: data.fee,
                notes: data.notes,
              }
            : g
        )
      );
      // Also update groupName in students belonging to this group
      setStudents((prev) =>
        prev.map((s) =>
          s.groupId === data.id
            ? { ...s, groupName: data.name, course: data.course }
            : s
        )
      );
      showNotification(`تم تحديث المجموعة "${data.name}" بنجاح`);
    } else {
      const newGroup: Group = {
        id: 'grp-' + (Date.now() % 100000),
        name: data.name,
        course: data.course,
        days: data.days,
        time: data.time,
        fee: data.fee,
        studentCount: 0,
        notes: data.notes,
      };
      setGroups((prev) => [...prev, newGroup]);
      showNotification(`تمت إضافة المجموعة "${data.name}" بنجاح`);
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
      onConfirm: () => {
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
        closeConfirmModal();
        showNotification(`تم حذف المجموعة "${group.name}" بنجاح`, 'info');
      },
    });
  };

  // --- Attendance Handlers ---
  const handleSaveAttendance = (
    groupId: string,
    date: string,
    records: { studentId: string; status: 'حاضر' | 'غائب' }[]
  ) => {
    const group = groups.find((g) => g.id === groupId);
    const groupName = group ? group.name : '';

    setAttendance((prev) => {
      // Remove previous records for this group and date to overwrite
      const otherRecords = prev.filter(
        (r) => !(r.groupId === groupId && r.date === date)
      );

      const newRecords: AttendanceRecord[] = records.map((rec) => {
        const st = students.find((s) => s.id === rec.studentId);
        return {
          id: `att-${Date.now()}-${rec.studentId}`,
          studentId: rec.studentId,
          studentName: st ? st.name : '',
          groupId,
          groupName,
          date,
          status: rec.status,
        };
      });

      return [...otherRecords, ...newRecords];
    });

    showNotification(`تم حفظ كشف الحضور لتاريخ ${date} بنجاح`);
  };

  // --- Payment Handlers ---
  const handleSavePayment = (paymentData: {
    studentId: string;
    studentName: string;
    amount: number;
    date: string;
    paymentMethod: any;
    notes: string;
  }) => {
    const newPayment: PaymentRecord = {
      id: 'pay-' + Date.now(),
      studentId: paymentData.studentId,
      studentName: paymentData.studentName,
      amount: paymentData.amount,
      date: paymentData.date,
      paymentMethod: paymentData.paymentMethod,
      notes: paymentData.notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update student paid and remaining amounts
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === paymentData.studentId) {
          const newPaid = s.paidAmount + paymentData.amount;
          const newRemaining = Math.max(0, s.subscriptionFee - newPaid);
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
    showNotification(
      `تم تسجيل دفعة بقيمة ${paymentData.amount} ج.م للطالب "${paymentData.studentName}" بنجاح`
    );
  };

  // Switch student attendance history modal
  const handleOpenAttendanceHistory = (student: Student) => {
    setStudentForAttendanceHistory(student);
    setAttendanceHistoryModalOpen(true);
  };

  // If user is not logged in, display the dedicated Login Page matching the reference design
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          showNotification('تم تسجيل الدخول بنجاح إلى نظام زين لإدارة الدروس والسناتر');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Navigation: Desktop Sidebar (Left side matching Reference Image) + Mobile Drawer */}
      <Navigation
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        studentCount={students.length}
        groupCount={groups.length}
        onLogout={() => {
          setIsLoggedIn(false);
          showNotification('تم تسجيل الخروج بنجاح', 'info');
        }}
      />

      {/* Main Content Area (offset left for 260px sidebar on desktop) */}
      <div className="lg:ml-[260px] flex-1 flex flex-col min-w-0 bg-[#060c18]">
        {/* Sticky TopBar matching Reference Image */}
        <TopBar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchTerm={topBarSearchTerm}
          onSearchChange={setTopBarSearchTerm}
          onSearchSubmit={() => {
            if (topBarSearchTerm.trim()) {
              setCurrentPage('search');
            }
          }}
          onLogout={() => {
            setIsLoggedIn(false);
            showNotification('تم تسجيل الخروج بنجاح', 'info');
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1500px] w-full mx-auto">
          {/* Page Routing */}
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={setCurrentPage}
              onOpenAddStudent={() => {
                setStudentToEdit(null);
                setStudentModalOpen(true);
              }}
              onOpenRecordPayment={() => {
                setPreselectedStudentForPayment(undefined);
                setPaymentModalOpen(true);
              }}
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
              onOpenRecordPayment={() => {
                setPreselectedStudentForPayment(undefined);
                setPaymentModalOpen(true);
              }}
            />
          )}

          {currentPage === 'schedule' && (
            <SchedulePage sessions={sessions} groups={groups} />
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              students={students}
              groups={groups}
              payments={payments}
              attendance={attendance}
            />
          )}

          {currentPage === 'search' && (
            <SearchPage
              students={students}
              groups={groups}
              attendanceRecords={attendance}
              onViewStudent={(student) => {
                setStudentToView(student);
                setViewStudentModalOpen(true);
              }}
              onOpenAttendanceHistory={handleOpenAttendanceHistory}
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
        onClose={() => {
          setViewStudentModalOpen(false);
          setStudentToView(null);
        }}
        onOpenAttendanceHistory={handleOpenAttendanceHistory}
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
        onClose={() => {
          setPaymentModalOpen(false);
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
