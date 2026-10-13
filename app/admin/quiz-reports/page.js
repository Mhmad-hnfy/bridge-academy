"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
  Users,
  FileQuestion,
  TrendingUp,
  Download,
  AlertCircle,
  User,
  BookOpen,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function QuizReportsPage() {
  const {
    quizAttempts = [],
    lessonQuizzes = [],
    examBanks = [],
    lessons = [],
    courses = [],
    users = [],
    resetQuizAttempt,
  } = useGlobalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterResult, setFilterResult] = useState("all"); // 'all' | 'passed' | 'failed' | 'waiting'
  const [selectedQuizId, setSelectedQuizId] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [resettingId, setResettingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Enriched attempts list
  const enrichedAttempts = useMemo(() => {
    const now = new Date();
    return quizAttempts.map((attempt) => {
      const user = users.find((u) => u.id === attempt.userId) || {
        name: "طالب غير معروف",
        phone: "—",
      };
      const lessonQuiz = lessonQuizzes.find((lq) => lq.id === attempt.lessonQuizId);
      const lesson = lessonQuiz ? lessons.find((l) => l.id === lessonQuiz.lessonId) : null;
      const bank = lessonQuiz ? examBanks.find((b) => b.id === lessonQuiz.examBankId) : null;
      const course = bank ? courses.find((c) => c.id === bank.courseId) : null;

      const retryDate = attempt.canRetryAt ? new Date(attempt.canRetryAt) : null;
      const isWaiting = !attempt.passed && retryDate && retryDate > now;
      let waitingMinutes = 0;
      if (isWaiting) {
        waitingMinutes = Math.max(0, Math.ceil((retryDate.getTime() - now.getTime()) / (1000 * 60)));
      }

      return {
        ...attempt,
        userName: user.name,
        userPhone: user.phone,
        lessonName: lesson?.name || "درس غير معروف",
        bankName: bank?.name || "كويز بدون اسم",
        courseName: course?.name || bank?.subjectName || "—",
        courseId: bank?.courseId,
        passPercentage: lessonQuiz?.passPercentage ?? 50,
        isWaiting,
        waitingMinutes,
      };
    });
  }, [quizAttempts, users, lessonQuizzes, lessons, examBanks, courses]);

  // Statistics
  const stats = useMemo(() => {
    const total = enrichedAttempts.length;
    if (total === 0) {
      return { total: 0, passed: 0, failed: 0, waiting: 0, passRate: 0, avgScore: 0 };
    }
    const passed = enrichedAttempts.filter((a) => a.passed).length;
    const failed = total - passed;
    const waiting = enrichedAttempts.filter((a) => a.isWaiting).length;
    const passRate = Math.round((passed / total) * 100);
    const avgScore = Math.round(
      enrichedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / total
    );
    return { total, passed, failed, waiting, passRate, avgScore };
  }, [enrichedAttempts]);

  // Filtered attempts
  const filteredAttempts = useMemo(() => {
    return enrichedAttempts.filter((attempt) => {
      // Search
      const search = searchTerm.trim().toLowerCase();
      if (
        search &&
        !attempt.userName.toLowerCase().includes(search) &&
        !attempt.userPhone.includes(search) &&
        !attempt.lessonName.toLowerCase().includes(search) &&
        !attempt.bankName.toLowerCase().includes(search)
      ) {
        return false;
      }

      // Filter by result
      if (filterResult === "passed" && !attempt.passed) return false;
      if (filterResult === "failed" && attempt.passed) return false;
      if (filterResult === "waiting" && !attempt.isWaiting) return false;

      // Filter by quiz
      if (selectedQuizId !== "all" && attempt.lessonQuizId !== parseInt(selectedQuizId, 10)) {
        return false;
      }

      // Filter by course
      if (selectedCourseId !== "all" && attempt.courseId !== parseInt(selectedCourseId, 10)) {
        return false;
      }

      return true;
    });
  }, [enrichedAttempts, searchTerm, filterResult, selectedQuizId, selectedCourseId]);

  // Handle attempt reset
  const handleReset = async (attemptId, studentName) => {
    if (!confirm(`هل أنت متأكد من إعادة تعيين المحاولة للطالب "${studentName}"؟ سيتم حذف هذه المحاولة والسماح له بالدخول فوراً.`)) {
      return;
    }
    setResettingId(attemptId);
    const res = await resetQuizAttempt(attemptId);
    setResettingId(null);
    if (res?.success) {
      showToast(`تمت إعادة تعيين محاولة الطالب ${studentName} بنجاح.`);
    } else {
      showToast(`فشلت إعادة التعيين: ${res?.message || "خطأ غير معروف"}`);
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Toast Notification */}
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
            <BarChart3 className="w-8 h-8 text-[#C4963A]" />
            تقارير الكويزات والامتحانات
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            متابعة نتائج الطلاب في الكويزات، نسب النجاح والرسوب، والطلاب الخاضعين لفترة الانتظار (4 ساعات).
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1B3668] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">إجمالي المحاولات</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">المجتازون</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.passed}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">الراسبون</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.failed}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">قيد الانتظار (4 س)</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.waiting}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#C4963A]/10 text-[#C4963A] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">نسبة النجاح العامة</span>
          </div>
          <div className="text-2xl font-black text-[#C4963A]">{stats.passRate}%</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم الطالب، الهاتف، الدرس، أو الكويز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/40 focus:border-[#C4963A]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/40"
            >
              <option value="all">جميع الحالات</option>
              <option value="passed">الناجحون فقط (اجتازوا)</option>
              <option value="failed">الراسبون فقط</option>
              <option value="waiting">الخاضعون لانتظار الـ 4 ساعات</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C4963A]/40"
            >
              <option value="all">جميع المواد والكورسات</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-[#C4963A]" />
            سجل محاولات الطلاب ({filteredAttempts.length})
          </h2>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">لا توجد محاولات كويز مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">الطالب</th>
                  <th className="py-3.5 px-4">الدرس / المادة</th>
                  <th className="py-3.5 px-4 text-center">الدرجة</th>
                  <th className="py-3.5 px-4 text-center">النتيجة</th>
                  <th className="py-3.5 px-4">تاريخ المحاولة</th>
                  <th className="py-3.5 px-4">إعادة المحاولة (4 س)</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{attempt.userName}</div>
                      <div className="text-xs text-slate-400 font-mono" dir="ltr">
                        {attempt.userPhone}
                      </div>
                    </td>

                    {/* Lesson & Subject */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{attempt.lessonName}</div>
                      <div className="text-xs text-[#C4963A] font-semibold">{attempt.bankName}</div>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-black text-base">
                        <span
                          className={
                            attempt.passed ? "text-emerald-600" : "text-rose-600"
                          }
                        >
                          {attempt.score}%
                        </span>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            attempt.passed ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(attempt.score, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Result */}
                    <td className="py-3.5 px-4 text-center">
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ناجح (اجتاز)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          راسب
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {attempt.createdAt
                        ? new Date(attempt.createdAt).toLocaleString("ar-EG", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>

                    {/* Retry Status */}
                    <td className="py-3.5 px-4 text-xs font-bold">
                      {attempt.passed ? (
                        <span className="text-slate-400">— لا يحتاج إعادة</span>
                      ) : attempt.isWaiting ? (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg w-fit border border-amber-200">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            متبقي {Math.floor(attempt.waitingMinutes / 60)}س و{" "}
                            {attempt.waitingMinutes % 60}د
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          ✓ متاح للإعادة الآن
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleReset(attempt.id, attempt.userName)}
                        disabled={resettingId === attempt.id}
                        title="إعادة تعيين المحاولة والسماح للطالب بالدخول مجدداً فوراً"
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
