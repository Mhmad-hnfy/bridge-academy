"use client";
import React, { useRef } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useGlobalStore } from "@/lib/store";
import Link from "next/link";

export default function Courses() {
  const { categories, courses } = useGlobalStore();
  const coursesRef = useRef(null);

  const scroll = (ref, dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-slate-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">

        {/* ─── صف الكورسات ─── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                الكورسات المتاحة
              </h2>
              <p className="text-slate-500 text-base">
                كورس تأسيس · ماده بماده · كورس مكثف · كورس شامل
              </p>
              <div className="w-20 h-1.5 bg-[#C4963A] mt-3 rounded-full" />
            </div>
            {/* أسهم التنقل - ديسكتوب */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scroll(coursesRef, "right")}
                className="w-10 h-10 bg-white border border-[#EAE3D6] rounded-xl flex items-center justify-center text-[#C4963A] hover:bg-[#C4963A] hover:text-white hover:border-[#C4963A] transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(coursesRef, "left")}
                className="w-10 h-10 bg-white border border-[#EAE3D6] rounded-xl flex items-center justify-center text-[#C4963A] hover:bg-[#C4963A] hover:text-white hover:border-[#C4963A] transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* سكرول أفقي - كورسات */}
          <div
            ref={coursesRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat, index) => (
              <Link
                href={`/category/${cat.id}`}
                key={cat.id || index}
                className="snap-center shrink-0 w-[85vw] sm:w-72 group bg-white text-slate-800 rounded-[24px] flex flex-col overflow-hidden shadow-lg border border-[#C4963A]/20 hover:shadow-[#C4963A]/25 hover:-translate-y-1 transition-all duration-500"
              >
                {/* صورة */}
                <div className="relative h-44 overflow-hidden bg-[#C4963A]/10">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#C4963A]/10 to-[#C4963A]/20">
                      <BookOpen className="w-14 h-14 text-[#C4963A]/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* معلومات */}
                <div className="px-5 py-4 flex flex-col gap-2 bg-white relative">
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#C4963A] to-[#D4A84A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <h3 className="text-base font-black tracking-tight text-slate-900 group-hover:text-[#C4963A] transition-colors">
                    {cat.name}
                  </h3>
                  <div className="w-full h-px bg-[#C4963A]/15" />
                  <p className="text-xs text-slate-500 font-medium">
                    جميع كورسات {cat.name}
                  </p>
                </div>
              </Link>
            ))}

            {categories.length === 0 && (
              <div className="w-full text-center py-10 text-slate-400 font-bold">
                لا توجد كورسات متاحة حالياً
              </div>
            )}
          </div>

          {/* نقاط التنقل - موبايل */}
          {categories.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {categories.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#C4963A]/30" />
              ))}
            </div>
          )}
        </div>

        {/* ─── صف المواد المستقلة ─── */}
        <IndependentSubjectsRow courses={courses} />
      </div>
    </section>
  );
}

function IndependentSubjectsRow({ courses }) {
  const subjectsRef = useRef(null);

  const scroll = (dir) => {
    if (!subjectsRef.current) return;
    subjectsRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (!courses || courses.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            المواد الدراسية
          </h2>
          <p className="text-slate-500 text-base">
            اشترك في مادة بعينها حسب احتياجك
          </p>
          <div className="w-20 h-1.5 bg-[#1B3668] mt-3 rounded-full" />
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 bg-white border border-[#EAE3D6] rounded-xl flex items-center justify-center text-[#1B3668] hover:bg-[#1B3668] hover:text-white hover:border-[#1B3668] transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 bg-white border border-[#EAE3D6] rounded-xl flex items-center justify-center text-[#1B3668] hover:bg-[#1B3668] hover:text-white hover:border-[#1B3668] transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={subjectsRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {courses.map((course, i) => (
          <Link
            href={`/course/${course.id}`}
            key={course.id || i}
            className="snap-center shrink-0 w-[85vw] sm:w-64 group bg-white rounded-[24px] flex flex-col overflow-hidden shadow-lg border border-[#1B3668]/10 hover:shadow-[#1B3668]/20 hover:-translate-y-1 transition-all duration-500"
          >
            <div className="relative h-36 overflow-hidden bg-[#1B3668]/5">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1B3668]/10 to-[#1B3668]/20">
                  <BookOpen className="w-12 h-12 text-[#1B3668]/30" />
                </div>
              )}
            </div>
            <div className="px-5 py-4 relative">
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#1B3668] to-[#24427D] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="text-sm font-black text-slate-900 group-hover:text-[#1B3668] transition-colors mb-1">
                {course.name}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.active ? "bg-amber-50 text-[#C4963A] border border-[#C4963A]/20" : "bg-slate-100 text-slate-500"}`}>
                {course.active ? "تفعيل بالكود 🔒" : "قريباً"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {courses.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
          {courses.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#1B3668]/30" />
          ))}
        </div>
      )}
    </div>
  );
}
