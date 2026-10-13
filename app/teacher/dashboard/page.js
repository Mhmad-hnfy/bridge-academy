"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Video,
  FileText,
  FileQuestion,
  Users,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function TeacherDashboardPage() {
  const {
    currentTeacher,
    courses = [],
    chapters = [],
    lessons = [],
    users = [],
    examBanks = [],
    lessonQuizzes = [],
    quizAttempts = [],
    teacherFiles = [],
  } = useGlobalStore();

  const teacher = currentTeacher;
  const linkedCourse = courses.find((c) => c.id === teacher?.courseId);

  // Filter lessons belonging to teacher's course/subject
  const teacherLessons = useMemo(() => {
    if (!teacher) return [];
    if (linkedCourse) {
      const courseChapterIds = chapters
        .filter((ch) => ch.courseId === linkedCourse.id)
        .map((ch) => ch.id);
      return lessons.filter((l) => courseChapterIds.includes(parseInt(l.chapterId, 10)));
    }
    // Fallback: search by subject name in courses
    const matchingCourses = courses.filter(
      (c) => c.name.includes(teacher.subject) || c.teacherId === teacher.id
    );
    const matchingChapterIds = chapters
      .filter((ch) => matchingCourses.some((c) => c.id === ch.courseId))
      .map((ch) => ch.id);
    return lessons.filter((l) => matchingChapterIds.includes(parseInt(l.chapterId, 10)));
  }, [teacher, linkedCourse, courses, chapters, lessons]);

  // Teacher files
  const myFiles = useMemo(() => {
    if (!teacher) return [];
    return teacherFiles.filter((f) => f.teacherId === teacher.id || (linkedCourse && f.courseId === linkedCourse.id));
  }, [teacher, teacherFiles, linkedCourse]);

  // Teacher exams
  const myExamBanks = useMemo(() => {
    if (!teacher) return [];
    return examBanks.filter(
      (b) =>
        (linkedCourse && b.courseId === linkedCourse.id) ||
        (b.subjectName && b.subjectName.includes(teacher.subject))
    );
  }, [teacher, examBanks, linkedCourse]);

  // Teacher lesson quizzes
  const myLessonQuizzes = useMemo(() => {
    const lessonIds = teacherLessons.map((l) => l.id);
    return lessonQuizzes.filter((lq) => lessonIds.includes(lq.lessonId));
  }, [teacherLessons, lessonQuizzes]);

  // Quiz attempts for teacher's quizzes
  const myAttempts = useMemo(() => {
    const lqIds = myLessonQuizzes.map((lq) => lq.id);
    return quizAttempts.filter((qa) => lqIds.includes(qa.lessonQuizId));
  }, [myLessonQuizzes, quizAttempts]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAttempts = myAttempts.length;
    const passed = myAttempts.filter((a) => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passed / totalAttempts) * 100) : 0;
    const avgScore =
      totalAttempts > 0
        ? Math.round(myAttempts.reduce((acc, c) => acc + (c.score || 0), 0) / totalAttempts)
        : 0;

    return {
      videosCount: teacherLessons.length,
      filesCount: myFiles.length,
      quizzesCount: myExamBanks.length,
      attemptsCount: totalAttempts,
      passRate,
      avgScore,
      studentsCount: teacher?.students || 0,
    };
  }, [teacherLessons, myFiles, myExamBanks, myAttempts, teacher]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1B3668] to-[#24427D] rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-[#1B3668]/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C4963A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C4963A] text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              مرحباً بك في لوحة المعلم
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-2">
              أهلاً، أستاذ {teacher?.name} 🌟
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              مادتك الدراسية: <span className="font-bold text-[#C4963A]">{teacher?.subject}</span>
              {linkedCourse && <span> — مرتبطة بكورس: {linkedCourse.name}</span>}
              . يمكنك متابعة طلابك، إضافة الدروس، ووضع الامتحانات بكل سهولة.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {teacher?.canAddVideos !== false && (
              <Link
                href="/teacher/videos"
                className="px-5 py-2.5 rounded-xl bg-[#C4963A] hover:bg-[#D4A84A] text-slate-900 font-black text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                إضافة فيديو
              </Link>
            )}
            {teacher?.canCreateQuizzes !== false && (
              <Link
                href="/teacher/quizzes"
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <FileQuestion className="w-4 h-4" />
                إنشاء كويز
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B3668] flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">فيديوهات المادة</span>
            <span className="text-2xl font-black text-slate-900">{stats.videosCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">الطلاب المسجلون</span>
            <span className="text-2xl font-black text-slate-900">{stats.studentsCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">الكويزات المنشورة</span>
            <span className="text-2xl font-black text-slate-900">{stats.quizzesCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C4963A]/10 text-[#C4963A] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">نسبة نجاح الطلاب</span>
            <span className="text-2xl font-black text-[#C4963A]">{stats.passRate}%</span>
          </div>
        </div>
      </div>

      {/* Permissions & Quick Access Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions based on permissions */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C4963A]" />
            الأقسام المتاحة لك
          </h3>
          <div className="space-y-3">
            {teacher?.canAddVideos !== false && (
              <Link
                href="/teacher/videos"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1B3668] flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">إدارة الفيديوهات والدروس</h4>
                    <p className="text-xs text-slate-400">إضافة وتعديل روابط الفيديوهات لمادتك</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </Link>
            )}

            {teacher?.canAddFiles !== false && (
              <Link
                href="/teacher/files"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">المذكرات وملفات PDF</h4>
                    <p className="text-xs text-slate-400">رفع الملازم ومصادر التعلم لطلابك</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </Link>
            )}

            {teacher?.canCreateQuizzes !== false && (
              <Link
                href="/teacher/quizzes"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <FileQuestion className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">بنك الامتحانات والكويزات</h4>
                    <p className="text-xs text-slate-400">إنشاء أسئلة اختيار من متعدد وربطها بالدروس</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </Link>
            )}

            {teacher?.canViewStudents !== false && (
              <Link
                href="/teacher/students"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">الطلاب المشتركين والنتائج</h4>
                    <p className="text-xs text-slate-400">متابعة درجات الكويزات وحالات الرسوب</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#C4963A]" />
                آخر نتائج كويزات مادتك
              </h3>
              {teacher?.canViewStudents !== false && (
                <Link
                  href="/teacher/students"
                  className="text-xs text-[#1B3668] font-bold hover:underline"
                >
                  عرض الكل
                </Link>
              )}
            </div>

            {myAttempts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-bold">
                لا توجد محاولات طلاب مسجلة بعد في كويزات هذه المادة
              </div>
            ) : (
              <div className="space-y-3">
                {myAttempts.slice(0, 5).map((attempt) => {
                  const student = users.find((u) => u.id === attempt.userId);
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {student?.name || "طالب"}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {student?.phone || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-sm ${
                            attempt.passed ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {attempt.score}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            attempt.passed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {attempt.passed ? "ناجح" : "راسب"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
