"use client";

import React, { useState, useMemo } from "react";
import {
  Plus, Trash2, Edit, BookOpen, HelpCircle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, Image as LucideImage,
  Search, Save, X, ShieldAlert, FileQuestion, Link2, Clock, Check
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function TeacherQuizzesPage() {
  const {
    currentTeacher, courses = [], chapters = [], lessons = [],
    examBanks = [], examQuestions = [], examChoices = [],
    lessonQuizzes = [],
    addExamBank, updateExamBank, deleteExamBank,
    addExamQuestion, updateExamQuestion, deleteExamQuestion,
    addExamChoice, updateExamChoice, deleteExamChoice,
    addLessonQuiz, updateLessonQuiz, deleteLessonQuiz,
  } = useGlobalStore();

  const [search, setSearch] = useState("");
  const [expandedBank, setExpandedBank] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Modals
  const [bankModal, setBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankForm, setBankForm] = useState({ name: "", subjectName: "" });

  const [questionModal, setQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    examBankId: "", questionText: "", questionImage: "", sortOrder: 0,
  });

  const [choiceModal, setChoiceModal] = useState(false);
  const [editingChoice, setEditingChoice] = useState(null);
  const [choiceForm, setChoiceForm] = useState({
    questionId: "", choiceText: "", isCorrect: false, sortOrder: 0,
  });

  // Link Quiz Modal
  const [linkModal, setLinkModal] = useState(false);
  const [selectedBankToLink, setSelectedBankToLink] = useState(null);
  const [linkLessonId, setLinkLessonId] = useState("");
  const [linkPassPercentage, setLinkPassPercentage] = useState(50);
  const [linkRetryHours, setLinkRetryHours] = useState(4);
  const [linkDurationMinutes, setLinkDurationMinutes] = useState(0);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const teacher = currentTeacher;
  const linkedCourse = courses.find((c) => c.id === teacher?.courseId);

  // If permission is denied
  if (teacher && teacher.canCreateQuizzes === false) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto mt-12" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">غير مصرح لك بإنشاء الكويزات</h2>
        <p className="text-slate-500 text-sm">
          لم يتم تفعيل صلاحية "إنشاء الكويزات والامتحانات" لحسابك من قبل إدارة المنصة. تواصل مع الأدمن لتفعيلها.
        </p>
      </div>
    );
  }

  // Teacher's lessons
  const availableChapters = useMemo(() => {
    if (!teacher) return [];
    if (linkedCourse) return chapters.filter((ch) => ch.courseId === linkedCourse.id);
    const matchingCourses = courses.filter(
      (c) => c.name.includes(teacher.subject) || c.teacherId === teacher.id
    );
    const cIds = matchingCourses.map((c) => c.id);
    return chapters.filter((ch) => cIds.includes(ch.courseId));
  }, [teacher, linkedCourse, courses, chapters]);

  const teacherLessons = useMemo(() => {
    const chIds = availableChapters.map((ch) => ch.id);
    return lessons.filter((l) => chIds.includes(parseInt(l.chapterId, 10)));
  }, [availableChapters, lessons]);

  // Teacher exam banks
  const filteredBanks = useMemo(() => {
    return (examBanks || []).filter((b) => {
      const matchTeacher =
        (linkedCourse && b.courseId === linkedCourse.id) ||
        (b.subjectName && b.subjectName.includes(teacher?.subject || ""));
      if (!matchTeacher) return false;
      if (search && !b.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [examBanks, linkedCourse, teacher, search]);

  const getQuestionsForBank = (bankId) =>
    (examQuestions || [])
      .filter((q) => q.examBankId === bankId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const getChoicesForQuestion = (questionId) =>
    (examChoices || [])
      .filter((c) => c.questionId === questionId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const handleSaveBank = async () => {
    if (!bankForm.name) {
      alert("اسم الامتحان مطلوب");
      return;
    }
    const payload = {
      ...bankForm,
      subjectName: teacher?.subject || "مادة",
      courseId: linkedCourse?.id || null,
      createdByAdmin: false,
    };
    if (editingBank) {
      await updateExamBank(editingBank.id, payload);
      showToast("تم تحديث بنك الامتحان بنجاح.");
    } else {
      await addExamBank(payload);
      showToast("تم إنشاء بنك الامتحان بنجاح.");
    }
    setBankModal(false);
    setEditingBank(null);
    setBankForm({ name: "", subjectName: "" });
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.questionText && !questionForm.questionImage) {
      alert("يجب كتابة نص السؤال أو وضع صورة");
      return;
    }
    if (editingQuestion) {
      await updateExamQuestion(editingQuestion.id, questionForm);
      showToast("تم تحديث السؤال بنجاح.");
    } else {
      await addExamQuestion(questionForm);
      showToast("تمت إضافة السؤال بنجاح.");
    }
    setQuestionModal(false);
    setEditingQuestion(null);
  };

  const handleSaveChoice = async () => {
    if (!choiceForm.choiceText) {
      alert("نص الإجابة مطلوب");
      return;
    }
    if (choiceForm.isCorrect && !editingChoice) {
      const existing = getChoicesForQuestion(choiceForm.questionId);
      const alreadyCorrect = existing.find((c) => c.isCorrect);
      if (alreadyCorrect) {
        await updateExamChoice(alreadyCorrect.id, { isCorrect: false });
      }
    }
    if (editingChoice) {
      await updateExamChoice(editingChoice.id, choiceForm);
    } else {
      await addExamChoice(choiceForm);
    }
    showToast("تم حفظ خيار الإجابة.");
    setChoiceModal(false);
    setEditingChoice(null);
  };

  // Link quiz to lesson
  const handleLinkQuiz = async () => {
    if (!linkLessonId) {
      alert("يرجى اختيار الدرس");
      return;
    }
    const lessonIdNum = parseInt(linkLessonId, 10);
    const existing = lessonQuizzes.find((lq) => lq.lessonId === lessonIdNum);
    const payload = {
      lessonId: lessonIdNum,
      examBankId: selectedBankToLink.id,
      passPercentage: parseInt(linkPassPercentage, 10),
      retryHours: parseInt(linkRetryHours, 10),
      durationMinutes: parseInt(linkDurationMinutes, 10) || 0,
      locksNextLessons: true,
    };
    if (existing) {
      await updateLessonQuiz(existing.id, payload);
    } else {
      await addLessonQuiz(payload);
    }
    showToast("تم ربط الكويز بالدرس بنجاح!");
    setLinkModal(false);
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
            <FileQuestion className="w-8 h-8 text-[#C4963A]" />
            بنك الامتحانات والكويزات لمادتي
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            إنشاء بنوك الأسئلة، خيارات الإجابة، وربط الكويز بدروس مادة ({teacher?.subject}).
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBank(null);
            setBankForm({ name: "", subjectName: teacher?.subject || "" });
            setBankModal(true);
          }}
          className="px-6 py-2.5 bg-[#1B3668] hover:bg-[#24427D] text-white font-bold rounded-xl shadow-md shadow-[#1B3668]/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 text-[#C4963A]" />
          إنشاء امتحان جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث باسم الامتحان..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4963A]/50 focus:border-[#C4963A]"
          />
        </div>
      </div>

      {/* Exam Banks List */}
      {filteredBanks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <FileQuestion className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-700 mb-1">لا توجد امتحانات مضافة بعد</h3>
          <p className="text-slate-400 text-sm mb-6">
            اضغط على زر "إنشاء امتحان جديد" لإضافة أول كويز في مادتك وتعبئته بالأسئلة.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBanks.map((bank) => {
            const isExpanded = expandedBank === bank.id;
            const bankQuestions = getQuestionsForBank(bank.id);
            const linkedLessonQuiz = lessonQuizzes.find((lq) => lq.examBankId === bank.id);
            const linkedLesson = linkedLessonQuiz
              ? lessons.find((l) => l.id === linkedLessonQuiz.lessonId)
              : null;

            return (
              <div
                key={bank.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Bank Header Card */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C4963A] flex items-center justify-center shrink-0">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{bank.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>{bankQuestions.length} أسئلة</span>
                        {linkedLesson ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            مرتبط بدرس: {linkedLesson.name} ({linkedLessonQuiz.passPercentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-400">غير مرتبط بدرس</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Link Quiz Button */}
                    <button
                      onClick={() => {
                        setSelectedBankToLink(bank);
                        setLinkLessonId(linkedLesson ? String(linkedLesson.id) : "");
                        setLinkPassPercentage(linkedLessonQuiz?.passPercentage || 50);
                        setLinkRetryHours(linkedLessonQuiz?.retryHours || 4);
                        setLinkDurationMinutes(linkedLessonQuiz?.durationMinutes ?? linkedLessonQuiz?.duration_minutes ?? 0);
                        setLinkModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1B3668] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{linkedLesson ? "تعديل الربط بدرس" : "ربط بدرس"}</span>
                    </button>

                    {/* Add Question Button */}
                    <button
                      onClick={() => {
                        setEditingQuestion(null);
                        setQuestionForm({
                          examBankId: bank.id,
                          questionText: "",
                          questionImage: "",
                          sortOrder: bankQuestions.length + 1,
                        });
                        setQuestionModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سؤال</span>
                    </button>

                    {/* Edit Bank */}
                    <button
                      onClick={() => {
                        setEditingBank(bank);
                        setBankForm({ name: bank.name, subjectName: bank.subjectName || "" });
                        setBankModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Bank */}
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف الامتحان "${bank.name}"؟`)) {
                          deleteExamBank(bank.id);
                          showToast("تم حذف الامتحان.");
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Expand Questions */}
                    <button
                      onClick={() => setExpandedBank(isExpanded ? null : bank.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Questions List (when expanded) */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-5 border-t border-slate-100 space-y-4">
                    {bankQuestions.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4 font-bold">
                        لم يتم إضافة أي أسئلة لهذا الامتحان بعد. اضغط "إضافة سؤال" للبدء.
                      </p>
                    ) : (
                      bankQuestions.map((q, qIndex) => {
                        const choices = getChoicesForQuestion(q.id);
                        return (
                          <div
                            key={q.id}
                            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#1B3668] text-white text-xs font-black flex items-center justify-center shrink-0">
                                  {qIndex + 1}
                                </span>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">
                                    {q.questionText}
                                  </p>
                                  {q.questionImage && (
                                    <img
                                      src={q.questionImage}
                                      alt="سؤال"
                                      className="mt-2 max-h-40 rounded-lg border border-slate-200"
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingChoice(null);
                                    setChoiceForm({
                                      questionId: q.id,
                                      choiceText: "",
                                      isCorrect: choices.length === 0,
                                      sortOrder: choices.length + 1,
                                    });
                                    setChoiceModal(true);
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  خيار
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingQuestion(q);
                                    setQuestionForm({
                                      examBankId: q.examBankId,
                                      questionText: q.questionText || "",
                                      questionImage: q.questionImage || "",
                                      sortOrder: q.sortOrder || 0,
                                    });
                                    setQuestionModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                  title="تعديل السؤال"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("هل تريد حذف هذا السؤال؟")) {
                                      deleteExamQuestion(q.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="حذف السؤال"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Choices */}
                            <div className="pr-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {choices.map((c) => (
                                <div
                                  key={c.id}
                                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-between ${
                                    c.isCorrect
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                      : "bg-slate-50 border-slate-200 text-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {c.isCorrect ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                                    )}
                                    <span>{c.choiceText}</span>
                                  </div>
                                  <button
                                    onClick={() => deleteExamChoice(c.id)}
                                    className="text-slate-400 hover:text-rose-500"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Link Quiz Modal */}
      {linkModal && selectedBankToLink && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
              <Link2 className="w-6 h-6 text-[#C4963A]" />
              ربط امتحان ({selectedBankToLink.name}) بدرس
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              سيظهر هذا الامتحان للطالب أسفل الفيديو المحدد ويقفل ما بعده حتى اجتيازه.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الدرس المراد ربط الكويز به *
                </label>
                <select
                  value={linkLessonId}
                  onChange={(e) => setLinkLessonId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:border-[#C4963A] outline-none"
                >
                  <option value="">— اختر درساً من مادتك —</option>
                  {teacherLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نسبة النجاح المطلوبة للعبور (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={linkPassPercentage}
                  onChange={(e) => setLinkPassPercentage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-[#C4963A] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  فترة الانتظار في حال الرسوب (بالساعات)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={linkRetryHours}
                  onChange={(e) => setLinkRetryHours(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-[#C4963A] outline-none"
                />
              </div>

              {/* مدة الامتحان بالدقائق */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C4963A]" />
                    مدة الامتحان (إجبار الطالب على وقت محدد):
                  </label>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                    {Number(linkDurationMinutes) > 0 ? `${linkDurationMinutes} دقيقة` : "مفتوح"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={linkDurationMinutes}
                    onChange={(e) => setLinkDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0 = بدون وقت"
                    className="w-28 border border-slate-300 rounded-xl p-2 font-black text-sm bg-white text-center focus:border-[#C4963A] outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">دقائق</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {[0, 10, 15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setLinkDurationMinutes(mins)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all ${
                        Number(linkDurationMinutes) === mins
                          ? "bg-[#C4963A] text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mins === 0 ? "بدون وقت" : `${mins} د`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setLinkModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleLinkQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs hover:bg-[#24427D]"
                >
                  حفظ الربط
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {bankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-4">
              {editingBank ? "تعديل بنك الامتحان" : "إنشاء امتحان جديد"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم الامتحان *
                </label>
                <input
                  type="text"
                  value={bankForm.name}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  placeholder="مثال: كويز الوحدة الأولى"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setBankModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveBank}
                  className="px-6 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs hover:bg-[#24427D]"
                >
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {questionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-4">إضافة سؤال جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نص السؤال *
                </label>
                <textarea
                  rows="3"
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="اكتب صيغة السؤال هنا..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  صورة السؤال (اختياري - اسحب وأفلت الصورة)
                </label>
                <ImageUpload
                  value={questionForm.questionImage}
                  onChange={(img) => setQuestionForm({ ...questionForm, questionImage: img })}
                  objectFit="contain"
                  label="اسحب وأفلت صورة السؤال هنا"
                  subLabel="أو اضغط لاختيار صورة من جهازك"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setQuestionModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs hover:bg-[#24427D]"
                >
                  حفظ السؤال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Choice Modal */}
      {choiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-4">إضافة خيار إجابة</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نص الخيار *
                </label>
                <input
                  type="text"
                  value={choiceForm.choiceText}
                  onChange={(e) => setChoiceForm({ ...choiceForm, choiceText: e.target.value })}
                  placeholder="نص الإجابة..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-[#C4963A] outline-none"
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer bg-slate-50">
                <input
                  type="checkbox"
                  checked={choiceForm.isCorrect}
                  onChange={(e) => setChoiceForm({ ...choiceForm, isCorrect: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800">
                  هل هذه هي الإجابة الصحيحة؟
                </span>
              </label>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setChoiceModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveChoice}
                  className="px-6 py-2.5 rounded-xl bg-[#1B3668] text-white font-bold text-xs hover:bg-[#24427D]"
                >
                  حفظ الخيار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
