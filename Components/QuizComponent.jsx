"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, Trophy,
  Play, ShieldCheck, ArrowLeft, ChevronRight, Timer
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

// ─── عداد تنازلي ──────────────────────────────────────────────────
function CountdownTimer({ targetTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetTime) - new Date();
      if (diff <= 0) { onExpire?.(); return 0; }
      return diff;
    };
    setTimeLeft(calc());
    const interval = setInterval(() => {
      const left = calc();
      setTimeLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  if (timeLeft === null || timeLeft <= 0) return null;
  const totalSecs = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;
  const pad   = n => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 justify-center">
      <Clock className="w-5 h-5 text-orange-400 animate-pulse" />
      <span className="font-mono font-black text-3xl text-orange-400 tracking-widest">
        {pad(hours)}:{pad(mins)}:{pad(secs)}
      </span>
    </div>
  );
}

// ─── شريط التقدم ──────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-1.5" dir="rtl">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-slate-400">السؤال {current} من {total}</span>
        <span className="text-[#C4963A] font-black">{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1B3668 0%, #C4963A 100%)" }}
        />
      </div>
    </div>
  );
}

// ─── بطاقة اختيار ─────────────────────────────────────────────────
function ChoiceCard({ label, text, isSelected, onClick }) {
  let containerCls = "bg-white/[0.03] border-white/10 hover:bg-[#1B3668]/20 hover:border-[#1B3668]/50";
  let labelCls     = "bg-slate-700/60 text-slate-400";
  let textCls      = "text-slate-300 group-hover:text-white";

  if (isSelected) {
    containerCls = "bg-[#1B3668]/40 border-[#C4963A] shadow-lg shadow-[#1B3668]/30";
    labelCls     = "bg-[#C4963A] text-slate-950 font-black";
    textCls      = "text-white font-black";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-right transition-all duration-200 group cursor-pointer active:scale-[0.99] ${containerCls}`}
      dir="rtl"
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${labelCls}`}>
        {label}
      </span>
      <span className={`flex-1 font-bold text-base leading-relaxed transition-colors ${textCls}`}>{text}</span>
      {isSelected && (
        <ChevronRight className="w-4 h-4 text-[#C4963A] shrink-0" />
      )}
    </button>
  );
}

