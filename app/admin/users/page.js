"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  User,
  GraduationCap,
  Trash2,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  CheckSquare,
  Square,
  BookOpen,
  Plus,
  UserPlus,
  X,
  Smartphone,
  LogOut,
  Key
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function UsersManagement() {
  const { users, classes, unlockedChapters, lessons, lessonViews, categories, deleteUser, updateUser, adminAddUser, revokeUserSessions } = useGlobalStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showActions, setShowActions] = useState(null);
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [categoryFilter, setCategoryFilter] = useState("الكل");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get("phone")?.trim() || "";
    const whatsapp = formData.get("whatsapp")?.trim() || "";
    const parentPhone = formData.get("parentPhone")?.trim() || "";
    const nationalId = formData.get("nationalId")?.trim() || "";

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 01");
      return;
    }

    if (whatsapp && !phoneRegex.test(whatsapp)) {
      alert("رقم الواتساب يجب أن يتكون من 11 رقماً ويبدأ بـ 01");
      return;
    }

    const nationalIdRegex = /^[0-9]{14}$/;
    if (nationalId && !nationalIdRegex.test(nationalId)) {
      alert("الرقم القومي يجب أن يتكون من 14 رقماً (أرقام فقط)");
      return;
    }

    const newUser = {
      name: formData.get("name")?.trim(),
      phone,
      email: formData.get("email")?.trim(),
      password: formData.get("password")?.trim(),
      whatsapp,
      nationalId,
      maxDevices: parseInt(formData.get("maxDevices")) || 1,
    };

    const res = await adminAddUser(newUser);
    if (res.success) {
      setShowAddModal(false);
      alert("تم إضافة الطالب بنجاح");
    } else {
      alert(res.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.target);
    const maxDevices = parseInt(formData.get("maxDevices")) || 1;
    const updates = {
      name: formData.get("name")?.trim(),
      phone: formData.get("phone")?.trim(),
      email: formData.get("email")?.trim(),
      whatsapp: formData.get("whatsapp")?.trim(),
      nationalId: formData.get("nationalId")?.trim(),
      status: formData.get("status"),
      maxDevices: maxDevices,
    };

    // If new password is provided
    const newPassword = formData.get("password")?.trim();
    if (newPassword) {
      const bcrypt = (await import("bcryptjs")).default;
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    await updateUser(editingUser.id, updates);
    setShowEditModal(false);
    setEditingUser(null);
    alert("تم تعديل بيانات الطالب بنجاح");
  };

  const handleRevokeDevices = async (user) => {
    if (confirm(`هل أنت متأكد من تسجيل خروج الطالب (${user.name}) من جميع الأجهزة المسجلة فوراً؟`)) {
      const res = await revokeUserSessions(user.id);
      if (res && res.success) {
        alert("تم إنهاء جميع الجلسات وطرد الطالب من جميع الأجهزة بنجاح");
      } else {
        alert(res?.message || "حدث خطأ أثناء إنهاء الجلسات");
      }
      setShowActions(null);
    }
  };

  const calculateProgress = (userId) => {
    const myUnlockedIds = (unlockedChapters || [])
      .filter(u => u.userId === userId)
      .map(u => u.chapterId);
    
    if (myUnlockedIds.length === 0) return 0;

    const unlockedLessons = (lessons || []).filter(l => myUnlockedIds.includes(l.chapterId));
    if (unlockedLessons.length === 0) return 0;

    const watchedIds = new Set((lessonViews || [])
      .filter(v => v.userId === userId)
      .map(v => v.lessonId));
    
    const watchedCount = unlockedLessons.filter(l => watchedIds.has(l.id)).length;
    return Math.round((watchedCount / unlockedLessons.length) * 100);
  };

  const filteredUsers = users.filter(user => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = user.role !== "admin" && 
        ((user.name || "").toLowerCase().includes(searchLow) ||
        (user.phone || "").includes(searchTerm) ||
        ((user.email || "").toLowerCase().includes(searchLow)));
    
    const matchesStatus = statusFilter === "الكل" || user.status === statusFilter;
    const matchesCategory = categoryFilter === "الكل" || user.categoryId?.toString() === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = () => {
    if (confirm(`هل أنت متأكد من حذف ${selectedUsers.size} طالب؟`)) {
      selectedUsers.forEach(id => deleteUser(id));
      setSelectedUsers(new Set());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الطلاب</h1>
          <p className="text-slate-500 mt-2 font-medium">
            عرض وإدارة حسابات جميع الطلاب المسجلين بالمنصة.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-slate-400 font-bold bg-white px-6 py-2.5 rounded-xl border border-slate-100">
                <span>إجمالي الطلاب:</span>
                <span className="text-[#C4963A]">{users.filter(u => u.role !== "admin").length}</span>
            </div>
            <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-[#C4963A] hover:bg-[#b8872e] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                إضافة طالب جديد
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث بالاسم، رقم الهاتف، أو الإيميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all font-bold"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold focus:outline-none"
              >
                <option value="الكل">جميع الحالات</option>
                <option value="نشط">نشط</option>
                <option value="غير نشط">غير نشط</option>
              </select>
            </div>
          </div>

          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between bg-[#FDF8F0] p-4 rounded-2xl border border-[#F0DDB8] animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-[#C4963A] font-bold">
                <CheckSquare className="w-5 h-5" />
                <span>تم تحديد {selectedUsers.size} طالب</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C4963A] text-white rounded-xl text-sm font-bold hover:bg-[#b8872e] transition-all shadow-md shadow-[#E8C87A]"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف المحدد
                </button>
                <button 
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-right border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="p-1 rounded-md hover:bg-slate-200 transition-colors">
                    {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-[#C4963A]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">اسم الطالب</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">رقم الهاتف</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">واتساب</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">الرقم القومي</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">الأجهزة المسموحة</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">الحالة</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap">الإنجاز</th>
                <th className="p-4 font-bold text-slate-600 text-sm whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user, i) => {
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${selectedUsers.has(user.id) ? 'bg-[#FDF8F0]/30' : ''}`}
                  >
                    <td className="p-4 text-center">
                      <button onClick={() => toggleSelectUser(user.id)} className="p-1 rounded-md hover:bg-slate-100 transition-colors">
                        {selectedUsers.has(user.id) ? (
                          <CheckSquare className="w-5 h-5 text-[#C4963A]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-200" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#C4963A] border border-[#F0DDB8] shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-[11px] text-slate-500 font-bold">{user.email || "بدون إيميل"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">{user.phone}</td>
                    <td className="p-4 text-sm font-medium text-slate-600">{user.whatsapp || "-"}</td>
                    <td className="p-4 text-sm font-mono font-medium text-slate-600">{user.nationalId || "-"}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                        <Smartphone className="w-3.5 h-3.5 text-[#C4963A]" />
                        {user.maxDevices || 1} {user.maxDevices === 1 ? "جهاز" : "أجهزة"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${
                        user.status === "نشط" ? "bg-green-100 text-green-700" : "bg-[#FBF0DC] text-[#b8872e]"
                      }`}>
                        {user.status || "نشط"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-[#C4963A] h-full transition-all duration-1000" style={{ width: `${calculateProgress(user.id)}%` }} />
                         </div>
                         <span className="text-[10px] font-black text-slate-400">{calculateProgress(user.id)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-left relative">
                      <button 
                        onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                        className="p-2 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                        {showActions === user.id && (
                          <div className="absolute left-[30px] top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2">
                            <button 
                              onClick={() => {
                                setEditingUser(user);
                                setShowEditModal(true);
                                setShowActions(null);
                              }}
                              className="w-full flex items-center gap-2 p-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" /> تعديل البيانات والأجهزة
                            </button>
                            <button 
                              onClick={() => handleRevokeDevices(user)}
                              className="w-full flex items-center gap-2 p-3 text-sm font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-all"
                              title="تسجيل خروج فوري من كافة الأجهزة المسجلة"
                            >
                              <LogOut className="w-4 h-4 text-amber-600" /> طرد من جميع الأجهزة
                            </button>
                            <button 
                              onClick={() => {
                                const newStatus = user.status === "نشط" ? "غير نشط" : "نشط";
                                updateUser(user.id, { status: newStatus });
                                setShowActions(null);
                              }}
                              className={`w-full flex items-center gap-2 p-3 text-sm font-bold rounded-xl transition-all ${
                                user.status === "نشط" ? "text-slate-600 hover:bg-slate-50" : "text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {user.status === "نشط" ? (
                                <><Ban className="w-4 h-4" /> تعطيل الحساب</>
                              ) : (
                                <><CheckCircle className="w-4 h-4" /> تنشيط الحساب</>
                              )}
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button 
                              onClick={() => {
                                if(confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
                                  deleteUser(user.id);
                                  setShowActions(null);
                                }
                              }}
                              className="w-full flex items-center gap-2 p-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" /> حذف الطالب
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan="9" className="p-12 text-center text-slate-400 font-bold">
                        لا يوجد طلاب مسجلون بهذا الاسم أو لم يتم تسجيل أي طلاب بعد.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Dummy */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <span>يتم عرض {filteredUsers.length} من أصل {users.filter(u => u.role !== "admin").length} طالب</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
              &lt;
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C4963A] text-white font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
              &gt;
            </button>
          </div>
        </div>
        </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute left-6 top-6 p-2 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center text-[#C4963A]">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">إضافة طالب جديد</h2>
                <p className="text-slate-500 font-medium">قم بإدخال بيانات الطالب لإنشاء حساب جديد.</p>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="space-y-6 text-right" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم الطالب رباعي</label>
                  <input name="name" type="text" required placeholder="محمد أحمد علي..." 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف (للدخول)</label>
                  <input 
                    name="phone" 
                    type="tel" 
                    inputMode="numeric"
                    maxLength={11}
                    required 
                    placeholder="01xxxxxxxxx (11 رقم)" 
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11); }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
                  <input name="password" type="password" required placeholder="********" 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني (اختياري)</label>
                  <input name="email" type="email" placeholder="example@mail.com" 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم واتساب</label>
                  <input 
                    name="whatsapp" 
                    type="tel" 
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="01xxxxxxxxx (11 رقم)" 
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11); }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الرقم القومي (14 رقم)</label>
                  <input 
                    name="nationalId" 
                    type="text" 
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="14 رقماً (أرقام فقط)" 
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 14); }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#C4963A] mb-2">الحد الأقصى للأجهزة (المفتوحة معاً)</label>
                  <input 
                    name="maxDevices" 
                    type="number" 
                    min="1" 
                    max="10" 
                    defaultValue="1"
                    required
                    className="w-full border-2 border-[#C4963A]/40 bg-[#FDF8F0]/30 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold text-[#C4963A]" 
                  />
                  <p className="text-xs text-slate-400 mt-1">الافتراضي: جهاز واحد فقط نشط في نفس الوقت.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 font-black text-white bg-[#C4963A] hover:bg-[#b8872e] rounded-2xl shadow-lg shadow-[#E8C87A] transition-all">
                  إنشاء الحساب
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              className="absolute left-6 top-6 p-2 text-slate-400 hover:text-[#C4963A] hover:bg-[#FDF8F0] rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] flex items-center justify-center text-[#C4963A]">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">تعديل بيانات الطالب</h2>
                <p className="text-slate-500 font-medium">تعديل معلومات الحساب والحد الأقصى للأجهزة المسموح بها.</p>
              </div>
            </div>

            <form onSubmit={handleEditUser} className="space-y-6 text-right" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم الطالب</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    defaultValue={editingUser.name || ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                  <input 
                    name="phone" 
                    type="tel" 
                    inputMode="numeric"
                    maxLength={11}
                    required 
                    defaultValue={editingUser.phone || ""}
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11); }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">كلمة مرور جديدة (اتركه فارغاً للإبقاء عليها)</label>
                  <input 
                    name="password" 
                    type="password" 
                    placeholder="اتركه فارغاً إذا كنت لا تريد تغييره" 
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold placeholder:text-xs placeholder:font-normal" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                  <input 
                    name="email" 
                    type="email" 
                    defaultValue={editingUser.email || ""}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم واتساب</label>
                  <input 
                    name="whatsapp" 
                    type="tel" 
                    inputMode="numeric"
                    maxLength={11}
                    defaultValue={editingUser.whatsapp || ""}
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11); }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الرقم القومي</label>
                  <input 
                    name="nationalId" 
                    type="text" 
                    inputMode="numeric"
                    maxLength={14}
                    defaultValue={editingUser.nationalId || ""}
                    onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 14); }}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">حالة الحساب</label>
                  <select 
                    name="status" 
                    defaultValue={editingUser.status || "نشط"}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 outline-none font-bold bg-white"
                  >
                    <option value="نشط">نشط</option>
                    <option value="غير نشط">غير نشط</option>
                    <option value="موقوف">موقوف</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#C4963A] mb-2">
                    الحد الأقصى للأجهزة (المسموحة في نفس الوقت)
                  </label>
                  <input 
                    name="maxDevices" 
                    type="number" 
                    min="1" 
                    max="10" 
                    defaultValue={editingUser.maxDevices || 1}
                    required
                    className="w-full border-2 border-[#C4963A]/40 bg-[#FDF8F0]/30 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold text-[#C4963A]" 
                  />
                  <p className="text-xs text-slate-400 mt-1">إذا فُتح الحساب على أكثر من هذا العدد، يُطرد أقدم جهاز تلقائياً.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="submit" className="flex-1 py-4 font-black text-white bg-[#C4963A] hover:bg-[#b8872e] rounded-2xl shadow-lg shadow-[#E8C87A] transition-all">
                  حفظ التعديلات
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }} 
                  className="px-8 py-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
