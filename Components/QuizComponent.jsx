"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, Trophy,
  Play, ShieldCheck, ArrowLeft, ChevronRight
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
function ChoiceCard({ label, text, isSelected, isCorrect, isWrong, isDisabled, onClick }) {
  let containerCls = "bg-white/[0.03] border-white/10 hover:bg-[#1B3668]/20 hover:border-[#1B3668]/50";
  let labelCls     = "bg-slate-700/60 text-slate-400";
  let textCls      = "text-slate-300 group-hover:text-white";

  if (isSelected && !isDisabled) {
    containerCls = "bg-[#1B3668]/30 border-[#1B3668] shadow-lg shadow-[#1B3668]/10";
    labelCls     = "bg-[#1B3668] text-white";
    textCls      = "text-white";
  }
  if (isCorrect) {
    containerCls = "bg-green-500/15 border-green-400 shadow-lg shadow-green-500/10";
    labelCls     = "bg-green-500 text-white";
    textCls      = "text-green-300";
  }
  if (isWrong) {
    containerCls = "bg-red-500/15 border-red-400";
    labelCls     = "bg-red-500 text-white";
    textCls      = "text-red-300";
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-right transition-all duration-200 group ${containerCls} ${!isDisabled ? "cursor-pointer active:scale-[0.99]" : "cursor-default"}`}
      dir="rtl"
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${labelCls}`}>
        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> :
         isWrong   ? <XCircle className="w-5 h-5" />    : label}
      </span>
      <span className={`flex-1 font-bold text-base leading-relaxed transition-colors ${textCls}`}>{text}</span>
      {isSelected && !isDisabled && !isCorrect && !isWrong && (
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
  const [confirmed, setConfirmed]     = useState(false);
  const [score, setScore]             = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [retryExpired, setRetryExpired] = useState(false);

  useEffect(() => {
    if (phase !== "quiz") return;
    const block = () => {
      window.history.pushState(null, "", window.location.href);
      alert("لا يمكنك مغادرة الاختبار. يجب إنهاء جميع الأسئلة.");
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", block);
    return () => window.removeEventListener("popstate", block);
  }, [phase]);

  useEffect(() => {
    if (alreadyPassed) setPhase("passed");
    else if (isWaiting) setPhase("waiting");
  }, [alreadyPassed, isWaiting]);

  const handleRetryExpire = useCallback(() => {
    setRetryExpired(true);
    setPhase("intro");
  }, []);

  const startQuiz = () => {
    setAnswers({}); setCurrentQ(0);
    setSelected(null); setConfirmed(false);
    setPhase("quiz");
  };

  const confirmAnswer = () => {
    if (selectedChoice === null) return;
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: selectedChoice }));
    setConfirmed(true);
  };

  const goNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setSubmitting(true);
      const allAnswers = { ...answers };
      let correct = 0;
      questions.forEach(q => {
        const chosen = allAnswers[q.id];
        const choicesList = (examChoices || []).filter(c => c.questionId === q.id);
        const correctChoice = choicesList.find(c => c.isCorrect);
        if (chosen && correctChoice && chosen === correctChoice.id) correct++;
      });
      const pct    = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = pct >= (quiz?.passPercentage || 50);
      await submitQuizAttempt({
        userId: currentUser.id,
        lessonQuizId: quiz.id,
        score: pct, passed,
        answers: allAnswers,
        canRetryAt: passed ? null : new Date(Date.now() + (quiz?.retryHours || 4) * 3600 * 1000).toISOString(),
      });
      setScore(pct);
      setPhase("result");
      setSubmitting(false);
      if (passed) setTimeout(() => onPassed?.(), 2500);
    }
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
        <p className="text-slate-400 font-bold text-sm">يمكنك الآن مشاهدة الدرس</p>
      </div>
      <button onClick={() => onPassed?.()} className="flex items-center gap-2 px-10 py-3.5 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-green-500/20">
        <Play className="w-4 h-4 fill-current" /> ابدأ المشاهدة
      </button>
    </div>
  );

  /* ═══════ WAITING ═══════ */
  if (phase === "waiting" && !retryExpired) return (
    <div className="flex flex-col items-center gap-6 py-10 text-center" dir="rtl">
      <div className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center">
        <Clock className="w-12 h-12 text-orange-400" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-white mb-1">لم تجتز الاختبار</h3>
        <p className="text-slate-400 font-bold text-sm">يمكنك المحاولة مرة أخرى بعد انتهاء المدة</p>
      </div>
      <div className="bg-slate-800/60 border border-orange-500/20 rounded-2xl px-10 py-6">
        <CountdownTimer targetTime={canRetryAt} onExpire={handleRetryExpire} />
      </div>
      {onClose && <button onClick={onClose} className="text-slate-500 hover:text-white text-sm font-bold transition-colors">← العودة</button>}
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
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[
          { value: questions.length,           label: "سؤال",  color: "text-white" },
          { value: `${quiz.passPercentage||50}%`, label: "للنجاح", color: "text-[#C4963A]" },
          { value: `${quiz.retryHours||4}h`,   label: "إعادة", color: "text-orange-400" },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/60 border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 max-w-xs text-right">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm font-bold leading-relaxed">
            لا يمكنك مغادرة الاختبار بعد بدئه. كل سؤال يظهر على حدة مثل Google Forms.
          </p>
        </div>
      </div>
      <button onClick={startQuiz} className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] hover:from-[#b8872e] text-white font-black rounded-2xl shadow-xl shadow-[#C4963A]/25 transition-all active:scale-95 text-lg">
        <Play className="w-5 h-5 fill-current" /> ابدأ الاختبار
      </button>
      {onClose && <button onClick={onClose} className="text-slate-500 hover:text-white text-sm font-bold transition-colors">← العودة بدون اختبار</button>}
    </div>
  );

  /* ═══════ QUIZ (Google Forms Style) ═══════ */
  if (phase === "quiz") {
    const q       = questions[currentQ];
    const choices = (examChoices || []).filter(c => c.questionId === q.id).sort((a, b) => (a.sortOrder||0)-(b.sortOrder||0));
    const labels  = ["أ", "ب", "ج", "د", "هـ", "و"];
    const correctId = choices.find(c => c.isCorrect)?.id;

    return (
      <div dir="rtl" className="space-y-5">
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
                السؤال {currentQ + 1}
              </span>
              {confirmed && (
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  answers[q.id] === correctId
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}>
                  {answers[q.id] === correctId ? "✓ إجابة صحيحة" : "✗ إجابة خاطئة"}
                </span>
              )}
            </div>
            {q.questionText && (
              <p className="text-white font-black text-lg leading-relaxed">{q.questionText}</p>
            )}
            {q.questionImage && (
              <img src={q.questionImage} alt="سؤال" className="w-full max-h-64 object-contain rounded-xl border border-white/10 mt-4" />
            )}
          </div>

          {/* الاختيارات */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500">اختر الإجابة الصحيحة:</p>
            {choices.map((c, ci) => {
              const isSelected = selectedChoice === c.id;
              const showResult = confirmed;
              const isCorrect  = showResult && c.id === correctId;
              const isWrong    = showResult && isSelected && c.id !== correctId;
              // Show correct even if not selected (after confirm)
              const showAsCorrect = showResult && c.id === correctId;
              return (
                <ChoiceCard
                  key={c.id}
                  label={labels[ci] || String(ci+1)}
                  text={c.choiceText}
                  isSelected={!showResult && isSelected}
                  isCorrect={showAsCorrect}
                  isWrong={isWrong}
                  isDisabled={confirmed}
                  onClick={() => !confirmed && setSelected(c.id)}
                />
              );
            })}
          </div>

          {/* شرح (لو موجود) */}
          {confirmed && q.explanation && (
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 text-right">
              <p className="text-xs font-black text-blue-400 mb-1">💡 شرح الإجابة:</p>
              <p className="text-slate-300 text-sm font-bold leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* الأزرار */}
          <div className="pt-1">
            {!confirmed ? (
              <button
                onClick={confirmAnswer}
                disabled={selectedChoice === null}
                className="w-full py-4 font-black text-white rounded-2xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: selectedChoice !== null
                    ? "linear-gradient(135deg,#1B3668 0%,#24427D 100%)"
                    : "#1e293b"
                }}
              >
                تأكيد الإجابة
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={submitting}
                className="w-full py-4 font-black text-white rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                style={{ background: "linear-gradient(135deg,#C4963A 0%,#D4A84A 100%)" }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    جاري الحفظ...
                  </>
                ) : currentQ < questions.length - 1 ? (
                  <>السؤال التالي <ArrowLeft className="w-5 h-5" /></>
                ) : "إنهاء الاختبار ✓"}
              </button>
            )}
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
    const passed = score >= (quiz?.passPercentage || 50);
    const correctCount = questions.filter(q => {
      const cl = (examChoices||[]).filter(c => c.questionId === q.id);
      return answers[q.id] === cl.find(c=>c.isCorrect)?.id;
    }).length;

    return (
      <div className="space-y-6 text-center" dir="rtl">
        {/* دائرة النتيجة */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={passed ? "#22c55e" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={`${2*Math.PI*50}`}
                strokeDashoffset={`${2*Math.PI*50*(1-score/100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {passed ? <Trophy className="w-7 h-7 text-yellow-400 mb-0.5" /> : <XCircle className="w-7 h-7 text-red-400 mb-0.5" />}
              <span className={`text-3xl font-black ${passed?"text-green-400":"text-red-400"}`}>{score}%</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-black mb-1 ${passed?"text-green-400":"text-red-400"}`}>
              {passed ? "🎉 أحسنت! اجتزت الاختبار" : "❌ لم تجتز الاختبار"}
            </h3>
            <p className="text-slate-400 font-bold text-sm">
              أجبت على {correctCount} من {questions.length} بشكل صحيح
            </p>
          </div>
        </div>

        {/* مراجعة الإجابات */}
        <div className="space-y-2.5 text-right max-h-60 overflow-y-auto" dir="rtl">
          <h4 className="text-sm font-black text-slate-300 sticky top-0 bg-[#0E1726] pb-1">مراجعة إجاباتك:</h4>
          {questions.map((q, qi) => {
            const cl = (examChoices||[]).filter(c => c.questionId === q.id);
            const correctChoice = cl.find(c => c.isCorrect);
            const myChoiceId = answers[q.id];
            const myChoice   = cl.find(c => c.id === myChoiceId);
            const isOk = myChoiceId === correctChoice?.id;
            return (
              <div key={q.id} className={`p-3.5 rounded-xl border ${isOk?"bg-green-500/10 border-green-500/25":"bg-red-500/10 border-red-500/25"}`}>
                <div className="flex items-start gap-2 mb-1">
                  {isOk
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5"/>
                    : <XCircle     className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
                  }
                  <p className="text-xs font-black text-slate-300 leading-relaxed">
                    {qi+1}. {q.questionText?.substring(0,80)}{q.questionText?.length>80?"...":""}
                  </p>
                </div>
                {!isOk && (
                  <div className="mr-6 space-y-0.5">
                    <p className="text-xs text-red-400 font-bold">إجابتك: {myChoice?.choiceText||"لم تجب"}</p>
                    <p className="text-xs text-green-400 font-bold">الصحيحة: {correctChoice?.choiceText}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* أزرار */}
        {passed ? (
          <button
            onClick={() => onPassed?.()}
            className="w-full py-4 font-black text-white bg-green-500 hover:bg-green-600 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            <Play className="w-5 h-5 fill-current" /> شاهد الدرس الآن
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
              <p className="text-orange-300 font-bold text-sm mb-3">⏳ يمكنك إعادة الاختبار بعد:</p>
              <CountdownTimer
                targetTime={new Date(Date.now() + (quiz?.retryHours||4) * 3600 * 1000)}
                onExpire={handleRetryExpire}
              />
            </div>
            {onClose && (
              <button onClick={onClose} className="w-full py-3 text-slate-400 hover:text-white font-bold text-sm transition-colors">
                ← العودة
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
