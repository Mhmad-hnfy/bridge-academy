"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, FileText, Clock, Youtube } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function ChapterLessonsPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const chapterId = parseInt(unwrappedParams.chapterId, 10);

  const { chapters, lessons: allLessons, currentUser, unlockedChapters } = useGlobalStore();

  const chapter = chapters.find(c => parseInt(c.id) === chapterId);
  const lessons = allLessons.filter(l => parseInt(l.chapterId) === chapterId && l.status === "نشط");

  // SECURITY: always require login — free means no code needed, not no account needed
  const isUnlocked = !!currentUser && !!chapter && (
    (unlockedChapters || []).some(u => u.userId === currentUser.id && u.chapterId === chapterId) ||
    Number(chapter.price || 0) === 0
  );

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center" dir="rtl">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">الباب غير موجود</h1>
          <Link href="/" className="text-red-600 font-bold hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  // Redirect if not unlocked
  if (!isUnlocked) {
    // In a real app we'd redirect to the course page
    return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center" dir="rtl">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-4">هذا الباب مغلق</h1>
            <p className="text-slate-500 mb-6">يجب تفعيل الكود للوصول لهذه الدروس</p>
            <button onClick={() => router.back()} className="text-red-600 font-bold hover:underline">العودة للخلف</button>
          </div>
        </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-12">
           <button 
             onClick={() => router.back()}
             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 shadow-sm border border-slate-100 transition-all"
           >
             <ArrowRight className="w-6 h-6 rotate-180" />
           </button>
           <div>
             <h1 className="text-3xl font-black text-slate-900">{chapter.name}</h1>
             <p className="text-slate-500 font-bold">قائمة الدروس والمحاضرات</p>
           </div>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id}
              className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-500 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="relative w-full md:w-60 h-36 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                {lesson.banner ? (
                  <img src={lesson.banner} alt={lesson.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                     <Youtube className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current" />
                   </div>
                </div>
              </div>

              <div className="flex-1 text-right w-full">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-3 py-1 bg-[#C4963A]/10 text-[#C4963A] rounded-full text-[10px] font-black">الدرس {index + 1}</span>
                   {lesson.pdfFile && (
                     <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                        <FileText className="w-3 h-3" />
                        ملف ملخص
                     </span>
                   )}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-[#C4963A] transition-colors">{lesson.name}</h3>
                <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                   <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>45:00 دقيقة</span>
                   </div>
                </div>
              </div>

              <Link 
                href={`/lesson/${lesson.id}`}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-100 transition-all"
              >
                شاهد الآن
              </Link>
            </div>
          ))}

          {lessons.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
                <Youtube className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-800">لا توجد دروس بعد</h3>
                <p className="text-slate-500 font-bold">سيتم إضافة المحاضرات قريباً لهذا الباب</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
