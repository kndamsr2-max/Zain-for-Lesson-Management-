import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Key,
  CheckCircle2,
  Lock,
  UserCheck,
  Search,
  BadgeCheck,
  Trash2,
  X,
  AlertTriangle,
  Mail,
  User,
  Eye,
  EyeOff,
  UserX,
  Plus,
} from 'lucide-react';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  role: 'مدير النظام' | 'مشرف' | 'معلم' | 'محاسب' | 'سكرتير';
  status: 'نشط' | 'معطل';
  lastActive: string;
  email: string;
  phone?: string;
}

const DEFAULT_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'Miss Sharbat (المديرة)',
    username: 'admin',
    role: 'مدير النظام',
    status: 'نشط',
    lastActive: 'الآن (متصل)',
    email: 'sharbat@zain-center.edu',
    phone: '01012345678',
  },
  {
    id: 'usr-2',
    name: 'أ. محمود الزين',
    username: 'zain',
    role: 'معلم',
    status: 'نشط',
    lastActive: 'منذ ساعتين',
    email: 'zain@zain-center.edu',
    phone: '01123456789',
  },
  {
    id: 'usr-3',
    name: 'سارة علي (مشرفة الحضور)',
    username: 'director',
    role: 'مشرف',
    status: 'نشط',
    lastActive: 'اليوم 09:30 ص',
    email: 'sara@zain-center.edu',
    phone: '01234567890',
  },
  {
    id: 'usr-4',
    name: 'محمد حسن (المحاسب)',
    username: 'manager',
    role: 'محاسب',
    status: 'نشط',
    lastActive: 'أمس 04:15 م',
    email: 'hassan@zain-center.edu',
    phone: '01512345678',
  },
];

const STORAGE_KEY = 'zein_system_users_v3';

