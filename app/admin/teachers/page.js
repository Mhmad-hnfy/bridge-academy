"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Key,
  CheckCircle2,
  Video,
  FileText,
  FileQuestion,
  Users,
  Copy,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function TeachersManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Permissions state for modal
  const [canAddVideos, setCanAddVideos] = useState(true);
  const [canAddFiles, setCanAddFiles] = useState(true);
  const [canCreateQuizzes, setCanCreateQuizzes] = useState(true);
  const [canViewStudents, setCanViewStudents] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { teachers = [], courses = [], addTeacher, updateTeacher, deleteTeacher } =
    useGlobalStore();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setImagePreview("");
    setCanAddVideos(true);
    setCanAddFiles(true);
    setCanCreateQuizzes(true);
    setCanViewStudents(true);
    setSelectedCourseId("");
    setShowAddModal(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setImagePreview(teacher.image || "");
    setCanAddVideos(teacher.canAddVideos !== false);
    setCanAddFiles(teacher.canAddFiles !== false);
    setCanCreateQuizzes(teacher.canCreateQuizzes !== false);
    setCanViewStudents(teacher.canViewStudents !== false);
    setSelectedCourseId(teacher.courseId ? String(teacher.courseId) : "");
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTeacher(null);
    setImagePreview("");
  };

  const handleSaveTeacher = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const subject = formData.get("subject");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const password = formData.get("password");
    const bio = formData.get("bio");
    const status = formData.get("status") || "نشط";

    const payload = {
      name,
      subject,
      phone,
      email,
      password: password || (editingTeacher?.password || "123456"),
      bio,
      status,
      courseId: selectedCourseId ? parseInt(selectedCourseId, 10) : null,
      canAddVideos,
      canAddFiles,
      canCreateQuizzes,
      canViewStudents,
      image:
        imagePreview ||
        editingTeacher?.image ||
        "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70),
    };

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, payload);
      showToast("تم تحديث بيانات المدرس وصلاحياته بنجاح.");
    } else {
      addTeacher({
        id: Date.now(),
        ...payload,
        students: 0,
      });
      showToast("تمت إضافة المدرس وتفعيل حسابه بنجاح.");
    }
    closeModal();
  };

  const copyLoginInfo = (teacher) => {
    const text = `مرحباً أستاذ ${teacher.name}،
رابط لوحة تحكم المدرس: ${typeof window !== "undefined" ? window.location.origin : ""}/teacher/login
رقم الهاتف / اسم الدخول: ${teacher.phone}
كلمة المرور: ${teacher.password || "123456"}`;
    navigator.clipboard.writeText(text);
    showToast("تم نسخ بيانات الدخول إلى الحافظة!");
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      t.name.toLowerCase().includes(term) ||
      (t.subject && t.subject.toLowerCase().includes(term)) ||
      (t.phone && t.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#C4963A]" />
            إدارة المدرسين وحساباتهم
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            إنشاء حسابات المدرسين، تعيين كلمات المرور، وتحديد صلاحيات لوحة التحكم لكل مدرس.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/teacher/login"
            target="_blank"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            شاشة دخول المدرسين
          </a>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5 text-[#C4963A]" />
            إضافة مدرس جديد
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث بالاسم، المادة، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A] transition-all"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeachers.map((teacher) => {
          const linkedCourse = courses.find((c) => c.id === teacher.courseId);

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-[#C4963A]/20 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Header Gradient */}
                <div className="h-24 bg-gradient-to-r from-[#1B3668] to-[#24427D] relative">
                  <div className="absolute top-3 left-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(teacher)}
                      title="تعديل البيانات والصلاحيات"
                      className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المدرس ${teacher.name}؟`)) {
                          deleteTeacher(teacher.id);
                        }
                      }}
                      title="حذف"
                      className="p-2 bg-white/20 hover:bg-rose-500 hover:text-white backdrop-blur-md rounded-lg text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Avatar & Status */}
                <div className="px-6 relative -mt-12 flex items-end justify-between">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-sm bg-slate-100"
                  />
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      teacher.status === "نشط"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {teacher.status || "نشط"}
                  </span>
                </div>

                {/* Info */}
                <div className="p-6 pt-3">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[#C4963A] transition-colors">
                    {teacher.name}
                  </h3>
                  <p className="text-sm font-bold text-[#C4963A] mb-1">
                    {teacher.subject}
                  </p>
                  {linkedCourse && (
                    <div className="text-xs text-slate-500 font-semibold mb-3 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
                      <BookOpen className="w-3.5 h-3.5 text-[#1B3668]" />
                      <span>مرتبط بـ: {linkedCourse.name}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span dir="ltr" className="font-mono">
                        {teacher.phone}
                      </span>
                    </div>
                    {teacher.password && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>كلمة المرور:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {teacher.password}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Permissions Badges */}
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                      صلاحيات لوحة التحكم:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold ${
                          teacher.canAddVideos !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        <Video className="w-3 h-3" />
                        فيديوهات
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold ${
                          teacher.canAddFiles !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        ملفات
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold ${
                          teacher.canCreateQuizzes !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        <FileQuestion className="w-3 h-3" />
                        كويزات
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold ${
                          teacher.canViewStudents !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        الطلاب
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => copyLoginInfo(teacher)}
                  className="w-full py-2 bg-slate-50 hover:bg-[#1B3668] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  نسخ بيانات الدخول للمدرس
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-[#C4963A]" />
              {editingTeacher ? "تعديل بيانات وحساب المدرس" : "إضافة مدرس وحساب جديد"}
            </h2>

            <form className="space-y-6" onSubmit={handleSaveTeacher}>
              {/* Image */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة المدرس
                </label>
                <ImageUpload value={imagePreview} onChange={setImagePreview} />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم المدرس *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTeacher ? editingTeacher.name : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
                    placeholder="مثال: أ. أحمد مصطفى"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    المادة العلمية *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    defaultValue={editingTeacher ? editingTeacher.subject : ""}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none"
                    placeholder="مثال: كيمياء، رياضيات..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    المادة المرتبطة بالكورس (اختياري)
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-[#C4963A] outline-none"
                  >
                    <option value="">— غير مرتبط بمادة معينة —</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الحالة
                  </label>
                  <select
                    name="status"
                    defaultValue={editingTeacher?.status || "نشط"}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-[#C4963A] outline-none"
                  >
                    <option value="نشط">نشط</option>
                    <option value="معلق">معلق</option>
                  </select>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                  <Key className="w-4 h-4 text-[#C4963A]" />
                  بيانات تسجيل دخول المدرس (لوحة التحكم)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      رقم الهاتف (اسم الدخول) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editingTeacher ? editingTeacher.phone : ""}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-mono focus:border-[#C4963A] outline-none"
                      placeholder="010XXXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      كلمة المرور *
                    </label>
                    <input
                      type="text"
                      name="password"
                      defaultValue={editingTeacher?.password || "123456"}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-mono focus:border-[#C4963A] outline-none"
                      placeholder="كلمة مرور الدخول"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      البريد الإلكتروني (اختياري)
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingTeacher ? editingTeacher.email : ""}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm focus:border-[#C4963A] outline-none"
                      placeholder="teacher@bridge.com"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#C4963A]" />
                  صلاحيات لوحة تحكم المدرس
                </div>
                <p className="text-xs text-slate-500">
                  حدد الصلاحيات المسموح بها لهذا المدرس في لوحة التحكم الخاصة به:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-[#C4963A] transition-colors">
                    <input
                      type="checkbox"
                      checked={canAddVideos}
                      onChange={(e) => setCanAddVideos(e.target.checked)}
                      className="w-4 h-4 text-[#1B3668] rounded border-slate-300 focus:ring-[#C4963A]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        رفع وإدارة الفيديوهات
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        إضافة وتعديل وحذف فيديوهات في مادته
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-[#C4963A] transition-colors">
                    <input
                      type="checkbox"
                      checked={canAddFiles}
                      onChange={(e) => setCanAddFiles(e.target.checked)}
                      className="w-4 h-4 text-[#1B3668] rounded border-slate-300 focus:ring-[#C4963A]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        رفع وإدارة الملفات والمذكرات
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        رفع مذكرات وملفات PDF للطلاب
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-[#C4963A] transition-colors">
                    <input
                      type="checkbox"
                      checked={canCreateQuizzes}
                      onChange={(e) => setCanCreateQuizzes(e.target.checked)}
                      className="w-4 h-4 text-[#1B3668] rounded border-slate-300 focus:ring-[#C4963A]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        إنشاء وإدارة الكويزات
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        بنك الامتحانات وربط الكويز بالفيديوهات
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-[#C4963A] transition-colors">
                    <input
                      type="checkbox"
                      checked={canViewStudents}
                      onChange={(e) => setCanViewStudents(e.target.checked)}
                      className="w-4 h-4 text-[#1B3668] rounded border-slate-300 focus:ring-[#C4963A]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">
                        متابعة الطلاب المشتركين
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        مشاهدة الطلاب المسجلين ودرجاتهم
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  النبذة التعريفية (Bio)
                </label>
                <textarea
                  rows="3"
                  name="bio"
                  defaultValue={editingTeacher ? editingTeacher.bio : ""}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none resize-none"
                  placeholder="نبذة مختصرة عن خبرة المدرس..."
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 font-bold text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-lg shadow-[#1B3668]/20 transition-all text-sm"
                >
                  {editingTeacher ? "حفظ التعديلات" : "إنشاء حساب المدرس"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
