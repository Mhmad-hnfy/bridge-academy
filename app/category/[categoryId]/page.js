"use client";

import React, { use } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, GraduationCap, Video } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function CategoryPage({ params }) {
  const unwrappedParams = use(params);
  const categoryId = parseInt(unwrappedParams.categoryId, 10);

  const { categories, classes, courses, teachers, chapters } = useGlobalStore();

  const category = categories.find((c) => c.id === categoryId);

  // Get all active courses directly belonging to this category
  const categoryCourses = courses.filter((c) => {
    if (!c.active) return false;
    if (c.categoryId === categoryId) return true;
    const matchClass = classes.find((cl) => cl.id === c.classId);
    return matchClass && matchClass.categoryId === categoryId;
  });

  const getTeacher = (teacherId) => teachers.find((t) => t.id === teacherId);
  const getChaptersCount = (courseId) =>
    (chapters || []).filter((ch) => ch.courseId === courseId && ch.active).length;

  if (!category) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8 text-center"
        dir="rtl"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">
            الكورس أو القسم غير موجود
          </h1>
          <Link href="/" className="text-[#C4963A] font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
          <Link
            href="/"
            className="text-slate-500 hover:text-[#C4963A] transition-colors flex items-center gap-2 font-bold text-sm sm:text-base"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            الرئيسية
          </Link>
          <div className="hidden sm:block w-px h-6 bg-slate-300"></div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            {category.name}
          </h1>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">
            المواد الدراسية
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-6 text-sm sm:text-base">
            تصفح جميع المواد المتاحة لكورس {category.name} مع نخبة من أفضل المدرسين.
          </p>
          <div className="w-20 h-1.5 bg-[#C4963A] mx-auto rounded-full" />
        </div>

        {/* Courses (المواد) Grid */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-6xl mx-auto">
          {categoryCourses.map((course) => {
            const teacher = getTeacher(course.teacherId);
            const chaptersCount = getChaptersCount(course.id);

            return (
              <div
                key={course.id}
                className="w-full sm:w-[380px] group bg-white text-slate-800 rounded-2xl sm:rounded-[28px] flex flex-col overflow-hidden shadow-xl border border-[#C4963A]/20 hover:shadow-[#C4963A]/25 hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-[200px] sm:h-[240px] overflow-hidden bg-[#C4963A]/10">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#C4963A]/10 to-[#C4963A]/20">
                      <BookOpen className="w-16 h-16 text-[#C4963A]/50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#0F1A30]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-1.5 shadow-lg">
                    <Video className="w-4 h-4 text-[#C4963A]" />
                    <span className="text-xs font-black">{chaptersCount} أبواب</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4 bg-white relative">
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#C4963A] to-[#D4A84A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#C4963A] transition-colors text-right">
                      {course.name}
                    </h3>

                    {teacher && (
                      <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <GraduationCap className="w-4 h-4 text-[#C4963A]" />
                        <span className="text-xs font-bold text-slate-700">{teacher.name}</span>
                        {teacher.subject && (
                          <span className="text-[10px] text-slate-400 font-medium mr-auto">({teacher.subject})</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={`/course/${course.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1B3668] to-[#122040] hover:from-[#C4963A] hover:to-[#B8872E] text-white font-black text-sm transition-all duration-300 shadow-md group-hover:shadow-lg active:scale-95"
                    >
                      <span>تصفح محتوى المادة</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {categoryCourses.length === 0 && (
            <div className="w-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg mb-2">
                لا توجد مواد دراسية مضافة في هذا الكورس حالياً.
              </p>
              <p className="text-slate-400 text-sm">
                سيتم إضافة المواد والمحاضرات قريباً.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
