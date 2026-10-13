"use client";

import React, { use, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Lock,
  BookOpen,
  Key,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function CoursePage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">جاري التحميل...</div>}>
      <CoursePageContent params={params} />
    </Suspense>
  );
}

function CoursePageContent({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = parseInt(unwrappedParams.courseId, 10);
  const catIdParam = searchParams.get("catId") ? parseInt(searchParams.get("catId")) : null;

  const {
    courses,
    classes,
    categories,
    chapters: allChapters,
    currentUser,
    unlockedChapters,
    unlockedCourses,
    verifyAndUseCode,
    lessons,
  } = useGlobalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8 text-center"
        dir="rtl"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">
            المادة الدراسية غير موجودة
          </h1>
          <Link href="/" className="text-red-600 font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Determine Category context (from URL param if accessed via a course, or fallback)
  const category = catIdParam
    ? categories.find((c) => c.id === catIdParam)
    : course.categoryId
      ? categories.find((c) => c.id === course.categoryId)
      : classes.find((c) => c.id === course.classId)
        ? categories.find(
            (c) =>
              c.id ===
              classes.find((cl) => cl.id === course.classId).categoryId,
          )
        : null;

  const chapters = allChapters.filter(
    (c) => c.courseId === courseId && c.active,
  );

  // Determine if this course is unlocked specifically in this context
  // If catIdParam is present -> must be unlocked for that course (categoryId)
  // If catIdParam is absent -> standalone subject (must be unlocked without category or standalone)
  const isCourseUnlocked =
    !!currentUser &&
    (catIdParam
      ? (unlockedCourses || []).some(
          (u) =>
            (u.userId === currentUser.id || u.user_id === currentUser.id) &&
            parseInt(u.courseId || u.course_id) === courseId &&
            parseInt(u.categoryId || u.category_id) === catIdParam,
        )
      : (unlockedCourses || []).some(
          (u) =>
            (u.userId === currentUser.id || u.user_id === currentUser.id) &&
            parseInt(u.courseId || u.course_id) === courseId &&
            (!u.categoryId && !u.category_id),
        ) ||
      (Number(course.price || 0) === 0 &&
        chapters.length > 0 &&
        chapters.every((ch) => Number(ch.price || 0) === 0)));

  // WhatsApp subscribe url with pre-filled message
  const studentName = currentUser?.name || "طالب جديد";
  const studentPhone = currentUser?.phone || "";
  const isWithinCourse = !!catIdParam && !!category;

  const waMessage = [
    `مرحباً Bridge Academy 🎓،`,
    `أريد الاشتراك في مادة: *${course.name}*`,
    isWithinCourse
      ? `ضمن كورس: *${category.name}*`
      : `(مادة منفصلة / مستقلة)`,
    `اسم الطالب: *${studentName}*`,
    studentPhone ? `رقم الهاتف: *${studentPhone}*` : null,
    `أرجو إرسال تفاصيل الدفع وتفعيل كود المادة.`,
  ]
    .filter(Boolean)
    .join("\n");

  const waUrl = `https://wa.me/201022714993?text=${encodeURIComponent(waMessage)}`;

  const handleOpenModal = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setIsModalOpen(true);
    setSuccess(false);
    setError("");
    setCodeValue("");
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError("");
    const result = await verifyAndUseCode(
      codeValue,
      currentUser.id,
      catIdParam ? parseInt(catIdParam) : null,
      courseId
    );
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-3 mb-8 text-sm md:text-base">
          <Link
            href="/"
            className="text-slate-500 hover:text-[#C4963A] font-bold transition-colors"
          >
            الرئيسية
          </Link>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
          {category && (
            <>
              <Link
                href={`/category/${category.id}`}
                className="text-slate-500 hover:text-[#C4963A] font-bold transition-colors"
              >
                {category.name}
              </Link>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
            </>
          )}
          <span className="text-slate-900 font-black truncate max-w-[200px] sm:max-w-none">
            {course.name}
          </span>
        </div>

        {/* Subscription & Course Activation Hero Banner */}
        {isCourseUnlocked ? (
          <div className="mb-12 max-w-5xl mx-auto bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 text-right">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-800 rounded-full text-xs font-black mb-1">
                  اشتراك نشط ومفعل
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  أنت مشترك بالفعل في مادة {course.name}
                </h3>
                <p className="text-sm font-medium text-slate-600">
                  جميع فصول ودروس وكويزات المادة مفتوحة ومتاحة لك بالكامل.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 max-w-5xl mx-auto bg-white border border-slate-100 rounded-[36px] p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            {/* Background ambient accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C4963A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="text-right space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 text-[#C4963A] border border-[#C4963A]/20 rounded-full text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  اشتراك المادة الدراسية
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                  اشترك الآن في مادة {course.name}
                </h3>
                <p className="text-sm font-medium text-slate-500 max-w-xl">
                  تفعيل كود المادة يمنحك وصولاً شاملاً لجميع فصول المادة، الدروس
                  المسجلة، بنك الأسئلة، الكويزات، والمذكرات طوال فترة دراستك.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                {/* WhatsApp Subscribe Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-black text-sm shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5"
                >
                  <svg
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0"
                  >
                    <path d="M16 2C8.27 2 2 8.27 2 16c0 2.49.68 4.82 1.85 6.83L2 30l7.37-1.82A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.43 11.43 0 01-5.85-1.6l-.42-.25-4.37 1.08 1.1-4.25-.28-.44A11.47 11.47 0 014.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.28-8.58c-.34-.17-2.02-1-2.34-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86 0 1.69 1.22 3.32 1.4 3.55.17.23 2.42 3.69 5.86 5.17.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.82 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.23-.65-.4z" />
                  </svg>
                  <span>اشترك الآن عبر واتساب</span>
                </a>

                {/* Enter Course Code Button */}
                <button
                  onClick={handleOpenModal}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#C4963A] to-[#D4A84A] hover:from-[#b8872e] hover:to-[#c4963a] text-white font-black text-sm shadow-lg shadow-[#E8C87A] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>تفعيل كود المادة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
            فصول مادة {course.name}
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-6">
            تصفح فصول المادة لمتابعة شروحات الدروس، تحميل المذكرات، وحل
            الكويزات
          </p>
          <div className="w-16 h-1 bg-[#C4963A] mx-auto rounded-full" />
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {chapters.map((chapter) => {
            const isChapterUnlocked =
              isCourseUnlocked ||
              (!!currentUser &&
                ((unlockedChapters || []).some(
                  (u) =>
                    (u.userId === currentUser.id ||
                      u.user_id === currentUser.id) &&
                    parseInt(u.chapterId || u.chapter_id) === chapter.id,
                ) ||
                  Number(chapter.price || 0) === 0));

            const chapterLessonsCount = lessons.filter(
              (l) => parseInt(l.chapterId) === parseInt(chapter.id),
            ).length;

            return (
              <div
                key={chapter.id}
                className="group bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4963A]/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>

                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-sm border-2 border-slate-100 z-10 relative">
                  <img
                    src={chapter.image}
                    alt={chapter.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 z-10 relative">
                  {chapter.name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 z-10 relative">
                  <div className="text-sm font-bold text-slate-500 flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{chapterLessonsCount} دروس</span>
                  </div>
                  <div className="text-sm font-black text-[#C4963A] bg-[#C4963A]/10 px-4 py-1.5 rounded-full">
                    <span>
                      {isChapterUnlocked
                        ? "مفتوح للطالب"
                        : Number(chapter.price || 0) > 0
                          ? `${chapter.price} ج.م`
                          : "مشترك في المادة"}
                    </span>
                  </div>
                </div>

                {isChapterUnlocked ? (
                  <Link
                    href={catIdParam ? `/chapter/${chapter.id}?catId=${catIdParam}` : `/chapter/${chapter.id}`}
                    className="mt-6 px-8 py-3.5 w-full rounded-2xl bg-green-600 text-white font-bold shadow-md hover:bg-green-700 shadow-green-200 transition-all duration-300 text-sm flex items-center justify-center gap-2 z-10"
                  >
                    تصفح الدروس والكويزات
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Link>
                ) : (
                  <button
                    onClick={handleOpenModal}
                    className="mt-6 px-8 py-3.5 w-full rounded-2xl bg-[#C4963A] text-white font-bold shadow-md hover:bg-[#A87C24] shadow-[#C4963A]/20 transition-all duration-300 text-sm flex items-center justify-center gap-2 z-10"
                  >
                    <Lock className="w-4 h-4" />
                    تفعيل كود المادة
                  </button>
                )}
              </div>
            );
          })}
          {chapters.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                لا توجد فصول متاحة حالياً
              </h3>
              <p className="text-slate-500 font-medium">
                لم يتم إضافة أي فصول أو أبواب لهذه المادة حتى الآن أو أنها قيد
                التجهيز.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Course Code Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#C4963A] to-[#D4A84A] p-8 text-center text-white relative">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition-colors"
                aria-label="إغلاق"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black">
                تفعيل كود مادة {course.name}
              </h3>
              <p className="text-white/90 text-sm mt-1">
                أدخل كود تفعيل المادة لفتح جميع فصولها ودروسها فوراً
              </p>
            </div>

            <form onSubmit={handleUnlock} className="p-8 space-y-6">
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
                      كود تفعيل المادة (8 أرقام أو حروف)
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
                      href={waUrl}
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
