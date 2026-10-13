"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  Video,
  Lock,
  Key,
  CheckCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function CategoryPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const categoryId = parseInt(unwrappedParams.categoryId, 10);

  const {
    categories,
    classes,
    courses,
    teachers,
    chapters,
    currentUser,
    unlockedCourses,
    unlockedChapters,
    verifyAndUseCode,
  } = useGlobalStore();

  const [selectedCourseForCode, setSelectedCourseForCode] = useState(null);
  const [codeValue, setCodeValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const category = categories.find((c) => c.id === categoryId);

  // Get all active courses directly belonging or linked to this category
  const categoryCourses = courses.filter((c) => {
    if (!c.active) return false;
    if (c.categoryId === categoryId) return true;
    if (
      Array.isArray(c.categoryIds) &&
      c.categoryIds.map(Number).includes(categoryId)
    )
      return true;
    const matchClass = classes.find((cl) => cl.id === c.classId);
    return matchClass && matchClass.categoryId === categoryId;
  });

  const getTeacher = (teacherId) => teachers.find((t) => t.id === teacherId);
  const getChaptersCount = (courseId) =>
    (chapters || []).filter((ch) => ch.courseId === courseId && ch.active).length;

  // Check if a course is unlocked for current user specifically within this category
  const checkIsCourseUnlocked = (courseId) => {
    if (!currentUser) return false;

    // Check unlocked_courses table specifically for THIS category
    const hasCategoryUnlock = (unlockedCourses || []).some(
      (u) =>
        (u.userId === currentUser.id || u.user_id === currentUser.id) &&
        parseInt(u.courseId || u.course_id) === courseId &&
        parseInt(u.categoryId || u.category_id) === categoryId,
    );
    if (hasCategoryUnlock) return true;

    // Free course check
    const cObj = courses.find((c) => c.id === courseId);
    const courseChapters = (chapters || []).filter(
      (ch) => ch.courseId === courseId && ch.active,
    );
    if (
      cObj &&
      Number(cObj.price || 0) === 0 &&
      courseChapters.length > 0 &&
      courseChapters.every((ch) => Number(ch.price || 0) === 0)
    ) {
      return true;
    }

    return false;
  };


  const buildWhatsAppUrl = (course) => {
    const studentName = currentUser?.name || "طالب جديد";
    const studentPhone = currentUser?.phone || "";
    const catName = category?.name || "";

    const msg = [
      `مرحباً Bridge Academy 🎓،`,
      `أريد الاشتراك في مادة: *${course.name}*`,
      catName ? `ضمن كورس: *${catName}*` : null,
      `اسم الطالب: *${studentName}*`,
      studentPhone ? `رقم الهاتف: *${studentPhone}*` : null,
      `أرجو إرسال تفاصيل الدفع وتفعيل كود المادة.`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/201022714993?text=${encodeURIComponent(msg)}`;
  };

  const handleOpenCodeModal = (course) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setSelectedCourseForCode(course);
    setCodeValue("");
    setError("");
    setSuccess(false);
  };

  const handleUnlockCode = async (e) => {
    e.preventDefault();
    setError("");
    const result = await verifyAndUseCode(
      codeValue,
      currentUser.id,
      categoryId,
      selectedCourseForCode?.id
    );
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSelectedCourseForCode(null);
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  if (!category) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8 text-center"
        dir="rtl"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">
            الكورس أو القسم غير موجود
          </h1>
          <Link href="/" className="text-[#C4963A] font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-slate-500 hover:text-[#C4963A] transition-colors flex items-center gap-2 font-bold text-sm sm:text-base"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            الرئيسية
          </Link>
          <div className="hidden sm:block w-px h-6 bg-slate-300"></div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            {category.name}
          </h1>
        </div>

        {/* Informative Banner */}
        <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-right z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-[#C4963A] border border-[#C4963A]/20 rounded-full text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              نظام تفعيل المواد بالكود
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              المواد الدراسية لكورس {category.name}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl font-medium">
              كل مادة دراسية تتاح بكود تفعيل يفتح لك جميع فصولها ومحاضراتها، مذكراتها
              وبنوك الأسئلة التفاعلية الخاصة بها.
            </p>
          </div>

          <a
            href={`https://wa.me/201022714993?text=${encodeURIComponent(`مرحباً Bridge Academy 🎓، أريد الاستفسار والاشتراك في مواد كورس: *${category.name}*`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-black text-sm shadow-lg shadow-[#25D366]/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 shrink-0 z-10"
          >
            <svg viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5">
              <path d="M16 2C8.27 2 2 8.27 2 16c0 2.49.68 4.82 1.85 6.83L2 30l7.37-1.82A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.43 11.43 0 01-5.85-1.6l-.42-.25-4.37 1.08 1.1-4.25-.28-.44A11.47 11.47 0 014.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.28-8.58c-.34-.17-2.02-1-2.34-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86 0 1.69 1.22 3.32 1.4 3.55.17.23 2.42 3.69 5.86 5.17.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.82 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.23-.65-.4z" />
            </svg>
            <span>اشتراك الكورس عبر واتساب</span>
          </a>
        </div>

        {/* Courses (المواد) Grid */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-6xl mx-auto">
          {categoryCourses.map((course) => {
            const teacher = getTeacher(course.teacherId);
            const chaptersCount = getChaptersCount(course.id);
            const isUnlocked = checkIsCourseUnlocked(course.id);
            const waUrl = buildWhatsAppUrl(course);

            return (
              <div
                key={course.id}
                className="w-full sm:w-[380px] group bg-white text-slate-800 rounded-3xl sm:rounded-[32px] flex flex-col overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative"
              >
                {/* Image & Status Badge */}
                <div className="relative h-[200px] sm:h-[230px] overflow-hidden bg-[#C4963A]/10">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#C4963A]/10 to-[#C4963A]/20">
                      <BookOpen className="w-16 h-16 text-[#C4963A]/50" />
                    </div>
                  )}

                  {/* Chapters count pill */}
                  <div className="absolute top-4 right-4 bg-[#0F1A30]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-1.5 shadow-lg text-xs font-black">
                    <Video className="w-3.5 h-3.5 text-[#C4963A]" />
                    <span>{chaptersCount} فصول</span>
                  </div>

                  {/* Lock / Unlocked Status Badge */}
                  <div className="absolute top-4 left-4 shadow-lg">
                    {isUnlocked ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 border border-emerald-400/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        مشترك بالمادة
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-[#C4963A] text-white font-black text-xs flex items-center gap-1.5 shadow-md">
                        <Lock className="w-3.5 h-3.5" />
                        تتطلب كود تفعيل
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4 bg-white relative">
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#C4963A] transition-colors text-right">
                      {course.name}
                    </h3>

                    {teacher && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <GraduationCap className="w-4 h-4 text-[#C4963A]" />
                        <span className="text-xs font-bold text-slate-700">
                          {teacher.name}
                        </span>
                        {teacher.subject && (
                          <span className="text-[10px] text-slate-400 font-medium mr-auto">
                            ({teacher.subject})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions according to unlocked/locked state */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {isUnlocked ? (
                      <Link
                        href={`/course/${course.id}?catId=${categoryId}`}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-sm transition-all duration-300 shadow-md shadow-green-200"
                      >
                        <span>تصفح محتوى المادة</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Enter Code button */}
                          <button
                            type="button"
                            onClick={() => handleOpenCodeModal(course)}
                            className="w-full flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#C4963A] hover:bg-[#b8872e] text-white font-black text-xs transition-all shadow-md shadow-[#C4963A]/20"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>تفعيل الكود</span>
                          </button>

                          {/* WhatsApp Subscribe button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-black text-xs transition-all shadow-md shadow-[#25D366]/20"
                          >
                            <svg
                              viewBox="0 0 32 32"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M16 2C8.27 2 2 8.27 2 16c0 2.49.68 4.82 1.85 6.83L2 30l7.37-1.82A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.43 11.43 0 01-5.85-1.6l-.42-.25-4.37 1.08 1.1-4.25-.28-.44A11.47 11.47 0 014.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.28-8.58c-.34-.17-2.02-1-2.34-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86 0 1.69 1.22 3.32 1.4 3.55.17.23 2.42 3.69 5.86 5.17.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.82 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.23-.65-.4z" />
                            </svg>
                            <span>اشترك واتساب</span>
                          </a>
                        </div>

                        {/* Direct link to course details */}
                        <Link
                          href={`/course/${course.id}?catId=${categoryId}`}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                        >
                          <span>استعراض فصول المادة</span>
                          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {categoryCourses.length === 0 && (
            <div className="w-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg mb-2">
                لا توجد مواد دراسية مضافة في هذا الكورس حالياً.
              </p>
              <p className="text-slate-400 text-sm">
                سيتم إضافة المواد والمحاضرات قريباً.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Code Entry Modal */}
      {selectedCourseForCode && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCourseForCode(null)}
          ></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#C4963A] to-[#D4A84A] p-8 text-center text-white relative">
              <button
                type="button"
                onClick={() => setSelectedCourseForCode(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition-colors"
                aria-label="إغلاق"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black">
                تفعيل مادة {selectedCourseForCode.name}
              </h3>
              <p className="text-white/90 text-sm mt-1">
                أدخل كود الاشتراك لتفعيل المادة وفتح جميع فصولها فوراً
              </p>
            </div>

            <form onSubmit={handleUnlockCode} className="p-8 space-y-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-6 text-green-600 space-y-3">
                  <CheckCircle className="w-14 h-14" />
                  <p className="font-black text-xl">تم تفعيل المادة بنجاح!</p>
                  <p className="text-xs text-slate-500">
                    أصبحت جميع فصول ودروس المادة متاحة لك الآن.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 block text-right pr-2">
                      كود تفعيل المادة (8 رموز)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: A1B2C3D4"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-black text-center text-xl tracking-widest uppercase transition-all"
                      value={codeValue}
                      onChange={(e) => setCodeValue(e.target.value)}
                      required
                      autoFocus
                    />
                    {error && (
                      <p className="text-red-500 text-xs font-bold text-center mt-2">
                        {error}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    تفعيل المادة الآن
                  </button>

                  <div className="pt-4 border-t border-slate-100 text-center space-y-3">
                    <p className="text-xs font-bold text-slate-500">
                      ليس لديك كود تفعيل للمادة؟
                    </p>
                    <a
                      href={buildWhatsAppUrl(selectedCourseForCode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-black text-sm transition-all flex items-center justify-center gap-2 border border-[#25D366]/30"
                    >
                      <svg
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        className="w-4 h-4 shrink-0"
                      >
                        <path d="M16 2C8.27 2 2 8.27 2 16c0 2.49.68 4.82 1.85 6.83L2 30l7.37-1.82A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.43 11.43 0 01-5.85-1.6l-.42-.25-4.37 1.08 1.1-4.25-.28-.44A11.47 11.47 0 014.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.28-8.58c-.34-.17-2.02-1-2.34-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86 0 1.69 1.22 3.32 1.4 3.55.17.23 2.42 3.69 5.86 5.17.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.82 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.23-.65-.4z" />
                      </svg>
                      <span>اشترك الآن عبر واتساب</span>
                    </a>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