export const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('الكل');
  
  // State for users list with local persistence
  const [usersList, setUsersList] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_USERS;
  });

  // Save to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usersList));
    } catch {
      // ignore
    }
  }, [usersList]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<SystemUser['role']>('معلم');
  const [newUserStatus, setNewUserStatus] = useState<SystemUser['status']>('نشط');
  const [formError, setFormError] = useState<string | null>(null);

  // Notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = newUserName.trim();
    const trimmedUsername = newUsername.trim().toLowerCase();

    if (!trimmedName) {
      setFormError('يرجى إدخال اسم المستخدم بالكامل');
      return;
    }

    if (!trimmedUsername) {
      setFormError('يرجى إدخال اسم الدخول (Username)');
      return;
    }

    // Check duplicate username
    if (usersList.some((u) => u.username.toLowerCase() === trimmedUsername)) {
      setFormError('اسم الدخول مستخدم بالفعل، يرجى اختيار اسم مستخدم آخر');
      return;
    }

    if (!newUserPassword || newUserPassword.length < 4) {
      setFormError('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      username: trimmedUsername,
      role: newUserRole,
      status: newUserStatus,
      lastActive: 'لم يسجل دخول بعد',
      email: newUserEmail.trim() || `${trimmedUsername}@zain-center.edu`,
      phone: newUserPhone.trim() || undefined,
    };

    setUsersList((prev) => [newUser, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewUserName('');
    setNewUsername('');
    setNewUserPassword('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('معلم');
    setNewUserStatus('نشط');

    setNotification({
      message: `تمت إضافة المستخدم "${trimmedName}" بنجاح`,
      type: 'success',
    });
  };

  // Handle Delete User
  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    if (userToDelete.username === 'admin') {
      setNotification({
        message: 'لا يمكن حذف الحساب الإداري الرئيسي (admin) لحماية سلامة النظام',
        type: 'error',
      });
      setUserToDelete(null);
      return;
    }

    const deletedName = userToDelete.name;
    setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);

    setNotification({
      message: `تم حذف المستخدم "${deletedName}" بنجاح`,
      type: 'success',
    });
  };

  // Toggle user active status
  const handleToggleStatus = (user: SystemUser) => {
    if (user.username === 'admin') {
      setNotification({
        message: 'لا يمكن تعطيل حساب مدير النظام الرئيسي',
        type: 'error',
      });
      return;
    }

    const nextStatus = user.status === 'نشط' ? 'معطل' : 'نشط';
    setUsersList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    setNotification({
      message: `تم تغيير حالة "${user.name}" إلى ${nextStatus}`,
      type: 'success',
    });
  };

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'الكل' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Metrics
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter((u) => u.status === 'نشط').length;
  const teacherCount = usersList.filter((u) => u.role === 'معلم').length;
  const adminCount = usersList.filter((u) => u.role === 'مدير النظام').length;

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-3 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-rose-600 text-white shadow-rose-600/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="w-6 h-6 text-[#1e65e5]" />
            <h1 className="text-xl sm:text-2xl font-black">إدارة المستخدمين والصلاحيات</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إضافة وحذف وتعديل حسابات طاقم العمل، المعلمين والمشرفين ومتابعة الصلاحيات
          </p>
        </div>

        <button
          id="btn-add-user-modal-trigger"
          type="button"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e65e5] hover:bg-[#1651ba] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">إجمالي المستخدمين</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block font-mono">
              {totalUsers}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e65e5] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">المستخدمين النشطين</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {activeUsers}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">طاقم المعلمين</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 mt-1 block font-mono">
              {teacherCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block">مدراء النظام</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block font-mono">
              {adminCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BadgeCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            id="input-users-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم أو اسم المستخدم أو البريد..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e65e5] focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">تصفية الدور:</span>
          <select
            id="select-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1e65e5] cursor-pointer"
          >
            <option value="الكل">كل الأدوار ({usersList.length})</option>
            <option value="مدير النظام">مدير النظام</option>
            <option value="مشرف">مشرف</option>
            <option value="معلم">معلم</option>
            <option value="محاسب">محاسب</option>
            <option value="سكرتير">سكرتير</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">المستخدم</th>
                <th className="py-3 px-4">اسم الدخول</th>
                <th className="py-3 px-4">الدور الوظيفي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">آخر نشاط</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserX className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm">لا توجد نتائج مطابقة للبحث</p>
                    <p className="text-xs text-slate-400 mt-1">
                      جرب تغيير شروط البحث أو اضغط على إضافة مستخدم جديد
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1e65e5]/10 text-[#1e65e5] font-bold flex items-center justify-center border border-[#1e65e5]/20 shrink-0">
                          {u.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'مدير النظام' && (
                              <span title="مدير رئيسي">
                                <BadgeCheck className="w-4 h-4 text-[#1e65e5]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {u.email}
                            {u.phone ? ` • ${u.phone}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-xs">
                        {u.username}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'مدير النظام'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : u.role === 'معلم'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'محاسب'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.role === 'سكرتير'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          u.status === 'نشط'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="انقر لتغيير الحالة (نشط / معطل)"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.status === 'نشط' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{u.status}</span>
                      </button>
                    </td>

                    {/* Last active */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">{u.lastActive}</td>

                    {/* Actions: Delete & Info */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Delete User Button */}
                        <button
                          id={`btn-delete-user-${u.id}`}
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          disabled={u.username === 'admin'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.username === 'admin'
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={
                            u.username === 'admin'
                              ? 'لا يمكن حذف حساب المدير الرئيسي'
                              : `حذف المستخدم: ${u.name}`
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW USER (إضافة مستخدم جديد)                                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          id="modal-add-user-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            id="modal-add-user-container"
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e65e5] flex items-center justify-center">
                  <UserPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">إضافة مستخدم جديد</h3>
                  <p className="text-[11px] text-slate-500">إنشاء حساب جديد لطاقم العمل في السنتر</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الاسم بالكامل <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-new-user-fullname"
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="مثال: أ. إبراهيم خليل"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e65e5] focus:ring-2 focus:ring-blue-500/10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Username & Password in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم الدخول (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-new-user-username"
                    type="text"
                    required
                    dir="ltr"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. ibrahim"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e65e5] focus:ring-2 focus:ring-blue-500/10 text-right"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-new-user-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e65e5] focus:ring-2 focus:ring-blue-500/10 font-mono text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'إخفاء' : 'إظهار'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الدور الوظيفي <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-new-user-role"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as SystemUser['role'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1e65e5] cursor-pointer"
                  >
                    <option value="معلم">معلم</option>
                    <option value="مشرف">مشرف</option>
                    <option value="محاسب">محاسب</option>
                    <option value="سكرتير">سكرتير</option>
                    <option value="مدير النظام">مدير النظام</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الحالة</label>
                  <select
                    id="select-new-user-status"
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as SystemUser['status'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1e65e5] cursor-pointer"
                  >
                    <option value="نشط">نشط (يمكنه الدخول)</option>
                    <option value="معطل">معطل (موقوف مؤقتاً)</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    id="input-new-user-email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@zain-center.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e65e5] text-right font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    id="input-new-user-phone"
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1e65e5] text-right font-mono"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  id="btn-submit-new-user"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1e65e5] hover:bg-[#1651ba] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ وإضافة المستخدم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM DELETE USER (تأكيد حذف مستخدم)                           */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div
          id="modal-delete-user-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            id="modal-delete-user-container"
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">
                تأكيد حذف المستخدم
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف حساب المستخدم:
                <br />
                <span className="font-bold text-slate-900 text-sm sm:text-base mt-1 inline-block">
                  "{userToDelete.name}" ({userToDelete.username})
                </span>
              </p>

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 text-right">
                ⚠️ تنبيه: بمجرد الحذف، لن يتمكن هذا المستخدم من الدخول إلى النظام مجدداً.
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء التراجع
                </button>

                <button
                  id="btn-confirm-delete-user"
                  type="button"
                  onClick={confirmDeleteUser}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد الحذف نهائياً</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

