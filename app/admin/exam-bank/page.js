"use client";

import React, { useState, useMemo } from "react";
import {
  Plus, Trash2, Edit, BookOpen, HelpCircle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, Image as LucideImage,
  Search, Sparkles, Save, X
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import ImageUpload from "@/Components/ImageUpload";

export default function ExamBankPage() {
  const {
    examBanks, examQuestions, examChoices, courses,
    addExamBank, updateExamBank, deleteExamBank,
    addExamQuestion, updateExamQuestion, deleteExamQuestion,
    addExamChoice, updateExamChoice, deleteExamChoice,
  } = useGlobalStore();

  const [search, setSearch] = useState("");
  const [expandedBank, setExpandedBank] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // ── حالة مودال بنك الامتحان ──
  const [bankModal, setBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankForm, setBankForm] = useState({ name: "", subjectName: "", courseId: "" });

  // ── حالة مودال السؤال ──
  const [questionModal, setQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    examBankId: "", questionText: "", questionImage: "", sortOrder: 0
  });

  // ── حالة مودال الخيار ──
  const [choiceModal, setChoiceModal] = useState(false);
  const [editingChoice, setEditingChoice] = useState(null);
  const [choiceForm, setChoiceForm] = useState({
    questionId: "", choiceText: "", isCorrect: false, sortOrder: 0
  });

  const filteredBanks = useMemo(() => {
    return (examBanks || []).filter(b =>
      b.name?.includes(search) || b.subjectName?.includes(search)
    );
  }, [examBanks, search]);

  const getQuestionsForBank = (bankId) =>
    (examQuestions || []).filter(q => q.examBankId === bankId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const getChoicesForQuestion = (questionId) =>
    (examChoices || []).filter(c => c.questionId === questionId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // ── handlers ──
  const handleSaveBank = async () => {
    if (!bankForm.name || !bankForm.subjectName) {
      alert("اسم الامتحان واسم المادة مطلوبان"); return;
    }
    if (editingBank) {
      await updateExamBank(editingBank.id, bankForm);
    } else {
      await addExamBank(bankForm);
    }
    setBankModal(false); setEditingBank(null);
    setBankForm({ name: "", subjectName: "", courseId: "" });
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.questionText && !questionForm.questionImage) {
      alert("يجب كتابة نص السؤال أو رفع صورة"); return;
    }
    if (editingQuestion) {
      await updateExamQuestion(editingQuestion.id, questionForm);
    } else {
      await addExamQuestion(questionForm);
    }
    setQuestionModal(false); setEditingQuestion(null);
    setQuestionForm({ examBankId: "", questionText: "", questionImage: "", sortOrder: 0 });
  };

  const handleSaveChoice = async () => {
    if (!choiceForm.choiceText) { alert("نص الخيار مطلوب"); return; }
    // ensure only one correct per question
    if (choiceForm.isCorrect && !editingChoice) {
      const existing = getChoicesForQuestion(choiceForm.questionId);
      const alreadyCorrect = existing.find(c => c.isCorrect);
      if (alreadyCorrect) {
        const ok = confirm("يوجد إجابة صحيحة مسبقاً، هل تريد تغييرها؟");
        if (!ok) return;
        await updateExamChoice(alreadyCorrect.id, { isCorrect: false });
      }
    }
    if (editingChoice) {
      await updateExamChoice(editingChoice.id, choiceForm);
    } else {
      await addExamChoice(choiceForm);
    }
    setChoiceModal(false); setEditingChoice(null);
    setChoiceForm({ questionId: "", choiceText: "", isCorrect: false, sortOrder: 0 });
  };

  const openNewBank = () => {
    setEditingBank(null);
    setBankForm({ name: "", subjectName: "", courseId: "" });
    setBankModal(true);
  };

  const openEditBank = (bank) => {
    setEditingBank(bank);
    setBankForm({ name: bank.name, subjectName: bank.subjectName, courseId: bank.courseId || "" });
    setBankModal(true);
  };

  const openNewQuestion = (bankId) => {
    setEditingQuestion(null);
    setQuestionForm({ examBankId: bankId, questionText: "", questionImage: "", sortOrder: getQuestionsForBank(bankId).length + 1 });
    setQuestionModal(true);
  };

  const openEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({ examBankId: q.examBankId, questionText: q.questionText || "", questionImage: q.questionImage || "", sortOrder: q.sortOrder || 0 });
    setQuestionModal(true);
  };

  const openNewChoice = (questionId) => {
    setEditingChoice(null);
    setChoiceForm({ questionId, choiceText: "", isCorrect: false, sortOrder: getChoicesForQuestion(questionId).length + 1 });
    setChoiceModal(true);
  };

  const openEditChoice = (c) => {
    setEditingChoice(c);
    setChoiceForm({ questionId: c.questionId, choiceText: c.choiceText, isCorrect: c.isCorrect, sortOrder: c.sortOrder || 0 });
    setChoiceModal(true);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-l from-slate-900 via-slate-850 to-slate-950 p-8 rounded-[36px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#C4963A]/10 rounded-full blur-[80px]" />
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#C4963A]/20 text-[#E8C87A] border border-[#C4963A]/30 text-xs font-black rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              بنك الامتحانات
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">إدارة بنك الامتحانات</h1>
          <p className="text-slate-400 mt-2 font-medium">
            أنشئ امتحاناتك، أضف الأسئلة والاختيارات، ثم اربطها بالدروس.
          </p>
        </div>
        <button
          onClick={openNewBank}
          className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#C4963A] to-[#d4a84a] text-white rounded-2xl font-black hover:from-[#b8872e] transition-all shadow-lg shrink-0"
        >
          <Plus className="w-5 h-5" />
          امتحان جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-5">
        <div className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث عن امتحان أو مادة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#C4963A] focus:outline-none font-bold text-sm text-slate-700"
          />
        </div>
      </div>

      {/* Banks List */}
      <div className="space-y-4">
        {filteredBanks.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 text-center border border-slate-100 shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد امتحانات بعد</h3>
            <p className="text-slate-400 text-sm mb-6">اضغط على زر "امتحان جديد" لإنشاء أول امتحان في البنك</p>
            <button onClick={openNewBank} className="px-6 py-3 bg-[#C4963A] text-white font-black rounded-xl hover:bg-[#b8872e] transition-all">
              إنشاء امتحان الآن
            </button>
          </div>
        ) : filteredBanks.map(bank => {
          const questions = getQuestionsForBank(bank.id);
          const isExpanded = expandedBank === bank.id;
          return (
            <div key={bank.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
              {/* Bank Header */}
              <div
                className={`flex items-center justify-between p-5 cursor-pointer select-none transition-colors ${isExpanded ? "bg-slate-50 border-b border-slate-100" : "hover:bg-slate-50/50"}`}
                onClick={() => setExpandedBank(isExpanded ? null : bank.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border transition-colors ${isExpanded ? "bg-[#C4963A] text-white border-[#C4963A]" : "bg-[#FDF8F0] text-[#C4963A] border-[#F0DDB8]"}`}>
                    {bank.subjectName?.charAt(0) || "؟"}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{bank.name}</h3>
                    <p className="text-sm text-slate-400 font-bold">
                      {bank.subjectName} · {questions.length} سؤال
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); openEditBank(bank); }}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); if(confirm("هل تريد حذف هذا الامتحان؟")) deleteExamBank(bank.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Questions List */}
              {isExpanded && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-600">{questions.length} سؤال</span>
                    <button
                      onClick={() => openNewQuestion(bank.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1B3668] text-white font-black rounded-xl hover:bg-[#24427D] text-xs transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة سؤال
                    </button>
                  </div>

                  {questions.map((q, qi) => {
                    const choices = getChoicesForQuestion(q.id);
                    const isQExpanded = expandedQuestion === q.id;
                    return (
                      <div key={q.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                        {/* Question Header */}
                        <div
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${isQExpanded ? "bg-slate-50 border-b border-slate-100" : "hover:bg-slate-50/50"}`}
                          onClick={() => setExpandedQuestion(isQExpanded ? null : q.id)}
                        >
                          <span className="w-7 h-7 rounded-xl bg-[#1B3668]/10 text-[#1B3668] flex items-center justify-center font-black text-xs shrink-0">
                            {qi + 1}
                          </span>
                          <div className="flex-1">
                            {q.questionText && <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.questionText}</p>}
                            {q.questionImage && (
                              <img src={q.questionImage} alt="سؤال" className="mt-2 max-h-28 rounded-xl object-contain border border-slate-100" />
                            )}
                            <p className="text-xs text-slate-400 mt-1 font-bold">{choices.length} خيارات</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={e => { e.stopPropagation(); openEditQuestion(q); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); if(confirm("حذف السؤال؟")) deleteExamQuestion(q.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {isQExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Choices */}
                        {isQExpanded && (
                          <div className="p-4 bg-white space-y-2">
                            {choices.map((c, ci) => (
                              <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${c.isCorrect ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${c.isCorrect ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                                  {["أ","ب","ج","د","هـ"][ci] || ci + 1}
                                </span>
                                <span className="flex-1">{c.choiceText}</span>
                                {c.isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => openEditChoice(c)} className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => { if(confirm("حذف الخيار؟")) deleteExamChoice(c.id); }} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => openNewChoice(q.id)}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#C4963A]/50 text-[#C4963A] font-black rounded-xl hover:bg-[#FDF8F0] text-xs transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" /> إضافة خيار
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {questions.length === 0 && (
                    <div className="text-center py-8 text-slate-400 font-bold text-sm">
                      لا توجد أسئلة بعد. اضغط "إضافة سؤال" للبدء.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── مودال بنك الامتحان ── */}
      {bankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingBank ? "تعديل الامتحان" : "امتحان جديد"}
              </h2>
              <button onClick={() => { setBankModal(false); setEditingBank(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">اسم الامتحان</label>
                <input
                  type="text"
                  value={bankForm.name}
                  onChange={e => setBankForm({ ...bankForm, name: e.target.value })}
                  placeholder="مثال: اختبار الوحدة الأولى"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">المادة الدراسية</label>
                <input
                  type="text"
                  value={bankForm.subjectName}
                  onChange={e => setBankForm({ ...bankForm, subjectName: e.target.value })}
                  placeholder="مثال: كيمياء، فيزياء، رياضيات..."
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">الكورس المرتبط (اختياري)</label>
                <select
                  value={bankForm.courseId}
                  onChange={e => setBankForm({ ...bankForm, courseId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] outline-none font-bold text-sm bg-white"
                >
                  <option value="">بدون ربط بكورس</option>
                  {(courses || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveBank} className="flex-1 py-3 font-black text-white bg-[#C4963A] hover:bg-[#b8872e] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingBank ? "حفظ التعديلات" : "إنشاء الامتحان"}
                </button>
                <button onClick={() => { setBankModal(false); setEditingBank(null); }} className="px-6 py-3 font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── مودال السؤال ── */}
      {questionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingQuestion ? "تعديل السؤال" : "إضافة سؤال"}
              </h2>
              <button onClick={() => { setQuestionModal(false); setEditingQuestion(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">نص السؤال (اختياري لو فيه صورة)</label>
                <textarea
                  value={questionForm.questionText}
                  onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder="اكتب نص السؤال هنا..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] focus:ring-1 focus:ring-[#C4963A] outline-none font-bold text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">صورة السؤال (اختياري - اسحب وأفلت الصورة)</label>
                <ImageUpload
                  value={questionForm.questionImage}
                  onChange={img => setQuestionForm({ ...questionForm, questionImage: img })}
                  objectFit="contain"
                  label="اسحب وأفلت صورة السؤال هنا"
                  subLabel="أو اضغط لاختيار صورة من جهازك"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">رقم الترتيب</label>
                <input
                  type="number"
                  value={questionForm.sortOrder}
                  onChange={e => setQuestionForm({ ...questionForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] outline-none font-bold text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveQuestion} className="flex-1 py-3 font-black text-white bg-[#1B3668] hover:bg-[#24427D] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingQuestion ? "حفظ التعديلات" : "إضافة السؤال"}
                </button>
                <button onClick={() => { setQuestionModal(false); setEditingQuestion(null); }} className="px-6 py-3 font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── مودال الخيار ── */}
      {choiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingChoice ? "تعديل الخيار" : "إضافة خيار"}
              </h2>
              <button onClick={() => { setChoiceModal(false); setEditingChoice(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">نص الخيار</label>
                <input
                  type="text"
                  value={choiceForm.choiceText}
                  onChange={e => setChoiceForm({ ...choiceForm, choiceText: e.target.value })}
                  placeholder="اكتب الخيار هنا..."
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-[#C4963A] outline-none font-bold text-sm"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isCorrect"
                  checked={choiceForm.isCorrect}
                  onChange={e => setChoiceForm({ ...choiceForm, isCorrect: e.target.checked })}
                  className="w-5 h-5 accent-green-500 rounded"
                />
                <label htmlFor="isCorrect" className="text-sm font-black text-slate-700 flex items-center gap-2 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  هذا هو الجواب الصحيح
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveChoice} className="flex-1 py-3 font-black text-white bg-[#C4963A] hover:bg-[#b8872e] rounded-xl shadow-lg transition-all">
                  {editingChoice ? "حفظ التعديلات" : "إضافة الخيار"}
                </button>
                <button onClick={() => { setChoiceModal(false); setEditingChoice(null); }} className="px-6 py-3 font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
