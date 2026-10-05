"use client";
import React, { useRef } from "react";
import { AnimatedBeam } from "./ui/animated-beam";
import {
  BookOpen,
  Trophy,
  School,
  User,
  GraduationCap,
  Laptop,
  Sparkles,
  LayoutDashboard,
  Cpu,
  LineChart,
} from "lucide-react";

const Circle = React.forwardRef(({ className, children, label }, ref) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        className={`z-10 flex size-12 md:size-14 items-center justify-center rounded-full border-2 bg-white p-3 shadow-lg ${className}`}
      >
        {children}
      </div>
      {label && (
        <span className="text-sm font-black text-slate-700 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
});

Circle.displayName = "Circle";

export default function LearningJourney() {
  const containerRef = useRef(null);
  const teacherRef = useRef(null);
  const studentRef = useRef(null);
  const platformRef = useRef(null);

  return (
    <section className="py-2 bg-white overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            تواصل ذكي وتفاعل مستمر
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto font-medium">
            نظام متكامل يربط المعلم بالطالب من خلال منصة Bridge Academy لضمان أفضل تجربة
            تعليمية.
          </p>
          <div className="w-16 h-1 bg-[#C4963A] mx-auto mt-4 rounded-full" />
        </div>

        <div
          className="relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-[40px] border border-[#C4963A] bg-slate-50/50 p-6 md:shadow-inner"
          ref={containerRef}
        >
          <div className="flex size-full max-w-2xl items-center justify-between gap-4 px-4">
            {/* Teacher Node */}
            <Circle
              ref={teacherRef}
              label="المعلم"
              className="border-[#C4963A] text-[#C4963A]"
            >
              <User className="size-6" />
            </Circle>

            {/* Platform Node (Center) */}
            <Circle
              ref={platformRef}
              label="Bridge Academy"
              className="size-16 md:size-20 border-[#C4963A] bg-[#C4963A] text-white shadow-[#C4963A] shadow-2xl"
            >
              <span className="text-2xl font-bold text-[#C4963A]">ف</span>
            </Circle>

            {/* Student Node */}
            <Circle
              ref={studentRef}
              label="الطالب"
              className="border-[#C4963A] text-[#C4963A]"
            >
              <GraduationCap className="size-6" />
            </Circle>
          </div>

          {/* Teacher <-> Platform Beam */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={teacherRef}
            toRef={platformRef}
            pathColor="#C4963A"
            gradientStartColor="#C4963A"
            gradientStopColor="#efc32c"
            curvature={100}
            duration={4}
          />

          {/* Student <-> Platform Beam */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={studentRef}
            toRef={platformRef}
            pathColor="#C4963A"
            gradientStartColor="#C4963A"
            gradientStopColor="#efc32c"
            curvature={-100}
            duration={4}
            reverse
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-10">
          <div className="p-8 rounded-[32px] bg-[#C4963A]/30 border border-[#C4963A]/50 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C4963A] shadow-sm mb-6">
              <LayoutDashboard className="size-6" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-slate-800">
              إدارة المحتوى
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              يتيح للمعلم رفع الدروس والاختبارات ومتابعة تقدم الطلاب لحظة بلحظة.
            </p>
          </div>
          <div className="p-8 rounded-[32px] bg-white border border-[#C4963A] shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-[#C4963A] rounded-2xl flex items-center justify-center text-white shadow-[#C4963A]/20 shadow-lg mb-6">
              <Cpu className="size-6" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-slate-800">
              بيئة تعلم ذكية
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              توفر المنصة الأدوات التقنية المتطورة لتسهيل عملية الشرح والتواصل
              التفاعلي.
            </p>
          </div>
          <div className="p-8 rounded-[32px] bg-[#C4963A]/30 border border-[#C4963A]/50 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C4963A] shadow-sm mb-6">
              <LineChart className="size-6" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-slate-800">
              نتائج فورية
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              يحصل الطالب على تقارير دورية واختبارات تفاعلية تساعده على التفوق.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
