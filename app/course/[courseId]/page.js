"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, BookOpen, Key, CheckCircle } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function CoursePage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const courseId = parseInt(unwrappedParams.courseId, 10);

  const { 
    courses, 
    classes, 
    categories, 
    chapters: allChapters, 
    currentUser, 
    unlockedChapters,
    verifyAndUseCode,
    lessons
  } = useGlobalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(null);
  const [codeValue, setCodeValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center" dir="rtl">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">الكورس غير موجود</h1>
          <Link href="/" className="text-red-600 font-bold hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const category = course.categoryId 
    ? categories.find((c) => c.id === course.categoryId)
    : (classes.find((c) => c.id === course.classId) 
        ? categories.find((c) => c.id === classes.find((cl) => cl.id === course.classId).categoryId) 
        : null);
  const chapters = allChapters.filter(c => c.courseId === courseId && c.active);

  const handleOpenModal = (chapter) => {
    if (!currentUser) {
        router.push("/login");
        return;
    }
    setActiveChapter(chapter);
    setIsModalOpen(true);
    setSuccess(false);
    setError("");
    setCodeValue("");
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError("");
    const result = await verifyAndUseCode(codeValue, currentUser.id);
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
        <div className="flex flex-wrap items-center gap-3 mb-12 text-sm md:text-base">
          <Link href="/" className="text-slate-500 hover:text-[#C4963A] font-bold transition-colors">
            الرئيسية
          </Link>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
          {category && (
            <>
              <Link href={`/category/${category.id}`} className="text-slate-500 hover:text-[#C4963A] font-bold transition-colors">
                {category.name}
              </Link>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
            </>
          )}
          <span className="text-slate-900 font-black truncate max-w-[200px] sm:max-w-none">
            {course.name}
          </span>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
            أبواب الكورس
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-6">
            اختر الباب للبدء في تصفح الدروس
          </p>
          <div className="w-16 h-1 bg-[#C4963A] mx-auto rounded-full" />
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {chapters.map((chapter) => {
            // SECURITY: always require login even for free chapters
            const isUnlocked = !!currentUser && (
              (unlockedChapters || []).some(u => u.userId === currentUser.id && u.chapterId === chapter.id) ||
              Number(chapter.price || 0) === 0
            );
            const chapterLessonsCount = lessons.filter(l => parseInt(l.chapterId) === parseInt(chapter.id)).length;
            
            return (
              <div
                key={chapter.id}
                className="group bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4963A]/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>

                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-sm border-2 border-slate-100 z-10 relative">
                  <img src={chapter.image} alt={chapter.name} className="w-full h-full object-cover" />
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
                    <span>{Number(chapter.price || 0) > 0 ? `${chapter.price} ج.م` : "مجاناً"}</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <Link 
                    href={`/chapter/${chapter.id}`}
                    className="mt-6 px-8 py-3 w-full rounded-2xl bg-green-600 text-white font-bold shadow-md hover:bg-green-700 shadow-green-200 transition-all duration-300 text-sm flex items-center justify-center gap-2 z-10"
                  >
                    تصفح الدروس
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Link>
                ) : (
                  <button 
                    onClick={() => handleOpenModal(chapter)}
                    className="mt-6 px-8 py-3 w-full rounded-2xl bg-[#C4963A] text-white font-bold shadow-md hover:bg-[#A87C24] shadow-[#C4963A]/20 transition-all duration-300 text-sm flex items-center justify-center gap-2 z-10"
                  >
                    <Lock className="w-4 h-4" />
                    ادخل الكود
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
                لا توجد أبواب متاحة
              </h3>
              <p className="text-slate-500 font-medium">
                لم يتم إضافة أي أبواب لهذا الكورس حتى الآن أو أنها غير مفعلة.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Code Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#C4963A] to-[#D4A84A] p-8 text-center text-white">
               <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <Key className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black">تفعيل {activeChapter?.name}</h3>
               <p className="text-white/90 text-sm mt-1">أدخل الكود المكون من 8 أرقام لفتح الباب</p>
            </div>

            <form onSubmit={handleUnlock} className="p-8 space-y-6">
               {success ? (
                 <div className="flex flex-col items-center justify-center py-4 text-green-600 space-y-3">
                    <CheckCircle className="w-12 h-12" />
                    <p className="font-black text-xl">تم التفعيل بنجاح!</p>
                 </div>
               ) : (
                 <>
                   <div className="space-y-2">
                     <label className="text-sm font-black text-slate-700 block text-right pr-2">كود التفعيل</label>
                     <input
                       type="text"
                       placeholder="مثال: A1B2C3D4"
                       className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-[#C4963A] focus:outline-none font-black text-center text-xl tracking-widest uppercase transition-all"
                       value={codeValue}
                       onChange={(e) => setCodeValue(e.target.value)}
                       required
                       autoFocus
                     />
                     {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}
                   </div>
                   <button
                     type="submit"
                     className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                   >
                     تفعيل الآن
                   </button>
                 </>
               )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
