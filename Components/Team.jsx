"use client";
import React from "react";
import { useGlobalStore } from "@/lib/store";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Team() {
  const { teachers } = useGlobalStore();
  const activeTeachers = teachers.filter((t) => t.status === "نشط");

  return (
    <section className="py-20 bg-slate-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
           تعرف على فريق Bridge Academy 
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            نخبة من الخبراء والمعلمين يسعون لتقديم أفضل تجربة تعليمية لمساعدتك
            على التفوق والنجاح.
          </p>
          <div className="w-24 h-1.5 bg-[#C4963A] mx-auto mt-6 rounded-full" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 max-w-6xl mx-auto">
          {activeTeachers.map((member, index) => (
            <div
              key={member.id || index}
              className="w-full sm:w-[520px] group bg-white text-slate-800 rounded-2xl sm:rounded-[24px] flex flex-col overflow-hidden shadow-xl border border-[#C4963A]/20 hover:shadow-[#C4963A]/20 hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-[220px] sm:h-[300px] overflow-hidden bg-[#C4963A]/10">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#C4963A]/10 to-[#C4963A]/20">
                    <GraduationCap className="w-16 h-16 text-[#C4963A]/50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col gap-2 bg-white relative">
                {/* Gold accent line */}
                <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#C4963A] to-[#D4A84A] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <h3 className="text-base sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-[#C4963A] transition-colors text-right line-clamp-1">
                  {member.name}
                </h3>

                <div className="w-full h-px bg-[#C4963A]/15 my-1" />

                <p className="text-xs sm:text-sm text-slate-500 font-medium text-right line-clamp-2 min-h-[2.5rem]">
                  {member.bio || "مدرس متميز في Bridge Academy"}
                </p>

                <div className="pt-2 border-t border-slate-50">
                  <Link
                    href={`/teachers/${member.id}`}
                    className="text-xs sm:text-sm font-bold text-[#C4963A] hover:text-[#A87C24] transition-colors"
                  >
                    عرض الملف الشخصي &larr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
