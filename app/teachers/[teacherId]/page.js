"use client";

import React, { use, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Mail,
  Phone,
  BookOpen,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { useGlobalStore } from "@/lib/store";

export default function TeacherProfile({ params }) {
  const unwrappedParams = use(params);
  const teacherId = parseInt(unwrappedParams.teacherId, 10);

  const { teachers, courses, chapters, unlockedChapters } = useGlobalStore();

  const teacher = teachers.find((t) => t.id === teacherId);
  const teacherCourses = useMemo(() => 
    courses.filter((c) => c.teacherId === teacherId && c.active),
    [courses, teacherId]
  );

  const realActiveStudents = useMemo(() => {
    const teacherCourseIds = teacherCourses.map(c => c.id);
    const teacherChapterIds = chapters
      .filter(chap => teacherCourseIds.includes(chap.courseId))
      .map(chap => chap.id);
    
    // Find unique student IDs who have unlocked at least one chapter from this teacher
    const studentIds = (unlockedChapters || [])
      .filter(u => teacherChapterIds.includes(u.chapterId))
      .map(u => u.userId);
    
    return new Set(studentIds).size;
  }, [teacherCourses, chapters, unlockedChapters]);

  if (!teacher) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8 text-center"
        dir="rtl"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">
            المدرس غير موجود
          </h1>
          <Link href="/" className="text-red-600 font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للرئيسية
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-12 relative">
          {/* Cover Area */}
          <div className="h-40 bg-gradient-to-r from-red-600 to-rose-500" />

          <div className="px-8 pb-10 relative">
            {/* Avatar & Name */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 mb-8">
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-32 h-32 rounded-[24px] object-cover border-4 border-white shadow-xl bg-slate-100"
              />
              <div className="text-center md:text-right flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                    {teacher.name}
                  </h1>
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-red-600 font-bold text-lg">
                  {teacher.subject}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4 md:mt-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-black text-lg text-slate-800">
                      4.9
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    التقييم العام
                  </span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="text-center">
                  <span className="block font-black text-lg text-slate-800">
                    {realActiveStudents.toLocaleString("ar-EG")}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    طالب نشط
                  </span>
                </div>
              </div>
            </div>

            {/* Bio & Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">
                    نبذة عن المدرس
                  </h3>
                  <p className="text-slate-600 leading-relaxed max-w-2xl font-medium">
                    {teacher.bio}
                    <br />
                    <br />
                    يعتبر {teacher.name} من نخبة المدرسين في مادة{" "}
                    {teacher.subject} ويتميز بأسلوب شرح مبسط وشامل يعتمد على
                    الفهم والتطبيق العملي، مع دعم مستمر واختبارات دورية تضمن
                    التفوق لجميع الطلاب.
                  </p>
                </div>
              </div>

              {/* Contact Sidebar */}
              <div className="bg-[#C4963A]/10 rounded-3xl p-6 border border-[#C4963A]/20">
                <h3 className="text-lg font-black text-slate-800 mb-4">
                  التواصل والدعم
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-600 font-bold">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#C4963A] shadow-sm border border-[#C4963A]/20">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span dir="ltr">{teacher.phone}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 font-bold">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#C4963A] shadow-sm border border-[#C4963A]/20">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="truncate">{teacher.email}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 mb-8 border-r-4 border-[#C4963A] pr-4">
            الكورسات المتاحة مع المدرس
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#C4963A]/10 group-hover:text-[#C4963A] transition-colors">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-4 group-hover:text-[#C4963A] transition-colors">
                  {course.name}
                </h4>
                <Link 
                  href={`/course/${course.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 font-bold group-hover:bg-[#C4963A] group-hover:text-white transition-all text-sm flex items-center justify-center"
                >
                  تفاصيل الكورس
                </Link>
              </div>
            ))}

            {teacherCourses.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 font-bold">
                لا توجد كورسات متاحة حالياً مع هذا المدرس.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
