"use client";

import React, { use } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Video, GraduationCap } from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function ClassPage({ params }) {
  const unwrappedParams = use(params);
  const classId = parseInt(unwrappedParams.classId, 10);

  const { classes, courses, teachers, categories } = useGlobalStore();

  const classObj = classes.find((c) => c.id === classId);
  const classCourses = courses.filter((c) => c.classId === classId && c.active);

  if (!classObj) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8 text-center"
        dir="rtl"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">
            الصف الدراسي غير موجود
          </h1>
          <Link href="/" className="text-red-600 font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === classObj.categoryId);
  const getTeacher = (teacherId) => teachers.find((t) => t.id === teacherId);

  return (
    <main className="min-h-screen bg-slate-50 pt-24 lg:pt-32 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-3 mb-12 text-sm md:text-base">
          <Link
            href="/"
            className="text-slate-500 hover:text-red-600 font-bold transition-colors"
          >
            الرئيسية
          </Link>
          <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
          {category && (
            <>
              <Link
                href={`/category/${category.id}`}
                className="text-slate-500 hover:text-red-600 font-bold transition-colors"
              >
                {category.name}
              </Link>
              <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
            </>
          )}
          <span className="text-slate-900 font-black truncate max-w-[200px] sm:max-w-none">
            {classObj.name}
          </span>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
            المواد الدراسية (الكورسات)
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto mb-6">
            تصفح جميع المواد المتاحة لهذا الصف مع نخبة من أفضل المدرسين.
          </p>
          <div className="w-16 h-1 bg-red-600 mx-auto rounded-full" />
        </div>

        {/* Courses Grid */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 max-w-6xl mx-auto">
          {classCourses.map((course) => {
            const teacher = getTeacher(course.teacherId);

            return (
              <div
                key={course.id}
                className="w-full sm:w-[380px] group bg-white text-slate-800 rounded-2xl sm:rounded-[24px] flex flex-col overflow-hidden shadow-xl border border-[#C4963A]/20 hover:shadow-[#C4963A]/20 hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-[190px] sm:h-[240px] overflow-hidden bg-[#C4963A]/10">
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
                </div>

                {/* Info */}
                <div className="px-5 py-4 sm:px-7 sm:py-5 flex flex-col gap-2 bg-white relative">
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#C4963A] to-[#D4A84A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <h3 className="text-base sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-[#C4963A] transition-colors text-right line-clamp-1">
                    {course.name}
                  </h3>

                  <div className="w-full h-px bg-[#C4963A]/15 my-1" />

                  {teacher && (
                    <Link
                      href={`/teachers/${teacher.id}`}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#C4963A] transition-colors"
                    >
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-slate-200"
                      />
                      <span className="line-clamp-1">{teacher.name}</span>
                    </Link>
                  )}

                  <Link
                    href={`/course/${course.id}`}
                    className="mt-2 px-4 py-2.5 w-full rounded-xl bg-[#C4963A] text-white font-bold shadow-md hover:bg-[#A87C24] shadow-[#C4963A]/20 transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    تفاصيل الكورس
                  </Link>
                </div>
              </div>
            );
          })}

          {classCourses.length === 0 && (
            <div className="w-full text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                لا توجد مواد متاحة
              </h3>
              <p className="text-slate-500 font-medium">
                لم يتم إضافة أي مواد دراسية لهذا الصف حتى الآن.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