// ─── المكون الرئيسي ────────────────────────────────────────────────
export default function QuizComponent({ lessonQuizId, lessonId, onPassed, onClose }) {
  const {
    lessonQuizzes, examBanks, examQuestions, examChoices,
    currentUser, quizAttempts, submitQuizAttempt,
  } = useGlobalStore();

  const quiz      = (lessonQuizzes || []).find(q => q.id === lessonQuizId || q.lessonId === lessonId);
  const bank      = quiz ? (examBanks || []).find(b => b.id === quiz.examBankId) : null;
  const questions = bank
    ? (examQuestions || []).filter(q => q.examBankId === bank.id).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : [];

  const durationMinutes = Number(quiz?.durationMinutes ?? quiz?.duration_minutes ?? 0);

  const lastAttempt  = (quizAttempts || [])
    .filter(a => a.userId === currentUser?.id && a.lessonQuizId === quiz?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const canRetryAt   = lastAttempt?.canRetryAt ? new Date(lastAttempt.canRetryAt) : null;
  const isWaiting    = canRetryAt && new Date() < canRetryAt && !lastAttempt?.passed;
  const alreadyPassed = lastAttempt?.passed;

  const [phase, setPhase]             = useState("intro");
  const [currentQ, setCurrentQ]       = useState(0);
  const [answers, setAnswers]         = useState({});
  const [selectedChoice, setSelected] = useState(null);
  const [score, setScore]             = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [retryExpired, setRetryExpired] = useState(false);
  const [timeLeftMs, setTimeLeftMs]   = useState(null);
  const [autoSubmittedByTimeout, setAutoSubmittedByTimeout] = useState(false);

  // Refs for callbacks to avoid stale closures in interval
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const selectedChoiceRef = useRef(selectedChoice);
  selectedChoiceRef.current = selectedChoice;

  const currentQRef = useRef(currentQ);
  currentQRef.current = currentQ;

  const submittingRef = useRef(false);

  const sessionTimerKey = quiz?.id && currentUser?.id ? `quiz_timer_${quiz.id}_${currentUser.id}` : null;

  // Auto-submit when exam time expires
  const handleTimeExpired = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setAutoSubmittedByTimeout(true);

    if (sessionTimerKey && typeof window !== "undefined") {
      sessionStorage.removeItem(sessionTimerKey);
    }

    const finalAnswers = { ...answersRef.current };
    const curIdx = currentQRef.current;
    if (selectedChoiceRef.current !== null && questions[curIdx]) {
      finalAnswers[questions[curIdx].id] = selectedChoiceRef.current;
    }

    let correct = 0;
    questions.forEach(q => {
      const chosen = finalAnswers[q.id];
      const choicesList = (examChoices || []).filter(c => String(c.questionId) === String(q.id));
      const correctChoice = choicesList.find(c => c.isCorrect);
      if (chosen && correctChoice && String(chosen) === String(correctChoice.id)) correct++;
    });

    const pct    = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = pct >= (quiz?.passPercentage || 50);

    try {
      await submitQuizAttempt({
        userId: currentUser?.id,
        lessonQuizId: quiz.id,
        score: pct,
        passed,
        answers: finalAnswers,
        canRetryAt: passed ? null : new Date(Date.now() + (quiz?.retryHours || 4) * 3600 * 1000).toISOString(),
      });
    } catch (e) {
      console.error("Auto-submit quiz attempt failed:", e);
    }

    setAnswers(finalAnswers);
    setScore(pct);
    setPhase("result");
    setSubmitting(false);
    submittingRef.current = false;
  }, [questions, examChoices, quiz, currentUser, submitQuizAttempt, sessionTimerKey]);

  // Exam Countdown Timer Effect
  useEffect(() => {
    if (phase !== "quiz" || durationMinutes <= 0) return;

    let expiresAt = null;
    if (sessionTimerKey && typeof window !== "undefined") {
      const saved = sessionStorage.getItem(sessionTimerKey);
      if (saved) {
        expiresAt = parseInt(saved, 10);
      } else {
        expiresAt = Date.now() + durationMinutes * 60 * 1000;
        sessionStorage.setItem(sessionTimerKey, String(expiresAt));
      }
    } else {
      expiresAt = Date.now() + durationMinutes * 60 * 1000;
    }

    const checkTime = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        handleTimeExpired();
        return;
      }
      setTimeLeftMs(remaining);
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [phase, durationMinutes, sessionTimerKey, handleTimeExpired]);

  useEffect(() => {
    if (phase !== "quiz") return;
    const block = () => {
      window.history.pushState(null, "", window.location.href);
      alert("لا يمكنك مغادرة الاختبار أثناء جريان المؤقت. يجب إنهاء جميع الأسئلة أو انتظار انتهاء الوقت.");
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", block);
    return () => window.removeEventListener("popstate", block);
  }, [phase]);

  useEffect(() => {
    // Only set initial state on mount if user is still on the intro screen
    if (phase === "intro") {
      if (alreadyPassed) setPhase("passed");
      else if (isWaiting) setPhase("waiting");
    }
  }, [alreadyPassed, isWaiting, phase]);

  const handleRetryExpire = useCallback(() => {
    setRetryExpired(true);
    setPhase("intro");
  }, []);

  const startQuiz = () => {
    setAnswers({});
    setCurrentQ(0);
    setSelected(null);
    setAutoSubmittedByTimeout(false);
    if (durationMinutes > 0 && sessionTimerKey && typeof window !== "undefined") {
      const expiresAt = Date.now() + durationMinutes * 60 * 1000;
      sessionStorage.setItem(sessionTimerKey, String(expiresAt));
      setTimeLeftMs(durationMinutes * 60 * 1000);
    }
    setPhase("quiz");
  };

  const handleNext = async () => {
    if (selectedChoice === null) return;
    const currentQuestionId = questions[currentQ].id;
    const newAnswers = { ...answers, [currentQuestionId]: selectedChoice };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
    } else {
      if (sessionTimerKey && typeof window !== "undefined") {
        sessionStorage.removeItem(sessionTimerKey);
      }
      submittingRef.current = true;
      setSubmitting(true);
      let correct = 0;
      questions.forEach(q => {
        const chosen = newAnswers[q.id];
        const choicesList = (examChoices || []).filter(c => String(c.questionId) === String(q.id));
        const correctChoice = choicesList.find(c => c.isCorrect);
        if (chosen && correctChoice && String(chosen) === String(correctChoice.id)) correct++;
      });
      const pct    = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = pct >= (quiz?.passPercentage || 50);
      await submitQuizAttempt({
        userId: currentUser?.id,
        lessonQuizId: quiz.id,
        score: pct,
        passed,
        answers: newAnswers,
        canRetryAt: passed ? null : new Date(Date.now() + (quiz?.retryHours || 4) * 3600 * 1000).toISOString(),
      });
      setScore(pct);
      setPhase("result");
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const formatTimeLeft = (ms) => {
    if (ms === null || ms <= 0) return "00:00";
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSecs / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;
    const pad   = n => String(n).padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  if (!quiz || !bank || questions.length === 0) {
    return <div className="text-center py-10 text-slate-400 font-bold" dir="rtl">لا يوجد امتحان مرتبط بهذا الدرس</div>;
  }

  /* ═══════ PASSED ═══════ */
  if (phase === "passed") return (
    <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <span className="absolute -top-1 -right-1 text-xl">🏆</span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-white mb-1">اجتزت الاختبار بنجاح!</h3>
        <p className="text-slate-400 font-bold text-sm">
          درجتك: <span className="text-[#C4963A] font-black">{lastAttempt?.score ?? score}%</span>
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <button
          onClick={() => setPhase("result")}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-[#C4963A] font-black rounded-2xl border border-[#C4963A]/30 transition-all text-sm cursor-pointer"
        >
          📋 مراجعة إجاباتي والأسئلة
        </button>
        <button
          onClick={() => onPassed?.()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-green-500/20 text-sm cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" /> ابدأ المشاهدة
        </button>
      </div>
    </div>
  );

  /* ═══════ WAITING ═══════ */
  if (phase === "waiting" && !retryExpired) return (
    <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
      <div className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center">
        <Clock className="w-12 h-12 text-orange-400" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-white mb-1">لم تجتز الاختبار (راسب)</h3>
        <p className="text-slate-400 font-bold text-sm">يمكنك المحاولة مرة أخرى بعد انتهاء المدة</p>
      </div>
      <div className="bg-slate-800/60 border border-orange-500/20 rounded-2xl px-10 py-6">
        <CountdownTimer targetTime={canRetryAt} onExpire={handleRetryExpire} />
      </div>
      {onClose && <button onClick={onClose} className="text-slate-500 hover:text-white text-sm font-bold transition-colors cursor-pointer">← العودة</button>}
    </div>
  );

  /* ═══════ INTRO ═══════ */
  if (phase === "intro") return (
    <div className="flex flex-col items-center gap-7 py-8 text-center" dir="rtl">
      <div className="w-20 h-20 bg-gradient-to-br from-[#1B3668] to-[#C4963A] rounded-2xl flex items-center justify-center shadow-xl shadow-[#C4963A]/20">
        <ShieldCheck className="w-10 h-10 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-white mb-1">{bank.name}</h3>
        <p className="text-slate-400 font-bold text-sm">{bank.subjectName}</p>
      </div>
      <div className={`grid ${durationMinutes > 0 ? "grid-cols-4" : "grid-cols-3"} gap-2.5 w-full max-w-sm`}>
        {[
          { value: questions.length,           label: "سؤال",  color: "text-white" },
          ...(durationMinutes > 0 ? [{ value: `${durationMinutes} د`, label: "المدة", color: "text-amber-400" }] : []),
          { value: `${quiz.passPercentage||50}%`, label: "للنجاح", color: "text-[#C4963A]" },
          { value: `${quiz.retryHours||4}h`,   label: "إعادة", color: "text-orange-400" },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/60 border border-white/5 rounded-2xl p-3 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 max-w-sm text-right space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300 text-xs font-bold leading-relaxed">
            لا يمكنك مغادرة الاختبار بعد بدئه. اختر إجابتك وانتقل للسؤال التالي، وستظهر النتيجة في نهاية الاختبار.
          </p>
        </div>
        {durationMinutes > 0 && (
          <div className="flex items-start gap-2 pt-2 border-t border-amber-500/20">
            <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-orange-300 text-xs font-bold leading-relaxed">
              ⏱️ مدة الامتحان: <span className="font-black text-white underline">{durationMinutes} دقيقة</span>. سيتم قفل الاختبار وتسليم إجاباتك تلقائياً فور نفاد الوقت.
            </p>
          </div>
        )}
      </div>
      <button onClick={startQuiz} className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] hover:from-[#b8872e] text-white font-black rounded-2xl shadow-xl shadow-[#C4963A]/25 transition-all active:scale-95 text-lg cursor-pointer">
        <Play className="w-5 h-5 fill-current" /> ابدأ الاختبار
      </button>
      {onClose && <button onClick={onClose} className="text-slate-500 hover:text-white text-sm font-bold transition-colors cursor-pointer">← العودة بدون اختبار</button>}
    </div>
  );

  /* ═══════ QUIZ (بدون إظهار الصح والخطأ أثناء الحل) ═══════ */
  if (phase === "quiz") {
    const q       = questions[currentQ];
    const choices = (examChoices || []).filter(c => c.questionId === q.id).sort((a, b) => (a.sortOrder||0)-(b.sortOrder||0));
    const labels  = ["أ", "ب", "ج", "د", "هـ", "و"];

    return (
      <div dir="rtl" className="space-y-4">
        {/* شريط عداد الوقت المحدد للامتحان */}
        {durationMinutes > 0 && timeLeftMs !== null && (
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-lg ${
            timeLeftMs <= 120000
              ? "bg-gradient-to-r from-red-950/90 to-rose-900/80 border-red-500/60 shadow-red-500/20 animate-pulse text-red-200"
              : "bg-slate-900/90 border-[#C4963A]/30 text-amber-300"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                timeLeftMs <= 120000 ? "bg-red-500/20 text-red-400" : "bg-[#C4963A]/20 text-[#C4963A]"
              }`}>
                <Clock className={`w-5 h-5 ${timeLeftMs <= 120000 ? "animate-bounce" : ""}`} />
              </div>
              <div className="text-right">
                <p className={`text-xs font-black ${timeLeftMs <= 120000 ? "text-red-300" : "text-white"}`}>
                  {timeLeftMs <= 120000 ? "⚠️ انتبه! أوشك الوقت على الانتهاء" : "الوقت المتبقي للامتحان"}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {timeLeftMs <= 120000 ? "سيتم قفل الاختبار وتسليم الإجابات تلقائياً" : `مدة الامتحان: ${durationMinutes} دقيقة`}
                </p>
              </div>
            </div>
            <div className={`font-mono font-black text-2xl tracking-widest px-3 py-1.5 rounded-xl ${
              timeLeftMs <= 120000 ? "bg-red-900/60 text-red-200 border border-red-500/50" : "bg-black/50 text-[#C4963A] border border-white/5"
            }`}>
              {formatTimeLeft(timeLeftMs)}
            </div>
          </div>
        )}

        <ProgressBar current={currentQ + 1} total={questions.length} />

        <div
          key={currentQ}
          className="space-y-5"
          style={{ animation: "gfSlideIn 0.3s cubic-bezier(0.25,0.46,0.45,0.94)" }}
        >
          {/* رأس السؤال */}
          <div className="bg-gradient-to-br from-[#0E1726] to-[#142038] border border-white/8 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[#1B3668]/50 text-[#C4963A] border border-[#C4963A]/20">
                السؤال {currentQ + 1} من {questions.length}
              </span>
            </div>
            {q.questionText && (
              <p className="text-white font-black text-lg leading-relaxed">{q.questionText}</p>
            )}
            {q.questionImage && (
              <img src={q.questionImage} alt="سؤال" className="w-full max-h-64 object-contain rounded-xl border border-white/10 mt-4" />
            )}
          </div>

          {/* الاختيارات (لا تظهر صح أو خطأ للطالب) */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500">اختر الإجابة:</p>
            {choices.map((c, ci) => (
              <ChoiceCard
                key={c.id}
                label={labels[ci] || String(ci + 1)}
                text={c.choiceText}
                isSelected={selectedChoice === c.id}
                onClick={() => setSelected(c.id)}
              />
            ))}
          </div>

          {/* زر الانتقال للسؤال التالي أو إنهاء الاختبار */}
          <div className="pt-2">
            <button
              onClick={handleNext}
              disabled={selectedChoice === null || submitting}
              className="w-full py-4 font-black text-white rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: selectedChoice !== null
                  ? "linear-gradient(135deg, #1B3668 0%, #C4963A 100%)"
                  : "#1e293b"
              }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  جاري تسجيل النتيجة...
                </>
              ) : currentQ < questions.length - 1 ? (
                <>السؤال التالي <ArrowLeft className="w-5 h-5" /></>
              ) : (
                <>إنهاء وتسليم الاختبار ✓</>
              )}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes gfSlideIn {
            from { opacity: 0; transform: translateX(32px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  /* ═══════ RESULT ═══════ */
  if (phase === "result") {
    const activeAnswers = (answers && Object.keys(answers).length > 0) ? answers : (lastAttempt?.answers || {});
    const activeScore = typeof score === "number" && score > 0 ? score : (lastAttempt?.score ?? 0);
    const passed = activeScore >= (quiz?.passPercentage || 50);
    const correctCount = questions.filter(q => {
      const cl = (examChoices || []).filter(c => String(c.questionId) === String(q.id));
      const correctChoice = cl.find(c => c.isCorrect);
      const myChoiceId = activeAnswers[q.id];
      return myChoiceId && correctChoice && String(myChoiceId) === String(correctChoice.id);
    }).length;

    // ── في حالة النجاح: تظهر النتيجة ومراجعة تفصيلية للأسئلة والإجابات الصح والغلط ──
    if (passed) {
      return (
        <div className="space-y-6 text-center" dir="rtl">
          {autoSubmittedByTimeout && (
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-center text-amber-300 font-bold text-sm flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>انتهى الوقت المحدد للاختبار! تم اعتماد وتسليم إجاباتك المسجلة تلقائياً.</span>
            </div>
          )}
          {/* دائرة النتيجة */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#22c55e"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - activeScore / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Trophy className="w-7 h-7 text-yellow-400 mb-0.5" />
                <span className="text-3xl font-black text-green-400">{activeScore}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black mb-1 text-green-400">
                🎉 أحسنت! اجتزت الاختبار بنجاح
              </h3>
              <p className="text-slate-400 font-bold text-sm">
                أجبت على {correctCount} من {questions.length} سؤال بشكل صحيح (نسبة النجاح {quiz?.passPercentage || 50}%)
              </p>
            </div>
          </div>

          {/* مراجعة تفصيلية للأسئلة: أي الأسئلة صح وأيها غلط */}
          <div className="space-y-3 text-right max-h-72 overflow-y-auto pr-1" dir="rtl">
            <div className="sticky top-0 bg-[#0E1726]/95 backdrop-blur-sm py-2 z-10 flex items-center justify-between border-b border-white/10">
              <h4 className="text-sm font-black text-slate-200">
                مراجعة إجاباتك:
              </h4>
              <span className="text-xs font-bold text-slate-400">
                {correctCount} صح • {questions.length - correctCount} خطأ
              </span>
            </div>

            {questions.map((q, qi) => {
              const cl = (examChoices || []).filter(c => String(c.questionId) === String(q.id));
              const correctChoice = cl.find(c => c.isCorrect);
              const myChoiceId = activeAnswers[q.id];
              const myChoice = cl.find(c => String(c.id) === String(myChoiceId));
              const isOk = myChoiceId && correctChoice && String(myChoiceId) === String(correctChoice.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isOk ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isOk ? (
                      <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-[11px] font-black px-2 py-0.5 rounded-md border border-green-500/30 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> صح
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-[11px] font-black px-2 py-0.5 rounded-md border border-red-500/30 shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> خطأ
                      </span>
                    )}
                    <p className="text-xs font-black text-white leading-relaxed flex-1">
                      {qi + 1}. {q.questionText}
                    </p>
                  </div>

                  {q.questionImage && (
                    <img
                      src={q.questionImage}
                      alt="سؤال"
                      className="w-full max-h-36 object-contain rounded-lg border border-white/10 my-2"
                    />
                  )}

                  <div className="mr-2 space-y-1 pt-1 border-t border-white/5 text-xs font-bold">
                    <p className={`flex items-center gap-1.5 ${isOk ? "text-green-300" : "text-red-300"}`}>
                      <span className="text-slate-400">إجابتك:</span>
                      <span>{myChoice?.choiceText || "لم تجب"}</span>
                    </p>
                    {!isOk && (
                      <p className="flex items-center gap-1.5 text-green-400">
                        <span className="text-slate-400">الإجابة الصحيحة:</span>
                        <span>{correctChoice?.choiceText}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <div className="mt-2 bg-slate-800/60 p-2.5 rounded-lg text-slate-300 text-[11px] font-normal leading-relaxed border border-white/5">
                        <span className="font-bold text-amber-400">💡 الشرح: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* زر المتابعة للناجح */}
          <button
            onClick={() => onPassed?.()}
            className="w-full py-4 font-black text-white bg-green-500 hover:bg-green-600 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> ابدأ مشاهدة الدرس الآن
          </button>
        </div>
      );
    }

    // ── في حالة الرسوب: يظهر فقط أنه راسب بدون أي تفاصيل للأسئلة أو الإجابات ──
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center" dir="rtl">
        {autoSubmittedByTimeout && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 text-center text-red-300 font-bold text-sm flex items-center justify-center gap-2 w-full max-w-sm">
            <Clock className="w-5 h-5 text-red-400 shrink-0" />
            <span>انتهى الوقت المحدد للاختبار! تم تسليم الامتحان تلقائياً.</span>
          </div>
        )}
        <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-red-400 mb-2">للأسف، لم تجتز الاختبار (راسب)</h3>
          <p className="text-slate-400 font-bold text-sm max-w-sm">
            لم تحقق نسبة النجاح المطلوبة ({quiz?.passPercentage || 50}%). يمكنك المحاولة مرة أخرى بعد انتهاء فترة الانتظار.
          </p>
        </div>

        <div className="bg-slate-800/60 border border-orange-500/20 rounded-2xl px-8 py-5 w-full max-w-sm">
          <p className="text-orange-300 font-bold text-xs mb-2">⏳ يمكنك إعادة الاختبار بعد:</p>
          <CountdownTimer
            targetTime={new Date(Date.now() + (quiz?.retryHours || 4) * 3600 * 1000)}
            onExpire={handleRetryExpire}
          />
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full max-w-sm py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black text-sm rounded-2xl transition-colors border border-white/5 cursor-pointer"
          >
            ← العودة للدروس
          </button>
        )}
      </div>
    );
  }

  return null;
}
