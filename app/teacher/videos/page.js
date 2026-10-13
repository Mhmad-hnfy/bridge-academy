"use client";

import React, { useState, useMemo } from "react";
import {
  Video,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Play,
  Layers,
  CheckCircle2,
  X,
  FileQuestion,
  Youtube,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import { cleanVideoInput } from "@/lib/videoHelper";

export default function TeacherVideosPage() {
  const {
    currentTeacher,
    courses = [],
    chapters = [],
    lessons = [],
    lessonQuizzes = [],
    examBanks = [],
    addLesson,
    updateLesson,
    deleteLesson,
  } = useGlobalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const teacher = currentTeacher;
  const linkedCourse = courses.find((c) => c.id === teacher?.courseId);

  // If permission is denied
  if (teacher && teacher.canAddVideos === false) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto mt-12" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">غير مصرح لك بإدارة الفيديوهات</h2>
        <p className="text-slate-500 text-sm">
          لم يتم تفعيل صلاحية "رفع وإدارة الفيديوهات" لحسابك من قبل إدارة المنصة. تواصل مع الأدمن لتفعيلها.
        </p>
      </div>
    );
  }

  // Chapters available for teacher
  const availableChapters = useMemo(() => {
    if (!teacher) return [];
    if (linkedCourse) {
      return chapters.filter((ch) => ch.courseId === linkedCourse.id);
    }
    const matchingCourses = courses.filter(
      (c) => c.name.includes(teacher.subject) || c.teacherId === teacher.id
    );
    const cIds = matchingCourses.map((c) => c.id);
    return chapters.filter((ch) => cIds.includes(ch.courseId));
  }, [teacher, linkedCourse, courses, chapters]);

  // Lessons for teacher
  const teacherLessons = useMemo(() => {
    const chIds = availableChapters.map((ch) => ch.id);
    return lessons.filter((l) => chIds.includes(parseInt(l.chapterId, 10)));
  }, [availableChapters, lessons]);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return teacherLessons.filter((lesson) => {
      if (searchTerm && !lesson.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedChapterId !== "all" && parseInt(lesson.chapterId, 10) !== parseInt(selectedChapterId, 10)) {
        return false;
      }
      return true;
    });
  }, [teacherLessons, searchTerm, selectedChapterId]);

  const openAddModal = () => {
    setEditingLesson(null);
    setShowModal(true);
  };

  const openEditModal = (lesson) => {
    setEditingLesson(lesson);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLesson(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const rawVideoUrl = formData.get("videoUrl");
    const videoUrl = cleanVideoInput(rawVideoUrl);
    const chapterId = parseInt(formData.get("chapterId"), 10);
    const maxViews = parseInt(formData.get("maxViews") || "5", 10);
    const active = formData.get("active") === "true";

    const payload = {
      name,
      videoUrl,
      youtubeLink: videoUrl,
      chapterId,
      maxViews,
      active,
    };

    if (editingLesson) {
      updateLesson(editingLesson.id, payload);
      showToast("تم تحديث بيانات الفيديو بنجاح.");
    } else {
      addLesson({
        id: Date.now(),
        ...payload,
        sortOrder: teacherLessons.length + 1,
      });
      showToast("تمت إضافة الفيديو الجديد بنجاح.");
    }
    closeModal();
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Video className="w-8 h-8 text-[#C4963A]" />
            فيديوهات ودروس مادتي
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            إدارة وشروحات مادة ({teacher?.subject}) وإضافة الفيديوهات للطلاب.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-[#C4963A]" />
          إضافة فيديو جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث باسم الدرس أو الفيديو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50"
          >
            <option value="all">جميع الشهور / الأبواب</option>
            {availableChapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredLessons.length === 0 ? (
          <div className="py-16 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">لا توجد فيديوهات مضافة بعد في هذه المادة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">عنوان الدرس</th>
                  <th className="py-3.5 px-4">الباب / الشهر</th>
                  <th className="py-3.5 px-4 text-center">الكويز المرتبط</th>
                  <th className="py-3.5 px-4 text-center">أقصى مشاهدات</th>
                  <th className="py-3.5 px-4 text-center">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLessons.map((lesson) => {
                  const ch = chapters.find((c) => c.id === parseInt(lesson.chapterId, 10));
                  const quiz = lessonQuizzes.find((lq) => lq.lessonId === lesson.id);
                  const bank = quiz ? examBanks.find((b) => b.id === quiz.examBankId) : null;

                  return (
                    <tr key={lesson.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Play className="w-4 h-4 text-[#C4963A]" />
                          <span>{lesson.name}</span>
                        </div>
                        <a
                          href={lesson.videoUrl || lesson.youtubeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-[#1B3668] flex items-center gap-1.5 mt-0.5 truncate max-w-xs"
                        >
                          {(lesson.videoUrl || lesson.youtubeLink || '').includes('mediadelivery.net') || (lesson.videoUrl || lesson.youtubeLink || '').includes('bunny') ? (
                            <Video className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Youtube className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.videoUrl || lesson.youtubeLink}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold">
                          <Layers className="w-3 h-3 text-[#1B3668]" />
                          {ch?.name || "—"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {quiz ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            <FileQuestion className="w-3 h-3" />
                            {bank?.name || "كويز مرتبط"} ({quiz.passPercentage}%)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">لا يوجد</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {lesson.maxViews || 5} مشاهدات
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            lesson.active !== false
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {lesson.active !== false ? "مفعل" : "معطل"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(lesson)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-[#1B3668] transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الدرس "${lesson.name}"؟`)) {
                                deleteLesson(lesson.id);
                                showToast("تم حذف الدرس.");
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-rose-500 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Video className="w-6 h-6 text-[#C4963A]" />
              {editingLesson ? "تعديل بيانات الفيديو" : "إضافة فيديو درس جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان الدرس *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingLesson ? editingLesson.name : ""}
                  required
                  placeholder="مثال: شرح الباب الأول - الجزء الأول"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    رابط الفيديو (YouTube أو Bunny Stream) *
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    يدعم YouTube & Bunny.net
                  </span>
                </div>
                <input
                  type="text"
                  name="videoUrl"
                  defaultValue={editingLesson ? (editingLesson.videoUrl || editingLesson.youtubeLink || "") : ""}
                  required
                  placeholder="https://youtube.com/watch?v=... أو رابط/كود Bunny"
                  dir="ltr"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-mono focus:border-[#C4963A] outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  يمكنك وضع رابط YouTube أو رابط التضمين من Bunny Stream (أو كود الـ iframe كاملاً).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الشهر / الباب التابع له الدرس *
                </label>
                <select
                  name="chapterId"
                  defaultValue={editingLesson ? editingLesson.chapterId : availableChapters[0]?.id || ""}
                  required
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-[#C4963A] outline-none"
                >
                  {availableChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    أقصى عدد مشاهدات للطالب
                  </label>
                  <input
                    type="number"
                    name="maxViews"
                    defaultValue={editingLesson ? editingLesson.maxViews || 5 : 5}
                    min="1"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الحالة
                  </label>
                  <select
                    name="active"
                    defaultValue={editingLesson ? (editingLesson.active !== false ? "true" : "false") : "true"}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-[#C4963A] outline-none"
                  >
                    <option value="true">مفعل</option>
                    <option value="false">معطل</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs hover:bg-[#24427D] shadow-md transition-all"
                >
                  {editingLesson ? "حفظ التعديلات" : "إضافة الدرس"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
