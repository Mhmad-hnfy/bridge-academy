"use client";

import React, { useRef } from "react";
import { Trophy, Download, Star, Award, CheckCircle2 } from "lucide-react";

export default function Certificate({ studentName, chapterName, courseName, issuedAt, certificateId }) {
  const certRef = useRef(null);

  const handleDownload = () => {
    if (!certRef.current) return;
    // Simple print-to-PDF approach
    const printContent = certRef.current.outerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>شهادة إتمام - Bridge Academy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Cairo', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8f5f0; }
          .cert { width: 900px; min-height: 620px; padding: 60px; background: white; border: 3px solid #C4963A; border-radius: 24px; text-align: center; position: relative; }
          .cert-title { font-size: 48px; font-weight: 900; color: #1B3668; margin-bottom: 10px; }
          .cert-subtitle { font-size: 18px; color: #C4963A; font-weight: 700; margin-bottom: 40px; }
          .student-name { font-size: 36px; font-weight: 900; color: #122040; border-bottom: 3px solid #C4963A; display: inline-block; padding-bottom: 8px; margin: 20px 0; }
          .cert-text { font-size: 18px; color: #555; font-weight: 700; margin: 10px 0; }
          .chapter-name { font-size: 28px; font-weight: 900; color: #1B3668; margin: 10px 0; }
          .cert-date { font-size: 14px; color: #888; margin-top: 40px; font-weight: 700; }
          .cert-id { font-size: 11px; color: #ccc; margin-top: 5px; }
          @media print { body { background: white; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="cert-title">Bridge Academy</div>
          <div class="cert-subtitle">🏆 شهادة إتمام وتفوق</div>
          <div class="cert-text">نشهد بأن الطالب / الطالبة</div>
          <div class="student-name">${studentName}</div>
          <div class="cert-text">قد أتم/أتمت بنجاح</div>
          <div class="chapter-name">${chapterName}</div>
          ${courseName ? `<div class="cert-text">في كورس: ${courseName}</div>` : ""}
          <div class="cert-date">تاريخ الإصدار: ${new Date(issuedAt || Date.now()).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</div>
          ${certificateId ? `<div class="cert-id">رقم الشهادة: ${certificateId}</div>` : ""}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const formattedDate = new Date(issuedAt || Date.now()).toLocaleDateString("ar-EG", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* شهادة */}
      <div
        ref={certRef}
        className="relative bg-gradient-to-br from-[#FDF8F0] via-white to-[#FFF8E7] border-4 border-[#C4963A] rounded-[32px] p-10 text-center overflow-hidden"
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        {/* زوايا زخرفية */}
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#C4963A] rounded-tr-2xl" />
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#C4963A] rounded-tl-2xl" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#C4963A] rounded-br-2xl" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#C4963A] rounded-bl-2xl" />

        {/* أيقونة التتويج */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C4963A] to-[#D4A84A] rounded-full flex items-center justify-center shadow-xl shadow-[#C4963A]/30">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* العنوان */}
        <h2 className="text-4xl font-black text-[#1B3668] mb-1">Bridge Academy</h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Star className="w-4 h-4 text-[#C4963A] fill-current" />
          <p className="text-[#C4963A] font-black text-lg">شهادة إتمام وتفوق</p>
          <Star className="w-4 h-4 text-[#C4963A] fill-current" />
        </div>

        {/* الفاصل */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C4963A]/40" />
          <Award className="w-5 h-5 text-[#C4963A]" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C4963A]/40" />
        </div>

        <p className="text-slate-600 font-bold text-base mb-3">نشهد بأن الطالب / الطالبة</p>

        {/* اسم الطالب */}
        <div className="inline-block">
          <h3 className="text-3xl font-black text-[#122040] mb-1">{studentName}</h3>
          <div className="h-1 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] rounded-full" />
        </div>

        <p className="text-slate-600 font-bold text-base mt-4 mb-2">قد أتم/أتمت بنجاح</p>

        <h4 className="text-2xl font-black text-[#1B3668] mb-1">{chapterName}</h4>
        {courseName && <p className="text-slate-500 font-bold text-sm">في كورس: {courseName}</p>}

        {/* نجوم */}
        <div className="flex justify-center gap-1 my-5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-[#C4963A] fill-current" />
          ))}
        </div>

        {/* الفاصل السفلي */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C4963A]/40" />
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C4963A]/40" />
        </div>

        <p className="text-slate-400 text-xs font-bold">تاريخ الإصدار: {formattedDate}</p>
        {certificateId && (
          <p className="text-slate-300 text-[10px] mt-1 font-mono">رقم الشهادة: {certificateId}</p>
        )}
      </div>

      {/* زر التحميل */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#C4963A] to-[#D4A84A] text-white font-black rounded-2xl hover:from-[#b8872e] transition-all shadow-lg shadow-[#C4963A]/20 text-lg"
      >
        <Download className="w-5 h-5" />
        تحميل الشهادة / طباعة
      </button>
    </div>
  );
}
