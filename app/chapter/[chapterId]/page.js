"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight, Play, FileText, Lock, CheckCircle2,
  Youtube, Clock, Trophy, Shield
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import dynamic from "next/dynamic";

const QuizComponent = dynamic(() => import("@/Components/QuizComponent"), { ssr: false });
const Certificate = dynamic(() => import("@/Components/Certificate"), { ssr: false });

export default function ChapterLessonsPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">جاري التحميل...</div>}>
      <ChapterLessonsContent params={params} />
    </Suspense>
  );
}

function ChapterLessonsContent({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const catIdParam = searchParams.get("catId") ? parseInt(searchParams.get("catId")) : null;
  const chapterId = parseInt(unwrappedParams.chapterId, 10);

  const {
    chapters, lessons: allLessons, currentUser, unlockedChapters, unlockedCourses,
    lessonQuizzes, quizAttempts, certificates,
    courses, categories, issueCertificate,
  } = useGlobalStore();

  const [activeQuizLessonId, setActiveQuizLessonId] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [passedLessons, setPassedLessons] = useState(new Set());

  const chapter = chapters.find(c => parseInt(c.id) === chapterId);
  const lessons = allLessons
    .filter(l => parseInt(l.chapterId) === chapterId && l.status === "نشط")
    .sort((a, b) => (a.sortOrder || a.id) - (b.sortOrder || b.id));

  // Check course unlock respecting context (inside course vs standalone)
  const isCourseUnlocked = !!currentUser && !!chapter && (
    catIdParam
      ? (unlockedCourses || []).some(
          u => (u.userId === currentUser.id || u.user_id === currentUser.id) &&
          parseInt(u.courseId || u.course_id) === parseInt(chapter.courseId) &&
          parseInt(u.categoryId || u.category_id) === catIdParam
        )
      : (unlockedCourses || []).some(
          u => (u.userId === currentUser.id || u.user_id === currentUser.id) &&
          parseInt(u.courseId || u.course_id) === parseInt(chapter.courseId) &&
          (!u.categoryId && !u.category_id)
        )
  );

  const isUnlocked = !!currentUser && !!chapter && (
    isCourseUnlocked ||
    (unlockedChapters || []).some(u => (u.userId === currentUser.id || u.user_id === currentUser.id) && parseInt(u.chapterId || u.chapter_id) === chapterId) ||
    Number(chapter.price || 0) === 0
  );

  // حساب الدروس المتاحة بناءً على نتائج الكويزات
  const getQuizForLesson = (lessonId) =>
    (lessonQuizzes || []).find(q => q.lessonId === lessonId);

  const getLastAttempt = (quizId) =>
    (quizAttempts || [])
      .filter(a => a.userId === currentUser?.id && a.lessonQuizId === quizId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  // هل الدرس مقفول بكويز قبله؟
  const isLessonLockedByQuiz = (lessonIndex) => {
    if (!currentUser || lessonIndex === 0) return false;
    // ابحث عن أي كويز في الدروس السابقة يقفل هذا الدرس
    for (let i = 0; i < lessonIndex; i++) {
      const prevLesson = lessons[i];
      const quiz = getQuizForLesson(prevLesson.id);
      if (!quiz || !quiz.locksNextLessons) continue;
      const attempt = getLastAttempt(quiz.id);
      if (!attempt?.passed) return true; // مقفول
    }
    return false;
  };

  // هل اكتمل كل الفصل؟
  const allLessonsPassed = lessons.every((lesson, idx) => {
    const quiz = getQuizForLesson(lesson.id);
    if (!quiz) return true;
    const attempt = getLastAttempt(quiz.id);
    return attempt?.passed;
  });

  // معلومات الكورس
  const courseId = chapter?.courseId;
  const course = courses?.find(c => c.id === courseId);
  const certForChapter = (certificates || []).find(
    c => c.userId === currentUser?.id && c.chapterId === chapterId
  );

  // منح الشهادة عند اكتمال الفصل
  useEffect(() => {
    if (allLessonsPassed && lessons.length > 0 && currentUser && !certForChapter) {
      issueCertificate?.(currentUser.id, chapterId).then(cert => {
        if (cert) setShowCertificate(true);
      });
    }
  }, [allLessonsPassed, currentUser]);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center" dir="rtl">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">الباب غير موجود</h1>
          <Link href="/" className="text-[#C4963A] font-bold hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center" dir="rtl">
        <div>
          <div className="w-16 h-16 bg-[#C4963A]/10 border border-[#C4963A]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#C4963A]" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">هذا الباب مغلق</h1>
          <p className="text-slate-500 mb-6">يجب تفعيل الكود للوصول لهذه الدروس</p>
          <button onClick={() => router.back()} className="text-[#C4963A] font-bold hover:underline">
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  // ── شاشة شهادة الإتمام ──
  if (showCertificate) {
    return (
      <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">🎉 مبروك! أتممت الفصل</h1>
            <p className="text-slate-500 font-bold">لقد اجتزت جميع دروس هذا الفصل بنجاح</p>
          </div>
          <Certificate
            studentName={currentUser?.name || "الطالب"}
            chapterName={chapter.name}
            courseName={course?.name}
            issuedAt={certForChapter?.issuedAt || new Date().toISOString()}
            certificateId={certForChapter?.id}
          />
          <button
            onClick={() => setShowCertificate(false)}
            className="w-full mt-4 py-3 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
          >
            ← العودة لقائمة الدروس
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#C4963A] shadow-sm border border-slate-100 transition-all"
          >
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900">{chapter.name}</h1>
            <p className="text-slate-500 font-bold text-sm mt-0.5">
              {lessons.length} درس · {(quizAttempts || []).filter(a => a.userId === currentUser?.id && a.passed).length > 0 ? "جاري التقدم" : "لم تبدأ بعد"}
            </p>
          </div>
          {/* زر الشهادة لو موجودة */}
          {certForChapter && (
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#C4963A]/10 text-[#C4963A] border border-[#C4963A]/30 rounded-xl font-black text-sm hover:bg-[#C4963A]/20 transition-all"
            >
              <Trophy className="w-4 h-4" />
              شهادتي
            </button>
          )}
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const quiz = getQuizForLesson(lesson.id);
            const quizAttempt = quiz ? getLastAttempt(quiz.id) : null;
            const quizPassed = quizAttempt?.passed;
            const isLockedByQuiz = isLessonLockedByQuiz(index);
            const isShowingQuiz = activeQuizLessonId === lesson.id;

            return (
              <div key={lesson.id} className="space-y-0">
                {/* Lesson Card */}
                <div className={`group bg-white p-6 rounded-[32px] border shadow-sm transition-all duration-500 flex flex-col md:flex-row items-center gap-6 ${
                  isLockedByQuiz
                    ? "border-slate-200 opacity-70"
                    : "border-slate-100 hover:shadow-xl hover:border-[#C4963A]/20"
                }`}>
                  {/* Thumbnail */}
                  <div className="relative w-full md:w-60 h-36 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {lesson.banner ? (
                      <img src={lesson.banner} alt={lesson.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Youtube className="w-12 h-12" />
                      </div>
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center ${isLockedByQuiz ? "bg-black/50" : "bg-black/20 group-hover:bg-black/40"} transition-colors`}>
                      {isLockedByQuiz ? (
                        <Lock className="w-8 h-8 text-white" />
                      ) : (
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-right w-full">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 bg-[#C4963A]/10 text-[#C4963A] rounded-full text-[10px] font-black">
                        الدرس {index + 1}
                      </span>
                      {lesson.pdfFile && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                          <FileText className="w-3 h-3" />
                          ملف ملخص
                        </span>
                      )}
                      {quiz && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                          quizPassed
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}>
                          {quizPassed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {quizPassed ? "اجتزت الكويز" : "يوجد كويز"}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-black mb-2 transition-colors ${isLockedByQuiz ? "text-slate-400" : "text-slate-800 group-hover:text-[#C4963A]"}`}>
                      {lesson.name}
                    </h3>
                    {isLockedByQuiz && (
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        يجب اجتياز الكويز السابق لفتح هذا الدرس
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  {isLockedByQuiz ? (
                    <div className="w-full md:w-auto px-8 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-center cursor-not-allowed">
                      <Lock className="w-5 h-5 mx-auto" />
                    </div>
                  ) : (
                    <Link
                      href={catIdParam ? `/lesson/${lesson.id}?catId=${catIdParam}` : `/lesson/${lesson.id}`}
                      className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#1B3668] shadow-lg transition-all text-center"
                    >
                      شاهد الآن
                    </Link>
                  )}
                </div>

                {/* Quiz Block (يظهر تحت الدرس لو فيه كويز) */}
                {quiz && !quizPassed && !isLockedByQuiz && (
                  <div className="mx-4">
                    <div className="bg-gradient-to-r from-[#1B3668] to-[#24427D] rounded-b-[24px] p-5 border border-t-0 border-[#1B3668]/20">
                      {isShowingQuiz ? (
                        <div className="bg-slate-900/50 rounded-2xl p-6">
                          <QuizComponent
                            lessonId={lesson.id}
                            lessonQuizId={quiz.id}
                            onPassed={() => {
                              setActiveQuizLessonId(null);
                              setPassedLessons(prev => new Set([...prev, lesson.id]));
                            }}
                            onClose={() => setActiveQuizLessonId(null)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                              <Shield className="w-5 h-5 text-[#C4963A]" />
                            </div>
                            <div>
                              <p className="text-white font-black text-sm">
                                كويز إجباري قبل الدرس التالي
                              </p>
                              <p className="text-slate-300 text-xs font-bold">
                                يجب الحصول على {quiz.passPercentage || 50}% للمتابعة
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveQuizLessonId(lesson.id)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#C4963A] hover:bg-[#b8872e] text-white font-black rounded-xl transition-all text-sm shrink-0"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            ابدأ الكويز
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Passed Quiz Badge */}
                {quiz && quizPassed && (
                  <div className="mx-4">
                    <div className="bg-green-50 border border-green-100 border-t-0 rounded-b-[16px] px-5 py-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 font-bold text-sm">
                        اجتزت الكويز بنجاح — نسبتك: {
                          (quizAttempts || [])
                            .filter(a => a.userId === currentUser?.id && a.lessonQuizId === quiz.id && a.passed)
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.score
                        }%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {lessons.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
              <Youtube className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-800">لا توجد دروس بعد</h3>
              <p className="text-slate-500 font-bold">سيتم إضافة المحاضرات قريباً لهذا الباب</p>
            </div>
          )}
        </div>

        {/* اكتمال الفصل */}
        {allLessonsPassed && lessons.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-green-800">🎉 أحسنت! أتممت الفصل</h3>
                <p className="text-green-600 text-sm font-bold">لقد اجتزت جميع الكويزات بنجاح</p>
              </div>
            </div>
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all shadow-lg shadow-green-500/20"
            >
              <Trophy className="w-5 h-5" />
              عرض الشهادة
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
