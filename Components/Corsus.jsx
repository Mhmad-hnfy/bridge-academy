import React from "react";

// Mock Data for the Fahem Platform Team
const teamMembers = [
  {
    id: 1,
    name: "م. أحمد مصطفى",
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    id: 2,
    name: "م. سارة إبراهيم",
    image: "https://i.pravatar.cc/300?img=5",
  },
  {
    id: 3,
    name: "د. خالد منصور",
    image: "https://i.pravatar.cc/300?img=8",
  },
  {
    id: 4,
    name: "أ. ندى حسين",
    image: "https://i.pravatar.cc/300?img=9",
  },
];

export default function Corsus() {
  return (
    <section className="py-20 bg-slate-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            الصفوف الدراسية
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            ثانوى عام ، اعدادى ، ابتدائى
          </p>
          <div className="w-24 h-1.5 bg-[#C4963A] mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id || index}
              className="group bg-white text-slate-800 rounded-[32px] flex flex-col overflow-hidden shadow-xl border border-[#C4963A]/20 hover:shadow-[#C4963A]/20 hover:-translate-y-2 transition-all duration-500"
            >
              <div className="relative h-[320px] overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full group-hover:scale-110 transition-transform duration-700 object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-70" />

                {/* Floating micro-glow */}
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="size-2 bg-[#C4963A] rounded-full animate-pulse" />
                </div>
              </div>

              <div className="px-6 pb-8 pt-6 text-center flex-1 bg-white relative">
                {/* Decorative line */}
                <div className="absolute top-0 right-1/2 translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] rounded-full -translate-y-1/2 group-hover:w-24 transition-all duration-500" />

                <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#C4963A] transition-colors">
                  {member.name}
                </h3>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <button className="text-[12px] font-bold text-[#C4963A] hover:text-[#A87C24] transition-colors">
                    عرض الكورسات &larr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
