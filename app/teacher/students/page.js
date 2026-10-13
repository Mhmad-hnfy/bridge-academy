"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldAlert,
  AlertCircle,
  FileQuestion,
  TrendingUp,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function TeacherStudentsPage() {
  const {
    currentTeacher,
    courses = [],
    chapters = [],
    lessons = [],
    users = [],
    lessonQuizzes = [],
    examBanks = [],
    quizAttempts = [],
    resetQuizAttempt,
  } = useGlobalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterResult, setFilterResult] = useState("all");
  const [resettingId, setResettingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const teacher = currentTeacher;
  const linkedCourse = courses.find((c) => c.id === teacher?.courseId);

  // If permission is denied
  if (teacher && teacher.canViewStudents === false) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto mt-12" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">غير مصرح لك بمتابعة الطلاب</h2>
        <p className="text-slate-500 text-sm">
          لم يتم تفعيل صلاحية "متابعة الطلاب المشتركين ونتائجهم" لحسابك من قبل إدارة المنصة. تواصل مع الأدمن لتفعيلها.
        </p>
      </div>
    );
  }

  // Teacher's lessons and quizzes
  const availableChapters = useMemo(() => {
    if (!teacher) return [];
    if (linkedCourse) return chapters.filter((ch) => ch.courseId === linkedCourse.id);
    const matchingCourses = courses.filter(
      (c) => c.name.includes(teacher.subject) || c.teacherId === teacher.id
    );
    const cIds = matchingCourses.map((c) => c.id);
    return chapters.filter((ch) => cIds.includes(ch.courseId));
  }, [teacher, linkedCourse, courses, chapters]);

  const teacherLessonIds = useMemo(() => {
    const chIds = availableChapters.map((ch) => ch.id);
    return lessons
      .filter((l) => chIds.includes(parseInt(l.chapterId, 10)))
      .map((l) => l.id);
  }, [availableChapters, lessons]);

  const teacherLessonQuizIds = useMemo(() => {
    return lessonQuizzes
      .filter((lq) => teacherLessonIds.includes(lq.lessonId))
      .map((lq) => lq.id);
  }, [teacherLessonIds, lessonQuizzes]);

  // Enriched attempts for this teacher's subject only
  const enrichedAttempts = useMemo(() => {
    const now = new Date();
    return quizAttempts
      .filter((attempt) => teacherLessonQuizIds.includes(attempt.lessonQuizId))
      .map((attempt) => {
        const student = users.find((u) => u.id === attempt.userId) || {
          name: "طالب",
          phone: "—",
        };
        const lessonQuiz = lessonQuizzes.find((lq) => lq.id === attempt.lessonQuizId);
        const lesson = lessonQuiz ? lessons.find((l) => l.id === lessonQuiz.lessonId) : null;
        const bank = lessonQuiz ? examBanks.find((b) => b.id === lessonQuiz.examBankId) : null;

        const retryDate = attempt.canRetryAt ? new Date(attempt.canRetryAt) : null;
        const isWaiting = !attempt.passed && retryDate && retryDate > now;
        let waitingMinutes = 0;
        if (isWaiting) {
          waitingMinutes = Math.max(
            0,
            Math.ceil((retryDate.getTime() - now.getTime()) / (1000 * 60))
          );
        }

        return {
          ...attempt,
          studentName: student.name,
          studentPhone: student.phone,
          lessonName: lesson?.name || "درس",
          bankName: bank?.name || "كويز",
          isWaiting,
          waitingMinutes,
        };
      });
  }, [quizAttempts, teacherLessonQuizIds, users, lessonQuizzes, lessons, examBanks]);

  // Filtered
  const filteredAttempts = useMemo(() => {
    return enrichedAttempts.filter((item) => {
      const term = searchTerm.trim().toLowerCase();
      if (
        term &&
        !item.studentName.toLowerCase().includes(term) &&
        !item.studentPhone.includes(term) &&
        !item.lessonName.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (filterResult === "passed" && !item.passed) return false;
      if (filterResult === "failed" && item.passed) return false;
      if (filterResult === "waiting" && !item.isWaiting) return false;
      return true;
    });
  }, [enrichedAttempts, searchTerm, filterResult]);

  // Reset student attempt
  const handleReset = async (attemptId, studentName) => {
    if (
      !confirm(
        `هل تريد إعادة تعيين المحاولة للطالب "${studentName}" والسماح له بإعادة دخول الكويز فوراً؟`
      )
    ) {
      return;
    }
    setResettingId(attemptId);
    const res = await resetQuizAttempt(attemptId);
    setResettingId(null);
    if (res?.success) {
      showToast(`تمت إعادة فتح الكويز للطالب ${studentName} بنجاح.`);
    } else {
      showToast(`فشلت العملية: ${res?.message || "خطأ غير معروف"}`);
    }
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
            <Users className="w-8 h-8 text-[#C4963A]" />
            متابعة نتائج الطلاب في مادتي
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            استعراض درجات ونتائج طلابك في كويزات مادة ({teacher?.subject}) وإمكانية إعادة فتح المحاولات لمن رسبوا.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث باسم الطالب، الهاتف، أو الدرس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A]"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50"
          >
            <option value="all">جميع الحالات ({enrichedAttempts.length})</option>
            <option value="passed">الناجحون فقط</option>
            <option value="failed">الراسبون فقط</option>
            <option value="waiting">المنتظرون (فترة 4 ساعات)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredAttempts.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">لا توجد محاولات مطابقة في كويزات مادتك</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">اسم الطالب</th>
                  <th className="py-3.5 px-4">الدرس / الكويز</th>
                  <th className="py-3.5 px-4 text-center">الدرجة</th>
                  <th className="py-3.5 px-4 text-center">النتيجة</th>
                  <th className="py-3.5 px-4">تاريخ المحاولة</th>
                  <th className="py-3.5 px-4">حالة الإعادة (4 ساعات)</th>
                  <th className="py-3.5 px-4 text-center">إعادة فتح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{attempt.studentName}</div>
                      <div className="text-xs text-slate-400 font-mono" dir="ltr">
                        {attempt.studentPhone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{attempt.lessonName}</div>
                      <div className="text-xs text-[#C4963A] font-semibold">{attempt.bankName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-black text-base ${
                          attempt.passed ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {attempt.score}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          اجتاز
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          راسب
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {attempt.createdAt
                        ? new Date(attempt.createdAt).toLocaleString("ar-EG", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-bold">
                      {attempt.passed ? (
                        <span className="text-slate-400">— ناجح</span>
                      ) : attempt.isWaiting ? (
                        <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          متبقي {Math.floor(attempt.waitingMinutes / 60)}س و{" "}
                          {attempt.waitingMinutes % 60}د
                        </span>
                      ) : (
                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          ✓ متاح للإعادة
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleReset(attempt.id, attempt.studentName)}
                        disabled={resettingId === attempt.id}
                        title="إعادة فتح المحاولة فوراً للطالب"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#1B3668] hover:text-white text-slate-700 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw
                          className={`w-3.5 h-3.5 ${
                            resettingId === attempt.id ? "animate-spin" : ""
                          }`}
                        />
                        <span>إعادة فتح</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
